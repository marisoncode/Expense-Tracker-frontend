import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';
import type { CategoryBreakdownItem } from '../../types/expense';
import { CATEGORIES } from '../../types/expense';
import { getCategoryStyles, CategoryIcon } from './CategoryIcon';
import { PieChart, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface CategoryPieWidgetProps {
  userId: number;
  refreshTrigger: number;
  currentMonth: Date;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string | null;
}

export const CategoryPieWidget: React.FC<CategoryPieWidgetProps> = ({
  userId,
  refreshTrigger,
  currentMonth,
  onSelectCategory,
  selectedCategory
}) => {
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryBreakdownItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBreakdown = useCallback(async () => {
    setIsLoading(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const { data } = await apiClient.get<CategoryBreakdownItem[]>(
        `/expenses/analytics/categories?user_id=${userId}&month=${monthStr}`
      );
      setBreakdown(data);
    } catch (error) {
      console.error('Failed to fetch category breakdown', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown, refreshTrigger]);

  const totalSpent = breakdown.reduce((sum, item) => sum + item.total_spent, 0);

  // SVG Donut calculations
  const size = 190;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = breakdown.map((cat) => {
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

  return (
    <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-800 dark:text-gray-100">
              Expense Distribution
            </h3>
            <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400">
              {format(currentMonth, 'MMMM yyyy')} Category Share
            </p>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory('')}
            className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-[10px] sm:text-[11px] font-bold text-indigo-500 hover:shadow-neu-pressed transition-all outline-none"
          >
            Clear Filter
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : breakdown.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6">
          <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mb-3">
            <span className="text-xs font-bold text-gray-400">₹0.00</span>
          </div>
          <p className="text-xs font-semibold text-gray-500">No expenses recorded for this month.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center shrink-0 my-1">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                className="text-gray-300/30 dark:text-gray-700/30"
                strokeWidth={strokeWidth}
              />

              {segments.map((seg) => {
                const isHovered = hoveredCategory?.category === seg.category;
                const isSelected = selectedCategory === seg.category;
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
                    onClick={() => onSelectCategory && onSelectCategory(isSelected ? '' : seg.category)}
                  />
                );
              })}
            </svg>

            {/* Center Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              {hoveredCategory ? (
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 truncate block max-w-[90px]">
                    {hoveredCategory.category}
                  </span>
                  <p className="text-base font-black text-gray-800 dark:text-gray-100">
                    ₹{hoveredCategory.total_spent.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs font-extrabold text-indigo-500">
                    {hoveredCategory.percentage}%
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                    Total Spent
                  </span>
                  <p className="text-base font-black text-gray-800 dark:text-gray-100">
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] font-semibold text-gray-500 flex items-center justify-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                    {breakdown.length} {breakdown.length === 1 ? 'Category' : 'Categories'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category Rows with Progress Bars */}
          <div className="w-full flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {CATEGORIES.map((cat) => {
              const dataItem = breakdown.find((c) => c.category === cat.name);
              const isSelected = selectedCategory === cat.name;
              const isHovered = hoveredCategory?.category === cat.name;
              const spentAmount = dataItem ? dataItem.total_spent : 0;
              const percent = dataItem ? dataItem.percentage : 0;

              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => dataItem && setHoveredCategory(dataItem)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onSelectCategory && onSelectCategory(isSelected ? '' : cat.name)}
                  className={clsx(
                    "p-2.5 rounded-2xl cursor-pointer transition-all duration-200",
                    isSelected || isHovered
                      ? "shadow-neu-pressed dark:shadow-neu-pressed-dark border border-indigo-500/30"
                      : "shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed"
                  )}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.hex }}
                      />
                      <CategoryIcon category={cat.name} className="w-3.5 h-3.5" />
                      <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        ₹{spentAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="w-full h-1.5 rounded-full shadow-neu-pressed dark:shadow-neu-pressed-dark p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percent, spentAmount > 0 ? 3 : 0)}%`,
                        backgroundColor: cat.hex
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
