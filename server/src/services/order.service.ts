import { prisma } from '../config/database.ts';

export class OrderService {
  static async getUserPurchases(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            category: true,
            pages: true,
            language: true,
            price: true,
          },
        },
        payments: {
          where: { status: 'SUCCESS' },
          select: {
            id: true,
            gatewayOrderId: true,
            gatewayPaymentId: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      purchaseDate: order.createdAt,
      book: order.book,
      payment: order.payments[0] || null,
    }));
  }

  static async checkUserOwnership(userId: string, bookId: string): Promise<boolean> {
    const completedOrder = await prisma.order.findFirst({
      where: {
        userId,
        bookId,
        status: 'COMPLETED',
        payments: {
          some: {
            status: 'SUCCESS',
          },
        },
      },
    });

    return !!completedOrder;
  }
}
