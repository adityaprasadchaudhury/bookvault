import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../types/index.ts';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator.ts';
import { PaymentService } from '../services/payment.service.ts';
import { AppError } from '../middlewares/errorHandler.middleware.ts';

export class PaymentController {
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized: Authentication required.', 401);
      }

      const { bookId } = createOrderSchema.parse(req.body);
      const result = await PaymentService.createPaymentOrder(req.user.id, bookId);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized: Authentication required.', 401);
      }

      const validated = verifyPaymentSchema.parse(req.body);
      const result = await PaymentService.verifyPayment(req.user.id, validated);

      res.status(200).json({
        success: true,
        message: result.message,
        orderId: result.orderId,
        bookId: result.bookId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sandbox simulator endpoint for generating authentic test signatures or simulating signature tampering
   */
  static async getSandboxPaymentData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized: Authentication required.', 401);
      }

      const { gatewayOrderId, simulateTamper, simulateFailure } = req.body;

      if (!gatewayOrderId) {
        throw new AppError('Gateway order ID is required for simulation.', 400);
      }

      if (simulateFailure) {
        res.status(400).json({
          success: false,
          error: 'Payment declined by test bank / UPI provider.',
        });
        return;
      }

      const mockPaymentId = `pay_${crypto.randomBytes(9).toString('hex')}`;
      let signature = PaymentService.generateSandboxSignature(gatewayOrderId, mockPaymentId);

      if (simulateTamper) {
        // Intentionally tamper with the signature to demonstrate backend rejection
        signature = `tampered_${signature.slice(9)}`;
      }

      res.status(200).json({
        success: true,
        razorpay_order_id: gatewayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: signature,
      });
    } catch (error) {
      next(error);
    }
  }
}
