import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import bookRoutes from './book.routes.ts';
import paymentRoutes from './payment.routes.ts';
import orderRoutes from './order.routes.ts';
import exportRoutes from './export.routes.ts';
import { OrderController } from '../controllers/order.controller.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/books', bookRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/export', exportRoutes);
apiRouter.get('/purchases', requireAuth, OrderController.getUserPurchases);

export default apiRouter;
