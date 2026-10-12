import api from '../api/axios';
import { ApiResponse, Expense, ExpensePageResponse, PaymentMethod } from '../types';

export interface ExpenseFilterParams {
  startDate?: string;
  endDate?: string;
  category?: number;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateExpensePayload {
  amount: number;
  description: string;
  categoryId: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateExpensePayload {
  amount: number;
  description: string;
  categoryId: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export const expenseService = {
  async getExpenses(params: ExpenseFilterParams = {}): Promise<ExpensePageResponse> {
    const res = await api.get<ApiResponse<ExpensePageResponse>>('/api/expenses', { params });
    return res.data.data;
  },

  async getExpenseById(id: number): Promise<Expense> {
    const res = await api.get<ApiResponse<Expense>>(`/api/expenses/${id}`);
    return res.data.data;
  },

  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const res = await api.post<ApiResponse<Expense>>('/api/expenses', payload);
    return res.data.data;
  },

  async updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
    const res = await api.put<ApiResponse<Expense>>(`/api/expenses/${id}`, payload);
    return res.data.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/expenses/${id}`);
  },
};
