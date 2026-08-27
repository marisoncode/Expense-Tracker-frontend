import React from 'react';
import {
  Moon,
  Sun,
  IndianRupee,
  LayoutDashboard,
  PieChart,
  Receipt,
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { format, addMonths, subMonths } from 'date-fns';
import clsx from 'clsx';

export type NavTab = 'overview' | 'charts' | 'transactions' | 'calendar';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  onOpenAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentMonth,
  onMonthChange,
  onOpenAddExpense
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems: { key: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'charts', label: 'Charts & Filter', icon: PieChart },
    { key: 'transactions', label: 'Transactions', icon: Receipt },
    { key: 'calendar', label: 'Calendar', icon: CalIcon },
  ];

  return (
    <header className="bg-neu-light dark:bg-neu-dark border-b border-gray-300/30 dark:border-gray-800/40 z-40 transition-colors duration-300 shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20 gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark flex items-center justify-center">
              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight leading-tight">
                SpendWise
              </h1>
              <p className="hidden sm:block text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">
                Expense & Budget Tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl shadow-neu-pressed dark:shadow-neu-pressed-dark bg-transparent">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange(item.key)}
                  className={clsx(
                    "h-9 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all outline-none",
                    isActive
                      ? "shadow-neu-flat dark:shadow-neu-flat-dark text-indigo-600 dark:text-indigo-400 bg-neu-light dark:bg-neu-dark"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Month Navigator + Add CTA + Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Month Switcher */}
            <div className="flex items-center h-8 sm:h-10 px-0.5 sm:px-1 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark">
              <button
                onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl hover:shadow-neu-pressed text-gray-600 dark:text-gray-400 transition-all outline-none"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => onMonthChange(new Date())}
                className="px-1.5 sm:px-2.5 text-[11px] sm:text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-wide hover:text-indigo-500 transition-colors whitespace-nowrap"
                title="Click for Current Month"
              >
                {format(currentMonth, 'MMM yy')}
              </button>
              <button
                onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl hover:shadow-neu-pressed text-gray-600 dark:text-gray-400 transition-all outline-none"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenAddExpense}
              className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed text-xs font-black text-indigo-500 flex items-center gap-1 sm:gap-1.5 transition-all outline-none shrink-0"
              title="Log Expense"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Add</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark hover:shadow-neu-pressed dark:hover:shadow-neu-pressed-dark transition-all outline-none shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-indigo-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
