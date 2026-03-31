import { Router } from 'express';
import {
	sendMoney,
	requestMoney,
	getPendingRequests,
	payRequest,
	rejectRequest,
	getHistory,
	getTransactionDetail,
	getRecentContacts,
} from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/send', protect, sendMoney);
router.post('/request', protect, requestMoney);
router.get('/requests', protect, getPendingRequests);
router.post('/requests/:id/pay', protect, payRequest);
router.post('/requests/:id/reject', protect, rejectRequest);
router.get('/history', protect, getHistory);
router.get('/recent-contacts', protect, getRecentContacts);
router.get('/:id', protect, getTransactionDetail);

export default router;
