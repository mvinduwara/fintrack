import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const catSchema = z.object({
  name: z.string().min(1),
  icon: z.string().default('💰'),
  color: z.string().default('#6366f1'),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export const getCategories = async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const data = catSchema.parse(req.body);
    const cat = await prisma.category.create({ data: { ...data, userId: req.userId! } });
    res.status(201).json(cat);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const data = catSchema.partial().parse(req.body);
    const cat = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const cat = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};