import assert from 'node:assert/strict';
import path from 'path';
import { StorageService } from '../../server/src/services/storage.service.ts';
import { AppError } from '../../server/src/middlewares/errorHandler.middleware.ts';

export async function runStorageUnitTests() {
  console.log('\n  [Unit Test] 🛡️ Storage & Path Traversal Prevention');

  // Test 1: Legal book file resolution
  const legalFile = 'book-1.pdf';
  const resolved = StorageService.resolveSecureFilePath(legalFile);
  assert.ok(resolved.endsWith('book-1.pdf'), 'Resolved path should contain the filename');
  assert.ok(path.isAbsolute(resolved), 'Resolved path must be an absolute path');
  console.log('    ✓ Authorized storage file access verified');

  // Test 2: Directory traversal attack attempts
  const traversalAttacks = [
    '../../etc/passwd',
    '..\\..\\windows\\system32',
    '../../../server/src/config/env.ts',
    '/etc/shadow',
  ];

  for (const attack of traversalAttacks) {
    // path.basename strips directory components; if the resulting file doesn't exist in storage, it throws 404/403
    assert.throws(
      () => {
        StorageService.resolveSecureFilePath(attack);
      },
      (err: any) => {
        return err instanceof AppError && (err.statusCode === 403 || err.statusCode === 404);
      },
      `Traversal attack '${attack}' must be strictly rejected with AppError 403 or 404`
    );
  }
  console.log('    ✓ Path traversal attack payloads safely neutralized');
}
