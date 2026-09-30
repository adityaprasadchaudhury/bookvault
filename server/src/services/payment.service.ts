import crypto from 'crypto';
import { prisma } from '../config/database.ts';
import { ENV } from '../config/env.ts';
import { AppError } from '../middlewares/errorHandler.middleware.ts';
import { OrderService } from './order.service.ts';
import { BookService } from './book.service.ts';
import { VerifyPaymentInput } from '../validators/payment.validator.ts';

export class PaymentService {
  /**
   * Creates an internal order and payment record
   * strictly using database price (never trust frontend price)
   */
  static async createPaymentOrder(userId: string, bookId: string) {
    // 1. Resolve book
    const book = await BookService.resolveBook(bookId);
    if (!book) {
      throw new AppError('Book not found.', 404);
    }

    // 2. Check if user already owns this book
    const alreadyPurchased = await OrderService.checkUserOwnership(userId, book.id);
    if (alreadyPurchased) {
      throw new AppError('You have already purchased this book.', 409);
    }

    // Price is strictly obtained from the database record
    const amountInINR = book.price;
    const amountInPaise = Math.round(amountInINR * 100);

    // 3. Create internal Order in PENDING status
    const internalOrder = await prisma.order.create({
      data: {
        userId,
        bookId: book.id,
        amount: amountInINR,
        status: 'PENDING',
      },
    });

    // 4. Create Gateway Order Reference
    const gatewayOrderId = `order_${crypto.randomBytes(10).toString('hex')}`;

    // 5. Store Payment attempt in DB
    await prisma.payment.create({
      data: {
        orderId: internalOrder.id,
        gatewayOrderId,
        amount: amountInINR,
        status: 'CREATED',
      },
    });

    return {
      orderId: internalOrder.id,
      gatewayOrderId,
      amount: amountInINR,
      amountInPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID || 'rzp_test_bookvault_demo',
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        coverImage: book.coverImage,
      },
    };
  }

  /**
   * Securely verifies payment signature and updates database in transaction
   */
  static async verifyPayment(userId: string, data: VerifyPaymentInput) {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    // 1. Fetch internal order and payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          where: { gatewayOrderId: razorpay_order_id },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    // Ensure the order belongs to the currently authenticated user
    if (order.userId !== userId) {
      throw new AppError('Unauthorized: You do not have permission to verify this order.', 403);
    }

    // Idempotency: if order is already completed, return success
    if (order.status === 'COMPLETED') {
      return {
        success: true,
        message: 'Payment has already been verified and processed.',
        orderId: order.id,
        bookId: order.bookId,
      };
    }

    const payment = order.payments[0];
    if (!payment) {
      throw new AppError('No matching payment transaction found for this order.', 404);
    }

    // 2. Cryptographic Signature Verification
    // signature = hmac_sha256(order_id + "|" + payment_id, secret)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const providedBuf = Buffer.from(razorpay_signature || '', 'utf-8');

    const isAuthentic =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!isAuthentic) {
      // Record failed verification attempt
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          gatewayPaymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });

      throw new AppError(
        'Payment verification failed: Invalid cryptographic signature.',
        400
      );
    }

    // 3. Mark payment as SUCCESS and order as COMPLETED in a transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gatewayPaymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      success: true,
      message: 'Payment verified and purchase successfully completed.',
      orderId: order.id,
      bookId: order.bookId,
    };
  }

  /**
   * Generates authentic HMAC signature for the selected payment method
   */
  static generateSandboxSignature(orderId: string, paymentId: string): string {
    const payload = `${orderId}|${paymentId}`;
    return crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');
  }
}
