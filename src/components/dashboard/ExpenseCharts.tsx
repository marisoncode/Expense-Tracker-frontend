import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/client';
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  subDays as subDaysDate
} from 'date-fns';
import type { CategoryBreakdownItem, TrendAnalytics } from '../../types/expense';
import { CATEGORIES } from '../../types/expense';
import { getCategoryStyles, CategoryIcon } from './CategoryIcon';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import { MonthlyComparisonTable } from './MonthlyComparisonTable';
import { playClickSound, playToggleSound, playPopSound } from '../../utils/sound';

interface ExpenseChartsProps {
  userId: number;
  currentMonth: Date;
  refreshTrigger: number;
  selectedCategory?: string | null;
  onSelectCategory?: (cat: string) => void;
}

type FilterMode = 'day' | 'month' | 'year' | 'range';

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  userId,
  currentMonth,
  refreshTrigger,
  selectedCategory,
  onSelectCategory
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('month');

  // Filter States
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<string>(format(subDaysDate(new Date(), 29), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(selectedCategory || '');

  // Data states
  const [categoriesData, setCategoriesData] = useState<CategoryBreakdownItem[]>([]);
  const [trendData, setTrendData] = useState<TrendAnalytics | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryBreakdownItem | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop
  useEffect(() => {
    if (selectedCategory !== undefined) {
      setActiveCategoryFilter(selectedCategory || '');
    }
  }, [selectedCategory]);

  // Sync selectedMonth when currentMonth changes from parent
  useEffect(() => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentMonth.getFullYear());
  }, [currentMonth]);

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      let catUrl = `/expenses/analytics/categories?user_id=${userId}&timeframe=${filterMode}`;
      let trendUrl = `/expenses/analytics/trends?user_id=${userId}&timeframe=${filterMode}`;

      if (filterMode === 'day') {
        const dateStr = format(selectedDay, 'yyyy-MM-dd');
        catUrl += `&target_date=${dateStr}`;
        trendUrl += `&month=${format(selectedDay, 'yyyy-MM')}`;
      } else if (filterMode === 'month') {
        const monthStr = format(selectedMonth, 'yyyy-MM');
        catUrl += `&month=${monthStr}&year=${selectedMonth.getFullYear()}`;
        trendUrl += `&month=${monthStr}&year=${selectedMonth.getFullYear()}`;
      } else if (filterMode === 'year') {
        catUrl += `&year=${selectedYear}`;
        trendUrl += `&year=${selectedYear}`;
      } else if (filterMode === 'range') {
        catUrl += `&start_date=${startDate}&end_date=${endDate}`;
        trendUrl += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const [catRes, trendRes] = await Promise.all([
        apiClient.get<CategoryBreakdownItem[]>(catUrl),
        apiClient.get<TrendAnalytics>(trendUrl)
      ]);

      setCategoriesData(catRes.data);
      setTrendData(trendRes.data);
    } catch (err) {
      console.error('Failed to fetch filtered chart analytics', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, filterMode, selectedDay, selectedMonth, selectedYear, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, refreshTrigger]);

  const totalPeriodSpent = categoriesData.reduce((sum, item) => sum + item.total_spent, 0);
  const totalTxCount = categoriesData.reduce((sum, item) => sum + item.transaction_count, 0);

  // Stepper handlers
  const handlePrev = () => {
    if (filterMode === 'day') setSelectedDay((prev) => subDays(prev, 1));
    else if (filterMode === 'month') setSelectedMonth((prev) => subMonths(prev, 1));
    else if (filterMode === 'year') setSelectedYear((prev) => prev - 1);
  };

  const handleNext = () => {
    if (filterMode === 'day') setSelectedDay((prev) => addDays(prev, 1));
    else if (filterMode === 'month') setSelectedMonth((prev) => addMonths(prev, 1));
    else if (filterMode === 'year') setSelectedYear((prev) => prev + 1);
  };

  const handleResetToCurrent = () => {
    const now = new Date();
    setSelectedDay(now);
    setSelectedMonth(now);
    setSelectedYear(now.getFullYear());
    setStartDate(format(subDaysDate(now, 29), 'yyyy-MM-dd'));
    setEndDate(format(now, 'yyyy-MM-dd'));
  };

  // Category selection toggle
  const handleCategorySelect = (catName: string) => {
    const next = activeCategoryFilter === catName ? '' : catName;
    setActiveCategoryFilter(next);
    if (onSelectCategory) onSelectCategory(next);
  };

  // SVG Donut calculations
  const size = 230;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = categoriesData.map((cat) => {
    const style = getCategoryStyles(cat.category);
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += cat.percentage;

    return {
      ...cat,
      hex: style.hex,
      strokeDasharray,
      strokeDashoffset
    };
  });

  // Trend Bar calculations
  const trendPoints = trendData?.points || [];
  const maxTrendAmount = Math.max(...trendPoints.map((p) => p.total_spent), 1);

  // Period label badge
  let activePeriodText = '';
  if (filterMode === 'day') activePeriodText = format(selectedDay, 'EEEE, dd MMMM yyyy');
  else if (filterMode === 'month') activePeriodText = format(selectedMonth, 'MMMM yyyy');
  else if (filterMode === 'year') activePeriodText = `Year ${selectedYear}`;
  else activePeriodText = `${format(new Date(startDate), 'dd MMM yyyy')} to ${format(new Date(endDate), 'dd MMM yyyy')}`;

  const handleExportActiveFilter = (formatType: 'pdf' | 'csv') => {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000/api/v1';
    let url = `${baseURL}/expenses/export/${formatType}?user_id=${userId}`;

    if (filterMode === 'day') {
      url += `&start_date=${format(selectedDay, 'yyyy-MM-dd')}&end_date=${format(selectedDay, 'yyyy-MM-dd')}`;
    } else if (filterMode === 'month') {
      url += `&month=${format(selectedMonth, 'yyyy-MM')}`;
    } else if (filterMode === 'year') {
      url += `&year=${selectedYear}`;
    } else if (filterMode === 'range') {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    if (activeCategoryFilter) {
      url += `&category=${encodeURIComponent(activeCategoryFilter)}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="clay-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 transition-colors duration-300 flex flex-col gap-4 sm:gap-6">
      {/* 1. Header & Filter Mode Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 border-b border-sky-200/50 dark:border-slate-700/50 pb-4 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl clay-btn text-sky-500 bg-sky-500/10 flex items-center justify-center">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100">
              Visual Charts & Analytics
            </h2>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              Filter by exact Date, Month, Year, or Custom Range
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {/* 4 Mode Pills: Grid layout so Date Range is NEVER hidden */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl clay-inset w-full sm:w-auto">
            {(
              [
                { key: 'day', label: 'Day' },
                { key: 'month', label: 'Month' },
                { key: 'year', label: 'Year' },
                { key: 'range', label: 'Date Range' }
              ] as { key: FilterMode; label: string }[]
            ).map((mode) => (
              <button
                key={mode.key}
                onClick={() => {
                  playClickSound();
                  setFilterMode(mode.key);
                }}
                className={clsx(
                  "px-3 py-1.5 sm:py-2 rounded-xl text-xs font-black text-center transition-all outline-none whitespace-nowrap",
                  filterMode === mode.key
                    ? "clay-btn text-sky-600 dark:text-sky-400 font-extrabold shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Direct PDF Export of Active Filter */}
          <button
            onClick={() => {
              playPopSound();
              handleExportActiveFilter('pdf');
            }}
            className="h-8 sm:h-10 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl clay-btn text-xs font-black text-rose-500 flex items-center justify-center gap-1.5 transition-all outline-none shrink-0"
            title={`Download PDF Statement for ${activePeriodText}`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Precision Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl clay-inset">
        {/* Left: Active Period display with Steppers */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 flex-wrap">
          {filterMode !== 'range' && (
            <button
              onClick={() => {
                playToggleSound();
                handlePrev();
              }}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl clay-btn text-slate-600 dark:text-slate-300 outline-none transition-all"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-100 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl clay-btn flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
              <span>{activePeriodText}</span>
            </span>
          </div>

          {filterMode !== 'range' && (
            <button
              onClick={() => {
                playToggleSound();
                handleNext();
              }}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl clay-btn text-slate-600 dark:text-slate-300 outline-none transition-all"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Right: Direct Date Input Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Day Mode: Exact Date picker */}
          {filterMode === 'day' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">Pick Date:</span>
              <input
                type="date"
                value={format(selectedDay, 'yyyy-MM-dd')}
                onChange={(e) => e.target.value && setSelectedDay(new Date(e.target.value))}
                className="clay-btn rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              />
              <button
                onClick={() => setSelectedDay(new Date())}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl clay-btn text-[10px] sm:text-[11px] font-bold text-sky-600 dark:text-sky-400 outline-none transition-all"
              >
                Today
              </button>
            </div>
          )}

          {/* Month Mode: Month / Year picker */}
          {filterMode === 'month' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">Pick Month:</span>
              <input
                type="month"
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m] = e.target.value.split('-').map(Number);
                    setSelectedMonth(new Date(y, m - 1, 1));
                  }
                }}
                className="clay-btn rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
              />
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl clay-btn text-[10px] sm:text-[11px] font-bold text-sky-600 dark:text-sky-400 outline-none transition-all"
              >
                This Month
              </button>
            </div>
          )}

          {/* Year Mode: Year dropdown */}
          {filterMode === 'year' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">Pick Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="clay-btn rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                  <option key={yr} value={yr} className="bg-white dark:bg-slate-900">
                    Year {yr}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedYear(new Date().getFullYear())}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl clay-btn text-[10px] sm:text-[11px] font-bold text-sky-600 dark:text-sky-400 outline-none transition-all"
              >
                This Year
              </button>
            </div>
          )}

          {/* Range Mode: Fully Visible From / To Pickers + Quick Presets */}
          {filterMode === 'range' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="clay-btn rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="clay-btn rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* Quick Range Presets */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const now = new Date();
                    setStartDate(format(subDaysDate(now, 6), 'yyyy-MM-dd'));
                    setEndDate(format(now, 'yyyy-MM-dd'));
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg clay-btn text-sky-600 dark:text-sky-400 outline-none"
                >
                  7D
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setStartDate(format(subDaysDate(now, 29), 'yyyy-MM-dd'));
                    setEndDate(format(now, 'yyyy-MM-dd'));
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg clay-btn text-sky-600 dark:text-sky-400 outline-none"
                >
                  30D
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setStartDate(format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'));
                    setEndDate(format(now, 'yyyy-MM-dd'));
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg clay-btn text-sky-600 dark:text-sky-400 outline-none"
                >
                  YTD
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleResetToCurrent}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl clay-btn text-slate-500 hover:text-sky-500 transition-all outline-none"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Summary Metric Badges for the Filtered Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Filter Spend</span>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
            ₹{totalPeriodSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transactions</span>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {totalTxCount} <span className="text-xs font-semibold text-slate-500">records</span>
          </p>
        </div>

        <div className="p-3.5 rounded-2xl clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top Category</span>
          <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1 truncate">
            {categoriesData[0] ? (
              <span className="flex items-center gap-1.5">
                <CategoryIcon category={categoriesData[0].category} className="w-3.5 h-3.5" />
                {categoriesData[0].category}
              </span>
            ) : (
              'None'
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl clay-card flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average / Tx</span>
          <p className="text-xl font-black text-sky-500 mt-1">
            ₹{totalTxCount > 0 ? (totalPeriodSpent / totalTxCount).toFixed(1) : '0.00'}
          </p>
        </div>
      </div>

      {/* 4. Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Donut / Pie Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl clay-inset relative">
          <div className="flex justify-between items-center w-full px-1 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-sky-500" /> Category Breakdown
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Click slice to filter
            </span>
          </div>

          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            </div>
          ) : categoriesData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center p-6">
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-sky-300 dark:border-sky-800 flex items-center justify-center mb-3">
                <span className="text-xs font-bold text-slate-400">₹0.00</span>
              </div>
              <p className="text-xs font-semibold text-slate-500">No expenses recorded for this filter selection.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full py-2">
              {/* SVG Donut */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg width={size} height={size} className="transform -rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    className="text-sky-200/50 dark:text-slate-800/60"
                    strokeWidth={strokeWidth}
                  />

                  {segments.map((seg) => {
                    const isHovered = hoveredCategory?.category === seg.category;
                    const isSelected = activeCategoryFilter === seg.category;
                    return (
                      <circle
                        key={seg.category}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={seg.hex}
                        strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="butt"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(seg)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => handleCategorySelect(seg.category)}
                      />
                    );
                  })}
                </svg>

                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                  {hoveredCategory ? (
                    <div>
                      <span className="text-[11px] font-black uppercase text-slate-500 truncate block max-w-[110px]">
                        {hoveredCategory.category}
                      </span>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                        ₹{hoveredCategory.total_spent.toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs font-extrabold text-sky-500">
                        {hoveredCategory.percentage}%
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Spent
                      </span>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                        ₹{totalPeriodSpent.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {categoriesData.length} {categoriesData.length === 1 ? 'Category' : 'Categories'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Pills List */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {CATEGORIES.map((cat) => {
                  const dataItem = categoriesData.find((c) => c.category === cat.name);
                  const isSelected = activeCategoryFilter === cat.name;
                  const isHovered = hoveredCategory?.category === cat.name;

                  return (
                    <div
                      key={cat.name}
                      onMouseEnter={() => dataItem && setHoveredCategory(dataItem)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => handleCategorySelect(cat.name)}
                      className={clsx(
                        "flex items-center justify-between gap-3 p-1.5 px-2.5 rounded-xl cursor-pointer transition-all duration-200",
                        isSelected || isHovered
                          ? "clay-inset border border-sky-400/50 bg-sky-50/50 dark:bg-sky-950/20 font-black shadow-sm"
                          : "clay-btn"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.hex }}
                        />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          ₹{dataItem ? dataItem.total_spent.toLocaleString('en-IN') : '0'}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full clay-btn text-slate-600 dark:text-slate-400">
                          {dataItem ? `${dataItem.percentage}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Spending Trend Bars */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-5 rounded-3xl clay-inset min-h-[290px]">
          <div className="flex justify-between items-center w-full px-1 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" /> Spending Timeline
            </span>
            <span className="text-[11px] font-bold text-sky-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Peak: ₹{maxTrendAmount > 1 ? maxTrendAmount.toLocaleString('en-IN') : '0'}
            </span>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            </div>
          ) : trendPoints.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs font-semibold text-slate-500">
              No trend series for this selection.
            </div>
          ) : (
            <div className="flex flex-col h-56 justify-between pt-2">
              {/* Tooltip Header */}
              <div className="h-6 text-center">
                {hoveredBarIndex !== null && trendPoints[hoveredBarIndex] ? (
                  <span className="text-xs font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full clay-btn">
                    {trendPoints[hoveredBarIndex].label}: ₹{trendPoints[hoveredBarIndex].total_spent.toLocaleString('en-IN')} ({trendPoints[hoveredBarIndex].transaction_count} txs)
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Hover on timeline bars to inspect spending by day / month
                  </span>
                )}
              </div>

              {/* Bar Canvas */}
              <div className="flex items-end gap-1 sm:gap-1.5 h-36 px-1 pb-2 border-b border-sky-200 dark:border-slate-700">
                {trendPoints.map((pt, idx) => {
                  const heightPercent = maxTrendAmount > 0 ? (pt.total_spent / maxTrendAmount) * 100 : 0;
                  const isHovered = hoveredBarIndex === idx;
                  const hasSpending = pt.total_spent > 0;

                  return (
                    <div
                      key={pt.date_key}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      <div
                        style={{ height: `${Math.max(heightPercent, hasSpending ? 6 : 2)}%` }}
                        className={clsx(
                          "w-full rounded-t-lg transition-all duration-300",
                          isHovered
                            ? "bg-sky-500 shadow-md"
                            : hasSpending
                            ? "bg-gradient-to-t from-sky-500 to-blue-600 shadow-sm"
                            : "bg-sky-200/40 dark:bg-slate-800/40"
                        )}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between px-1 text-[10px] font-black text-slate-400 pt-1">
                <span>{trendPoints[0]?.label}</span>
                {trendPoints.length > 2 && (
                  <span>{trendPoints[Math.floor(trendPoints.length / 2)]?.label}</span>
                )}
                <span>{trendPoints[trendPoints.length - 1]?.label}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Month-over-Month Comparison Table with Horizontal Bars */}
      <div className="mt-2">
        <MonthlyComparisonTable
          userId={userId}
          initialYear={selectedYear}
          refreshTrigger={refreshTrigger}
          onMonthSelect={(mKey) => {
            const [y, m] = mKey.split('-').map(Number);
            setSelectedMonth(new Date(y, m - 1, 1));
            setFilterMode('month');
          }}
        />
      </div>
    </div>
  );
};
