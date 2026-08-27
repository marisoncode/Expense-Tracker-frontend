import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Calendar as CalIcon,
  Plus
} from 'lucide-react';
import type { NavTab } from './Header';
import clsx from 'clsx';

interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense
}) => {
  const navItems: { key: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'charts', label: 'Charts', icon: PieChart },
    { key: 'transactions', label: 'List', icon: Receipt },
    { key: 'calendar', label: 'Calendar', icon: CalIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-neu-light/90 dark:bg-neu-dark/90 backdrop-blur-lg border-t border-gray-300/30 dark:border-gray-800/40">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all outline-none",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-black"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-xl transition-all",
                  isActive
                    ? "shadow-neu-pressed dark:shadow-neu-pressed-dark bg-indigo-500/10"
                    : "shadow-neu-flat dark:shadow-neu-flat-dark"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Action Button (FAB) */}
        <button
          onClick={onOpenAddExpense}
          className="flex flex-col items-center gap-1 -mt-5 outline-none group"
          title="Add Expense"
        >
          <div className="p-3.5 rounded-2xl shadow-neu-flat dark:shadow-neu-flat-dark group-hover:shadow-neu-pressed bg-indigo-600 text-white transition-all transform group-active:scale-95">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-black text-indigo-500">Add</span>
        </button>

        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all outline-none",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-black"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-xl transition-all",
                  isActive
                    ? "shadow-neu-pressed dark:shadow-neu-pressed-dark bg-indigo-500/10"
                    : "shadow-neu-flat dark:shadow-neu-flat-dark"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
