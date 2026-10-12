import api from '../api/axios';
import {
  AnalyticsSummary,
  ApiResponse,
  CategorySpending,
  DailyTrend,
  Expense,
  Insight,
  MonthlyComparison,
  PaymentMethodSpending,
} from '../types';

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  months?: number;
  limit?: number;
}

export const analyticsService = {
  async getSummary(params: AnalyticsFilterParams = {}): Promise<AnalyticsSummary> {
    const res = await api.get<ApiResponse<AnalyticsSummary>>('/api/analytics/summary', { params });
    return res.data.data;
  },

  async getCategoryBreakdown(params: AnalyticsFilterParams = {}): Promise<CategorySpending[]> {
    const res = await api.get<ApiResponse<CategorySpending[]>>('/api/analytics/category', { params });
    return res.data.data;
  },

  async getMonthlyComparison(months = 6): Promise<MonthlyComparison[]> {
    const res = await api.get<ApiResponse<MonthlyComparison[]>>('/api/analytics/monthly', { params: { months } });
    return res.data.data;
  },

  async getPaymentMethods(params: AnalyticsFilterParams = {}): Promise<PaymentMethodSpending[]> {
    const res = await api.get<ApiResponse<PaymentMethodSpending[]>>('/api/analytics/payment-methods', { params });
    return res.data.data;
  },

  async getDailyTrend(params: AnalyticsFilterParams = {}): Promise<DailyTrend[]> {
    const res = await api.get<ApiResponse<DailyTrend[]>>('/api/analytics/trend', { params });
    return res.data.data;
  },

  async getTopExpenses(limit = 5, params: AnalyticsFilterParams = {}): Promise<Expense[]> {
    const res = await api.get<ApiResponse<Expense[]>>('/api/analytics/top-expenses', { params: { ...params, limit } });
    return res.data.data;
  },

  async getInsights(params: AnalyticsFilterParams = {}): Promise<Insight[]> {
    const res = await api.get<ApiResponse<Insight[]>>('/api/analytics/insights', { params });
    return res.data.data;
  },
};
