import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

export const getMonthlySummary = async (req: AuthRequest, res: Response) => {
  const { year } = req.query as { year: string };
  const y = parseInt(year) || new Date().getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const data = await Promise.all(months.map(async (month) => {
    const start = new Date(y, month - 1, 1);
    const end = new Date(y, month, 0, 23, 59, 59);
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId: req.userId, type: 'INCOME', date: { gte: start, lte: end } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } }, _sum: { amount: true } }),
    ]);
    return { month, income: income._sum.amount || 0, expense: expense._sum.amount || 0, net: (income._sum.amount || 0) - (expense._sum.amount || 0) };
  }));
  res.json(data);
};

export const getCategoryBreakdown = async (req: AuthRequest, res: Response) => {
  const { month, year, type = 'EXPENSE' } = req.query as Record<string, string>;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);

  const data = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId: req.userId, type: type as any, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  const enriched = await Promise.all(data.map(async (d) => {
    const cat = await prisma.category.findUnique({ where: { id: d.categoryId } });
    return { category: cat, amount: d._sum.amount || 0 };
  }));

  res.json(enriched.sort((a, b) => b.amount - a.amount));
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [income, expense, recentTx, totalBalance] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId: req.userId, type: 'INCOME', date: { gte: start, lte: end } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { userId: req.userId }, include: { category: true }, orderBy: { date: 'desc' }, take: 5 }),
    prisma.transaction.groupBy({ by: ['type'], where: { userId: req.userId }, _sum: { amount: true } }),
  ]);

  const totalIncome = totalBalance.find(t => t.type === 'INCOME')?._sum.amount || 0;
  const totalExpense = totalBalance.find(t => t.type === 'EXPENSE')?._sum.amount || 0;

  res.json({
    monthlyIncome: income._sum.amount || 0,
    monthlyExpense: expense._sum.amount || 0,
    monthlySavings: (income._sum.amount || 0) - (expense._sum.amount || 0),
    totalBalance: totalIncome - totalExpense,
    recentTransactions: recentTx,
  });
};