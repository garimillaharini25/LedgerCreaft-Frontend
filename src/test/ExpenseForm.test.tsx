import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AddEditExpensePage } from '../pages/expenses/AddEditExpensePage';
import { AuthProvider } from '../context/AuthContext';
import { describe, it, expect, vi } from 'vitest';

// Mock categoryService
vi.mock('../services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn().mockResolvedValue([
      { id: 1, name: 'Food', icon: 'utensils', color: '#0d5f47', systemCategory: true, totalSpending: 0, transactionCount: 0 },
      { id: 2, name: 'Transportation', icon: 'car', color: '#1b4d3e', systemCategory: true, totalSpending: 0, transactionCount: 0 },
    ]),
  },
}));

describe('AddEditExpensePage Component', () => {
  it('renders expense form fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AddEditExpensePage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record Expense/i })).toBeInTheDocument();
  });

  it('shows inline validation error for invalid amount and description', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <AddEditExpensePage />
        </AuthProvider>
      </BrowserRouter>
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText(/Amount must be greater than 0/i)).toBeInTheDocument();
    expect(await screen.findByText(/Description must be between 2 and 200 characters/i)).toBeInTheDocument();
  });
});
