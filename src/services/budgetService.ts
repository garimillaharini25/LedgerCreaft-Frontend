import api from '../api/axios';
import { ApiResponse, MonthlyBudget } from '../types';

export interface CreateBudgetPayload {
  month: number;
  year: number;
  totalBudget: number;
  warningThreshold: number;
  categories: {
    categoryId: number;
    amount: number;
  }[];
}

export interface UpdateBudgetPayload {
  totalBudget: number;
  warningThreshold: number;
  categories: {
    categoryId: number;
    amount: number;
  }[];
}

export const budgetService = {
  async getAllBudgets(): Promise<MonthlyBudget[]> {
    const res = await api.get<ApiResponse<MonthlyBudget[]>>('/api/budgets');
    return res.data.data;
  },

  async getBudgetByYearAndMonth(year: number, month: number): Promise<MonthlyBudget> {
    const res = await api.get<ApiResponse<MonthlyBudget>>(`/api/budgets/${year}/${month}`);
    return res.data.data;
  },

  async createBudget(payload: CreateBudgetPayload): Promise<MonthlyBudget> {
    const res = await api.post<ApiResponse<MonthlyBudget>>('/api/budgets', payload);
    return res.data.data;
  },

  async updateBudget(id: number, payload: UpdateBudgetPayload): Promise<MonthlyBudget> {
    const res = await api.put<ApiResponse<MonthlyBudget>>(`/api/budgets/${id}`, payload);
    return res.data.data;
  },

  async deleteBudget(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/budgets/${id}`);
  },
};
