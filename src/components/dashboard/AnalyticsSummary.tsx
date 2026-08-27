import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';
import type { MonthlyStats } from '../../types/expense';
import { CalendarDays, Flame, Receipt, PieChart } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsSummaryProps {
  userId: number;
  refreshTrigger: number;
  currentMonth: Date;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  userId,
  refreshTrigger,
  currentMonth
}) => {
  const [stats, setStats] = useState<MonthlyStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const { data } = await apiClient.get<MonthlyStats>(
        `/expenses/analytics/stats?user_id=${userId}&month=${monthStr}`
      );
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch monthly stats', error);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Daily Average */}
      <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Avg. Daily</span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-blue-500 flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <p className="text-base sm:text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-1 sm:mt-2">
          ₹{stats.average_daily_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* 2. Top Category */}
      <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Top Category</span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-purple-500 flex items-center justify-center">
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <p className="text-xs sm:text-base font-black text-gray-800 dark:text-gray-100 truncate flex items-center gap-1.5">
            {stats.top_category ? (
              <>
                <CategoryIcon category={stats.top_category} className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{stats.top_category}</span>
              </>
            ) : (
              'None'
            )}
          </p>
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 mt-0.5">
            ₹{stats.top_category_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* 3. Highest Single Expense */}
      <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Peak Expense</span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-rose-500 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1 sm:mt-2">
          <p className="text-base sm:text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight truncate">
            ₹{stats.highest_expense_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          {stats.highest_expense_title && (
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 truncate mt-0.5 max-w-[120px] sm:max-w-[200px]">
              {stats.highest_expense_title}
            </p>
          )}
        </div>
      </div>

      {/* 4. Total Transactions */}
      <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Transactions</span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-emerald-500 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <p className="text-base sm:text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-1 sm:mt-2">
          {stats.transaction_count} <span className="text-[10px] sm:text-xs font-semibold text-gray-500">entries</span>
        </p>
      </div>
    </div>
  );
};
