export interface Expense {
  id: number;
  user_id: number;
  date: string;
  amount: number;
  category: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
}

export interface BudgetSummary {
  month: string;
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  negative_balance: number;
  spent_percentage: number;
  is_over_budget: boolean;
}

export interface CategoryBreakdownItem {
  category: string;
  total_spent: number;
  percentage: number;
  transaction_count: number;
}

export interface MonthlyStats {
  total_spent: number;
  transaction_count: number;
  average_daily_spent: number;
  highest_expense_amount: number;
  highest_expense_title?: string;
  top_category?: string;
  top_category_amount: number;
}

export interface TrendPoint {
  label: string;
  date_key: string;
  total_spent: number;
  transaction_count: number;
}

export interface TrendAnalytics {
  timeframe: 'day' | 'month' | 'year';
  period_label: string;
  total_period_spent: number;
  points: TrendPoint[];
}

export interface DailySpendingOverview {
  month: string;
  daily_totals: Record<string, number>;
  total_month_spent: number;
}

export interface DaySummary {
  date: string;
  expenses: Expense[];
  total_spent: number;
}

export interface MonthlyComparisonItem {
  month_key: string;
  month_num: number;
  month_name: string;
  short_month: string;
  year: number;
  total_spent: number;
  transaction_count: number;
  budget: number;
  is_current_month: boolean;
  percentage_of_peak: number;
  percentage_of_year: number;
}

export interface MonthlyComparisonResponse {
  year: number;
  yearly_total_spent: number;
  average_monthly_spent: number;
  peak_month?: string | null;
  peak_amount: number;
  months: MonthlyComparisonItem[];
}

export const CATEGORIES = [
  { name: 'Food', icon: 'Utensils', color: 'text-amber-500', hex: '#f59e0b', bg: 'bg-amber-500/10' },
  { name: 'Petrol', icon: 'Fuel', color: 'text-emerald-500', hex: '#10b981', bg: 'bg-emerald-500/10' },
  { name: 'Dress', icon: 'Shirt', color: 'text-pink-500', hex: '#ec4899', bg: 'bg-pink-500/10' },
  { name: 'Accessories', icon: 'Sparkles', color: 'text-cyan-500', hex: '#06b6d4', bg: 'bg-cyan-500/10' },
  { name: 'Cinema', icon: 'Film', color: 'text-rose-500', hex: '#f43f5e', bg: 'bg-rose-500/10' },
  { name: 'Other Expenses', icon: 'MoreHorizontal', color: 'text-purple-500', hex: '#8b5cf6', bg: 'bg-purple-500/10' },
] as const;

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
] as const;
