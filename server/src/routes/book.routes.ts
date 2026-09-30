import { Router } from 'express';
import { BookController } from '../controllers/book.controller.ts';
import { DownloadController } from '../controllers/download.controller.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);
// Secure download route requiring authentication and verified purchase
router.get('/:bookId/download', requireAuth, DownloadController.downloadBook);

export default router;
