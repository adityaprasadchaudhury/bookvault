# 🚀 Complete GitHub Push & Repository Setup Guide

Follow this guide to push the **BookVault** project into your own GitHub repository.

---

## 🔗 Step 1: Create a New GitHub Repository

1. Go to GitHub in your browser: [https://github.com/new](https://github.com/new).
2. Enter a **Repository name**, for example:
   ```
   bookvault
   ```
   *(or `bookvault-digital-monographs`)*.
3. Choose **Public** or **Private** based on your preference.
4. ⚠️ **Important**: Do **NOT** check "Add a README file", ".gitignore", or "license" (the project already contains these files).
5. Click the green **"Create repository"** button.

---

## 💻 Step 2: Push Using Git Command Line (Windows / Mac / Linux)

Open **Command Prompt**, **PowerShell**, or **Terminal** inside your extracted project directory (or in VS Code press `` Ctrl + ` `` to open the integrated terminal):

### 1. Initialize & Verify Git
```bash
git init -b main
git add .
git commit -m "feat: initial commit for BookVault platform"
```
*(If git is already initialized, running `git status` will show everything is committed).*

### 2. Link Your GitHub Repository
Replace `<YOUR_GITHUB_USERNAME>` and `<YOUR_REPO_NAME>` with your GitHub details:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
```

> **Example**:
> ```bash
> git remote add origin https://github.com/adityaprasad113/bookvault.git
> ```

### 3. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

---

## 🔑 GitHub Authentication Tips

When GitHub prompts you for credentials:

### Method 1: Personal Access Token (PAT) (Standard)
1. In GitHub, go to **Settings > Developer settings > Personal access tokens > Tokens (classic)**:
   [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Generate a token with the **`repo`** scope selected.
3. When `git push` asks for your **Password**, paste your generated **Personal Access Token** (not your GitHub account password).

### Method 2: GitHub CLI (`gh`) (Quickest & Easiest)
If you have GitHub CLI installed:
```bash
gh auth login
gh repo create bookvault --public --source=. --remote=origin --push
```

---

## 🖥️ Alternative: Push Using GitHub Desktop (No Terminal Required)

If you prefer a visual interface without running commands:

1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Open GitHub Desktop and log into your GitHub account.
3. Click **File > Add Local Repository...** (`Ctrl + O`).
4. Browse to and select the extracted `bookvault` folder.
5. If prompted that it's not a git repository, click **"create a repository"**.
6. Click the blue **"Publish repository"** button in the top bar.
7. Choose Public or Private, and click **Publish Repository**.
8. All files are automatically committed and pushed to your GitHub profile!

---

## 📱 Pushing from Android (via Termux)

If you are developing directly on your Android phone using Termux:

1. Open Termux:
   ```bash
   cd ~/storage/shared/Download/bookvault
   git init -b main
   git config user.name "Your Name"
   git config user.email "your-email@example.com"
   git add .
   git commit -m "feat: mobile commit"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. When prompted for password, paste your GitHub Personal Access Token.

---

## ✅ What gets pushed to your repository
- All React frontend code (`/src`)
- All Express backend services & controllers (`/server` and `/server.ts`)
- SQLite database schema and seed monograph scripts (`/prisma`)
- Full test suite: unit, integration, and regression (`/tests`)
- 1-Click VS Code debugging configurations (`/.vscode`)
- `.env.example`, `README.md`, and complete setup resources
- *Note: `node_modules`, build artifacts (`dist/`), and database lock files are cleanly ignored by `.gitignore`.*
