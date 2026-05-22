import { Router } from 'express';
import { updateUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.put('/me', updateUser);
export default router;