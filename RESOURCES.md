# 📦 BookVault — Complete Project Resources & Setup Guide

Welcome to the **BookVault** complete source code distribution. This archive contains 100% of the project source files, configurations, database, and demonstration scripts.

---

## 💻 1. How to Open & Run on Laptop / Windows

### System Requirements:
- **Node.js**: Version 18, 20, or 22 LTS (download from [nodejs.org](https://nodejs.org/)).
- **Code Editor**: Visual Studio Code (recommended) or any modern editor.

### Step-by-Step Setup:
1. **Extract the ZIP Archive**:
   - Right-click `bookvault-complete-project.zip` and select **"Extract All..."** (or use 7-Zip / WinRAR).
   - Choose your destination folder (e.g., `C:\Projects\bookvault`).
2. **Open in VS Code**:
   - Open VS Code.
   - Click **File > Open Folder...** and select the extracted folder.
   - Alternatively, open Command Prompt / PowerShell in that directory and run:
     ```cmd
     code .
     ```
3. **Install Dependencies**:
   - Open the integrated terminal in VS Code (`Ctrl + ~` or `` Ctrl + ` ``).
   - Run:
     ```bash
     npm install --legacy-peer-deps
     ```
4. **Environment Configuration**:
   - A pre-configured `.env` is already included!
   - If needed, verify the contents or copy from `.env.example`:
     ```bash
     copy .env.example .env
     ```
5. **Database & Seed Data**:
   - The SQLite database `dev.db` with 30 curated books and demo user credentials is included.
   - If you ever wish to re-seed from scratch:
     ```bash
     npm run seed
     ```
6. **Start Full-Stack Development Server**:
   - **Method A (1-Click VS Code Debugger)**:
     - Press `F5` or click **Run & Debug** in the sidebar, then select **"🚀 Debug BookVault Full-Stack Server"**.
   - **Method B (Terminal Command)**:
     ```bash
     npm run dev
     ```
   - Open your browser at: **`http://localhost:3000`**

### Pre-configured VS Code Features Included:
- `.vscode/launch.json`: F5 debugging for both the full-stack server and the automated test suite.
- `.vscode/tasks.json`: Pre-defined tasks for `npm: dev`, `npm: test`, `npm: seed`, and `npm: lint`.
- `.vscode/settings.json`: TypeScript language server settings and automated code formatting.
- `.vscode/extensions.json`: Recommended VS Code extensions (ESLint, Prettier, Tailwind CSS, Prisma).

---

## 📱 2. How to Open & View on Android

You can easily inspect the source code, read the documentation, and view the books directly on your Android phone or tablet:

### Method A: Extract and Explore Files
1. Download `bookvault-complete-project.zip` on your Android device.
2. Open your default **Files by Google** (or **ZArchiver** / **RAR** from Play Store).
3. Tap on the ZIP file and select **Extract**.
4. You can browse the complete directory hierarchy:
   - `src/`: All React 19 frontend components, UI pages, and Redux state slices.
   - `server/`: Express backend API controllers, middlewares, routes, and security filters.
   - `tests/`: Automated unit, integration, and regression test suites.
   - `server/storage/books/`: All 30 sample book PDF files. Tap any `.pdf` to open in Google PDF Viewer or Adobe Acrobat Reader.

### Method B: View and Edit Code on Android
If you want to view, syntax-highlight, or edit code on Android:
- **Acode** (recommended powerful code editor on Google Play).
- **Spck Code Editor** (lightweight JS/TS editor with Git support).
- **QuickEdit Text Editor**.
- Simply open the extracted `bookvault` folder in Acode or Spck to browse with full syntax highlighting.

---

## 🧪 3. Running Automated Tests

BookVault comes with automated test suites covering:
- **Unit Tests**: Bcrypt password hashing, JWT token signing, HMAC-SHA256 signatures, path traversal protection, Zod schemas.
- **Integration Tests**: Complete end-to-end API lifecycle (health check, user registration, catalog query, order creation, payment verification, protected PDF download).
- **Regression Tests**: Forged signature rejection, cross-tenant isolation, payment idempotency, double-purchase prevention, project ZIP integrity.

To execute all tests:
```bash
npm test
```

---

## 🐙 4. Publishing to Git & GitHub

The project is structured and ready for Git version control:

1. **Initialize Git Repository**:
   ```bash
   git init
   ```
2. **Stage and Commit All Files**:
   ```bash
   git add .
   git commit -m "feat: complete BookVault full-stack digital book platform"
   ```
3. **Connect to Your GitHub Repository**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bookvault.git
   git push -u origin main
   ```
4. **CI/CD Pipeline**:
   - The `.github/workflows/ci.yml` file is included and will automatically lint, test, and build the project on every GitHub push or pull request.

---

## 📚 5. Default Demonstration Accounts

- **Member Account**:
  - Email: `user@example.com`
  - Password: `Password123!`
  - Pre-licensed Volume: *Clean Architecture in TypeScript* (Book 1) ready for instant download.

---

*BookVault Press — Handcrafted Architecture & Distributed Systems Library*
