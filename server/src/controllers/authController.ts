import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });

    // Create default categories
    const defaults = [
      { name: 'Salary', icon: '💼', color: '#22c55e', type: 'INCOME' as const },
      { name: 'Freelance', icon: '💻', color: '#16a34a', type: 'INCOME' as const },
      { name: 'Food & Dining', icon: '🍔', color: '#f97316', type: 'EXPENSE' as const },
      { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'EXPENSE' as const },
      { name: 'Shopping', icon: '🛍️', color: '#a855f7', type: 'EXPENSE' as const },
      { name: 'Bills & Utilities', icon: '⚡', color: '#ef4444', type: 'EXPENSE' as const },
      { name: 'Health', icon: '🏥', color: '#ec4899', type: 'EXPENSE' as const },
      { name: 'Entertainment', icon: '🎬', color: '#f59e0b', type: 'EXPENSE' as const },
    ];
    await prisma.category.createMany({ data: defaults.map(d => ({ ...d, userId: user.id })) });

    const token = generateToken(user.id);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};