import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { format, differenceInCalendarDays, endOfMonth, isSameMonth, getDaysInMonth } from 'date-fns';
import { TrendingDown, TrendingUp, IndianRupee, Edit2, Check, X, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import type { BudgetSummary } from '../../types/expense';
import clsx from 'clsx';

interface BudgetWidgetProps {
  userId: number;
  refreshTrigger: number;
  currentMonth: Date;
  onOpenAddExpense?: () => void;
}

export const BudgetWidget: React.FC<BudgetWidgetProps> = ({
  userId,
  refreshTrigger,
  currentMonth
}) => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const { data } = await apiClient.get<BudgetSummary>(`/budget/summary?user_id=${userId}&month=${monthStr}`);
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch budget summary", error);
    }
  }, [userId, currentMonth]);

  const handleUpdateBudget = async () => {
    const val = parseFloat(newBudgetAmount);
    if (isNaN(val) || val < 0) return;

    setIsSaving(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      await apiClient.put('/budget/update', {
        user_id: userId,
        monthly_budget: val,
        month: monthStr
      });
      setIsEditingBudget(false);
      fetchSummary();
    } catch (error) {
      console.error("Failed to update budget", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshTrigger]);

  if (!summary) {
    return (
      <div className="h-56 animate-pulse bg-neu-light dark:bg-neu-dark rounded-3xl shadow-neu-flat dark:shadow-neu-flat-dark"></div>
    );
  }

  const isOverBudget = summary.is_over_budget;
  const percentage = summary.spent_percentage;

  const today = new Date();
  const isCurrentActiveMonth = isSameMonth(currentMonth, today);
  const daysInMonth = getDaysInMonth(currentMonth);
  const daysLeft = isCurrentActiveMonth 
    ? Math.max(1, differenceInCalendarDays(endOfMonth(today), today) + 1)
    : daysInMonth;
  const safeDailyBudget = summary.remaining_budget > 0 ? (summary.remaining_budget / daysLeft) : 0;

  let progressColor = "bg-emerald-500";
  if (isOverBudget || percentage >= 100) {
    progressColor = "bg-rose-500";
  } else if (percentage >= 80) {
    progressColor = "bg-amber-500";
  }

  return (
    <div className="bg-neu-light dark:bg-neu-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-800 dark:text-gray-100 leading-tight">
              Monthly Budget Status
            </h2>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 leading-none mt-0.5">
              {format(currentMonth, 'MMMM yyyy')} Financial Health
            </p>
          </div>
        </div>

        {summary.total_budget > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-neu-pressed dark:shadow-neu-pressed-dark">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status:</span>
            <span className={clsx(
              "text-[11px] sm:text-xs font-black",
              isOverBudget ? "text-rose-500" : percentage >= 80 ? "text-amber-500" : "text-emerald-500"
            )}>
              {isOverBudget ? "Over Budget" : percentage >= 80 ? "Caution" : "On Track"}
            </span>
          </div>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6">
        {/* Card 1: Budget Target */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-neu-pressed dark:shadow-neu-pressed-dark flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider uppercase">Budget Target</span>
            {!isEditingBudget && (
              <button
                onClick={() => {
                  setIsEditingBudget(true);
                  setNewBudgetAmount(summary.total_budget > 0 ? summary.total_budget.toString() : "");
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed flex items-center justify-center text-gray-500 hover:text-indigo-500 transition-all outline-none"
                title="Edit Target Budget"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
              <span className="text-lg sm:text-xl font-black text-gray-800 dark:text-gray-200">₹</span>
              <input
                type="number"
                placeholder="Enter budget..."
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="w-full bg-transparent rounded-xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-2.5 py-1 text-sm sm:text-base font-black text-gray-800 dark:text-gray-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleUpdateBudget}
                disabled={isSaving}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-emerald-500 hover:shadow-neu-pressed flex items-center justify-center outline-none shrink-0"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark text-rose-500 hover:shadow-neu-pressed flex items-center justify-center outline-none shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setIsEditingBudget(true);
                setNewBudgetAmount(summary.total_budget > 0 ? summary.total_budget.toString() : "");
              }}
              className="cursor-pointer group mt-1 sm:mt-2"
            >
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                ₹{summary.total_budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              {summary.total_budget === 0 && (
                <p className="text-[10px] sm:text-[11px] font-bold text-indigo-500 group-hover:underline mt-0.5">
                  Click to set monthly budget
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Spent So Far */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-neu-pressed dark:shadow-neu-pressed-dark flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider uppercase">Spent So Far</span>
            {summary.total_budget > 0 && (
              <span className={clsx(
                "text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-neu-flat dark:shadow-neu-flat-dark",
                isOverBudget ? "text-rose-500" : "text-amber-500"
              )}>
                {percentage}%
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
              ₹{summary.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center text-rose-500">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>

        {/* Card 3: Net Remaining / Over Budget */}
        <div className={clsx(
          "p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between min-h-[85px] sm:min-h-[110px] transition-all duration-300",
          isOverBudget ? "shadow-neu-pressed dark:shadow-neu-pressed-dark border border-rose-500/30" : "shadow-neu-pressed dark:shadow-neu-pressed-dark"
        )}>
          <div className="flex justify-between items-center">
            <span className={clsx(
              "text-[10px] sm:text-[11px] font-bold tracking-wider uppercase",
              isOverBudget ? "text-rose-500" : "text-emerald-500"
            )}>
              {isOverBudget ? "Over Budget By" : "Net Remaining"}
            </span>
            {isOverBudget ? (
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 animate-pulse" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            )}
          </div>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <p className={clsx(
              "text-xl sm:text-2xl lg:text-3xl font-black tracking-tight",
              isOverBudget ? "text-rose-500" : "text-emerald-500"
            )}>
              ₹{isOverBudget 
                ? summary.negative_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                : summary.remaining_budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })
              }
            </p>
            {!isOverBudget && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Budget Progress Bar with Visible Target Line */}
      {summary.total_budget > 0 ? (
        <div className="space-y-2.5 mt-2">
          {/* Top Indicators */}
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
            <span>₹0.00</span>
            {isOverBudget ? (
              <span className="font-black text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Exceeded by ₹{summary.negative_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({(percentage - 100).toFixed(1)}% over target)
              </span>
            ) : (
              <span className="font-extrabold text-emerald-500">
                ₹{summary.remaining_budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining ({(100 - percentage).toFixed(1)}% left)
              </span>
            )}
            <span className="font-black text-indigo-500">
              Target: ₹{summary.total_budget.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Progress Track with Target Marker */}
          {isOverBudget ? (
            // OVER BUDGET MODE: Proportional bar with clear Target Line Marker
            (() => {
              const maxScale = Math.max(summary.total_spent, summary.total_budget * 1.15);
              const targetPercent = (summary.total_budget / maxScale) * 100;
              const spentPercent = (summary.total_spent / maxScale) * 100;

              return (
                <div className="relative pt-4 pb-1">
                  {/* Track container */}
                  <div className="w-full h-4 rounded-full shadow-neu-pressed dark:shadow-neu-pressed-dark p-0.5 overflow-hidden relative">
                    {/* Spent bar past target */}
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    />
                  </div>

                  {/* Prominent Target Line Marker */}
                  <div
                    className="absolute top-0 flex flex-col items-center pointer-events-none transition-all duration-500"
                    style={{ left: `${targetPercent}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-md leading-none mb-1">
                      🎯 Target
                    </span>
                    <div className="w-1.5 h-5 bg-indigo-500 dark:bg-indigo-400 rounded-full shadow-lg border border-white dark:border-gray-900" />
                  </div>
                </div>
              );
            })()
          ) : (
            // UNDER BUDGET MODE: Standard progress with Target Line at end
            <div className="relative pt-1">
              <div className="w-full h-3.5 rounded-full shadow-neu-pressed dark:shadow-neu-pressed-dark p-0.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => {
            setIsEditingBudget(true);
            setNewBudgetAmount("");
          }}
          className="mt-2 p-3 rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark text-center cursor-pointer hover:shadow-neu-flat transition-all"
        >
          <p className="text-xs font-bold text-indigo-500">
            🎯 No target budget set for this month. Click here to set a target.
          </p>
        </div>
      )}

      {/* Daily Safe Spending Pace & Health Recommendation */}
      {summary.total_budget > 0 && (
        <div className="mt-5 p-4 rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-neu-flat dark:shadow-neu-flat-dark",
              isOverBudget ? "text-rose-500" : "text-indigo-500"
            )}>
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                {isOverBudget ? (
                  "Monthly Target Exceeded"
                ) : (
                  <>
                    Safe Daily Pace: <span className="text-emerald-500 font-extrabold">₹{safeDailyBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> / day
                  </>
                )}
              </p>
              <p className="text-[11px] font-semibold text-gray-400">
                {isOverBudget ? (
                  `You have exceeded your monthly limit by ₹${summary.negative_balance.toLocaleString('en-IN')}. Reduce upcoming expenses.`
                ) : (
                  `${daysLeft} days left in ${format(currentMonth, 'MMMM')}. Keep daily expenses below ₹${Math.round(safeDailyBudget)} to maintain positive savings.`
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            <span className={clsx(
              "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-transparent",
              isOverBudget
                ? "text-rose-500 border-rose-500/40"
                : percentage >= 80
                ? "text-amber-500 border-amber-500/40"
                : "text-emerald-500 border-emerald-500/40"
            )}>
              {isOverBudget ? "Over Target 🔴" : percentage >= 80 ? "Caution 🟡" : "Safe Pace 🟢"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
