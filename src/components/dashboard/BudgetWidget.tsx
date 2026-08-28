import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { apiClient, cachedGet } from '../../api/client';
import { format, differenceInCalendarDays, endOfMonth, isSameMonth, getDaysInMonth } from 'date-fns';
import { TrendingDown, TrendingUp, IndianRupee, Edit2, Check, X, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import type { BudgetSummary } from '../../types/expense';
import clsx from 'clsx';
import { playSuccessSound, playPopSound, playClickSound } from '../../utils/sound';

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
  const fetchSummary = useCallback(async (force = false) => {
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const { data } = await apiClient.get<BudgetSummary>(`/budget/summary?user_id=${userId}&month=${monthStr}`);
      const data = await cachedGet<BudgetSummary>(
        `/budget/summary?user_id=${userId}&month=${monthStr}`,
        undefined,
        force
      );
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
      playSuccessSound();
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
    fetchSummary(refreshTrigger > 0);
  }, [fetchSummary, refreshTrigger]);

  if (!summary) {
    return (
      <div className="h-56 animate-pulse clay-card rounded-3xl"></div>
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

  let progressColor = "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm";
  if (isOverBudget || percentage >= 100) {
    progressColor = "bg-gradient-to-r from-rose-500 to-red-600 shadow-sm";
  } else if (percentage >= 80) {
    progressColor = "bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm";
  }

  return (
    <div className="clay-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl clay-btn flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
              Monthly Budget Status
            </h2>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              {format(currentMonth, 'MMMM yyyy')} Financial Health
            </p>
          </div>
        </div>

        {summary.total_budget > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl clay-btn text-xs">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
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
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl clay-inset flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Budget Target</span>
            {!isEditingBudget && (
              <button
                onClick={() => {
                  playPopSound();
                  setIsEditingBudget(true);
                  setNewBudgetAmount(summary.total_budget > 0 ? summary.total_budget.toString() : "");
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl clay-btn flex items-center justify-center text-slate-500 hover:text-sky-500 transition-all outline-none"
                title="Edit Target Budget"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
              <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200">₹</span>
              <input
                type="number"
                placeholder="Enter budget..."
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 rounded-xl clay-inset px-2.5 py-1 text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleUpdateBudget}
                disabled={isSaving}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl clay-btn text-emerald-500 flex items-center justify-center outline-none shrink-0"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setIsEditingBudget(false);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl clay-btn text-rose-500 flex items-center justify-center outline-none shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                playPopSound();
                setIsEditingBudget(true);
                setNewBudgetAmount(summary.total_budget > 0 ? summary.total_budget.toString() : "");
              }}
              className="cursor-pointer group mt-1 sm:mt-2"
            >
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                ₹{summary.total_budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              {summary.total_budget === 0 && (
                <p className="text-[10px] sm:text-[11px] font-bold text-sky-500 group-hover:underline mt-0.5">
                  Click to set monthly budget
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Spent So Far */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl clay-inset flex flex-col justify-between min-h-[85px] sm:min-h-[110px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Spent So Far</span>
            {summary.total_budget > 0 && (
              <span className={clsx(
                "text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full clay-btn",
                isOverBudget ? "text-rose-500" : "text-amber-500"
              )}>
                {percentage}%
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              ₹{summary.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl clay-btn flex items-center justify-center text-rose-500 bg-rose-500/10">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Card 3: Net Remaining / Over Budget */}
        <div className={clsx(
          "p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between min-h-[85px] sm:min-h-[110px] transition-all duration-300",
          isOverBudget ? "clay-inset border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20" : "clay-inset"
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
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl clay-btn flex items-center justify-center text-emerald-500 bg-emerald-500/10">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Budget Progress Bar with Visible Target Line */}
      {summary.total_budget > 0 ? (
        <div className="space-y-2.5 mt-2">
          {/* Top Indicators */}
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
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
            <span className="font-black text-sky-600 dark:text-sky-400">
              Target: ₹{summary.total_budget.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Progress Track with Target Marker */}
          {isOverBudget ? (
            (() => {
              const maxScale = Math.max(summary.total_spent, summary.total_budget * 1.15);
              const targetPercent = (summary.total_budget / maxScale) * 100;
              const spentPercent = (summary.total_spent / maxScale) * 100;

              return (
                <div className="relative pt-4 pb-1">
                  {/* Track container */}
                  <div className="w-full h-4 rounded-full clay-inset p-0.5 overflow-hidden relative">
                    {/* Spent bar past target */}
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    />
                  </div>

                  {/* Prominent Target Line Marker */}
                  <div
                    className="absolute top-0 flex flex-col items-center pointer-events-none transition-all duration-500"
                    style={{ left: `${targetPercent}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full clay-btn-primary text-white shadow-md leading-none mb-1">
                      🎯 Target
                    </span>
                    <div className="w-1.5 h-5 bg-sky-500 rounded-full shadow-lg border border-white dark:border-slate-900" />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="relative pt-1">
              <div className="w-full h-3.5 rounded-full clay-inset p-0.5 overflow-hidden">
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
          className="mt-2 p-3.5 rounded-2xl clay-inset text-center cursor-pointer hover:clay-btn transition-all"
        >
          <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
            🎯 No target budget set for this month. Click here to set a target.
          </p>
        </div>
      )}

      {/* Daily Safe Spending Pace & Health Recommendation */}
      {summary.total_budget > 0 && (
        <div className="mt-5 p-4 rounded-2xl clay-inset flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 clay-btn",
              isOverBudget ? "text-rose-500 bg-rose-500/10" : "text-sky-500 bg-sky-500/10"
            )}>
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                {isOverBudget ? (
                  "Monthly Target Exceeded"
                ) : (
                  <>
                    Safe Daily Pace: <span className="text-emerald-500 font-extrabold">₹{safeDailyBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> / day
                  </>
                )}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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
              "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full clay-btn",
              isOverBudget
                ? "text-rose-500"
                : percentage >= 80
                ? "text-amber-500"
                : "text-emerald-500"
            )}>
              {isOverBudget ? "Over Target 🔴" : percentage >= 80 ? "Caution 🟡" : "Safe Pace 🟢"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
