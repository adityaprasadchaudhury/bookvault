import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.ts';
import { PaymentController } from '../controllers/payment.controller.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/', requireAuth, OrderController.getUserPurchases);
router.get('/purchases', requireAuth, OrderController.getUserPurchases);
router.post('/', requireAuth, PaymentController.createOrder);

export default router;
