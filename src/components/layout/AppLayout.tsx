import React from 'react';
import { Header } from './Header';
import type { NavTab } from './Header';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  onOpenAddExpense: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  currentMonth,
  onMonthChange,
  onOpenAddExpense
}) => {
  return (
    <div className="relative h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-[#e8f3fc] dark:bg-[#0c1527] transition-colors duration-300">
      {/* Dynamic 3D Money, Rupee Coins & Finance Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        {/* 1. Top-Left: 3D Golden Rupee Coin with Ambient Glow */}
        <div 
          className="absolute -top-6 -left-6 sm:top-6 sm:left-8 animate-float-slow opacity-85 hover:opacity-100 transition-opacity"
          style={{ animationDelay: '0s' }}
        >
          <div className="clay-coin-3d w-20 h-20 sm:w-28 sm:h-28 flex flex-col items-center justify-center text-amber-950 dark:text-amber-900 font-black shadow-2xl relative transform -rotate-12">
            <span className="text-2xl sm:text-4xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] leading-none">₹</span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-extrabold text-amber-900/80 -mt-0.5">SAVE</span>
            <div className="absolute top-2 left-3 w-4 h-2 sm:w-6 sm:h-3 rounded-full bg-white/70 blur-[1px]" />
          </div>
        </div>

        {/* 2. Top-Right: 3D Floating Credit Card / Money Token */}
        <div 
          className="absolute top-12 right-3 sm:top-14 sm:right-16 animate-float-medium opacity-80"
          style={{ animationDelay: '2s' }}
        >
          <div className="clay-card-3d w-24 h-16 sm:w-36 sm:h-24 p-2 sm:p-3 flex flex-col justify-between text-white shadow-2xl transform rotate-12">
            <div className="flex justify-between items-center">
              <div className="w-5 h-3 sm:w-7 sm:h-5 rounded-md bg-amber-300/80 border border-amber-400/90 shadow-sm" />
              <span className="text-[10px] sm:text-xs font-black tracking-widest">₹ PAY</span>
            </div>
            <div className="space-y-0.5">
              <div className="w-12 sm:w-16 h-1 rounded bg-white/50" />
              <span className="text-[8px] sm:text-[9px] font-mono tracking-wider opacity-80">•••• 8829</span>
            </div>
          </div>
        </div>

        {/* 3. Mid-Right: 3D Savings Diamond / Gem */}
        <div 
          className="absolute top-1/3 -right-4 sm:right-12 animate-float-reverse opacity-75"
          style={{ animationDelay: '4s' }}
        >
          <div className="clay-gem-3d w-16 h-16 sm:w-24 sm:h-24 flex flex-col items-center justify-center text-emerald-950 font-black shadow-2xl transform -rotate-6">
            <span className="text-xl sm:text-3xl drop-shadow-md">💎</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-900">WEALTH</span>
          </div>
        </div>

        {/* 4. Mid-Left: 3D Money Bag Orb */}
        <div 
          className="absolute top-1/2 left-3 sm:left-14 animate-float-medium opacity-80"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="clay-orb-3d w-16 h-16 sm:w-24 sm:h-24 flex flex-col items-center justify-center text-indigo-950 font-black shadow-2xl transform rotate-6">
            <span className="text-xl sm:text-3xl drop-shadow-md">💰</span>
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-indigo-950/80">BUDGET</span>
          </div>
        </div>

        {/* 5. Bottom-Left: 3D Growth Trend & Piggy Token */}
        <div 
          className="absolute bottom-16 left-8 sm:bottom-20 sm:left-24 animate-float-slow opacity-80"
          style={{ animationDelay: '3.5s' }}
        >
          <div className="clay-bubble w-20 h-20 sm:w-28 sm:h-28 flex flex-col items-center justify-center shadow-2xl transform -rotate-12 border-2 border-sky-300/60">
            <span className="text-2xl sm:text-4xl drop-shadow-md">📈</span>
            <span className="text-[8px] sm:text-[10px] font-black text-sky-700 dark:text-sky-300 tracking-wider">GROWTH</span>
          </div>
        </div>

        {/* 6. Bottom-Right: 3D Golden Rupee Coin */}
        <div 
          className="absolute -bottom-4 right-1/4 sm:bottom-12 sm:right-1/4 animate-float-fast opacity-85"
          style={{ animationDelay: '5s' }}
        >
          <div className="clay-coin-3d w-16 h-16 sm:w-22 sm:h-22 flex flex-col items-center justify-center text-amber-950 font-black shadow-2xl transform rotate-12">
            <span className="text-xl sm:text-3xl drop-shadow-md">₹</span>
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-amber-900">INR</span>
          </div>
        </div>

        {/* 7. Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-sky-400/15 dark:bg-sky-500/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-400/15 dark:bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Persistent Top Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        onOpenAddExpense={onOpenAddExpense}
      />

      {/* Main View Container (100vh Fitted with Smooth Internal Scroll) */}
      <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 pb-24 md:pb-8 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenAddExpense={onOpenAddExpense}
      />
    </div>
  );
};

