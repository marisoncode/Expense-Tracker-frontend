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
    <div className="clay-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 transition-colors duration-300">
      <div>
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl clay-btn text-sky-500 bg-sky-500/10 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            Expense Calendar
          </h2>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">Click a day to view details</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center text-[9px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 py-0.5 sm:py-1 uppercase tracking-wider"
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
                    ? "clay-inset border border-sky-400/50 bg-sky-50/50 dark:bg-sky-950/30 font-black shadow-sm"
                    : "clay-btn text-slate-700 dark:text-slate-300"
                )}
              >
                <div className="flex items-center justify-between w-full px-0.5 sm:px-1">
                  <span className={clsx("text-[10px] sm:text-xs font-black", isToday ? "text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300")}>
                    {format(day, 'd')}
                  </span>
                  {daySpending > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm animate-pulse"></span>
                  )}
                </div>

                {daySpending > 0 ? (
                  <span className="text-[8px] sm:text-[10px] font-black text-rose-500 truncate max-w-full px-1.5 py-0.5 rounded-full border border-rose-400/30 bg-rose-50/50 dark:bg-rose-950/30">
                    ₹{daySpending >= 1000 ? `${(daySpending / 1000).toFixed(1)}k` : daySpending.toFixed(0)}
                  </span>
                ) : (
                  <span className="text-[8px] text-slate-400 opacity-40">-</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="clay-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md transition-colors duration-300 flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  {format(new Date(selectedDate), 'EEEE, MMM d, yyyy')}
                </h3>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Daily transaction summary</p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full clay-btn transition-all outline-none text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 pr-0.5 space-y-4">
              {isLoadingDay ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-sky-500"></div>
                </div>
              ) : daySummary ? (
                <>
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl clay-inset flex justify-between items-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Spent</p>
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
                      className="px-3 py-2 rounded-xl clay-btn-primary text-xs font-black text-white flex items-center gap-1 outline-none transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      Add
                    </button>
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-sky-500" /> Transactions ({daySummary.expenses?.length || 0})
                    </p>
                    <div className="space-y-2">
                      {daySummary.expenses && daySummary.expenses.length > 0 ? (
                        daySummary.expenses.map((e) => (
                          <div
                            key={e.id}
                            className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl clay-btn group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl clay-inset flex items-center justify-center shrink-0">
                                <CategoryIcon category={e.category} className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
                                  {e.category}
                                </span>
                                {e.notes && (
                                  <p className="text-[10px] text-slate-500 truncate max-w-[120px] sm:max-w-[160px]">
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
                                className="w-6 h-6 flex items-center justify-center rounded-lg clay-btn text-slate-500 hover:text-sky-500 transition-all outline-none"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(e.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg clay-btn text-slate-500 hover:text-rose-500 transition-all outline-none"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">No transactions on this date.</p>
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
