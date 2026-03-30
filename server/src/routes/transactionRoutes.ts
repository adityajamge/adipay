import { Router } from 'express';
import { sendMoney, getHistory, getTransactionDetail, getRecentContacts } from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/send', protect, sendMoney);
router.get('/history', protect, getHistory);
router.get('/recent-contacts', protect, getRecentContacts);
router.get('/:id', protect, getTransactionDetail);

export default router;
