export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export type NotificationType = 'BUDGET_WARNING' | 'BUDGET_EXCEEDED' | 'SYSTEM' | 'GENERAL';

export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  theme: string;
  defaultDateRange: string;
  budgetNotificationsEnabled: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  systemCategory: boolean;
  totalSpending: number;
  transactionCount: number;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: Category;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePageResponse {
  content: Expense[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface BudgetCategory {
  id?: number;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgetAmount: number;
  spentAmount?: number;
  remainingAmount?: number;
  percentageUsed?: number;
}

export interface MonthlyBudget {
  id?: number | null;
  month: number;
  year: number;
  totalBudget: number;
  warningThreshold: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isWarning: boolean;
  categories: BudgetCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSpendingThisMonth: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
  todaySpending: number;
  thisWeekSpending: number;
  transactionCount: number;
  largestExpense: number;
  largestExpenseDescription: string;
  averageDailySpend: number;
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyComparison {
  year: number;
  month: number;
  monthName: string;
  totalSpent: number;
  budgetAmount: number;
}

export interface PaymentMethodSpending {
  paymentMethod: PaymentMethod;
  displayName: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailyTrend {
  date: string;
  amount: number;
  count: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'POSITIVE' | 'WARNING' | 'INFO';
  icon: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
