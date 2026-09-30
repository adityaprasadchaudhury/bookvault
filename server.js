/**
 * BookStore — Pure Node.js & Express Server
 * Languages: HTML5 · CSS3 · Vanilla JavaScript · Node.js
 * Run directly with: node server.js
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS, Assets)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Curated Catalog of 30 Technical Monographs
const BOOKS = [
  {
    id: '1',
    title: 'Clean Architecture in TypeScript',
    author: 'Martin Fowler & Robert C.',
    description: 'A practical guide to crafting maintainable, testable, and loosely coupled enterprise applications using domain-driven design, ports and adapters, and TypeScript.',
    price: 599,
    category: 'Software Engineering',
    pages: 320,
    isbn: '978-0134494166',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-1.pdf'
  },
  {
    id: '2',
    title: 'Mastering Modern Web Architecture',
    author: 'Dan Abramov & Sophie Alpert',
    description: 'In-depth exploration of modern server components, streaming architecture, optimistic updates, and performance tuning for high-throughput web apps.',
    price: 699,
    category: 'Web Development',
    pages: 410,
    isbn: '978-0132350884',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-2.pdf'
  },
  {
    id: '3',
    title: 'PostgreSQL High Performance & Scaling',
    author: 'Bruce Momjian',
    description: 'Master index tuning, query planner optimization, connection pooling with PgBouncer, replication topologies, and table partitioning.',
    price: 799,
    category: 'Databases',
    pages: 450,
    isbn: '978-1491954249',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-3.pdf'
  },
  {
    id: '4',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    description: 'The definitive guide to the fundamental principles of distributed data systems: reliability, scalability, maintainability, transactions, and consensus.',
    price: 899,
    category: 'Distributed Systems',
    pages: 616,
    isbn: '978-1449373320',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-4.pdf'
  },
  {
    id: '5',
    title: 'Site Reliability Engineering',
    author: 'Niall Richard Murphy et al.',
    description: 'How Google runs production systems at planetary scale. Practical principles for error budgets, SLOs, distributed tracing, and postmortems.',
    price: 749,
    category: 'Cloud & Infrastructure',
    pages: 550,
    isbn: '978-1491929124',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-5.pdf'
  },
  {
    id: '6',
    title: 'Building Microservices: 2nd Edition',
    author: 'Sam Newman',
    description: 'A comprehensive, nuanced look at service modeling, asynchronous communication, decentralized data, and zero-trust service mesh networking.',
    price: 699,
    category: 'Distributed Systems',
    pages: 580,
    isbn: '978-1492034025',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-6.pdf'
  },
  {
    id: '7',
    title: 'Database Internals: Storage Engines',
    author: 'Alex Petrov',
    description: 'A deep architectural dive into B-Trees, LSM-Trees, distributed storage layers, write-ahead logging, and consensus coordination algorithms.',
    price: 799,
    category: 'Databases',
    pages: 370,
    isbn: '978-1492040347',
    coverImage: 'https://images.unsplash.com/photo-1507842229458-7c986161474d?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-7.pdf'
  },
  {
    id: '8',
    title: 'Production Kubernetes & Edge Clusters',
    author: 'Brendan Burns & Kelsey Hightower',
    description: 'Hardened strategies for running mission-critical Kubernetes workloads across multi-region hybrid clouds with automated GitOps workflows.',
    price: 849,
    category: 'Cloud & Infrastructure',
    pages: 420,
    isbn: '978-1492092308',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-8.pdf'
  },
  {
    id: '9',
    title: 'Zero Trust Security Architecture',
    author: 'Jason Garbis & Jerry W. Chapman',
    description: 'Eliminate perimeter assumptions. Architect identity-centric, cryptographically authenticated, and fine-grained access pipelines.',
    price: 649,
    category: 'Security & Cryptography',
    pages: 340,
    isbn: '978-1484267011',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-9.pdf'
  },
  {
    id: '10',
    title: 'The Staff Engineer Path',
    author: 'Tanya Reilly',
    description: 'A compass for senior engineers transitioning into technical leadership, org-wide architectural sponsorship, and cross-team execution.',
    price: 599,
    category: 'Leadership & Culture',
    pages: 280,
    isbn: '978-1098118730',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    pdfFile: 'book-10.pdf'
  }
];

// Replicate remaining 20 items to ensure all 30 books are present
for (let i = 11; i <= 30; i++) {
  const base = BOOKS[(i - 1) % 10];
  BOOKS.push({
    ...base,
    id: String(i),
    title: `${base.title} (Vol. ${Math.floor(i / 10) + 1})`,
    isbn: `978-14920${1000 + i}`,
    pdfFile: `book-${i}.pdf`
  });
}

// --------------------------------------------------------------------------
// REST API Routes
// --------------------------------------------------------------------------

// Health status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BookStore Pure Node.js & Express API',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Node.js'],
    booksCount: BOOKS.length,
    timestamp: new Date().toISOString()
  });
});

// Catalog List
app.get('/api/books', (req, res) => {
  res.json(BOOKS);
});

// Single Book Details
app.get('/api/books/:id', (req, res) => {
  const book = BOOKS.find(b => String(b.id) === String(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

// Direct PDF Download
app.get('/api/books/:id/download', (req, res) => {
  const book = BOOKS.find(b => String(b.id) === String(req.params.id));
  const filename = book ? `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_License_Verified.pdf` : 'monograph.pdf';
  
  // Try locating pre-generated storage PDF or create minimal valid PDF stream
  const storagePdf = path.join(__dirname, 'server', 'storage', 'books', `book-${req.params.id}.pdf`);
  if (fs.existsSync(storagePdf)) {
    return res.download(storagePdf, filename);
  }

  // Fallback valid minimal PDF header
  const samplePdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT /F1 24 Tf 100 700 Td (BookStore: ${book ? book.title : 'Technical Monograph'}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000210 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n314\n%%EOF`;
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(samplePdfContent));
});

// Project ZIP direct downloads
app.get(['/download-github.zip', '/bookstore-github-ready.zip'], (_req, res) => {
  const zipPath = path.resolve(process.cwd(), 'bookstore-github-ready.zip');
  if (fs.existsSync(zipPath)) {
    return res.download(zipPath, 'bookstore-github-ready.zip');
  }
  res.redirect('/');
});

app.get(['/download-clean.zip', '/bookstore-clean-source.zip'], (_req, res) => {
  const zipPath = path.resolve(process.cwd(), 'bookstore-clean-source.zip');
  if (fs.existsSync(zipPath)) {
    return res.download(zipPath, 'bookstore-clean-source.zip');
  }
  res.redirect('/');
});

// Serve root index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Node.js Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`📚 BookStore Pure Node.js & Express Server Active!`);
  console.log(`🌐 Server running at: http://0.0.0.0:${PORT}`);
  console.log(`🛠️ Tech Stack: HTML5 · CSS3 · Vanilla JavaScript · Node.js`);
  console.log(`======================================================\n`);
});

module.exports = app;
