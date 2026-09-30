import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

const rootDir = process.cwd();
const outputTargets = [
  path.join(rootDir, 'bookvault-complete-project.zip'),
  path.join(rootDir, 'public', 'bookvault-complete-project.zip'),
];

export async function createFullProjectArchive(): Promise<{ size: number; fileCount: number }> {
  const primaryOutput = outputTargets[0];
  const outputStream = fs.createWriteStream(primaryOutput);

  const archive = new ZipArchive({
    zlib: { level: 9 },
  });

  let fileCount = 0;

  archive.on('entry', (entry: any) => {
    if (entry && !entry.name.endsWith('/')) {
      fileCount++;
    }
  });

  const completionPromise = new Promise<{ size: number; fileCount: number }>((resolve, reject) => {
    outputStream.on('close', () => {
      const stats = fs.statSync(primaryOutput);
      // Copy to public directory as well
      fs.copyFileSync(primaryOutput, outputTargets[1]);
      resolve({ size: stats.size, fileCount });
    });

    archive.on('error', (err: any) => {
      reject(err);
    });
  });

  archive.pipe(outputStream);

  const ignoredPatterns = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/*.zip',
    '**/dev.db',
    '**/dev.db-journal',
    '**/dev.db-wal',
    '**/dev.db-shm',
    '**/.DS_Store',
    '**/*.log',
    '**/.env',
    '**/tmp/**',
  ];

  archive.glob('**/*', {
    cwd: rootDir,
    ignore: ignoredPatterns,
    dot: true,
  });

  await archive.finalize();
  return completionPromise;
}

// If executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[Packaging] Generating complete project ZIP for Windows & Android...');
  createFullProjectArchive()
    .then((result) => {
      console.log(`[Packaging] Success! Created ZIP: ${result.size} bytes containing ${result.fileCount} files.`);
      console.log(`[Packaging] Output locations:\n  - ${outputTargets[0]}\n  - ${outputTargets[1]}`);
    })
    .catch((err) => {
      console.error('[Packaging] Failed:', err);
      process.exit(1);
    });
}
