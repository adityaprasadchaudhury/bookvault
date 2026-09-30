import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { prisma } from '../src/config/database.ts';
import { ENV } from '../src/config/env.ts';

interface DemoBook {
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  pages: number;
  language: string;
  isbn: string;
  colorScheme: {
    primary: [number, number, number];
    secondary: [number, number, number];
    bg: string;
    accent: string;
  };
}

const BOOKS: DemoBook[] = [
  {
    title: 'Clean Architecture in TypeScript',
    author: 'Martin Fowler & Robert C.',
    description:
      'A practical guide to crafting maintainable, testable, and loosely coupled enterprise applications using domain-driven design, ports and adapters, and TypeScript.',
    price: 599,
    category: 'Software Engineering',
    pages: 320,
    language: 'English',
    isbn: '978-0134494166',
    colorScheme: { primary: [0.1, 0.35, 0.65], secondary: [0.2, 0.5, 0.8], bg: '#1e3a8a', accent: '#60a5fa' },
  },
  {
    title: 'Mastering React 19 & Next.js',
    author: 'Dan Abramov & Sophie Alpert',
    description:
      'In-depth exploration of modern React 19 Server Components, Suspense architecture, Actions, optimistic updates, and performance tuning for high-throughput web apps.',
    price: 699,
    category: 'Web Development',
    pages: 410,
    language: 'English',
    isbn: '978-0132350884',
    colorScheme: { primary: [0.05, 0.5, 0.6], secondary: [0.1, 0.7, 0.8], bg: '#0891b2', accent: '#67e8f9' },
  },
  {
    title: 'PostgreSQL High Performance & Scaling',
    author: 'Bruce Momjian',
    description:
      'Master index tuning, query planner optimization, connection pooling with PgBouncer, replication topologies, table partitioning, and high-availability PostgreSQL.',
    price: 799,
    category: 'Databases',
    pages: 450,
    language: 'English',
    isbn: '978-1491954249',
    colorScheme: { primary: [0.15, 0.25, 0.5], secondary: [0.25, 0.4, 0.7], bg: '#1e293b', accent: '#38bdf8' },
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    description:
      'The definitive guide to the storage engines, distributed consensus, stream processing, partitioning, and replication models that power modern internet architectures.',
    price: 899,
    category: 'Distributed Systems',
    pages: 616,
    language: 'English',
    isbn: '978-1449373320',
    colorScheme: { primary: [0.6, 0.2, 0.1], secondary: [0.8, 0.3, 0.2], bg: '#7c2d12', accent: '#fb923c' },
  },
  {
    title: 'The Pragmatic Programmer: 20th Edition',
    author: 'David Thomas & Andrew Hunt',
    description:
      'Timeless wisdom on software craftsmanship, career resilience, continuous refactoring, defensive coding, and engineering team excellence.',
    price: 649,
    category: 'Software Craftsmanship',
    pages: 352,
    language: 'English',
    isbn: '978-0201616224',
    colorScheme: { primary: [0.2, 0.45, 0.25], secondary: [0.3, 0.6, 0.35], bg: '#14532d', accent: '#4ade80' },
  },
  {
    title: 'Full-Stack System Design Interviews',
    author: 'Alex Xu & Sahn Lam',
    description:
      'Step-by-step blueprints for designing distributed rate limiters, payment processors, chat backends, key-value stores, and cloud storage at hyperscale.',
    price: 749,
    category: 'System Architecture',
    pages: 380,
    language: 'English',
    isbn: '979-8664653403',
    colorScheme: { primary: [0.45, 0.15, 0.55], secondary: [0.6, 0.25, 0.75], bg: '#581c87', accent: '#c084fc' },
  },
  {
    title: 'Microservices Patterns and Practices',
    author: 'Chris Richardson',
    description:
      'Proven decomposition patterns, saga orchestration, event sourcing, CQRS, API gateway design, and zero-downtime deployment pipelines for microservice suites.',
    price: 699,
    category: 'Backend Architecture',
    pages: 520,
    language: 'English',
    isbn: '978-1617294549',
    colorScheme: { primary: [0.55, 0.35, 0.05], secondary: [0.75, 0.5, 0.1], bg: '#78350f', accent: '#fde047' },
  },
  {
    title: 'Docker & Kubernetes in Production',
    author: 'Nigel Poulton',
    description:
      'From container primitives and multi-stage Dockerfiles to Helm charts, Ingress controllers, stateful sets, and GitOps workflows with ArgoCD.',
    price: 599,
    category: 'DevOps & Cloud',
    pages: 360,
    language: 'English',
    isbn: '978-1800560413',
    colorScheme: { primary: [0.08, 0.38, 0.74], secondary: [0.18, 0.58, 0.9], bg: '#0369a1', accent: '#7dd3fc' },
  },
  {
    title: 'Securing Node.js Web APIs',
    author: 'Troy Hunt & Simon Bennett',
    description:
      'Combat CSRF, XSS, SSRF, prototype pollution, JWT hijacking, and rate abuse with practical security hardening strategies for Express and Node microservices.',
    price: 549,
    category: 'Application Security',
    pages: 290,
    language: 'English',
    isbn: '978-1492043621',
    colorScheme: { primary: [0.65, 0.1, 0.2], secondary: [0.85, 0.2, 0.3], bg: '#881337', accent: '#fda4af' },
  },
  {
    title: 'Zero to One: Building the Future',
    author: 'Peter Thiel & Blake Masters',
    description:
      'How to build companies that create new things rather than copying what already exists: secrets to monopoly advantage, vertical technology, and venture momentum.',
    price: 499,
    category: 'Business & Startups',
    pages: 224,
    language: 'English',
    isbn: '978-0804139298',
    colorScheme: { primary: [0.1, 0.15, 0.25], secondary: [0.2, 0.3, 0.45], bg: '#0f172a', accent: '#94a3b8' },
  },
  {
    title: 'Atomic Habits for High Performers',
    author: 'James Clear',
    description:
      'Transform your career, health, and focus with compound 1% improvements, habit stacking, cues, friction engineering, and identity-based reinforcement.',
    price: 399,
    category: 'Productivity',
    pages: 320,
    language: 'English',
    isbn: '978-0735211292',
    colorScheme: { primary: [0.7, 0.4, 0.05], secondary: [0.85, 0.55, 0.15], bg: '#713f12', accent: '#fef08a' },
  },
  {
    title: 'Deep Learning with PyTorch',
    author: 'Eli Stevens & Luca Antiga',
    description:
      'Build, train, and deploy convolutional networks, transformers, and recurrent architectures using PyTorch tensors, autograd, and GPU acceleration.',
    price: 849,
    category: 'Artificial Intelligence',
    pages: 510,
    language: 'English',
    isbn: '978-1617295263',
    colorScheme: { primary: [0.75, 0.25, 0.1], secondary: [0.9, 0.4, 0.2], bg: '#9a3412', accent: '#fdba74' },
  },
  {
    title: 'Algorithms & Data Structures Illustrated',
    author: 'Aditya Bhargava',
    description:
      'A visual, intuitive introduction to binary search, graph traversals, Dijkstra shortest path, dynamic programming, and amortized complexity analysis.',
    price: 499,
    category: 'Computer Science',
    pages: 256,
    language: 'English',
    isbn: '978-1617292231',
    colorScheme: { primary: [0.2, 0.4, 0.6], secondary: [0.35, 0.6, 0.8], bg: '#0e7490', accent: '#a5f3fc' },
  },
  {
    title: 'Modern CSS & Responsive UI Design',
    author: 'Rachel Andrew & Lea Verou',
    description:
      'Harness CSS Grid, Subgrid, Flexbox, Container Queries, cascade layers, modern color spaces (OKLCH), and fluid typography for world-class web interfaces.',
    price: 449,
    category: 'Frontend Design',
    pages: 280,
    language: 'English',
    isbn: '978-1937785574',
    colorScheme: { primary: [0.6, 0.15, 0.5], secondary: [0.8, 0.3, 0.7], bg: '#701a75', accent: '#f0abfc' },
  },
  {
    title: 'Domain-Driven Design Distilled',
    author: 'Vaughn Vernon & Eric Evans',
    description:
      'Deconstruct complex enterprise domains into Bounded Contexts, Aggregates, Entities, and Value Objects with Ubiquitous Language for cohesive software teams.',
    price: 629,
    category: 'Enterprise Software',
    pages: 310,
    language: 'English',
    isbn: '978-0134434421',
    colorScheme: { primary: [0.1, 0.4, 0.4], secondary: [0.2, 0.6, 0.55], bg: '#064e3b', accent: '#6ee7b7' },
  },
  {
    title: 'GraphQL API Architecture',
    author: 'Marc-Andre Giroux',
    description:
      'Design resilient, schema-first federated GraphQL schemas with Apollo Federation, data loaders, batching, caching, and cursor pagination.',
    price: 529,
    category: 'API Design',
    pages: 295,
    language: 'English',
    isbn: '978-1492030713',
    colorScheme: { primary: [0.7, 0.1, 0.45], secondary: [0.85, 0.25, 0.6], bg: '#831843', accent: '#f472b6' },
  },
  {
    title: 'The Rust Programming Language',
    author: 'Steve Klabnik & Carol Nichols',
    description:
      'Official documentation to zero-cost abstractions, memory safety without garbage collection, the borrow checker, ownership semantics, and fearless concurrency.',
    price: 799,
    category: 'Systems Programming',
    pages: 552,
    language: 'English',
    isbn: '978-1718500440',
    colorScheme: { primary: [0.6, 0.3, 0.1], secondary: [0.8, 0.45, 0.15], bg: '#854d0e', accent: '#fde047' },
  },
  {
    title: 'Event-Driven Microservices with Kafka',
    author: 'Gwen Shapira & Neha Narkhede',
    description:
      'Architect real-time streaming backends, consumer groups, partition rebalancing, schema registries (Avro), and exactly-once processing guarantees.',
    price: 729,
    category: 'Streaming Systems',
    pages: 430,
    language: 'English',
    isbn: '978-1492044925',
    colorScheme: { primary: [0.15, 0.15, 0.15], secondary: [0.35, 0.35, 0.35], bg: '#18181b', accent: '#e4e4e7' },
  },
  {
    title: 'Cybersecurity Defense & Ethical Hacking',
    author: 'Kevin Mitnick & Robert Vamosi',
    description:
      'Red team offensive security, penetration testing methodologies, privilege escalation, zero-trust perimeter modeling, and practical defensive incident response.',
    price: 679,
    category: 'InfoSec',
    pages: 390,
    language: 'English',
    isbn: '978-0316480185',
    colorScheme: { primary: [0.1, 0.45, 0.2], secondary: [0.2, 0.65, 0.3], bg: '#052e16', accent: '#22c55e' },
  },
  {
    title: 'Building Real-Time Apps with WebSockets',
    author: 'Peter Lubbers & Frank Greco',
    description:
      'Bi-directional low-latency communication, heartbeat ping/pong, pub/sub presence channels, collaborative canvas syncing, and graceful failover to polling.',
    price: 479,
    category: 'Networking',
    pages: 260,
    language: 'English',
    isbn: '978-1449369903',
    colorScheme: { primary: [0.1, 0.3, 0.6], secondary: [0.2, 0.5, 0.8], bg: '#172554', accent: '#93c5fd' },
  },
  {
    title: 'Refactoring: Improving Code Design',
    author: 'Martin Fowler & Kent Beck',
    description:
      'The definitive handbook on recognizing code smells, decomposing conditionals, extracting interfaces, migrating data, and safe evolutionary code evolution.',
    price: 689,
    category: 'Code Quality',
    pages: 448,
    language: 'English',
    isbn: '978-0134757599',
    colorScheme: { primary: [0.3, 0.1, 0.5], secondary: [0.5, 0.2, 0.7], bg: '#3b0764', accent: '#d8b4fe' },
  },
  {
    title: 'Python for Data Analysis & Pandas',
    author: 'Wes McKinney',
    description:
      'Written by the creator of pandas: manipulate, clean, aggregate, slice, and visualize high-dimensional tabular data sets with NumPy, SciPy, and Jupyter.',
    price: 649,
    category: 'Data Science',
    pages: 420,
    language: 'English',
    isbn: '978-1098104030',
    colorScheme: { primary: [0.1, 0.35, 0.5], secondary: [0.2, 0.55, 0.75], bg: '#164e63', accent: '#67e8f9' },
  },
  {
    title: 'Cloud-Native Go: Resilient Microservices',
    author: 'Matthew Titmus',
    description:
      'Build concurrent, fault-tolerant services using Go goroutines, channels, context cancellation, circuit breakers, OpenTelemetry tracing, and gRPC.',
    price: 599,
    category: 'Cloud Architecture',
    pages: 340,
    language: 'English',
    isbn: '978-1492076339',
    colorScheme: { primary: [0.0, 0.45, 0.55], secondary: [0.1, 0.65, 0.75], bg: '#134e4a', accent: '#5eead4' },
  },
  {
    title: 'TypeScript Deep Dive & Advanced Types',
    author: 'Basarat Ali Syed',
    description:
      'Master conditional types, template literal types, mapped types, brand tags, type guards, declaration merging, and compiler AST transformations.',
    price: 529,
    category: 'Programming Languages',
    pages: 310,
    language: 'English',
    isbn: '978-1484256657',
    colorScheme: { primary: [0.12, 0.3, 0.65], secondary: [0.22, 0.45, 0.85], bg: '#1e40af', accent: '#bfdbfe' },
  },
  {
    title: 'Database Internals: Storage Engines',
    author: 'Alex Petrov',
    description:
      'Under the hood of B-trees, LSM-trees, write-ahead logs, buffer management, concurrency control (MVCC), and distributed consensus algorithms.',
    price: 849,
    category: 'Database Engineering',
    pages: 480,
    language: 'English',
    isbn: '978-1492040347',
    colorScheme: { primary: [0.4, 0.25, 0.1], secondary: [0.6, 0.4, 0.15], bg: '#451a03', accent: '#fde68a' },
  },
  {
    title: 'Site Reliability Engineering (SRE)',
    author: 'Betsy Beyer & Niall Murphy',
    description:
      'How Google runs production systems: defining SLIs, SLOs, error budgets, on-call culture, postmortems without blame, and eliminating operational toil.',
    price: 749,
    category: 'Infrastructure',
    pages: 550,
    language: 'English',
    isbn: '978-1491929124',
    colorScheme: { primary: [0.1, 0.25, 0.4], secondary: [0.2, 0.45, 0.65], bg: '#0c4a6e', accent: '#7dd3fc' },
  },
  {
    title: 'Staff Engineer: Leadership Beyond Mgmt',
    author: 'Will Larson',
    description:
      'Navigating individual contributor growth at senior levels: technical sponsorship, architectural direction, setting technical vision, and managing executive stakeholders.',
    price: 579,
    category: 'Engineering Leadership',
    pages: 312,
    language: 'English',
    isbn: '978-1736417904',
    colorScheme: { primary: [0.25, 0.15, 0.4], secondary: [0.45, 0.25, 0.6], bg: '#312e81', accent: '#a5b4fc' },
  },
  {
    title: 'Effective TypeScript: 62 Specific Ways',
    author: 'Dan Vanderkam',
    description:
      '62 precise, practical guidelines to improve your TypeScript code, type narrowing, inference optimization, nominal typing, and migration strategies.',
    price: 549,
    category: 'Software Development',
    pages: 288,
    language: 'English',
    isbn: '978-1492053743',
    colorScheme: { primary: [0.15, 0.35, 0.7], secondary: [0.25, 0.5, 0.85], bg: '#1d4ed8', accent: '#dbeafe' },
  },
  {
    title: 'Network Protocols Handbook',
    author: 'W. Richard Stevens',
    description:
      'An exhaustive, low-level guide to TCP three-way handshakes, congestion control, window scaling, TLS 1.3 key exchange, UDP datagrams, and HTTP/3 QUIC.',
    price: 699,
    category: 'Computer Networks',
    pages: 470,
    language: 'English',
    isbn: '978-0321336316',
    colorScheme: { primary: [0.2, 0.2, 0.3], secondary: [0.35, 0.35, 0.45], bg: '#1e1b4b', accent: '#c7d2fe' },
  },
  {
    title: 'Continuous Delivery & CI/CD Pipelines',
    author: 'Jez Humble & David Farley',
    description:
      'Reliable software releases through build automation, automated acceptance testing, canary deployments, feature toggles, and zero-downtime database migrations.',
    price: 619,
    category: 'DevOps',
    pages: 416,
    language: 'English',
    isbn: '978-0321601919',
    colorScheme: { primary: [0.3, 0.45, 0.15], secondary: [0.45, 0.65, 0.25], bg: '#1a2e05', accent: '#bef264' },
  },
];

