import React, { useState, useEffect } from 'react';
import { X, Plus, Check, IndianRupee, Tag, Calendar as CalIcon, CreditCard, AlignLeft } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Expense } from '../../types/expense';
import { CATEGORIES, PAYMENT_METHODS } from '../../types/expense';
import { CategoryIcon } from './CategoryIcon';
import clsx from 'clsx';
import { format } from 'date-fns';
import { playSuccessSound, playClickSound } from '../../utils/sound';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  initialDate?: string;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  initialDate,
  expenseToEdit
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].name);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [date, setDate] = useState<string>(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setPaymentMethod(expenseToEdit.payment_method || 'UPI');
      setDate(expenseToEdit.date);
      setNotes(expenseToEdit.notes || '');
    } else {
      setAmount('');
      setCategory(CATEGORIES[0].name);
      setPaymentMethod('UPI');
      setDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
    }
    setError(null);
  }, [expenseToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (expenseToEdit) {
        await apiClient.put(`/expenses/${expenseToEdit.id}`, {
          amount: numAmount,
          category,
          payment_method: paymentMethod,
          date,
          notes: notes.trim() || null
        });
      } else {
        await apiClient.post('/expenses', {
          user_id: userId,
          amount: numAmount,
          category,
          payment_method: paymentMethod,
          date,
          notes: notes.trim() || null
        });
      }

      playSuccessSound();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save expense', err);
      setError(err?.response?.data?.detail || 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neu-light dark:bg-neu-dark rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 leading-tight">
                {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <p className="text-[11px] font-semibold text-gray-400 leading-none mt-0.5">Record your transaction details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed flex items-center justify-center transition-all outline-none"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar flex-1 space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Amount (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-black text-gray-400 pointer-events-none">₹</span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 bg-transparent rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark pl-10 pr-4 text-2xl font-black text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" /> Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCategory(cat.name);
                    }}
                    className={clsx(
                      "h-10 px-3 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all outline-none text-left",
                      isSelected
                        ? "shadow-neu-pressed dark:shadow-neu-pressed-dark border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-black"
                        : "shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <CategoryIcon category={cat.name} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <CalIcon className="w-3.5 h-3.5 text-indigo-500" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 bg-transparent rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3.5 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  playClickSound();
                  setPaymentMethod(e.target.value);
                }}
                className="w-full h-11 bg-neu-light dark:bg-neu-dark rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3.5 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-neu-light dark:bg-neu-dark text-gray-800 dark:text-gray-200">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-500" /> Notes / Description
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Cafe coffee, Petrol station, Swiggy order..."
              className="w-full h-11 bg-transparent rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3.5 text-xs font-semibold text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 h-11 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-xs font-bold text-gray-600 dark:text-gray-400 transition-all outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 h-11 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-xs font-black text-indigo-500 flex items-center justify-center gap-2 transition-all outline-none"
            >
              {expenseToEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
