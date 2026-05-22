import api from './axios';
import { Transaction, Category, Budget, DashboardStats, MonthlyReport, CategoryReport } from '../types';

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Transactions
export const transactionAPI = {
  getAll: (params?: Record<string, string>) => api.get<{ transactions: Transaction[]; total: number; pages: number }>('/transactions', { params }),
  create: (data: Omit<Transaction, 'id' | 'category' | 'createdAt'>) => api.post<Transaction>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) => api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: Omit<Category, 'id'>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Budgets
export const budgetAPI = {
  getAll: (params?: { month?: number; year?: number }) => api.get<Budget[]>('/budgets', { params }),
  upsert: (data: Omit<Budget, 'id' | 'spent' | 'category'>) => api.post<Budget>('/budgets', data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

// Reports
export const reportAPI = {
  getDashboard: () => api.get<DashboardStats>('/reports/dashboard'),
  getMonthly: (year: number) => api.get<MonthlyReport[]>('/reports/monthly', { params: { year } }),
  getCategories: (params: { month: number; year: number; type?: string }) => api.get<CategoryReport[]>('/reports/categories', { params }),
};

// User
export const userAPI = {
  update: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => api.put('/users/me', data),
};

