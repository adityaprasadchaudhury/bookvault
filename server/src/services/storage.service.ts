import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.ts';
import { AppError } from '../middlewares/errorHandler.middleware.ts';

export class StorageService {
  /**
   * Initializes storage directory
   */
  static ensureStorageDirectory(): void {
    if (!fs.existsSync(ENV.STORAGE_DIR)) {
      fs.mkdirSync(ENV.STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Resolves and verifies that a requested file path is safe and inside the storage directory
   * Strictly prevents Directory/Path Traversal attacks (e.g. ../../etc/passwd)
   */
  static resolveSecureFilePath(relativeFilePath: string): string {
    this.ensureStorageDirectory();

    // Sanitize input: extract only the basename if filename or normalize path
    const safeBasename = path.basename(relativeFilePath);
    const resolvedPath = path.resolve(ENV.STORAGE_DIR, safeBasename);

    // Verify resolved path starts with the designated storage directory
    const normalizedStorageDir = path.resolve(ENV.STORAGE_DIR);
    if (!resolvedPath.startsWith(normalizedStorageDir)) {
      console.error(
        `[Security Alert] Potential path traversal detected! Attempted: ${relativeFilePath}`
      );
      throw new AppError('Access denied: Illegal file path.', 403);
    }

    if (!fs.existsSync(resolvedPath)) {
      console.error(`[StorageService] File not found at: ${resolvedPath}`);
      throw new AppError('The requested book file is currently unavailable on storage.', 404);
    }

    return resolvedPath;
  }
}
