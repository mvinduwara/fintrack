export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  category: Category;
  categoryId: string;
}

export interface DashboardStats {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  totalBalance: number;
  recentTransactions: Transaction[];
}

export interface MonthlyReport {
  month: number;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryReport {
  category: Category;
  amount: number;
}