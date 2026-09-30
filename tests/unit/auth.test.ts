import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../server/src/config/env.ts';

export async function runAuthUnitTests() {
  console.log('\n  [Unit Test] 🔐 Authentication & JWT Tokens');

  // Test 1: Password hashing with bcrypt
  const password = 'SuperSecretPassword123!';
  const salt = 10;
  const hash = await bcrypt.hash(password, salt);

  assert.notEqual(hash, password, 'Hash should not match plain password');
  assert.equal(await bcrypt.compare(password, hash), true, 'Valid password should verify against hash');
  assert.equal(await bcrypt.compare('WrongPassword999', hash), false, 'Invalid password should be rejected');
  console.log('    ✓ Bcrypt hashing and secure comparison verified');

  // Test 2: JWT token signing and verification
  const payload = {
    userId: 'user_test_uuid_123',
    email: 'test.reader@example.com',
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' });
  assert.ok(token && typeof token === 'string', 'Generated token should be a non-empty string');

  const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
  assert.equal(decoded.userId, payload.userId, 'Decoded user ID should match original payload');
  assert.equal(decoded.email, payload.email, 'Decoded email should match original payload');
  console.log('    ✓ JWT token signing and payload verification verified');

  // Test 3: JWT rejection with invalid secret
  assert.throws(
    () => {
      jwt.verify(token, 'attacker-altered-secret-key-123');
    },
    { name: 'JsonWebTokenError' },
    'JWT signed with different secret must throw JsonWebTokenError'
  );
  console.log('    ✓ Cryptographic rejection of tampered JWT secret verified');
}
