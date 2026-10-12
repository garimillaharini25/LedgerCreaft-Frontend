import api from '../api/axios';
import { ApiResponse, Category } from '../types';

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  icon: string;
  color: string;
}

export interface UpdateCategoryPayload {
  name: string;
  description?: string;
  icon: string;
  color: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>('/api/categories');
    return res.data.data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>('/api/categories', payload);
    return res.data.data;
  },

  async updateCategory(id: number, payload: UpdateCategoryPayload): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/api/categories/${id}`, payload);
    return res.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/categories/${id}`);
  },
};
