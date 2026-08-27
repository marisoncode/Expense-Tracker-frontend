import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, X, Receipt, Plus, Trash2, Edit3 } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { DailySpendingOverview, DaySummary, Expense } from '../../types/expense';
import { CategoryIcon } from './CategoryIcon';
import clsx from 'clsx';
import { playPopSound, playDeleteSound } from '../../utils/sound';

interface CalendarViewProps {
  userId: number;
  currentMonth: Date;
  refreshTrigger: number;
  onExpenseAdded: () => void;
  onOpenAddExpenseForDate: (dateStr: string) => void;
  onEditExpense: (expense: Expense) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  userId,
  currentMonth,
  refreshTrigger,
  onExpenseAdded,
  onOpenAddExpenseForDate,
  onEditExpense
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
  const [monthOverview, setMonthOverview] = useState<DailySpendingOverview | null>(null);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fetchMonthOverview = useCallback(async () => {
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const { data } = await apiClient.get<DailySpendingOverview>(
        `/calendar/month-overview?user_id=${userId}&month=${monthStr}`
      );
      setMonthOverview(data);
    } catch (error) {
      console.error('Failed to fetch month overview', error);
    }
  }, [userId, currentMonth]);

  const fetchDaySummary = async (dateStr: string) => {
    setIsLoadingDay(true);
    try {
      const { data } = await apiClient.get<DaySummary>(
        `/calendar/day-summary?user_id=${userId}&target_date=${dateStr}`
      );
      setDaySummary(data);
    } catch (e) {
      console.error(e);
      setDaySummary(null);
    } finally {
      setIsLoadingDay(false);
    }
  };

  useEffect(() => {
    fetchMonthOverview();
  }, [fetchMonthOverview, refreshTrigger]);

  const openModal = async (dateStr: string) => {
    playPopSound();
    setSelectedDate(dateStr);
    fetchDaySummary(dateStr);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await apiClient.delete(`/expenses/${expenseId}`);
      playDeleteSound();
      if (selectedDate) fetchDaySummary(selectedDate);
      onExpenseAdded();
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  return (
    <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3 sm:mb-5">
          <h2 className="text-sm sm:text-lg font-black text-gray-800 dark:text-gray-200 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            </div>
            Expense Calendar
          </h2>
          <span className="text-[10px] sm:text-xs font-bold text-gray-500">Click a day to view details</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center text-[9px] sm:text-[11px] font-black text-gray-500 py-0.5 sm:py-1 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}

          {/* Empty offset days */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="p-0.5 sm:p-1"></div>
          ))}

          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, new Date());
            const daySpending = monthOverview?.daily_totals[dateStr] || 0;

            return (
              <button
                key={dateStr}
                onClick={() => openModal(dateStr)}
                className={clsx(
                  "min-h-[50px] sm:min-h-[68px] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex flex-col items-center justify-between relative transition-all duration-300 outline-none",
                  isToday
                    ? "shadow-neu-pressed dark:shadow-neu-pressed-dark border border-indigo-500/40 font-bold"
                    : "shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark text-gray-700 dark:text-gray-300"
                )}
              >
                <div className="flex items-center justify-between w-full px-0.5 sm:px-1">
                  <span className={clsx("text-[10px] sm:text-xs font-black", isToday ? "text-indigo-500" : "text-gray-700 dark:text-gray-300")}>
                    {format(day, 'd')}
                  </span>
                  {daySpending > 0 && (
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </div>

                {daySpending > 0 ? (
                  <span className="text-[8px] sm:text-[10px] font-black text-rose-500 truncate max-w-full px-1 py-0.5 rounded border border-rose-400/30">
                    ₹{daySpending >= 1000 ? `${(daySpending / 1000).toFixed(1)}k` : daySpending.toFixed(0)}
                  </span>
                ) : (
                  <span className="text-[8px] text-gray-400 opacity-40">-</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-800 dark:text-gray-200">
                  {format(new Date(selectedDate), 'EEEE, MMM d, yyyy')}
                </h3>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500">Daily transaction summary</p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition-all outline-none"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 pr-0.5 space-y-4">
              {isLoadingDay ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500"></div>
                </div>
              ) : daySummary ? (
                <>
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark flex justify-between items-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Total Spent</p>
                      <p className="text-xl sm:text-2xl font-black text-rose-500 mt-0.5">
                        ₹{daySummary.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const d = selectedDate;
                        setSelectedDate(null);
                        onOpenAddExpenseForDate(d);
                      }}
                      className="px-3 py-2 rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-xs font-black text-indigo-500 flex items-center gap-1 outline-none transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-indigo-500" /> Transactions ({daySummary.expenses?.length || 0})
                    </p>
                    <div className="space-y-2">
                      {daySummary.expenses && daySummary.expenses.length > 0 ? (
                        daySummary.expenses.map((e) => (
                          <div
                            key={e.id}
                            className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl shadow-neu-pressed dark:shadow-neu-pressed-dark flex items-center justify-center shrink-0">
                                <CategoryIcon category={e.category} className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate block">
                                  {e.category}
                                </span>
                                {e.notes && (
                                  <p className="text-[10px] text-gray-500 truncate max-w-[120px] sm:max-w-[160px]">
                                    {e.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-xs sm:text-sm text-rose-500 whitespace-nowrap">
                                ₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedDate(null);
                                  onEditExpense(e);
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded-lg shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-gray-500 hover:text-indigo-500 transition-all outline-none"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(e.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-gray-500 hover:text-rose-500 transition-all outline-none"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic text-center py-4">No transactions on this date.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
