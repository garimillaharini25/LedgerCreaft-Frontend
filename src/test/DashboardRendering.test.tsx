import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { describe, it, expect, vi } from 'vitest';

// Mock analytics, budget, and expense services
vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getSummary: vi.fn().mockResolvedValue({
      totalSpendingThisMonth: 28450.0,
      monthlyBudget: 40000.0,
      remainingBudget: 11550.0,
      budgetPercentageUsed: 71.1,
      todaySpending: 450.0,
      thisWeekSpending: 3200.0,
      transactionCount: 15,
      largestExpense: 15000.0,
      largestExpenseDescription: 'October Apartment Rent',
      averageDailySpend: 917.74,
    }),
    getCategoryBreakdown: vi.fn().mockResolvedValue([
      { categoryId: 1, categoryName: 'Food', categoryColor: '#0d5f47', categoryIcon: 'utensils', totalAmount: 4850.0, percentage: 17.0, transactionCount: 4 },
      { categoryId: 10, categoryName: 'Rent', categoryColor: '#1b4d3e', categoryIcon: 'home', totalAmount: 15000.0, percentage: 52.7, transactionCount: 1 },
    ]),
    getDailyTrend: vi.fn().mockResolvedValue([
      { date: '2026-10-01', amount: 15000.0, count: 1 },
      { date: '2026-10-04', amount: 780.0, count: 1 },
    ]),
    getMonthlyComparison: vi.fn().mockResolvedValue([
      { year: 2026, month: 8, monthName: 'Aug 26', totalSpent: 28948.0, budgetAmount: 35000.0 },
      { year: 2026, month: 9, monthName: 'Sep 26', totalSpent: 36379.0, budgetAmount: 38000.0 },
      { year: 2026, month: 10, monthName: 'Oct 26', totalSpent: 28450.0, budgetAmount: 40000.0 },
    ]),
    getInsights: vi.fn().mockResolvedValue([
      { id: '1', title: 'On Track with Budget', description: 'You have comfortably used 71.1% of your monthly budget.', type: 'POSITIVE', icon: 'check-circle' },
    ]),
  },
}));

vi.mock('../services/budgetService', () => ({
  budgetService: {
    getBudgetByYearAndMonth: vi.fn().mockResolvedValue({
      id: 1,
      month: 10,
      year: 2026,
      totalBudget: 40000.0,
      warningThreshold: 80,
      spent: 28450.0,
      remaining: 11550.0,
      percentage: 71.1,
      isOverBudget: false,
      isWarning: false,
      categories: [],
    }),
  },
}));

vi.mock('../services/expenseService', () => ({
  expenseService: {
    getExpenses: vi.fn().mockResolvedValue({
      content: [
        {
          id: 1,
          amount: 15000.0,
          description: 'October Apartment Rent',
          category: { id: 10, name: 'Rent', icon: 'home', color: '#1b4d3e', systemCategory: true, totalSpending: 15000, transactionCount: 1 },
          expenseDate: '2026-10-01',
          paymentMethod: 'BANK_TRANSFER',
          createdAt: '2026-10-01T10:00:00Z',
          updatedAt: '2026-10-01T10:00:00Z',
        },
      ],
      page: 0,
      size: 7,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    }),
  },
}));

describe('DashboardPage Component', () => {
  it('renders dashboard overview with financial KPI cards and recent transactions', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify KPI headers
    expect(await screen.findByText(/Total Spent This Month/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Budget Target/i)).toBeInTheDocument();
    expect(screen.getByText(/Remaining Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Ledger Overview/i)).toBeInTheDocument();

    // Verify recent expense
    expect(screen.getAllByText(/October Apartment Rent/i).length).toBeGreaterThan(0);
  });
});
