import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Receipt,
  Lightbulb,
  CheckCircle,
  Wallet,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { expenseService } from '../../services/expenseService';
import { budgetService } from '../../services/budgetService';
import {
  AnalyticsSummary,
  CategorySpending,
  DailyTrend,
  Expense,
  Insight,
  MonthlyBudget,
  MonthlyComparison,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { MonthlyBarChart } from '../../components/charts/MonthlyBarChart';
import { CategoryIconRenderer } from '../../utils/categoryIcons';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySpending[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyComparison[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Delete modal state
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sumData, budgetData, catData, trendData, histData, expData, insightsData] =
        await Promise.all([
          analyticsService.getSummary({ month: currentMonth, year: currentYear }),
          budgetService.getBudgetByYearAndMonth(currentYear, currentMonth),
          analyticsService.getCategoryBreakdown({ month: currentMonth, year: currentYear }),
          analyticsService.getDailyTrend({ month: currentMonth, year: currentYear }),
          analyticsService.getMonthlyComparison(6),
          expenseService.getExpenses({ page: 0, size: 7, sort: 'newest' }),
          analyticsService.getInsights({ month: currentMonth, year: currentYear }),
        ]);

      setSummary(sumData);
      setCurrentBudget(budgetData);
      setCategoryBreakdown(catData);
      setDailyTrend(trendData);
      setMonthlyHistory(histData);
      setRecentExpenses(expData.content);
      setInsights(insightsData);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      toast.success('Expense deleted successfully');
      setExpenseToDelete(null);
      loadDashboardData();
    } catch {
      toast.error('Could not delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const budgetUsed = summary?.budgetPercentageUsed || 0;
  const isOverBudget = currentBudget?.isOverBudget || false;
  const isWarningBudget = currentBudget?.isWarning || false;
  const hasExpenses = recentExpenses.length > 0;
  const hasBudget = currentBudget && currentBudget.id;

  return (
    <div className="space-y-6 text-ink">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-xl p-6 shadow-card">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink tracking-tight">
            Financial Ledger Overview
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Month of{' '}
            <span className="font-medium text-ink">
              {new Date(currentYear, currentMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            . Track expenses against your monthly limits in real time.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/expenses/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Expense
            </Button>
          </Link>
          <Link to="/budgets">
            <Button variant="secondary" size="md">
              Adjust Budget
            </Button>
          </Link>
        </div>
      </div>

      {/* Brand New User Guidance Empty State */}
      {!hasExpenses && !hasBudget && (
        <EmptyState
          icon={Wallet}
          title="Welcome to your financial ledger"
          description="You haven't recorded any expenses or set a monthly budget yet. Log your first expense or set a spending target to see your dashboard come to life."
          actionText="Log Your First Expense"
          onAction={() => (window.location.href = '/expenses/new')}
        />
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spending */}
        <Card className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Total Spent This Month</span>
            <div className="w-7 h-7 rounded-md bg-surface-subtle text-accent flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {formatCurrency(summary?.totalSpendingThisMonth, currency)}
            </span>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-secondary">
              <span>{summary?.transactionCount || 0} transaction(s)</span>
              <span>&bull;</span>
              <span>Avg {formatCurrency(summary?.averageDailySpend, currency)}/day</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Monthly Budget */}
        <Card className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Monthly Budget Target</span>
            <div className="w-7 h-7 rounded-md bg-surface-subtle text-accent flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {formatCurrency(summary?.monthlyBudget, currency)}
            </span>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-secondary">
              <span>{currentBudget?.warningThreshold || 80}% warning threshold</span>
              <span>&bull;</span>
              <span>{currentBudget?.categories?.length || 0} categories</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Remaining Budget */}
        <Card className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Remaining Balance</span>
            <div className="w-7 h-7 rounded-md bg-surface-subtle text-accent flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`font-display text-2xl font-semibold tracking-tight tabular-nums ${
                (summary?.remainingBudget || 0) < 0 ? 'text-danger' : 'text-ink'
              }`}
            >
              {formatCurrency(summary?.remainingBudget, currency)}
            </span>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              {isOverBudget ? (
                <span className="text-danger font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Budget limit exceeded
                </span>
              ) : isWarningBudget ? (
                <span className="text-warning font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warning threshold reached
                </span>
              ) : (
                <span className="text-success font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Spending within limits
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Card 4: Budget Used % */}
        <Card className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Budget Utilization</span>
            <span className="font-semibold text-xs tabular-nums text-ink">
              {budgetUsed.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="w-full bg-surface-subtle rounded-full h-2 overflow-hidden border border-border/40">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isOverBudget
                    ? 'bg-danger'
                    : isWarningBudget
                    ? 'bg-warning'
                    : 'bg-accent'
                }`}
                style={{ width: `${Math.min(100, budgetUsed)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-ink-muted pt-1">
              <span>Today: {formatCurrency(summary?.todaySpending, currency)}</span>
              <span>This week: {formatCurrency(summary?.thisWeekSpending, currency)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Line Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div>
              <h3 className="font-semibold text-sm text-ink">Daily Spending Trend</h3>
              <p className="text-xs text-ink-muted">Cumulative disbursements over the current month</p>
            </div>
          </div>
          <SpendingTrendChart data={dailyTrend} currency={currency} />
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div>
              <h3 className="font-semibold text-sm text-ink">Category Distribution</h3>
              <p className="text-xs text-ink-muted">Share of expenses by category</p>
            </div>
          </div>
          <CategoryPieChart data={categoryBreakdown} currency={currency} />
        </Card>
      </div>

      {/* Monthly History & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm text-ink">Monthly Spend vs Budget History</h3>
                <p className="text-xs text-ink-muted">Past 6 months comparison</p>
              </div>
            </div>
            <MonthlyBarChart data={monthlyHistory} currency={currency} />
          </Card>
        </div>

        {/* Spending Insights Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <Lightbulb className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-sm text-ink">Financial Insights</h3>
            </div>

            <div className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-xs text-ink-muted py-4">
                  Log additional transactions across categories to unlock tailored insights.
                </p>
              ) : (
                insights.map((ins, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-surface-elevated border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      {ins.type === 'WARNING' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      )}
                      <span className="font-semibold text-ink">{ins.title}</span>
                    </div>
                    <p className="text-ink-secondary leading-relaxed pl-5">{ins.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {summary?.largestExpense && summary.largestExpense > 0 && (
            <div className="mt-4 pt-3 border-t border-border text-xs flex items-center justify-between">
              <span className="text-ink-muted">Largest Single Expense:</span>
              <span className="font-bold text-ink tabular-nums">
                {formatCurrency(summary.largestExpense, currency)}
                <span className="text-ink-muted font-normal ml-1">({summary.largestExpenseDescription})</span>
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Expenses List with View/Edit/Delete */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
          <div>
            <h3 className="font-semibold text-sm text-ink">Recent Transactions</h3>
            <p className="text-xs text-ink-muted">Latest entries posted to your ledger</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>View All Expenses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-muted">
            No expenses logged yet. Click &apos;Add Expense&apos; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-ink-muted font-medium">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 px-3 text-ink-secondary whitespace-nowrap">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-ink">
                      {expense.description}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-subtle border border-border">
                        <CategoryIconRenderer
                          name={expense.category.icon}
                          className="w-3.5 h-3.5"
                          color={expense.category.color}
                        />
                        <span>{expense.category.name}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-secondary">{expense.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-bold text-ink whitespace-nowrap tabular-nums">
                      {formatCurrency(expense.amount, currency)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link
                          to={`/expenses/${expense.id}/edit`}
                          className="text-xs text-accent hover:underline font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setExpenseToDelete(expense)}
                          className="text-xs text-danger hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Delete Expense"
        description={`Are you sure you want to delete "${expenseToDelete?.description}"? This will update your monthly budget calculation.`}
      >
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => setExpenseToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
