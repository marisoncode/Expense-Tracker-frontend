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
import { playClickSound, playPopSound } from '../../utils/sound';

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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white/80 dark:bg-[#0c1527]/90 backdrop-blur-xl border-t border-sky-200/80 dark:border-white/10 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                playClickSound();
                onTabChange(item.key);
              }}
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all outline-none",
                isActive
                  ? "text-sky-600 dark:text-sky-400 font-black"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-xl transition-all",
                  isActive
                    ? "clay-btn text-sky-600 dark:text-sky-400 shadow-sm"
                    : "hover:clay-btn"
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
          onClick={() => {
            playPopSound();
            onOpenAddExpense();
          }}
          className="flex flex-col items-center gap-1 -mt-6 outline-none group"
          title="Add Expense"
        >
          <div className="p-3.5 rounded-2xl clay-btn-primary shadow-clay-primary text-white transition-all transform group-active:scale-95">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <span className="text-[10px] font-black text-sky-600 dark:text-sky-400">Add</span>
        </button>

        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                playClickSound();
                onTabChange(item.key);
              }}
              className={clsx(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all outline-none",
                isActive
                  ? "text-sky-600 dark:text-sky-400 font-black"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-xl transition-all",
                  isActive
                    ? "clay-btn text-sky-600 dark:text-sky-400 shadow-sm"
                    : "hover:clay-btn"
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
