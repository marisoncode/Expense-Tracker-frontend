import React, { useState } from 'react';
import { X, FileText, Download, Calendar, Tag } from 'lucide-react';
import { CATEGORIES } from '../../types/expense';
import { format } from 'date-fns';
import { apiClient } from '../../api/client';
import clsx from 'clsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentMonth: Date;
}

type ExportPeriod = 'month' | 'year' | 'range' | 'all';
type ExportFormat = 'pdf' | 'csv';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentMonth
}) => {
  const [period, setPeriod] = useState<ExportPeriod>('year');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(currentMonth, 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState<number>(currentMonth.getFullYear());
  const [startDate, setStartDate] = useState<string>(format(new Date(currentMonth.getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  if (!isOpen) return null;

  const handleExport = (formatType: ExportFormat) => {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000/api/v1';
    let url = `${baseURL}/expenses/export/${formatType}?user_id=${userId}`;

    if (period === 'month') {
      url += `&month=${selectedMonth}`;
    } else if (period === 'year') {
      url += `&year=${selectedYear}`;
    } else if (period === 'range') {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    if (categoryFilter) {
      url += `&category=${encodeURIComponent(categoryFilter)}`;
    }

    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neu-light dark:bg-neu-dark rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-neu-flat dark:shadow-neu-flat-dark transition-colors duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center text-indigo-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 leading-tight">
                Export Expense Statement
              </h3>
              <p className="text-[11px] font-semibold text-gray-400 leading-none mt-0.5">
                Download PDF or CSV reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed flex items-center justify-center transition-all outline-none"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar space-y-4">
          {/* Period Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Select Statement Period
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { key: 'month', label: 'Month' },
                  { key: 'year', label: 'Full Year' },
                  { key: 'range', label: 'Custom' },
                  { key: 'all', label: 'All-Time' }
                ] as { key: ExportPeriod; label: string }[]
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={clsx(
                    "h-9 rounded-xl text-xs font-black transition-all outline-none",
                    period === p.key
                      ? "shadow-neu-pressed dark:shadow-neu-pressed-dark text-indigo-500 font-extrabold"
                      : "shadow-neu-flat dark:shadow-neu-flat-dark text-gray-600 dark:text-gray-400 hover:shadow-neu-pressed"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Period Inputs */}
          {period === 'month' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Choose Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 bg-transparent rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3.5 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
              />
            </div>
          )}

          {period === 'year' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Choose Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-10 bg-neu-light dark:bg-neu-dark rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3.5 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y} className="bg-neu-light dark:bg-neu-dark">
                    Year {y} Statement
                  </option>
                ))}
              </select>
            </div>
          )}

          {period === 'range' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 bg-transparent rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 bg-transparent rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* Optional Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" /> Filter by Category (Optional)
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 bg-neu-light dark:bg-neu-dark rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark px-3.5 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value="" className="bg-neu-light dark:bg-neu-dark">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name} className="bg-neu-light dark:bg-neu-dark">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format Action Buttons */}
          <div className="pt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleExport('pdf')}
              className="h-11 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-xs font-black text-rose-500 flex items-center justify-center gap-2 transition-all outline-none"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Statement</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="h-11 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-xs font-black text-indigo-500 flex items-center justify-center gap-2 transition-all outline-none"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
