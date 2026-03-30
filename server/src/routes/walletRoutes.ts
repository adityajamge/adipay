import { Router } from 'express';
import { getBalance, addMoney } from '../controllers/walletController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/balance', protect, getBalance);
router.post('/add', protect, addMoney);

export default router;
