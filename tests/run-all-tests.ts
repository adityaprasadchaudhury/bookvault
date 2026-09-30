import { runAuthUnitTests } from './unit/auth.test.ts';
import { runPaymentUnitTests } from './unit/payment.test.ts';
import { runStorageUnitTests } from './unit/storage.test.ts';
import { runValidatorUnitTests } from './unit/validator.test.ts';
import { runIntegrationApiLifecycleTests } from './integration/api-lifecycle.test.ts';
import { runRegressionTests } from './regression/regression.test.ts';

async function runTestSuite() {
  console.log('===============================================================');
  console.log('   🧪 BookStore Automated Test & Security Verification Suite   ');
  console.log('===============================================================');

  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  const testSuites = [
    { name: 'Unit: Authentication & JWT', fn: runAuthUnitTests },
    { name: 'Unit: Payment Signatures & HMAC', fn: runPaymentUnitTests },
    { name: 'Unit: Storage & Path Traversal', fn: runStorageUnitTests },
    { name: 'Unit: Input Validators & Zod', fn: runValidatorUnitTests },
    { name: 'Integration: API Lifecycle', fn: runIntegrationApiLifecycleTests },
    { name: 'Regression: Security Invariants', fn: runRegressionTests },
  ];

  for (const suite of testSuites) {
    try {
      await suite.fn();
      passedCount++;
    } catch (err: any) {
      console.error(`\n  ❌ [FAILED] ${suite.name}:`, err.message || err);
      failedCount++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n===============================================================');
  console.log(`   Test Results: ${passedCount} Passed | ${failedCount} Failed (${duration}s)`);
  console.log('===============================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('   🎉 ALL TEST SUITES PASSED! System verified production-ready.\n');
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
