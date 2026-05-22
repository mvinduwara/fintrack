import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const txSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string(),
  categoryId: z.string(),
});

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type, categoryId, startDate, endDate, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = { userId: req.userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where, include: { category: true },
        orderBy: { date: 'desc' }, skip, take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);
    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const data = txSchema.parse(req.body);
    const tx = await prisma.transaction.create({
      data: { ...data, date: new Date(data.date), userId: req.userId! },
      include: { category: true },
    });
    res.status(201).json(tx);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const data = txSchema.partial().parse(req.body);
    const tx = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
      include: { category: true },
    });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const tx = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};