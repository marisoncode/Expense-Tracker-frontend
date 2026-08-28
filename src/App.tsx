import { useState } from 'react';
import { useState, lazy, Suspense } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { NavTab } from './components/layout/Header';
import { BudgetWidget } from './components/dashboard/BudgetWidget';
import { AnalyticsSummary } from './components/dashboard/AnalyticsSummary';
import { CategoryPieWidget } from './components/dashboard/CategoryPieWidget';
import { ExpenseCharts } from './components/dashboard/ExpenseCharts';
import { ExpenseList } from './components/dashboard/ExpenseList';
import { CalendarView } from './components/dashboard/CalendarView';
import { ExpenseModal } from './components/dashboard/ExpenseModal';
import type { Expense } from './types/expense';

// Lazy load secondary tab views and modals for fast initial paint
const ExpenseCharts = lazy(() =>
  import('./components/dashboard/ExpenseCharts').then((m) => ({ default: m.ExpenseCharts }))
);
const CalendarView = lazy(() =>
  import('./components/dashboard/CalendarView').then((m) => ({ default: m.CalendarView }))
);
const ExpenseModal = lazy(() =>
  import('./components/dashboard/ExpenseModal').then((m) => ({ default: m.ExpenseModal }))
);

const TabLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
      <span className="text-xs font-semibold text-slate-400">Loading view...</span>
    </div>
  </div>
);


function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [selectedInitialDate, setSelectedInitialDate] = useState<string | undefined>(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const USER_ID = 1; // Default primary user

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleOpenAddExpense = (initialDateStr?: string) => {
    setExpenseToEdit(null);
    setSelectedInitialDate(initialDateStr);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setSelectedInitialDate(expense.date);
    setIsExpenseModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
    setSelectedInitialDate(undefined);
  };

  return (
    <>
      <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentMonth={currentMonth}
      onMonthChange={setCurrentMonth}
      onOpenAddExpense={() => handleOpenAddExpense()}
    >
      <div className="flex flex-col gap-6">
        {/* TAB 1: OVERVIEW / DASHBOARD (Budget + 50/50 Category Donut & Transactions Split) */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Budget Status Widget */}
            <BudgetWidget
              userId={USER_ID}
              refreshTrigger={refreshTrigger}
              currentMonth={currentMonth}
              onOpenAddExpense={() => handleOpenAddExpense()}
            />

            {/* Financial Highlights & Analytics Cards */}
            <AnalyticsSummary
              userId={USER_ID}
              refreshTrigger={refreshTrigger}
              currentMonth={currentMonth}
            />

            {/* Clean 50 / 50 Split: Category Distribution Chart (Left) and Transactions Manager (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: Category Donut & Progress (50% width) */}
              <div className="w-full">
                <CategoryPieWidget
                  userId={USER_ID}
                  refreshTrigger={refreshTrigger}
                  currentMonth={currentMonth}
                  selectedCategory={selectedCategoryFilter}
                  onSelectCategory={(cat) => setSelectedCategoryFilter(cat)}
                />
              </div>

              {/* Right Column: Transactions History (50% width) */}
              <div className="w-full">
                <ExpenseList
                  userId={USER_ID}
                  refreshTrigger={refreshTrigger}
                  currentMonth={currentMonth}
                  onEditExpense={handleEditExpense}
                  onOpenAddExpense={() => handleOpenAddExpense()}
                  onExpensesChanged={triggerRefresh}
                  categoryFilter={selectedCategoryFilter}
                  onCategoryFilterChange={(cat) => setSelectedCategoryFilter(cat)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHARTS & ANALYTICS DEDICATED VIEW */}
        {activeTab === 'charts' && (
          <div className="animate-fade-in max-w-5xl mx-auto w-full">
            <ExpenseCharts
              userId={USER_ID}
              currentMonth={currentMonth}
              refreshTrigger={refreshTrigger}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={(cat) => setSelectedCategoryFilter(cat)}
            />
          </div>
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="animate-fade-in max-w-5xl mx-auto w-full">
              <ExpenseCharts
                userId={USER_ID}
                currentMonth={currentMonth}
                refreshTrigger={refreshTrigger}
                selectedCategory={selectedCategoryFilter}
                onSelectCategory={(cat) => setSelectedCategoryFilter(cat)}
              />
            </div>
          </Suspense>
        )}

        {/* TAB 3: TRANSACTIONS DEDICATED VIEW */}
        {activeTab === 'transactions' && (
          <div className="animate-fade-in max-w-4xl mx-auto w-full">
            <ExpenseList
              userId={USER_ID}
              refreshTrigger={refreshTrigger}
              currentMonth={currentMonth}
              onEditExpense={handleEditExpense}
              onOpenAddExpense={() => handleOpenAddExpense()}
              onExpensesChanged={triggerRefresh}
              categoryFilter={selectedCategoryFilter}
              onCategoryFilterChange={(cat) => setSelectedCategoryFilter(cat)}
            />
          </div>
        )}

        {/* TAB 4: CALENDAR DEDICATED VIEW */}
        {activeTab === 'calendar' && (
          <div className="animate-fade-in max-w-4xl mx-auto w-full">
            <CalendarView
              userId={USER_ID}
              currentMonth={currentMonth}
              refreshTrigger={refreshTrigger}
              onExpenseAdded={triggerRefresh}
              onOpenAddExpenseForDate={(d) => handleOpenAddExpense(d)}
              onEditExpense={handleEditExpense}
            />
          </div>
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="animate-fade-in max-w-4xl mx-auto w-full">
              <CalendarView
                userId={USER_ID}
                currentMonth={currentMonth}
                refreshTrigger={refreshTrigger}
                onExpenseAdded={triggerRefresh}
                onOpenAddExpenseForDate={(d) => handleOpenAddExpense(d)}
                onEditExpense={handleEditExpense}
              />
            </div>
          </Suspense>
        )}
      </div>
    </AppLayout>

    {/* Add / Edit Expense Modal at Root Level (Above all layout layers) */}
    <ExpenseModal
      isOpen={isExpenseModalOpen}
      onClose={handleCloseModal}
      onSuccess={triggerRefresh}
      userId={USER_ID}
      initialDate={selectedInitialDate}
      expenseToEdit={expenseToEdit}
    />
    {isExpenseModalOpen && (
      <Suspense fallback={null}>
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={handleCloseModal}
          onSuccess={triggerRefresh}
          userId={USER_ID}
          initialDate={selectedInitialDate}
          expenseToEdit={expenseToEdit}
        />
      </Suspense>
    )}
  </>
);
}

export default App;

