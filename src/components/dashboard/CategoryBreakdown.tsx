import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';
import type { CategoryBreakdownItem } from '../../types/expense';
import { PieChart, Layers } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBreakdownProps {
  userId: number;
  refreshTrigger: number;
  currentMonth: Date;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string | null;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  userId,
  refreshTrigger,
  currentMonth,
  onSelectCategory,
  selectedCategory
}) => {
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
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

  return (
    <div className="bg-neu-light dark:bg-neu-dark rounded-3xl p-6 sm:p-7 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark">
            <PieChart className="w-5 h-5 text-indigo-500" />
          </div>
          Category Breakdown
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory('')}
            className="text-xs font-bold text-indigo-500 hover:underline outline-none"
          >
            Clear Filter
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
          ))}
        </div>
      ) : breakdown.length === 0 ? (
        <div className="text-center py-10">
          <Layers className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-gray-500">No expenses recorded for this month.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {breakdown.map((item) => {
            const isSelected = selectedCategory === item.category;
            return (
              <div
                key={item.category}
                onClick={() => onSelectCategory && onSelectCategory(isSelected ? '' : item.category)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'shadow-neu-pressed dark:shadow-neu-pressed-dark border border-indigo-500/30'
                    : 'shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon category={item.category} className="w-4 h-4" />
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      ({item.transaction_count} {item.transaction_count === 1 ? 'tx' : 'txs'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-800 dark:text-gray-100">
                      ₹{item.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full shadow-neu-pressed dark:shadow-neu-pressed-dark p-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
