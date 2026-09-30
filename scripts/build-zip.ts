import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

async function buildZip() {
  const rootDir = process.cwd();
  const outputPath = path.join(rootDir, 'bookstore-github-netlify.zip');
  const output = fs.createWriteStream(outputPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  output.on('close', () => {
    const sizeInKb = (archive.pointer() / 1024).toFixed(1);
    console.log(`✅ bookstore-github-netlify.zip successfully created! (${sizeInKb} KB, ${archive.pointer()} bytes)`);
  });

  archive.on('error', (err: any) => {
    throw err;
  });

  archive.pipe(output);

  // Exclude unwanted directories and temporary files
  const ignoredPatterns = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/.DS_Store',
    '**/dev.db',
    '**/dev.db-journal',
    '**/*.log',
    '**/.env',
    '**/*.zip',
  ];

  archive.glob('**/*', {
    cwd: rootDir,
    ignore: ignoredPatterns,
    dot: true,
  });

  await archive.finalize();
}

buildZip().catch((err) => {
  console.error('Failed to build zip archive:', err);
  process.exit(1);
});
