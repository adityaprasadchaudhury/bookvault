import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

const exportRouter = Router();

/**
 * GET /api/export/project.zip
 * Returns the complete repository in a clean, non-empty ZIP archive
 * containing all source code and documentation for Windows and Android.
 */
exportRouter.get('/project.zip', (_req: Request, res: Response) => {
  const rootDir = process.cwd();
  const prebuiltZip = path.join(rootDir, 'bookvault-complete-project.zip');

  if (fs.existsSync(prebuiltZip)) {
    return res.download(prebuiltZip, 'bookvault-complete-project.zip');
  }

  const archive = new ZipArchive({
    zlib: { level: 9 }, // Best compression
  });

  const zipFilename = `bookvault-complete-project-${new Date().toISOString().slice(0, 10)}.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  archive.on('error', (err: any) => {
    console.error('[ExportService] Archiving error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate project archive' });
    }
  });

  archive.pipe(res);

  // Ignored patterns
  const ignoredPatterns = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/.DS_Store',
    '**/dev.db',
    '**/dev.db-journal',
    '**/*.log',
    '**/.env',
  ];

  // Append root files and folders with .vscode, tests, src, server, config
  archive.glob('**/*', {
    cwd: rootDir,
    ignore: ignoredPatterns,
    dot: true,
  });

  archive.finalize();
});

export default exportRouter;
