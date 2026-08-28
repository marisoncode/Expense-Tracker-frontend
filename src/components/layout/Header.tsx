import React, { useState } from 'react';
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
  Plus,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { format, addMonths, subMonths } from 'date-fns';
import clsx from 'clsx';
import {
  isSoundEnabled,
  toggleSoundEnabled,
  playClickSound,
  playToggleSound,
  playPopSound
} from '../../utils/sound';

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
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  const handleSoundToggle = () => {
    const next = toggleSoundEnabled();
    setSoundOn(next);
  };

  const navItems: { key: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'charts', label: 'Charts & Filter', icon: PieChart },
    { key: 'transactions', label: 'Transactions', icon: Receipt },
    { key: 'calendar', label: 'Calendar', icon: CalIcon },
  ];

  return (
    <header className="bg-white/80 dark:bg-[#0c1527]/80 backdrop-blur-xl border-b border-sky-200/80 dark:border-white/10 z-40 transition-colors duration-300 shrink-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20 gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl clay-btn overflow-hidden p-0.5 flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 shadow-clay-primary">
              <img
                src="/icon-192.png"
                alt="SpendWise"
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
              />
            </div>
            <div>

              <h1 className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight leading-tight">
                SpendWise
              </h1>
              <p className="hidden sm:block text-[9px] font-bold text-sky-600/70 dark:text-sky-400/70 uppercase tracking-widest leading-none mt-0.5">
                Expense & Budget Tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl clay-inset">
            {navItems.map((item) => {
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
                    "h-9 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all outline-none",
                    isActive
                      ? "clay-btn text-sky-600 dark:text-sky-400 font-black shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <Icon className={clsx("w-4 h-4", isActive ? "text-sky-500" : "text-slate-400")} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Month Navigator + Add CTA + Sound Toggle + Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Month Switcher */}
            <div className="flex items-center h-8 sm:h-10 px-1 rounded-xl sm:rounded-2xl clay-btn">
              <button
                onClick={() => {
                  playToggleSound();
                  onMonthChange(subMonths(currentMonth, 1));
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-sky-100/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-all outline-none"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onMonthChange(new Date());
                }}
                className="px-1.5 sm:px-2.5 text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide hover:text-sky-500 transition-colors whitespace-nowrap"
                title="Click for Current Month"
              >
                {format(currentMonth, 'MMM yy')}
              </button>
              <button
                onClick={() => {
                  playToggleSound();
                  onMonthChange(addMonths(currentMonth, 1));
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-sky-100/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-all outline-none"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => {
                playPopSound();
                onOpenAddExpense();
              }}
              className="h-8 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl clay-btn-primary text-xs font-black flex items-center gap-1 sm:gap-1.5 outline-none shrink-0"
              title="Log Expense"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden xs:inline sm:inline">Add</span>
            </button>

            {/* Sound Toggle (Direct Enable / Disable) */}
            <button
              onClick={handleSoundToggle}
              className={clsx(
                "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all outline-none shrink-0",
                soundOn
                  ? "clay-btn text-sky-500 hover:text-sky-600 shadow-sm"
                  : "clay-inset text-slate-400 opacity-60"
              )}
              title={soundOn ? "Sound Effects ON (Click to Mute)" : "Sound Effects MUTED (Click to Enable)"}
              aria-label="Toggle Sound Effects"
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              ) : (
                <VolumeX className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                playToggleSound();
                toggleTheme();
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl clay-btn text-slate-700 dark:text-slate-200 transition-all outline-none shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-sky-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
