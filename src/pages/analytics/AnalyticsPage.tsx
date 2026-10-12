import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Calendar,
  CreditCard,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { analyticsService, AnalyticsFilterParams } from '../../services/analyticsService';
import {
  CategorySpending,
  DailyTrend,
  Expense,
  Insight,
  MonthlyComparison,
  PaymentMethodSpending,
} from '../../types';
import { formatCurrency, formatDate, formatMonthName } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { MonthlyBarChart } from '../../components/charts/MonthlyBarChart';
import { PaymentMethodChart } from '../../components/charts/PaymentMethodChart';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [monthsCount, setMonthsCount] = useState<number>(6);

  const [isLoading, setIsLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([]);
  const [trendData, setTrendData] = useState<DailyTrend[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyComparison[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentMethodSpending[]>([]);
  const [topExpenses, setTopExpenses] = useState<Expense[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const params: AnalyticsFilterParams = {
        month: selectedMonth,
        year: selectedYear,
      };

      const [cat, trend, hist, pay, top, ins] = await Promise.all([
        analyticsService.getCategoryBreakdown(params),
        analyticsService.getDailyTrend(params),
        analyticsService.getMonthlyComparison(monthsCount),
        analyticsService.getPaymentMethods(params),
        analyticsService.getTopExpenses(5, params),
        analyticsService.getInsights(params),
      ]);

      setCategoryData(cat);
      setTrendData(trend);
      setMonthlyHistory(hist);
      setPaymentData(pay);
      setTopExpenses(top);
      setInsights(ins);
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedMonth, selectedYear, monthsCount]);

  const totalPeriodSpend = categoryData.reduce((acc, c) => acc + Number(c.totalAmount), 0);

  return (
    <div className="space-y-8">
      {/* Top Filter and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Categorical allocation, payment channels, and long-term spending patterns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-paper border border-border rounded-md px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {formatMonthName(m)}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-paper border border-border rounded-md px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-ink-muted uppercase tracking-wider font-semibold">Total Period Spend</span>
          <p className="text-2xl font-serif font-bold text-ink tabular-nums mt-1">
            {formatCurrency(totalPeriodSpend, currency)}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {formatMonthName(selectedMonth)} {selectedYear}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-ink-muted uppercase tracking-wider font-semibold">Largest Category</span>
          <p className="text-xl font-serif font-semibold text-ink mt-1 truncate">
            {categoryData[0]?.categoryName || 'None'}
          </p>
          <p className="text-xs text-ink-muted tabular-nums mt-1">
            {categoryData[0] ? `${formatCurrency(categoryData[0].totalAmount, currency)} (${categoryData[0].percentage.toFixed(1)}%)` : 'No transactions'}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-ink-muted uppercase tracking-wider font-semibold">Peak Expense</span>
          <p className="text-xl font-serif font-semibold text-ink mt-1 truncate">
            {topExpenses[0]?.description || 'None'}
          </p>
          <p className="text-xs text-ink-muted tabular-nums mt-1">
            {topExpenses[0] ? formatCurrency(topExpenses[0].amount, currency) : 'No transactions'}
          </p>
        </Card>
      </div>

      {/* Row 1 Charts: Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-sm text-ink">Daily Spending Pattern</h3>
            <p className="text-xs text-ink-muted">Cumulative and individual daily cashflow</p>
          </div>
          <SpendingTrendChart data={trendData} currency={currency} />
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-sm text-ink">Category Distribution</h3>
            <p className="text-xs text-ink-muted">Percentage breakdown by category</p>
          </div>
          <CategoryPieChart data={categoryData} currency={currency} />
        </Card>
      </div>

      {/* Row 2 Charts: Monthly Comparison & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-semibold text-sm text-ink">Monthly Spend vs Budget</h3>
              <p className="text-xs text-ink-muted">Longitudinal financial cadence</p>
            </div>
            <select
              value={monthsCount}
              onChange={(e) => setMonthsCount(Number(e.target.value))}
              className="bg-paper border border-border rounded px-2 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>
          <MonthlyBarChart data={monthlyHistory} currency={currency} />
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-sm text-ink">Payment Method Breakdown</h3>
            <p className="text-xs text-ink-muted">Distribution across cards, transfers, and cash</p>
          </div>
          <PaymentMethodChart data={paymentData} currency={currency} />
        </Card>
      </div>

      {/* Row 3: Top Transactions & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Expenses */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-serif font-semibold text-sm text-ink">Largest Transactions</h3>
          </div>

          {topExpenses.length === 0 ? (
            <p className="text-xs text-ink-muted py-8 text-center">No transactions recorded for this period.</p>
          ) : (
            <div className="space-y-2.5">
              {topExpenses.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded border border-border bg-canvas/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded border border-border bg-paper text-ink-muted flex items-center justify-center font-bold text-[10px] tabular-nums">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{exp.description}</p>
                      <p className="text-[11px] text-ink-muted">{formatDate(exp.expenseDate)} • {exp.category.name}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-ink tabular-nums">
                    {formatCurrency(exp.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dynamic Behavioral Insights */}
        <Card className="p-5">
          <h3 className="font-serif font-semibold text-sm text-ink mb-4">
            Monthly Analysis & Observations
          </h3>

          {insights.length === 0 ? (
            <p className="text-xs text-ink-muted py-8 text-center">No trend anomalies or threshold alerts detected.</p>
          ) : (
            <div className="space-y-2.5">
              {insights.map((ins) => (
                <div
                  key={ins.id}
                  className={`p-3 rounded border text-xs ${
                    ins.type === 'WARNING'
                      ? 'border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
                      : ins.type === 'POSITIVE'
                      ? 'border-brand-200 bg-brand-50/60 dark:bg-brand-950/20 dark:border-brand-900/40 text-brand-800 dark:text-brand-300'
                      : 'border-border bg-canvas/50 text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {ins.type === 'WARNING' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                    )}
                    <span>{ins.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {ins.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