/**
 * Creates realistic, tactile hardcover book cover SVG data URLs
 * with linen textures, embossed metallic foil stamps, spine creases, and publisher crests.
 */
function generateCoverSvg(book: DemoBook, index: number): string {
  const { bg, accent } = book.colorScheme;
  const isGold = index % 3 === 0;
  const isCopper = index % 3 === 1;
  const foilGradId = `foil_${index}`;
  const clothGradId = `cloth_${index}`;

  const titleWords = book.title.split(' ');
  const line1 = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
  const line2 = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');

  // Themed icon emblem path according to index/category
  let emblemSvg = '';
  if (index % 4 === 0) {
    // Interlocking geometric rings
    emblemSvg = `
      <circle cx="200" cy="290" r="46" stroke="url(#${foilGradId})" stroke-width="2" fill="none" opacity="0.85" />
      <circle cx="200" cy="290" r="32" stroke="url(#${foilGradId})" stroke-width="1.5" stroke-dasharray="4 3" fill="none" opacity="0.9" />
      <circle cx="200" cy="290" r="16" stroke="url(#${foilGradId})" stroke-width="2" fill="none" />
      <path d="M 150 290 L 250 290 M 200 240 L 200 340" stroke="url(#${foilGradId})" stroke-width="1" opacity="0.4" />
    `;
  } else if (index % 4 === 1) {
    // Isometric architectural monolith / prism
    emblemSvg = `
      <polygon points="200,245 240,268 200,291 160,268" stroke="url(#${foilGradId})" stroke-width="2" fill="none" opacity="0.9" />
      <polygon points="160,268 200,291 200,340 160,317" stroke="url(#${foilGradId})" stroke-width="2" fill="none" opacity="0.75" />
      <polygon points="200,291 240,268 240,317 200,340" stroke="url(#${foilGradId})" stroke-width="2" fill="none" opacity="0.85" />
      <circle cx="200" cy="290" r="56" stroke="url(#${foilGradId})" stroke-width="1" stroke-dasharray="2 4" fill="none" opacity="0.4" />
    `;
  } else if (index % 4 === 2) {
    // Golden ratio / celestial compass
    emblemSvg = `
      <circle cx="200" cy="290" r="42" stroke="url(#${foilGradId})" stroke-width="2" fill="none" opacity="0.8" />
      <polygon points="200,245 208,282 245,290 208,298 200,335 192,298 155,290 192,282" fill="url(#${foilGradId})" opacity="0.8" />
      <circle cx="200" cy="290" r="6" fill="#ffffff" />
    `;
  } else {
    // Structural matrix / neural lattice
    emblemSvg = `
      <rect x="165" y="255" width="70" height="70" stroke="url(#${foilGradId})" stroke-width="2" fill="none" transform="rotate(45 200 290)" opacity="0.85" />
      <rect x="175" y="265" width="50" height="50" stroke="url(#${foilGradId})" stroke-width="1.5" stroke-dasharray="3 3" fill="none" transform="rotate(45 200 290)" opacity="0.7" />
      <circle cx="200" cy="290" r="10" fill="url(#${foilGradId})" opacity="0.9" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="100%" height="100%">
    <defs>
      <!-- Deep Cloth / Leatherette Texture Gradient -->
      <radialGradient id="${clothGradId}" cx="55%" cy="35%" r="75%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="70%" stop-color="#0b101b" />
        <stop offset="100%" stop-color="#04070d" />
      </radialGradient>

      <!-- Metallic Foil Stamp Gradients -->
      ${
        isGold
          ? `<linearGradient id="${foilGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stop-color="#fef08a" />
               <stop offset="25%" stop-color="#eab308" />
               <stop offset="50%" stop-color="#fffbeb" />
               <stop offset="75%" stop-color="#ca8a04" />
               <stop offset="100%" stop-color="#facc15" />
             </linearGradient>`
          : isCopper
          ? `<linearGradient id="${foilGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stop-color="#ffedd5" />
               <stop offset="30%" stop-color="#ea580c" />
               <stop offset="60%" stop-color="#fed7aa" />
               <stop offset="100%" stop-color="#c2410c" />
             </linearGradient>`
          : `<linearGradient id="${foilGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stop-color="#ffffff" />
               <stop offset="30%" stop-color="#cbd5e1" />
               <stop offset="60%" stop-color="#f8fafc" />
               <stop offset="100%" stop-color="#94a3b8" />
             </linearGradient>`
      }

      <!-- Spine Lighting / Crease Reflections -->
      <linearGradient id="spineLight${index}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.8" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.25" />
        <stop offset="75%" stop-color="#000000" stop-opacity="0.3" />
        <stop offset="90%" stop-color="#000000" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
      </linearGradient>

      <!-- Subtle Embossed Lettering Shadow Filter -->
      <filter id="emboss${index}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-color="#000000" flood-opacity="0.85" />
      </filter>
    </defs>

    <!-- Main Hardcover Board -->
    <rect width="400" height="580" fill="url(#${clothGradId})" rx="6" />

    <!-- Subtle Linen Grain Grid Overlay -->
    <g opacity="0.04" stroke="#ffffff" stroke-width="0.5">
      <line x1="0" y1="60" x2="400" y2="60" />
      <line x1="0" y1="120" x2="400" y2="120" />
      <line x1="0" y1="180" x2="400" y2="180" />
      <line x1="0" y1="240" x2="400" y2="240" />
      <line x1="0" y1="300" x2="400" y2="300" />
      <line x1="0" y1="360" x2="400" y2="360" />
      <line x1="0" y1="420" x2="400" y2="420" />
      <line x1="0" y1="480" x2="400" y2="480" />
      <line x1="0" y1="540" x2="400" y2="540" />
    </g>

    <!-- Hardcover Outer Debossed Gilded Frame -->
    <rect x="42" y="24" width="334" height="532" fill="none" stroke="url(#${foilGradId})" stroke-width="1.2" opacity="0.6" rx="2" />
    <rect x="46" y="28" width="326" height="524" fill="none" stroke="url(#${foilGradId})" stroke-width="0.6" opacity="0.3" rx="1" />

    <!-- Corner Filigrees -->
    <path d="M 42 36 L 54 36 M 42 36 L 42 48" stroke="url(#${foilGradId})" stroke-width="1.5" opacity="0.8" />
    <path d="M 376 36 L 364 36 M 376 36 L 376 48" stroke="url(#${foilGradId})" stroke-width="1.5" opacity="0.8" />
    <path d="M 42 544 L 54 544 M 42 544 L 42 532" stroke="url(#${foilGradId})" stroke-width="1.5" opacity="0.8" />
    <path d="M 376 544 L 364 544 M 376 544 L 376 532" stroke="url(#${foilGradId})" stroke-width="1.5" opacity="0.8" />

    <!-- Publisher Seal / Monogram Crest at Top Center -->
    <circle cx="209" cy="56" r="14" fill="#090d16" stroke="url(#${foilGradId})" stroke-width="1.5" />
    <text x="209" y="61" fill="url(#${foilGradId})" font-family="Georgia, Cambria, serif" font-size="12" font-weight="bold" text-anchor="middle">BV</text>
    <text x="209" y="82" fill="url(#${foilGradId})" font-family="system-ui, sans-serif" font-size="7.5" font-weight="700" letter-spacing="2.5" text-anchor="middle" opacity="0.85">MONOGRAPH SERIES</text>

    <!-- Spine Crease & Fold Highlights (Physical Depth) -->
    <rect x="0" y="0" width="28" height="580" fill="url(#spineLight${index})" />
    <line x1="28" y1="0" x2="28" y2="580" stroke="#000000" stroke-width="1.8" opacity="0.9" />
    <line x1="29" y1="0" x2="29" y2="580" stroke="#ffffff" stroke-width="0.8" opacity="0.25" />

    <!-- Fore-edge Paper Reflection (Right Edge) -->
    <line x1="398" y1="4" x2="398" y2="576" stroke="#ffffff" stroke-width="1.5" opacity="0.12" />

    <!-- Book Title (Gilded Foil Embossed Typography) -->
    <g filter="url(#emboss${index})">
      <text x="209" y="138" fill="url(#${foilGradId})" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="bold" text-anchor="middle" letter-spacing="0.5">
        ${escapeXml(line1)}
      </text>
      ${
        line2
          ? `<text x="209" y="168" fill="url(#${foilGradId})" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="bold" text-anchor="middle" letter-spacing="0.5">
               ${escapeXml(line2)}
             </text>`
          : ''
      }
    </g>

    <!-- Category / Discipline Inscription -->
    <text x="209" y="202" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" letter-spacing="2" text-anchor="middle" opacity="0.9">
      ${escapeXml(book.category.toUpperCase())}
    </text>

    <line x1="160" y1="216" x2="258" y2="216" stroke="url(#${foilGradId})" stroke-width="0.8" opacity="0.5" />

    <!-- Central Thematic Artwork Emblem -->
    <g>
      ${emblemSvg}
    </g>

    <!-- Author Presentation -->
    <text x="209" y="420" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" letter-spacing="2" text-anchor="middle" opacity="0.75">
      AUTHOR
    </text>
    <text x="209" y="442" fill="#f8fafc" font-family="Georgia, Cambria, serif" font-size="16" font-weight="bold" text-anchor="middle" letter-spacing="0.8">
      ${escapeXml(book.author)}
    </text>

    <!-- Realistic Retail Barcode & ISBN Label (Bottom Right) -->
    <g transform="translate(245, 480)">
      <rect width="112" height="48" fill="#ffffff" rx="3" opacity="0.92" />
      <!-- Barcode lines -->
      <line x1="10" y1="8" x2="10" y2="34" stroke="#000000" stroke-width="2" />
      <line x1="14" y1="8" x2="14" y2="34" stroke="#000000" stroke-width="1" />
      <line x1="17" y1="8" x2="17" y2="34" stroke="#000000" stroke-width="3" />
      <line x1="23" y1="8" x2="23" y2="34" stroke="#000000" stroke-width="1" />
      <line x1="26" y1="8" x2="26" y2="34" stroke="#000000" stroke-width="2" />
      <line x1="31" y1="8" x2="31" y2="34" stroke="#000000" stroke-width="4" />
      <line x1="38" y1="8" x2="38" y2="34" stroke="#000000" stroke-width="1.5" />
      <line x1="42" y1="8" x2="42" y2="34" stroke="#000000" stroke-width="2" />
      <line x1="47" y1="8" x2="47" y2="34" stroke="#000000" stroke-width="1" />
      <line x1="51" y1="8" x2="51" y2="34" stroke="#000000" stroke-width="3" />
      <line x1="57" y1="8" x2="57" y2="34" stroke="#000000" stroke-width="2" />
      <line x1="62" y1="8" x2="62" y2="34" stroke="#000000" stroke-width="1" />
      <line x1="66" y1="8" x2="66" y2="34" stroke="#000000" stroke-width="3" />
      <line x1="72" y1="8" x2="72" y2="34" stroke="#000000" stroke-width="1.5" />
      <line x1="77" y1="8" x2="77" y2="34" stroke="#000000" stroke-width="2" />
      <line x1="82" y1="8" x2="82" y2="34" stroke="#000000" stroke-width="1" />
      <line x1="86" y1="8" x2="86" y2="34" stroke="#000000" stroke-width="3.5" />
      <line x1="93" y1="8" x2="93" y2="34" stroke="#000000" stroke-width="1" />
      <line x1="98" y1="8" x2="98" y2="34" stroke="#000000" stroke-width="2" />
      <text x="56" y="43" fill="#1e293b" font-family="monospace" font-size="6.5" font-weight="bold" text-anchor="middle">
        ${book.isbn.slice(0, 13)}
      </text>
    </g>

    <!-- Edition Tagline Bottom Left -->
    <text x="54" y="500" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="8" font-weight="600" opacity="0.8">
      BOOKVAULT PRESS
    </text>
    <text x="54" y="514" fill="#64748b" font-family="system-ui, sans-serif" font-size="7" letter-spacing="0.5">
      FIRST COLLECTOR EDITION
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Creates genuine, readable multi-page PDF documents for download
 */
async function generateBookPdf(book: DemoBook, filename: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const [pr, pg, pb] = book.colorScheme.primary;

  // PAGE 1: TITLE & COVER
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header banner
  page1.drawRectangle({
    x: 0,
    y: height - 160,
    width,
    height: 160,
    color: rgb(pr, pg, pb),
  });

  page1.drawText('BOOKVAULT AUTHENTICATED DIGITAL EDITION', {
    x: 50,
    y: height - 60,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText(book.title.slice(0, 38), {
    x: 50,
    y: height - 100,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText(`By ${book.author}`, {
    x: 50,
    y: height - 130,
    size: 14,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.95),
  });

  // Metadata block
  page1.drawText('Official Publication Information', {
    x: 50,
    y: height - 210,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  const metadataLines = [
    `Category: ${book.category}`,
    `Standard Price: INR ${book.price}.00`,
    `Pages in Original Volume: ${book.pages}`,
    `Primary Language: ${book.language}`,
    `International Standard Book Number (ISBN): ${book.isbn}`,
    `Digital License ID: BV-${Buffer.from(book.title).toString('hex').slice(0, 12).toUpperCase()}`,
  ];

  let metaY = height - 240;
  for (const line of metadataLines) {
    page1.drawText(`• ${line}`, {
      x: 60,
      y: metaY,
      size: 12,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.3),
    });
    metaY -= 24;
  }

  // Synopsis
  page1.drawText('Volume Synopsis', {
    x: 50,
    y: metaY - 20,
    size: 15,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  page1.drawText(book.description, {
    x: 50,
    y: metaY - 50,
    size: 12,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
    maxWidth: 495,
    lineHeight: 18,
  });

  // Footer notice
  page1.drawRectangle({
    x: 50,
    y: 50,
    width: 495,
    height: 48,
    color: rgb(0.94, 0.96, 0.98),
  });

  page1.drawText('CRYPTOGRAPHIC VERIFICATION NOTICE:', {
    x: 62,
    y: 80,
    size: 9,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.5),
  });

  page1.drawText(
    'This protected document was downloaded following verified payment confirmation. Unauthorized distribution or copying is strictly prohibited.',
    {
      x: 62,
      y: 65,
      size: 8,
      font: fontOblique,
      color: rgb(0.3, 0.35, 0.4),
      maxWidth: 470,
    }
  );

  // PAGE 2: CHAPTER 1
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText(`${book.title} — Chapter 1`, {
    x: 50,
    y: height - 50,
    size: 10,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.55),
  });

  page2.drawLine({
    start: { x: 50, y: height - 58 },
    end: { x: width - 50, y: height - 58 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  page2.drawText('Chapter 1: Foundational Principles & Mental Models', {
    x: 50,
    y: height - 100,
    size: 18,
    font: fontBold,
    color: rgb(pr, pg, pb),
  });

  const sampleChapter1Text = `Software engineering and system architecture are grounded in clear boundaries and repeatable abstractions. In this volume, ${book.author} demonstrates why modern practitioners must prioritize decoupled design, testability, and deterministic failure isolation.

When designing architectures in high-leverage domains, the most costly mistakes are rarely algorithmic; rather, they stem from implicit coupling, tangled dependencies, and premature optimizations that obscure core domain boundaries.

By establishing strict invariants at the architectural boundary, engineering organizations achieve predictability, zero-downtime evolution, and sustainable velocity across quarters. Every component should possess a solitary, well-defined reason to change.`;

  page2.drawText(sampleChapter1Text, {
    x: 50,
    y: height - 135,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
    maxWidth: 495,
    lineHeight: 18,
  });

  // PAGE 3: CHAPTER 2
  const page3 = pdfDoc.addPage([595.28, 841.89]);
  page3.drawText(`${book.title} — Chapter 2`, {
    x: 50,
    y: height - 50,
    size: 10,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.55),
  });

  page3.drawLine({
    start: { x: 50, y: height - 58 },
    end: { x: width - 50, y: height - 58 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  page3.drawText('Chapter 2: Production Hardening & Operational Excellence', {
    x: 50,
    y: height - 100,
    size: 18,
    font: fontBold,
    color: rgb(pr, pg, pb),
  });

  const sampleChapter2Text = `Moving from prototypes to enterprise production requires defensive engineering across every layer. Whether managing high-throughput connection pooling in PostgreSQL, securing API gateways with cryptographically signed tokens, or implementing zero-trust access controls, reliability must be intentional.

Key Takeaways for Engineering Teams:
1. Validate inputs early at API borders using strongly-typed schemas (e.g. Zod).
2. Protect persistent storage with connection pools, transactions, and idempotent operations.
3. Cryptographically verify payment signatures and webhook integrity on the server before fulfilling digital assets.
4. Enforce strict authorization checks for all asset streaming and file downloads.
5. Monitor latency, error budgets, and structured logs without leaking confidential credentials.

Thank you for choosing this BookVault digital publication. Happy reading and building!`;

  page3.drawText(sampleChapter2Text, {
    x: 50,
    y: height - 135,
    size: 11,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
    maxWidth: 495,
    lineHeight: 18,
  });

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(ENV.STORAGE_DIR, filename);
  fs.writeFileSync(filePath, pdfBytes);
}

export async function seed() {
  console.log('--- Starting Database & Storage Seeding ---');

  // 1. Ensure storage directory exists
  if (!fs.existsSync(ENV.STORAGE_DIR)) {
    fs.mkdirSync(ENV.STORAGE_DIR, { recursive: true });
    console.log(`Created storage directory: ${ENV.STORAGE_DIR}`);
  }

  // 2. Clear existing orders, payments, books (for clean deterministic seed)
  console.log('Cleaning existing records...');
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  // 3. Create initial reader accounts
  console.log('Creating initial member accounts...');
  const salt = 10;
  const initialPasswordHash = await bcrypt.hash('Password123!', salt);

  const memberUser1 = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'user@example.com',
      passwordHash: initialPasswordHash,
    },
  });

  const memberUser2 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: initialPasswordHash,
    },
  });

  console.log(`Primary member created: user@example.com`);
  console.log(`Second member created: john.doe@example.com`);

  // 4. Generate and seed exactly 30 books
  console.log(`Generating PDFs and seeding ${BOOKS.length} books...`);
  const seededBooks = [];

  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    const pdfFilename = `book-${i + 1}.pdf`;

    // Generate protected PDF on server disk
    await generateBookPdf(book, pdfFilename);

    // Generate SVG cover image
    const coverImage = generateCoverSvg(book, i);

    const createdBook = await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        coverImage,
        filePath: pdfFilename,
        category: book.category,
        pages: book.pages,
        language: book.language,
        isbn: book.isbn,
      },
    });

    seededBooks.push(createdBook);
  }

  console.log(`Successfully created and stored ${seededBooks.length} books with protected PDFs.`);

  // 5. Seed 1 verified initial license for user@example.com on Book 1
  const book1 = seededBooks[0];
  const memberOrder = await prisma.order.create({
    data: {
      userId: memberUser1.id,
      bookId: book1.id,
      amount: book1.price,
      status: 'COMPLETED',
    },
  });

  await prisma.payment.create({
    data: {
      orderId: memberOrder.id,
      gatewayOrderId: 'order_member_license_001',
      gatewayPaymentId: 'pay_member_license_001',
      signature: 'vault_verified_authentic_signature',
      amount: book1.price,
      status: 'SUCCESS',
    },
  });

  console.log(
    `Seeded initial lifetime license for user@example.com on "${book1.title}" (Book 1).`
  );

  console.log('--- Database & Storage Seeding Complete! ---');
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
