# 📚 BookStore — Digital Monograph Press & Technical Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://img.shields.io/badge/Deploy-Netlify%20Ready-00ad9f.svg)](https://www.netlify.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Ready-181717.svg)](https://github.com/)

A modern, high-performance digital technical press and online bookstore. Built for software engineers, systems architects, and technical leaders.

---



### Method 2: Deploy from GitHub to Netlify
1. Create a new GitHub repository (see GitHub instructions below) and push this code.
2. Go to [Netlify](https://app.netlify.com) and click **"Add new site"** > **"Import an existing project"**.
3. Select **GitHub** and choose your repository.
4. Netlify will auto-detect `netlify.toml`:
   - **Publish directory:** `.` (root)
   - **Build command:** (leave empty or `echo "done"`)
5. Click **Deploy Site**. Every future `git push` will deploy automatically!

---

## 🐙 Uploading to GitHub

To publish this project to your GitHub account:

1. Create a new repository on GitHub:
   - Go to [github.com/new](https://github.com/new).
   - Enter a name (e.g. `bookstore-press`).
   - Do **not** initialize with README or .gitignore (they are already included).
   - Click **Create repository**.

2. In your local terminal, navigate to the unzipped project folder and run:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of BookStore digital press"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

---

## 💻 Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Running Test Suites
```bash
npm test
```

---

## 📁 Project Architecture

```text
├── index.html          # Semantic HTML5 frontend interface
├── css/
│   └── style.css       # Responsive styling, typography & layout
├── js/
│   └── app.js          # Client-side reactivity, search & vault management
├── netlify.toml        # Netlify production deploy configuration
├── server.ts           # Full-stack Node & Express API server
├── server/             # Backend API modules (auth, books, payments, storage)
├── tests/              # Automated unit, integration & regression test suites
├── package.json        # Dependencies & npm scripts
└── README.md           # Project documentation
```

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
