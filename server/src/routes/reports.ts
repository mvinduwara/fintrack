import { Router } from 'express';
import { getMonthlySummary, getCategoryBreakdown, getDashboardStats } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlySummary);
router.get('/categories', getCategoryBreakdown);
export default router;