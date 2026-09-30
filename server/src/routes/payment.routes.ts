import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post('/create-order', requireAuth, PaymentController.createOrder);
router.post('/verify', requireAuth, PaymentController.verifyPayment);
router.post('/sandbox-data', requireAuth, PaymentController.getSandboxPaymentData);

export default router;
