import assert from 'node:assert/strict';

export async function runRegressionTests(baseUrl = 'http://localhost:3000/api') {
  console.log('\n  [Regression Test] 🔒 Security Invariants & Exploit Defenses');

  // Setup: Create two separate users (User A and User B)
  const userAEmail = `user.a.${Date.now()}@example.com`;
  const userBEmail = `user.b.${Date.now()}@example.com`;

  const [resA, resB] = await Promise.all([
    fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password: 'Password123!' }),
    }),
    fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'Password123!' }),
    }),
  ]);

  const dataA = await resA.json();
  const dataB = await resB.json();
  const tokenA = dataA.token;
  const tokenB = dataB.token;

  // Retrieve book for regression testing (Book 5)
  const booksRes = await fetch(`${baseUrl}/books`);
  const { books } = await booksRes.json();
  const testBook = books[4];

  // REGRESSION 1: Tampered HMAC Signature Rejection
  const orderARes = await fetch(`${baseUrl}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ bookId: testBook.id }),
  });
  const orderA = (await orderARes.json()).data;

  // Forge a tampered signature
  const tamperedVerifyRes = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      orderId: orderA.orderId,
      razorpay_order_id: orderA.gatewayOrderId,
      razorpay_payment_id: 'pay_tampered_exploit_attempt',
      razorpay_signature: 'deadbeef00112233445566778899aabbccddeeff00112233445566778899aabb',
    }),
  });

  assert.equal(
    tamperedVerifyRes.status,
    400,
    'Tampered payment signature must be strictly rejected with HTTP 400 Bad Request'
  );
  console.log('    ✓ Regression 1 Passed: Forged cryptographic signature rejected (HTTP 400)');

  // REGRESSION 2: Cross-Tenant Order Verification Attempt
  // User B attempts to verify User A's order
  const crossTenantVerifyRes = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      orderId: orderA.orderId,
      razorpay_order_id: orderA.gatewayOrderId,
      razorpay_payment_id: 'pay_unauthorized_user_attempt',
      razorpay_signature: 'dummy_signature',
    }),
  });

  assert.equal(
    crossTenantVerifyRes.status,
    403,
    'Cross-user order verification must be strictly blocked with HTTP 403 Forbidden'
  );
  console.log('    ✓ Regression 2 Passed: Cross-tenant unauthorized verification blocked (HTTP 403)');

  // Legitimate verification for User A
  const sbRes = await fetch(`${baseUrl}/payments/sandbox-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ gatewayOrderId: orderA.gatewayOrderId }),
  });
  const sbData = await sbRes.json();

  const legitVerifyRes = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      orderId: orderA.orderId,
      razorpay_order_id: sbData.razorpay_order_id,
      razorpay_payment_id: sbData.razorpay_payment_id,
      razorpay_signature: sbData.razorpay_signature,
    }),
  });
  assert.equal(legitVerifyRes.status, 200, 'Legitimate verification should succeed');

  // REGRESSION 3: Payment Verification Idempotency
  // Re-verifying the already COMPLETED order must succeed idempotently without double-billing
  const repeatVerifyRes = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      orderId: orderA.orderId,
      razorpay_order_id: sbData.razorpay_order_id,
      razorpay_payment_id: sbData.razorpay_payment_id,
      razorpay_signature: sbData.razorpay_signature,
    }),
  });

  assert.equal(repeatVerifyRes.status, 200, 'Repeated verification on completed order must be idempotent (200)');
  console.log('    ✓ Regression 3 Passed: Idempotent payment verification handling confirmed');

  // REGRESSION 4: Double-Purchase Prevention
  // User A attempts to create another order for the already owned testBook
  const doubleOrderRes = await fetch(`${baseUrl}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ bookId: testBook.id }),
  });

  assert.equal(
    doubleOrderRes.status,
    409,
    'Attempting to re-order an already owned book must return HTTP 409 Conflict'
  );
  console.log('    ✓ Regression 4 Passed: Double-purchase prevented with HTTP 409 Conflict');

  // REGRESSION 5: Project Export Download Verification
  const exportRes = await fetch(`${baseUrl}/export/project.zip`);
  assert.equal(exportRes.status, 200, 'Project ZIP export endpoint should return HTTP 200');
  assert.equal(
    exportRes.headers.get('content-type'),
    'application/zip',
    'Project export Content-Type must be application/zip'
  );
  const zipBuffer = await exportRes.arrayBuffer();
  const zipBytes = new Uint8Array(zipBuffer.slice(0, 4));
  // Standard ZIP file signature: 0x50, 0x4B, 0x03, 0x04 ('PK\x03\x04')
  assert.equal(zipBytes[0], 0x50, 'ZIP magic byte 1 should be 0x50 (P)');
  assert.equal(zipBytes[1], 0x4b, 'ZIP magic byte 2 should be 0x4B (K)');
  assert.equal(zipBytes[2], 0x03, 'ZIP magic byte 3 should be 0x03');
  assert.equal(zipBytes[3], 0x04, 'ZIP magic byte 4 should be 0x04');
  console.log(`    ✓ Regression 5 Passed: Project ZIP archive verified (${zipBuffer.byteLength} bytes, PK magic header confirmed)`);
}
