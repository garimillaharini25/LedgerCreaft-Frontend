import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BudgetsPage } from '../pages/budgets/BudgetsPage';
import { AuthProvider } from '../context/AuthContext';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn().mockResolvedValue([
      { id: 1, name: 'Food', icon: 'utensils', color: '#f97316', systemCategory: true, totalSpending: 0, transactionCount: 0 },
    ]),
  },
}));

vi.mock('../services/budgetService', () => ({
  budgetService: {
    getAllBudgets: vi.fn().mockResolvedValue([]),
    getBudgetByYearAndMonth: vi.fn().mockResolvedValue({
      id: 1,
      month: 10,
      year: 2026,
      totalBudget: 40000.0,
      warningThreshold: 80,
      spent: 42000.0,
      remaining: -2000.0,
      percentage: 105.0,
      isOverBudget: true,
      isWarning: false,
      categories: [
        {
          id: 1,
          categoryId: 1,
          categoryName: 'Food',
          categoryIcon: 'utensils',
          categoryColor: '#f97316',
          budgetAmount: 4000.0,
          spentAmount: 4800.0,
          remainingAmount: -800.0,
          percentageUsed: 120.0,
        },
      ],
    }),
  },
}));

describe('BudgetsPage Component', () => {
  it('renders budget page with over-budget warning badge', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BudgetsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/OVER BUDGET/i)).toBeInTheDocument();
    expect(screen.getByText(/Remaining Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Food/i)).toBeInTheDocument();
  });
});
