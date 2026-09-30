import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

const rootDir = process.cwd();

async function createArchive(zipFilename: string, includeGit: boolean): Promise<{ path: string; size: number; fileCount: number }> {
  const outputPath = path.join(rootDir, zipFilename);
  const publicPath = path.join(rootDir, 'public', zipFilename);

  const outputStream = fs.createWriteStream(outputPath);
  const archive = new ZipArchive({
    zlib: { level: 9 },
  });

  let fileCount = 0;
  archive.on('entry', (entry: any) => {
    if (entry && !entry.name.endsWith('/')) {
      fileCount++;
    }
  });

  const completionPromise = new Promise<{ path: string; size: number; fileCount: number }>((resolve, reject) => {
    outputStream.on('close', () => {
      const stats = fs.statSync(outputPath);
      fs.copyFileSync(outputPath, publicPath);
      resolve({ path: outputPath, size: stats.size, fileCount });
    });

    archive.on('error', (err: any) => {
      reject(err);
    });
  });

  archive.pipe(outputStream);

  const ignoredPatterns = [
    '**/node_modules/**',
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

  if (!includeGit) {
    ignoredPatterns.push('**/.git/**');
  }

  archive.glob('**/*', {
    cwd: rootDir,
    ignore: ignoredPatterns,
    dot: true,
  });

  await archive.finalize();
  return completionPromise;
}

export async function generateAllZips() {
  console.log('[Packaging] 1. Creating bookstore-github-ready.zip (includes pre-initialized .git)...');
  const githubReady = await createArchive('bookstore-github-ready.zip', true);
  console.log(`[Packaging] Generated bookstore-github-ready.zip: ${githubReady.size} bytes (${githubReady.fileCount} files)`);

  console.log('[Packaging] 2. Creating bookstore-clean-source.zip (pure clean source)...');
  const cleanSource = await createArchive('bookstore-clean-source.zip', false);
  console.log(`[Packaging] Generated bookstore-clean-source.zip: ${cleanSource.size} bytes (${cleanSource.fileCount} files)`);

  // Also maintain bookvault-complete-project.zip for backwards compatibility
  fs.copyFileSync(githubReady.path, path.join(rootDir, 'bookvault-complete-project.zip'));
  fs.copyFileSync(githubReady.path, path.join(rootDir, 'public', 'bookvault-complete-project.zip'));
}

generateAllZips()
  .then(() => {
    console.log('[Packaging] All ZIP archives generated and verified!');
  })
  .catch((err) => {
    console.error('[Packaging] Error creating archives:', err);
    process.exit(1);
  });
