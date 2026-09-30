import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthenticatedRequest } from '../types/index.ts';
import { prisma } from '../config/database.ts';
import { AppError } from '../middlewares/errorHandler.middleware.ts';
import { StorageService } from '../services/storage.service.ts';
import { BookService } from '../services/book.service.ts';

export class DownloadController {
  static async downloadBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // 1. Authenticate user
      if (!req.user) {
        throw new AppError('Unauthorized: Please log in to download this book.', 401);
      }

      const { bookId } = req.params;
      if (!bookId) {
        throw new AppError('Book ID is required.', 400);
      }

      // 2. Verify book exists
      const book = await BookService.resolveBook(bookId);

      if (!book) {
        throw new AppError('Book not found.', 404);
      }

      // 3. Find completed purchase belonging to this user and this book
      const purchase = await prisma.order.findFirst({
        where: {
          userId: req.user.id,
          bookId: book.id,
          status: 'COMPLETED',
        },
        include: {
          payments: {
            where: {
              status: 'SUCCESS',
            },
          },
        },
      });

      // 4. Verify user has purchased that particular book AND payment was successfully verified
      if (!purchase || purchase.payments.length === 0) {
        throw new AppError(
          'Authorization denied: You have not purchased this book, or payment verification is incomplete.',
          403
        );
      }

      // 5. Resolve safe canonical file path on backend (strictly preventing path traversal)
      const absoluteFilePath = StorageService.resolveSecureFilePath(book.filePath);

      // Verify file exists on server
      if (!fs.existsSync(absoluteFilePath)) {
        throw new AppError('The requested book file could not be found in secure storage.', 404);
      }

      // 6. Set protective headers and stream file
      const safeFilename = `${book.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_')}.pdf`;
      const fileStats = fs.statSync(absoluteFilePath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Content-Length', fileStats.size);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const fileStream = fs.createReadStream(absoluteFilePath);
      fileStream.on('error', (streamErr) => {
        console.error('[DownloadController] File streaming error:', streamErr);
        if (!res.headersSent) {
          next(new AppError('Error streaming book file.', 500));
        }
      });

      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
