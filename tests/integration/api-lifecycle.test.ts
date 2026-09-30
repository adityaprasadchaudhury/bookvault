import assert from 'node:assert/strict';

export async function runIntegrationApiLifecycleTests(baseUrl = 'http://localhost:3000/api') {
  console.log('\n  [Automation / Integration Test] 🔄 Full End-to-End API Lifecycle');

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.equal(healthRes.status, 200, 'Health check should return 200');
  const healthData = await healthRes.json();
  assert.equal(healthData.status, 'ok', 'Service status must be ok');
  console.log('    ✓ Health check endpoint operational');

  // 2. User registration
  const uniqueEmail = `qa.tester.${Date.now()}@example.com`;
  const registerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Automated QA Engineer',
      email: uniqueEmail,
      password: 'StrongPassword123!',
    }),
  });

  assert.equal(registerRes.status, 201, 'User registration should return 201');
  const registerData = await registerRes.json();
  assert.ok(registerData.token, 'Register response should contain auth token');
  assert.equal(registerData.user.email, uniqueEmail, 'User email should match registered email');
  console.log('    ✓ User registration and automatic session creation verified');

  // 3. User login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'StrongPassword123!',
    }),
  });

  assert.equal(loginRes.status, 200, 'User login should return 200');
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert.ok(token, 'Login response should return auth token');
  console.log('    ✓ User credentials verification and token issuance verified');

  // 4. Catalog retrieval (30 books)
  const booksRes = await fetch(`${baseUrl}/books`);
  assert.equal(booksRes.status, 200, 'Books catalog should return 200');
  const booksData = await booksRes.json();
  assert.equal(booksData.total, 30, 'Catalog must contain exactly 30 curated books');
  assert.equal(booksData.books.length, 30, 'Books array length must be 30');
  console.log('    ✓ Catalog retrieval verified: exactly 30 books confirmed');

  // Select a book to test purchase flow (Book 2)
  const targetBook = booksData.books[1];
  assert.ok(targetBook, 'Target book must exist');

  // 5. Unauthorized download prevention
  const unauthDownloadRes = await fetch(`${baseUrl}/books/${targetBook.id}/download`);
  assert.equal(unauthDownloadRes.status, 401, 'Unauthenticated download must return 401 Unauthorized');
  console.log('    ✓ Guarded asset download without authentication rejected (401)');

  // Unpurchased download with valid token
  const unpurchasedDownloadRes = await fetch(`${baseUrl}/books/${targetBook.id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(unpurchasedDownloadRes.status, 403, 'Downloading unpurchased book must return 403 Forbidden');
  console.log('    ✓ Guarded asset download without verified purchase rejected (403)');

  // 6. Create Payment Order
  const orderRes = await fetch(`${baseUrl}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId: targetBook.id }),
  });

  assert.ok(
    orderRes.status === 200 || orderRes.status === 201,
    `Create order should return 200 or 201, received ${orderRes.status}`
  );
  const orderJson = await orderRes.json();
  assert.ok(orderJson.data.orderId, 'Order must have internal orderId');
  assert.ok(orderJson.data.gatewayOrderId, 'Order must have gatewayOrderId');
  assert.equal(orderJson.data.amount, targetBook.price, 'Order price must match authoritative DB price');
  console.log(`    ✓ Payment order creation verified at authoritative price (₹${targetBook.price})`);

  // 7. Obtain Sandbox Signature & Verify Payment
  const sandboxRes = await fetch(`${baseUrl}/payments/sandbox-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gatewayOrderId: orderJson.data.gatewayOrderId,
      simulateTamper: false,
      simulateFailure: false,
    }),
  });

  assert.equal(sandboxRes.status, 200, 'Sandbox data should return 200');
  const sandboxData = await sandboxRes.json();

  const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId: orderJson.data.orderId,
      razorpay_order_id: sandboxData.razorpay_order_id,
      razorpay_payment_id: sandboxData.razorpay_payment_id,
      razorpay_signature: sandboxData.razorpay_signature,
    }),
  });

  assert.equal(verifyRes.status, 200, 'Payment verification should return 200');
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.success, true, 'Verification must succeed');
  assert.equal(verifyData.bookId, targetBook.id, 'Verified bookId must match target book');
  console.log('    ✓ Cryptographic payment signature verification succeeded');

  // 8. Authorized Protected Download
  const authorizedDownloadRes = await fetch(`${baseUrl}/books/${targetBook.id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(authorizedDownloadRes.status, 200, 'Authorized download must return 200');
  assert.equal(
    authorizedDownloadRes.headers.get('content-type'),
    'application/pdf',
    'Downloaded asset must be application/pdf'
  );
  const pdfBuffer = await authorizedDownloadRes.arrayBuffer();
  assert.ok(pdfBuffer.byteLength > 1000, 'PDF buffer must contain real document bytes');
  console.log(`    ✓ Authorized PDF file streamed successfully (${pdfBuffer.byteLength} bytes)`);

  // 9. Member Purchases retrieval
  const purchasesRes = await fetch(`${baseUrl}/purchases`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(purchasesRes.status, 200, 'Purchases query should return 200');
  const purchasesData = await purchasesRes.json();
  assert.ok(purchasesData.purchases.length >= 1, 'Member vault should include the newly acquired volume');
  const foundBook = purchasesData.purchases.some((p: any) => p.book.id === targetBook.id);
  assert.equal(foundBook, true, 'Target book must be recorded in member vault');
  console.log('    ✓ Member vault updated with verified lifetime DRM-free license');
}
