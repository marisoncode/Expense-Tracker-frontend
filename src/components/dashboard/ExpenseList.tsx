import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';
import type { Expense } from '../../types/expense';
import { CATEGORIES } from '../../types/expense';
import {
  Search,
  FileText,
  ArrowUpDown,
  Edit3,
  Trash2,
  Receipt,
  Plus
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { ExportModal } from './ExportModal';
import { playClickSound, playPopSound, playDeleteSound } from '../../utils/sound';

interface ExpenseListProps {
  userId: number;
  refreshTrigger: number;
  currentMonth: Date;
  onEditExpense: (expense: Expense) => void;
  onOpenAddExpense: () => void;
  onExpensesChanged: () => void;
  categoryFilter?: string | null;
  onCategoryFilterChange?: (cat: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  userId,
  refreshTrigger,
  currentMonth,
  onEditExpense,
  onOpenAddExpense,
  onExpensesChanged,
  categoryFilter,
  onCategoryFilterChange
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      let url = `/expenses?user_id=${userId}&month=${monthStr}&sort_by=${sortBy}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (categoryFilter) {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }

      const { data } = await apiClient.get<Expense[]>(url);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentMonth, searchQuery, categoryFilter, sortBy]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`/expenses/${id}`);
      playDeleteSound();
      onExpensesChanged();
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="clay-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 transition-colors duration-300 flex flex-col justify-between h-full">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl clay-btn text-sky-500 bg-sky-500/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                  Transactions History
                </h3>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  {expenses.length} {expenses.length === 1 ? 'record' : 'records'} in {format(currentMonth, 'MMM yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  playPopSound();
                  setIsExportOpen(true);
                }}
                className="flex-1 sm:flex-none h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl clay-btn text-[11px] sm:text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1.5 transition-all outline-none"
                title="Export Statement (PDF / CSV)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={() => {
                  playPopSound();
                  onOpenAddExpense();
                }}
                className="flex-1 sm:flex-none h-8 sm:h-9 px-3 sm:px-4 rounded-xl sm:rounded-2xl clay-btn-primary text-[11px] sm:text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all outline-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Search */}
            <div className="sm:col-span-2 relative flex items-center">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 sm:h-10 clay-inset rounded-xl sm:rounded-2xl pl-9 pr-3 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
            </div>

            {/* Sort */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-8 sm:h-10 clay-inset rounded-xl sm:rounded-2xl pl-8 pr-2.5 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="date_desc" className="bg-white dark:bg-slate-900">Newest First</option>
                <option value="date_asc" className="bg-white dark:bg-slate-900">Oldest First</option>
                <option value="amount_desc" className="bg-white dark:bg-slate-900">Highest Amount</option>
                <option value="amount_asc" className="bg-white dark:bg-slate-900">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Category Pills Filter */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-1 mb-2">
            <button
              onClick={() => {
                playClickSound();
                onCategoryFilterChange && onCategoryFilterChange('');
              }}
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-all outline-none flex items-center ${
                !categoryFilter
                  ? 'clay-btn text-sky-600 dark:text-sky-400 font-black shadow-sm'
                  : 'clay-btn text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = categoryFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    playClickSound();
                    onCategoryFilterChange && onCategoryFilterChange(isSelected ? '' : cat.name);
                  }}
                  className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all outline-none ${
                    isSelected
                      ? 'clay-btn text-sky-600 dark:text-sky-400 font-black shadow-sm'
                      : 'clay-btn text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: cat.hex }} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* List Content */}
          {isLoading ? (
            <div className="space-y-2 py-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse clay-inset rounded-xl sm:rounded-2xl"></div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mx-auto mb-1.5 opacity-40" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No transactions match your filter.</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 mb-2.5">Try clearing filters or add a new expense.</p>
              <button
                onClick={() => {
                  playPopSound();
                  onOpenAddExpense();
                }}
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl sm:rounded-2xl clay-btn text-xs font-black text-sky-600 dark:text-sky-400 inline-flex items-center gap-1.5 transition-all outline-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add Expense Now
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[390px] overflow-y-auto no-scrollbar p-1.5">
              {expenses.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl clay-btn flex items-center justify-between gap-2 sm:gap-3 transition-all duration-200 group"
                >
                  {/* Left Details */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl clay-inset flex items-center justify-center shrink-0">
                      <CategoryIcon category={item.category} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {item.category}
                        </span>
                        {item.payment_method && (
                          item.payment_method.toLowerCase().includes('upi') ? (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-sky-600 dark:text-sky-400 border border-sky-400/30 bg-sky-50/50 dark:bg-sky-950/30 flex items-center gap-0.5">
                              <span>⚡</span> {item.payment_method}
                            </span>
                          ) : item.payment_method.toLowerCase().includes('cash') ? (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center gap-0.5">
                              <span>💵</span> {item.payment_method}
                            </span>
                          ) : item.payment_method.toLowerCase().includes('credit') ? (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-amber-600 dark:text-amber-400 border border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/30 flex items-center gap-0.5">
                              <span>💳</span> {item.payment_method}
                            </span>
                          ) : item.payment_method.toLowerCase().includes('debit') ? (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-blue-600 dark:text-blue-400 border border-blue-400/30 bg-blue-50/50 dark:bg-blue-950/30 flex items-center gap-0.5">
                              <span>💳</span> {item.payment_method}
                            </span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-teal-600 dark:text-teal-400 border border-teal-400/30 bg-teal-50/50 dark:bg-teal-950/30 flex items-center gap-0.5">
                              <span>🏦</span> {item.payment_method}
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-slate-500">
                        <span>{item.date}</span>
                        {item.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate italic max-w-[100px] sm:max-w-xs">{item.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <span className="text-xs sm:text-sm font-black text-rose-500 tracking-tight whitespace-nowrap">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                    {/* Edit / Delete Buttons */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          playPopSound();
                          onEditExpense(item);
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl clay-btn text-slate-500 hover:text-sky-500 transition-all outline-none"
                        title="Edit transaction"
                      >
                        <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl clay-btn text-slate-500 hover:text-rose-500 transition-all outline-none"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Statement Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        userId={userId}
        currentMonth={currentMonth}
      />
    </>
  );
};
