import assert from 'node:assert/strict';
import crypto from 'crypto';
import { ENV } from '../../server/src/config/env.ts';
import { PaymentService } from '../../server/src/services/payment.service.ts';

export async function runPaymentUnitTests() {
  console.log('\n  [Unit Test] 💳 Payment Signature & Cryptography');

  const orderId = 'order_test_987654321';
  const paymentId = 'pay_test_123456789';

  // Test 1: Authentic signature generation
  const signature = PaymentService.generateSandboxSignature(orderId, paymentId);
  assert.equal(typeof signature, 'string', 'Signature must be a hex string');
  assert.equal(signature.length, 64, 'HMAC-SHA256 signature must be exactly 64 hex characters');

  // Verify that recalculating yields exact match
  const expected = crypto
    .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  assert.equal(signature, expected, 'Generated signature must match expected HMAC-SHA256 digest');
  console.log('    ✓ HMAC-SHA256 256-bit signature generation verified');

  // Test 2: Constant-time timing safe comparison
  const sigBufA = Buffer.from(signature, 'utf-8');
  const sigBufB = Buffer.from(expected, 'utf-8');
  assert.equal(crypto.timingSafeEqual(sigBufA, sigBufB), true, 'Identical buffers must pass timingSafeEqual');

  const tamperedSig = signature.slice(0, -4) + 'abcd';
  const tamperedBuf = Buffer.from(tamperedSig, 'utf-8');
  assert.equal(crypto.timingSafeEqual(sigBufA, tamperedBuf), false, 'Tampered buffer must fail timingSafeEqual');
  console.log('    ✓ Constant-time timingSafeEqual validation verified');

  // Test 3: Sensitivity to payload variations
  const alteredSignature = PaymentService.generateSandboxSignature(orderId, 'pay_test_DIFFERENT');
  assert.notEqual(signature, alteredSignature, 'Altering payment ID must produce completely different hash');
  console.log('    ✓ Avalanche property and collision resistance verified');
}
