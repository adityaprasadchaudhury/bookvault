# 📚 BookVault — Full Project Resource, Architecture & Setup Guide

This guide provides complete instructions to open, explore, develop, and run the **BookVault** project on both **Windows Laptops** and **Android Devices (Phones & Tablets)**.

---

## 📋 Table of Contents
1. [Project Overview & Architectural Design](#1-project-overview--architectural-design)
2. [Source Code Structure](#2-source-code-structure)
3. [Setup & Running on Laptop (Windows / macOS / Linux)](#3-setup--running-on-laptop-windows--macos--linux)
4. [Setup & Running on Android (Phones & Tablets)](#4-setup--running-on-android-phones--tablets)
5. [Automated Testing & Security Verification](#5-automated-testing--security-verification)
6. [Troubleshooting & FAQs](#6-troubleshooting--faqs)

---

## 1. Project Overview & Architectural Design

**BookVault** is a production-grade digital monograph bookstore and cryptographic license management platform.

### Core Technology Stack:
- **Frontend**: React 19, TypeScript, Material-UI (MUI v7), Emotion, Redux Toolkit, RTK Query, React Router v7.
- **Backend**: Node.js, Express, TypeScript, tsx.
- **Database & ORM**: Prisma ORM with SQLite (`file:./dev.db`). Pre-seeded with 30 technical monographs.
- **Security & Cryptography**:
  - `helmet`: Full HTTP security headers (X-Content-Type-Options, Strict-Transport-Security, CORP).
  - `express-rate-limit`: Brute-force protection on authentication and payment endpoints.
  - `crypto.timingSafeEqual`: Constant-time HMAC-SHA256 signature verification preventing side-channel attacks.
  - Path traversal defenses: Confines all requested files strictly within server storage bounds.
  - Server-authoritative pricing: Client price tampering is strictly prevented.
- **Guarded Asset Delivery**: Monograph PDFs are dynamically generated in-memory or securely streamed from protected storage (`server/storage/books/`) only after verifying a valid purchase record in SQLite.

---

## 2. Source Code Structure

```
bookvault/
├── .vscode/                     # VS Code debug configurations and task settings
│   ├── launch.json              # 1-Click debug launcher (F5 to run full-stack)
│   ├── tasks.json               # Automated build & test tasks
│   └── settings.json            # Editor formatting and TypeScript settings
├── prisma/                      # Database Schema & Seed Data
│   ├── schema.prisma            # Prisma schema (User, Book, Purchase, Order)
│   ├── seed.ts                  # 30 Curated technical monographs seed script
│   └── seed-data.ts             # Rich metadata and cover art definitions
├── server/                      # Backend Architecture
│   ├── src/
│   │   ├── config/              # Environment config validation
│   │   ├── controllers/         # Auth, Book, Purchase, Payment controllers
│   │   ├── middleware/          # JWT authentication and error middlewares
│   │   ├── routes/              # Express routing definitions
│   │   ├── services/            # Cryptographic payment and PDF storage services
│   │   └── validators/          # Zod validation schemas
│   └── storage/books/           # Protected digital monograph storage
├── src/                         # Frontend Application (React + Vite)
│   ├── components/              # Navbar, Footer, BookCard, ProtectedRoute
│   ├── pages/                   # Catalog, BookDetails, MemberVault, Auth, Checkout
│   ├── store/                   # Redux store & RTK Query APIs
│   ├── types/                   # Shared TypeScript definitions
│   ├── App.tsx                  # Main router setup
│   └── main.tsx                 # Client entry point
├── tests/                       # Automated Testing Suite
│   ├── unit/                    # Auth, Payment crypto, Storage, Zod validators
│   ├── integration/             # Full end-to-end API lifecycle
│   ├── regression/              # Security exploit and tamper defenses
│   └── run-all-tests.ts         # Consolidated CLI test runner
├── .env.example                 # Example environment variables
├── package.json                 # Project dependencies & scripts
├── README.md                    # Quick overview
├── RESOURCES_AND_SETUP.md       # This comprehensive guide
├── server.ts                    # Full-stack server entry point (Express + Vite)
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration
```

---

## 3. Setup & Running on Laptop (Windows / macOS / Linux)

### Step 3.1: Prerequisites
1. **Node.js**: Download and install Node.js (v18, v20, or v22 LTS) from [nodejs.org](https://nodejs.org/).
   - Verify installation in Command Prompt or PowerShell:
     ```bash
     node -v
     npm -v
     ```
2. **VS Code** (Recommended): Download from [code.visualstudio.com](https://code.visualstudio.com/).
3. **Git** (Optional): Download from [git-scm.com](https://git-scm.com/).

### Step 3.2: Extracting the ZIP File
1. Locate your downloaded `bookvault-complete-project.zip`.
2. Right-click the file and select **"Extract All..."** (or use 7-Zip / WinRAR).
3. Choose a folder, e.g., `C:\Users\YourName\Projects\bookvault`.
4. Open the extracted folder.

### Step 3.3: One-Click Run in VS Code
1. Open **VS Code**.
2. Click **File > Open Folder...** and select the extracted `bookvault` folder.
3. Open the **Run and Debug** panel on the left (or press `Ctrl+Shift+D`).
4. Select **"🚀 Debug BookVault Full-Stack Server"** from the dropdown.
5. Press **F5** (or click the green Play button).
6. VS Code will automatically start the server on `http://localhost:3000`.
7. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

### Step 3.4: Running via Windows Terminal / PowerShell
Alternatively, open PowerShell or Command Prompt inside the folder:
```powershell
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Setup environment configuration
Copy-Item .env.example .env

# 3. Initialize SQLite Database & Seed 30 Books
npx prisma db push
npm run seed

# 4. Start the Full-Stack Server
npm run dev
```

### Step 3.5: Running the Test Suite
In the terminal, run:
```bash
npm test
```
All unit tests, integration tests, and security regression tests will execute.

---

## 4. Setup & Running on Android (Phones & Tablets)

You can both **inspect/edit the code** and **run the full-stack server** directly on an Android device!

### Method A: Extracting and Viewing Files on Android (Quick & Easy)
1. **Unzip on Android**:
   - Use the built-in **Files by Google** app or install **ZArchiver** / **RAR** from Google Play Store.
   - Tap on `bookvault-complete-project.zip` and select **Extract**.
2. **Viewing & Editing Code on Android**:
   - **Option 1 (Recommended)**: Install **Acode - code editor** or **Spck Editor** from the Play Store. Both provide full syntax highlighting for TypeScript, React, and JSON.
   - **Option 2**: Open Chrome or any browser on your Android device and visit [vscode.dev](https://vscode.dev). Click "Open Folder" to open the extracted `bookvault` folder directly in your browser.
3. **Reading Monograph PDFs on Android**:
   - When you purchase or download monographs from BookVault, PDFs can be opened directly in **Google Drive PDF Viewer**, **Adobe Acrobat Reader**, or **ReadEra**.

---

### Method B: Running the Full Application Locally on Android with Termux

You can run the entire Node.js server, SQLite database, and React frontend on your Android phone using **Termux** (free Linux environment for Android):

1. **Install Termux**:
   - Download Termux from [F-Droid](https://f-droid.org/packages/com.termux/) or GitHub Releases (avoid outdated Google Play versions).

2. **Open Termux and Install Node.js & Git**:
   ```bash
   pkg update && pkg upgrade -y
   pkg install nodejs-lts git -y
   ```

3. **Allow Storage Access**:
   ```bash
   termux-setup-storage
   ```
   (Grant storage permission in the popup prompt).

4. **Navigate to the Extracted Project Folder**:
   ```bash
   cd ~/storage/shared/Download/bookvault
   ```
   *(Or wherever you extracted the ZIP file).*

5. **Install Dependencies & Start the App**:
   ```bash
   npm install --legacy-peer-deps
   cp .env.example .env
   npx prisma db push
   npm run seed
   npm run dev
   ```

6. **Access in Android Browser**:
   - Open Chrome, Brave, or Firefox on your phone.
   - Go to: `http://localhost:3000`
   - You can browse the catalog, create accounts, simulate mock payments, and download protected PDFs right onto your phone!

---

## 5. Automated Testing & Security Verification

The project includes an enterprise-grade automated testing suite:

```bash
npm test
```

### What gets verified:
- **Unit Tests (`tests/unit/`)**:
  - Bcrypt salt hashing and password comparisons.
  - JWT creation, payload signature verification, and tampered token rejection.
  - Cryptographic HMAC-SHA256 signature calculation and `timingSafeEqual` side-channel protection.
  - Path traversal neutralization (`../../etc/passwd` injection tests).
  - Zod payload schema sanitization.
- **Integration Tests (`tests/integration/`)**:
  - End-to-end API lifecycle: Health check → Registration → Login → 30 books catalog listing → Unauthorized asset download rejection (401/403) → Order creation → Cryptographic payment verification → Authorized PDF download → Member vault confirmation.
- **Regression Tests (`tests/regression/`)**:
  - Forged signature rejection (HTTP 400).
  - Cross-tenant payment exploitation prevention (HTTP 403).
  - Idempotent payment re-verification.
  - Double-purchase prevention (HTTP 409 Conflict).

---

## 6. Troubleshooting & FAQs

### Q: Why do I need `--legacy-peer-deps` during npm install?
**A:** React 19 is used, and some ecosystem libraries specify React 18 as peer dependencies. Using `--legacy-peer-deps` allows npm to resolve all dependencies smoothly.

### Q: Where is the database stored?
**A:** The database is a local SQLite database stored at `dev.db` in the project root. It requires zero cloud database configuration and works offline immediately.

### Q: Can I run this without internet connection?
**A:** Yes! Once `npm install` has been run once, the entire application, database, and monograph generator work 100% offline.

### Q: How do mock payments work?
**A:** The platform includes an integrated Sandbox / Test Payment Modal. In development, you can test payments instantly with one click, which generates genuine cryptographic HMAC signatures verified on the backend.

---

*Authored for BookVault Digital Technical Press.*
