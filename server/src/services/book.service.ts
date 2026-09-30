import { prisma } from '../config/database.ts';
import { AppError } from '../middlewares/errorHandler.middleware.ts';

export class BookService {
  /**
   * Resolves book by UUID ID or numeric index fallback
   */
  static async resolveBook(bookId: string) {
    let book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      const numId = parseInt(bookId, 10);
      if (!isNaN(numId)) {
        const all = await prisma.book.findMany({ orderBy: { createdAt: 'asc' } });
        if (numId >= 1 && numId <= all.length) {
          book = all[numId - 1];
        }
      }
    }

    return book;
  }

  static async getAllBooks(userId?: string) {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let purchasedBookIds = new Set<string>();
    if (userId) {
      const userPurchases = await prisma.order.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        select: { bookId: true },
      });
      purchasedBookIds = new Set(userPurchases.map((p) => p.bookId));
    }

    return books.map((book) => ({
      ...book,
      filePath: undefined, // Never expose internal file paths to client
      isPurchased: purchasedBookIds.has(book.id),
    }));
  }

  static async getBookById(id: string, userId?: string) {
    const book = await BookService.resolveBook(id);

    if (!book) {
      throw new AppError('Book not found.', 404);
    }

    let isPurchased = false;
    if (userId) {
      const purchase = await prisma.order.findFirst({
        where: {
          userId,
          bookId: book.id,
          status: 'COMPLETED',
        },
      });
      isPurchased = !!purchase;
    }

    return {
      ...book,
      filePath: undefined, // Never expose internal file path
      isPurchased,
    };
  }
}
