import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});


export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = updateSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let password = user.password;
    if (currentPassword && newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
      password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { name: name || user.name, email: email || user.email, password },
      select: { id: true, name: true, email: true },
    });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: 'Server error' });
  }
};