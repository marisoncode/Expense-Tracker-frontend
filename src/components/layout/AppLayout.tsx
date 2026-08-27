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
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-neu-light dark:bg-neu-dark transition-colors duration-300">
      {/* Persistent Top Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        onOpenAddExpense={onOpenAddExpense}
      />

      {/* Main View Container (100vh Fitted with Smooth Internal Scroll) */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 pb-24 md:pb-8 w-full max-w-7xl mx-auto">
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
