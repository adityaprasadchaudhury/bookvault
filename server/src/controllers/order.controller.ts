import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.ts';
import { OrderService } from '../services/order.service.ts';
import { AppError } from '../middlewares/errorHandler.middleware.ts';

export class OrderController {
  static async getUserPurchases(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized: Authentication required.', 401);
      }

      const purchases = await OrderService.getUserPurchases(req.user.id);

      res.status(200).json({
        success: true,
        total: purchases.length,
        purchases,
      });
    } catch (error) {
      next(error);
    }
  }
}
