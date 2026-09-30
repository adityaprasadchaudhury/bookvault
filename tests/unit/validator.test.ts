import assert from 'node:assert/strict';
import { registerSchema, loginSchema } from '../../server/src/validators/auth.validator.ts';
import { createOrderSchema, verifyPaymentSchema } from '../../server/src/validators/payment.validator.ts';

export async function runValidatorUnitTests() {
  console.log('\n  [Unit Test] 📋 Zod Schemas & Input Sanitization');

  // Test 1: Register Schema validation
  const validRegister = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'SecurePassword123!',
  });
  assert.equal(validRegister.success, true, 'Valid registration payload must parse successfully');

  const invalidEmail = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'not-an-email',
    password: 'SecurePassword123!',
  });
  assert.equal(invalidEmail.success, false, 'Malformed email format must be rejected');

  const weakPassword = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: '123',
  });
  assert.equal(weakPassword.success, false, 'Short password must be rejected');
  console.log('    ✓ Registration input bounds and email formats enforced');

  // Test 2: Login Schema validation
  const validLogin = loginSchema.safeParse({
    email: 'reader@example.com',
    password: 'Password123!',
  });
  assert.equal(validLogin.success, true, 'Valid login payload must parse successfully');
  console.log('    ✓ Login payload validation verified');

  // Test 3: Payment Verification Schema validation
  const validPaymentVerify = verifyPaymentSchema.safeParse({
    orderId: 'c1234567-89ab-cdef-0123-456789abcdef',
    razorpay_order_id: 'order_1234567890',
    razorpay_payment_id: 'pay_1234567890',
    razorpay_signature: 'a1b2c3d4e5f6',
  });
  assert.equal(validPaymentVerify.success, true, 'Valid payment verification payload must parse');

  const missingSignature = verifyPaymentSchema.safeParse({
    orderId: 'c1234567-89ab-cdef-0123-456789abcdef',
    razorpay_order_id: 'order_1234567890',
    razorpay_payment_id: 'pay_1234567890',
  });
  assert.equal(missingSignature.success, false, 'Missing cryptographic signature must fail schema validation');
  console.log('    ✓ Cryptographic payment verification parameters schema-enforced');
}
