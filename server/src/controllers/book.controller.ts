import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/index.ts';
import { BookService } from '../services/book.service.ts';
import { ENV } from '../config/env.ts';

export class BookController {
  private static extractOptionalUserId(req: AuthenticatedRequest): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
        return decoded.id;
      } catch {
        // Invalid or expired token, treat as guest
        return undefined;
      }
    }
    return undefined;
  }

  static async getAllBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = BookController.extractOptionalUserId(req);
      const books = await BookService.getAllBooks(userId);

      res.status(200).json({
        success: true,
        total: books.length,
        books,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = BookController.extractOptionalUserId(req);
      const book = await BookService.getBookById(id, userId);

      res.status(200).json({
        success: true,
        book,
      });
    } catch (error) {
      next(error);
    }
  }
}
