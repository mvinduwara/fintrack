import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const budgetSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

export const getBudgets = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query as Record<string, string>;
  const budgets = await prisma.budget.findMany({
    where: {
      userId: req.userId,
      ...(month && { month: parseInt(month) }),
      ...(year && { year: parseInt(year) }),
    },
    include: { category: true },
  });

  // Calculate spending for each budget
  const enriched = await Promise.all(budgets.map(async (b) => {
    const start = new Date(b.year, b.month - 1, 1);
    const end = new Date(b.year, b.month, 0, 23, 59, 59);
    const agg = await prisma.transaction.aggregate({
      where: { userId: req.userId, categoryId: b.categoryId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return { ...b, spent: agg._sum.amount || 0 };
  }));

  res.json(enriched);
};

export const upsertBudget = async (req: AuthRequest, res: Response) => {
  try {
    const data = budgetSchema.parse(req.body);
    const budget = await prisma.budget.upsert({
      where: { userId_categoryId_month_year: { userId: req.userId!, categoryId: data.categoryId, month: data.month, year: data.year } },
      create: { ...data, userId: req.userId! },
      update: { amount: data.amount },
      include: { category: true },
    });
    res.json(budget);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const b = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!b) return res.status(404).json({ message: 'Not found' });
    await prisma.budget.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};