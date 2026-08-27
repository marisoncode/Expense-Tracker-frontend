import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import type { MonthlyComparisonResponse } from '../../types/expense';
import {
  BarChart2,
  Calendar,
  Flame,
  TrendingUp,
  Download,
  FileText
} from 'lucide-react';
import clsx from 'clsx';

interface MonthlyComparisonTableProps {
  userId: number;
  initialYear?: number;
  refreshTrigger: number;
  onMonthSelect?: (monthKey: string) => void;
}

export const MonthlyComparisonTable: React.FC<MonthlyComparisonTableProps> = ({
  userId,
  initialYear = new Date().getFullYear(),
  refreshTrigger,
  onMonthSelect
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [comparisonData, setComparisonData] = useState<MonthlyComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComparison = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<MonthlyComparisonResponse>(
        `/expenses/analytics/monthly-comparison?user_id=${userId}&year=${selectedYear}`
      );
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to fetch monthly comparison data', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedYear]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison, refreshTrigger]);

  const handleExportPDF = () => {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000/api/v1';
    window.open(`${baseURL}/expenses/export/pdf?user_id=${userId}&year=${selectedYear}`, '_blank');
  };

  const handleExportCSV = () => {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000/api/v1';
    window.open(`${baseURL}/expenses/export/csv?user_id=${userId}&year=${selectedYear}`, '_blank');
  };

  if (isLoading && !comparisonData) {
    return (
      <div className="h-64 animate-pulse clay-card rounded-2xl sm:rounded-3xl p-4 sm:p-6"></div>
    );
  }

  const months = comparisonData?.months || [];
  const yearlyTotal = comparisonData?.yearly_total_spent || 0;
  const avgMonthly = comparisonData?.average_monthly_spent || 0;
  const peakMonth = comparisonData?.peak_month;
  const peakAmount = comparisonData?.peak_amount || 0;

  return (
    <div className="clay-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 transition-colors duration-300 flex flex-col gap-4 sm:gap-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-sky-200/50 dark:border-slate-700/50 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl clay-btn text-sky-500 bg-sky-500/10 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
              Monthly Comparison ({selectedYear})
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              Month-over-month horizontal spending distribution
            </p>
          </div>
        </div>

        {/* Year Selector & Quick Statement Exports */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl clay-inset">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl clay-btn text-[11px] sm:text-xs font-black text-rose-500 flex items-center gap-1 transition-all outline-none"
            title={`Export ${selectedYear} Statement PDF`}
          >
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl clay-btn text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 transition-all outline-none"
            title={`Export ${selectedYear} CSV`}
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl clay-inset flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total {selectedYear} Spending
          </span>
          <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
            ₹{yearlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl clay-inset flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sky-500" /> Monthly Average
          </span>
          <p className="text-lg sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            ₹{avgMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl clay-inset flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-500" /> Peak Spend Month
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100">
              {peakMonth || 'None'}
            </span>
            {peakAmount > 0 && (
              <span className="text-[11px] sm:text-xs font-bold text-rose-500">
                ₹{peakAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Bar Comparison Table */}
      <div className="space-y-2 sm:space-y-3 pt-1">
        {months.map((item) => {
          const isPeak = peakAmount > 0 && item.total_spent === peakAmount;
          const hasSpend = item.total_spent > 0;

          return (
            <div
              key={item.month_key}
              onClick={() => onMonthSelect && onMonthSelect(item.month_key)}
              className={clsx(
                "p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4",
                item.is_current_month
                  ? "clay-inset border border-sky-400/50 bg-sky-50/50 dark:bg-sky-950/20"
                  : "clay-btn"
              )}
            >
              {/* Left: Month Info */}
              <div className="w-full sm:w-32 md:w-36 shrink-0 flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {item.month_name}
                  </span>
                  {item.is_current_month && (
                    <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/30 uppercase">
                      Current
                    </span>
                  )}
                </div>
                {item.transaction_count > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 sm:hidden">
                    {item.transaction_count} txs
                  </span>
                )}
              </div>

              {/* Center: Proportional Horizontal Bar */}
              <div className="flex-1 flex items-center gap-2 sm:gap-3">
                <div className="w-full h-3 sm:h-4 rounded-full clay-inset p-0.5 overflow-hidden relative">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-700 ease-out shadow-sm",
                      isPeak
                        ? "bg-gradient-to-r from-amber-400 to-rose-500"
                        : hasSpend
                        ? "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
                        : "bg-transparent"
                    )}
                    style={{ width: `${Math.max(item.percentage_of_peak, hasSpend ? 4 : 0)}%` }}
                  />
                </div>

                {/* Share of Year */}
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 w-9 sm:w-12 text-right shrink-0">
                  {item.percentage_of_year > 0 ? `${item.percentage_of_year}%` : '0%'}
                </span>
              </div>

              {/* Right: End Amount */}
              <div className="w-full sm:w-28 md:w-32 flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[11px] sm:hidden font-bold text-slate-400">Total:</span>
                <span
                  className={clsx(
                    "text-xs sm:text-sm font-black tracking-tight",
                    isPeak
                      ? "text-rose-500"
                      : hasSpend
                      ? "text-slate-800 dark:text-slate-100"
                      : "text-slate-400"
                  )}
                >
                  ₹{item.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
