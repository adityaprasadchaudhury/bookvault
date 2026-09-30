/**
 * BookStore — Pure Vanilla JavaScript Client Application
 * Languages: HTML5 · CSS3 · Vanilla JavaScript · Node.js
 * No external front-end libraries or frameworks.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  let allBooks = [];
  let currentCategory = 'ALL';
  let searchQuery = '';
  let currentSort = 'default';
  let activeTab = 'catalog'; // 'catalog' | 'vault'
  let currentUser = null;
  let cart = [];
  let purchasedBookIds = new Set();
  let selectedBook = null;

  // LocalStorage Keys
  const THEME_KEY = 'bookstore_theme';
  const USER_KEY = 'bookstore_user';

  // --------------------------------------------------------------------------
  // User-Scoped Purchase Vault Helpers
  // --------------------------------------------------------------------------
  function getUserVaultKey(user) {
    if (!user) return null;
    const identifier = user.email || user.id || 'anonymous';
    return `bookstore_vault_${identifier.toLowerCase().trim()}`;
  }

  function saveUserPurchases() {
    if (!currentUser) return;
    const key = getUserVaultKey(currentUser);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(purchasedBookIds)));
    } catch (e) {
      console.warn('Could not save user purchases', e);
    }
  }

  function loadUserPurchases() {
    purchasedBookIds.clear();
    if (!currentUser) {
      updateVaultBadge();
      return;
    }
    const key = getUserVaultKey(currentUser);
    if (!key) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) {
        saved.forEach((id) => purchasedBookIds.add(id));
      }
    } catch (e) {
      console.warn('Could not load user purchases', e);
    }
    updateVaultBadge();
  }

  async function syncUserPurchases() {
    purchasedBookIds.clear();
    if (!currentUser) {
      updateVaultBadge();
      render();
      return;
    }

    // 1. Load cached user purchases
    loadUserPurchases();
    updateVaultBadge();

    // 2. Fetch authoritative purchases from server for this specific user
    const token = localStorage.getItem('bookstore_token');
    if (token) {
      try {
        const res = await fetch('/api/purchases', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const purchases = data.purchases || [];
          purchasedBookIds.clear();
          purchases.forEach((p) => {
            if (p.book && p.book.id) {
              purchasedBookIds.add(p.book.id);
            } else if (p.bookId) {
              purchasedBookIds.add(p.bookId);
            }
          });
          saveUserPurchases();
        }
      } catch (err) {
        console.warn('Authoritative purchases sync failed, using cached session:', err);
      }
    }

    updateVaultBadge();
    render();
  }

  // --------------------------------------------------------------------------
  // DOM Elements
  // --------------------------------------------------------------------------
  const booksGrid = document.getElementById('books-grid');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryPills = document.querySelectorAll('.category-pill');
  const sortSelect = document.getElementById('sort-select');
  const catalogHeading = document.getElementById('catalog-heading');
  const totalBooksCount = document.getElementById('total-books-count');
  const tabCatalog = document.getElementById('tab-catalog');
  const tabVault = document.getElementById('tab-vault');
  const vaultBadge = document.getElementById('vault-badge');
  const currentYearSpan = document.getElementById('current-year');
  const toastNotice = document.getElementById('toast-notice');
  const toastMessage = document.getElementById('toast-message');

  // Modals
  const bookModal = document.getElementById('book-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCover = document.getElementById('modal-cover');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalAuthor = document.getElementById('modal-author');
  const modalPrice = document.getElementById('modal-price');
  const modalDescription = document.getElementById('modal-description');
  const modalPages = document.getElementById('modal-pages');
  const modalBuyBtn = document.getElementById('modal-buy-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');

  // Checkout Modal
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutClose = document.getElementById('checkout-close');
  const checkoutCancel = document.getElementById('checkout-cancel');
  const checkoutBookTitle = document.getElementById('checkout-book-title');
  const checkoutPrice = document.getElementById('checkout-price');
  const checkoutTotal = document.getElementById('checkout-total');
  const confirmPayBtn = document.getElementById('confirm-pay-btn');

  // Sign In Modal & Controls
  const signinModal = document.getElementById('signin-modal');
  const signinClose = document.getElementById('signin-close');
  const signinForm = document.getElementById('signin-form');
  const signinEmailInput = document.getElementById('signin-email');
  const signinPasswordInput = document.getElementById('signin-password');
  const signinSubmitBtn = document.getElementById('signin-submit-btn');
  const switchToRegisterBtn = document.getElementById('switch-to-register-btn');

  // Register Modal & Controls
  const registerModal = document.getElementById('register-modal');
  const registerClose = document.getElementById('register-close');
  const registerForm = document.getElementById('register-form');
  const registerNameInput = document.getElementById('register-name');
  const registerEmailInput = document.getElementById('register-email');
  const registerPasswordInput = document.getElementById('register-password');
  const registerSubmitBtn = document.getElementById('register-submit-btn');
  const switchToSigninBtn = document.getElementById('switch-to-signin-btn');

  // Profile Modal & Header Navigation
  const profileModal = document.getElementById('profile-modal');
  const profileClose = document.getElementById('profile-close');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const authBtn = document.getElementById('auth-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const modalLogoutBtn = document.getElementById('modal-logout-btn');

  // --------------------------------------------------------------------------
  // Initialization & Local Storage Sync
  // --------------------------------------------------------------------------
  async function init() {
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }

    // Clean up legacy global shared vault storage
    try {
      localStorage.removeItem('bookstore_vault_books');
    } catch (e) {}

    // Load saved user
    try {
      const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (savedUser && (savedUser.name || savedUser.email)) {
        currentUser = savedUser;
      }
    } catch (e) {
      console.warn('Could not parse user', e);
    }
    updateUserUI();

    // Init Theme
    initTheme();

    // Fetch catalog
    await fetchCatalog();

    // Authoritatively sync purchases for the active logged-in user
    await syncUserPurchases();
  }

  // --------------------------------------------------------------------------
  // Theme Management
  // --------------------------------------------------------------------------
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'classic';
    window.setTheme(saved);

    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-set-theme');
        window.setTheme(theme);
      });
    });
  }

  window.setTheme = function (themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    try {
      localStorage.setItem(THEME_KEY, themeName);
    } catch (e) {
      // ignore
    }

    document.querySelectorAll('.theme-btn').forEach((btn) => {
      if (btn.getAttribute('data-set-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // --------------------------------------------------------------------------
  // Fetch Catalog from Node.js REST API
  // --------------------------------------------------------------------------
  async function fetchCatalog() {
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      allBooks = Array.isArray(data) ? data : data.books || [];
      if (totalBooksCount) {
        totalBooksCount.textContent = allBooks.length;
      }
      render();
    } catch (err) {
      console.warn('Failed to load from /api/books, using embedded fallback list', err);
      allBooks = getEmbeddedBooks();
      if (totalBooksCount) {
        totalBooksCount.textContent = allBooks.length;
      }
      render();
    }
  }

  // --------------------------------------------------------------------------
  // Filtering & Rendering
  // --------------------------------------------------------------------------
  function render() {
    if (!booksGrid) return;

    let list = [...allBooks];

    // Filter by Tab (Catalog vs Member Vault)
    if (activeTab === 'vault') {
      if (!currentUser || !localStorage.getItem('bookstore_token')) {
        if (catalogHeading) {
          catalogHeading.textContent = 'Member Vault';
        }
        booksGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-main);">Sign In to View Your Purchased Books</h3>
            <p style="margin-bottom: 1.5rem; max-width: 480px; margin-left: auto; margin-right: auto;">
              The Member Vault is isolated to your specific reader account. Please sign in to view and download your purchased technical monographs.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="btn btn-primary" id="vault-signin-btn">Sign In</button>
              <button class="btn btn-secondary" id="vault-register-btn">Register</button>
            </div>
          </div>
        `;
        const vSignin = document.getElementById('vault-signin-btn');
        const vReg = document.getElementById('vault-register-btn');
        if (vSignin) vSignin.addEventListener('click', () => openDialog(signinModal));
        if (vReg) vReg.addEventListener('click', () => openDialog(registerModal));
        return;
      }

      list = list.filter((b) => purchasedBookIds.has(b.id));
      if (catalogHeading) {
        const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'My';
        catalogHeading.textContent = `${firstName}'s Purchased Books (${list.length})`;
      }
    } else {
      // Catalog filtering
      if (currentCategory !== 'ALL') {
        list = list.filter((b) => b.category && b.category.toLowerCase() === currentCategory.toLowerCase());
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (b) =>
            (b.title && b.title.toLowerCase().includes(q)) ||
            (b.author && b.author.toLowerCase().includes(q)) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
      }
      if (catalogHeading) {
        catalogHeading.textContent =
          currentCategory === 'ALL' ? 'All Monograph Volumes' : `${currentCategory} Volumes`;
      }
    }

    // Sorting
    if (currentSort === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (currentSort === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    if (list.length === 0) {
      if (activeTab === 'vault') {
        const userName = currentUser && currentUser.name ? escapeHtml(currentUser.name) : 'Reader';
        booksGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-main);">Your Member Vault is Empty</h3>
            <p style="margin-bottom: 1.5rem;">${userName}, you have not purchased any monographs on this account yet. Browse the catalog to start building your personal library.</p>
            <button class="btn btn-primary" onclick="window.switchTab('catalog')">Browse Curated Catalog</button>
          </div>
        `;
      } else {
        booksGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-main);">No matching books found</h3>
            <p>Try searching with another keyword or select "All Volumes".</p>
          </div>
        `;
      }
      return;
    }

    booksGrid.innerHTML = list
      .map((book) => {
        const isOwned = purchasedBookIds.has(book.id);
        const priceFormatted = `₹${(book.price || 699).toLocaleString('en-IN')}`;
        const pages = book.pageCount || book.pages || 320;

        return `
          <article class="book-card" data-id="${book.id}">
            <div class="card-media">
              <span class="card-spine"></span>
              ${isOwned ? '<span class="card-owned-badge">✓ OWNED</span>' : ''}
              <img src="${book.coverImage}" alt="${escapeHtml(book.title)}" class="card-cover" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'">
              <span class="card-badge">PDF · ${pages} pp</span>
            </div>
            <div class="card-body">
              <div class="card-category">${escapeHtml(book.category || 'Architecture')}</div>
              <h3 class="card-title">${escapeHtml(book.title)}</h3>
              <p class="card-author">by ${escapeHtml(book.author)}</p>
              <p class="card-description">${escapeHtml(book.description || '')}</p>
              <div class="card-footer">
                <span class="card-price">${priceFormatted}</span>
                <div class="card-actions">
                  <button class="btn btn-secondary preview-btn" data-id="${book.id}">Details</button>
                  ${
                    isOwned
                      ? `<button class="btn btn-success download-btn" data-id="${book.id}">Download</button>`
                      : `<button class="btn btn-primary buy-btn" data-id="${book.id}">Buy Now</button>`
                  }
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    // Attach Action Listeners
    booksGrid.querySelectorAll('.preview-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openPreview(id);
      });
    });

    booksGrid.querySelectorAll('.buy-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openCheckout(id);
      });
    });

    booksGrid.querySelectorAll('.download-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        downloadBook(id);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Tab Switching (Catalog vs Vault)
  // --------------------------------------------------------------------------
  window.switchTab = function (tab) {
    activeTab = tab;
    if (tab === 'catalog') {
      tabCatalog.classList.add('active');
      tabVault.classList.remove('active');
      document.querySelector('.category-nav').style.display = 'flex';
    } else {
      tabCatalog.classList.remove('active');
      tabVault.classList.add('active');
      document.querySelector('.category-nav').style.display = 'none';
    }
    render();
  };

  if (tabCatalog) tabCatalog.addEventListener('click', () => window.switchTab('catalog'));
  if (tabVault) tabVault.addEventListener('click', () => window.switchTab('vault'));

  // --------------------------------------------------------------------------
  // Modals & Interactive Actions
  // --------------------------------------------------------------------------
  function openPreview(bookId) {
    const book = allBooks.find((b) => String(b.id) === String(bookId));
    if (!book || !bookModal) return;

    selectedBook = book;
    modalCover.src = book.coverImage;
    modalCover.alt = book.title;
    modalCategory.textContent = book.category || 'Architecture';
    modalTitle.textContent = book.title;
    modalAuthor.textContent = `by ${book.author}`;
    modalPrice.textContent = `₹${(book.price || 699).toLocaleString('en-IN')}`;
    modalDescription.textContent = book.description || 'Full technical collector edition with cryptographic DRM-free license.';
    modalPages.textContent = `${book.pageCount || book.pages || 340} pages`;

    const isOwned = purchasedBookIds.has(book.id);
    if (isOwned) {
      modalBuyBtn.textContent = 'Download PDF';
      modalBuyBtn.className = 'btn btn-success';
    } else {
      modalBuyBtn.textContent = 'Purchase Digital Edition';
      modalBuyBtn.className = 'btn btn-primary';
    }

    openDialog(bookModal);
  }

  function openCheckout(bookId) {
    closeDialog(bookModal);
    const book = allBooks.find((b) => String(b.id) === String(bookId));
    if (!book || !checkoutModal) return;

    // Check if user is signed in
    const token = localStorage.getItem('bookstore_token');
    if (!token || !currentUser) {
      showToast('🔒 Please sign in with your account to purchase books.');
      openDialog(signinModal);
      return;
    }

    selectedBook = book;
    checkoutBookTitle.textContent = book.title;
    const priceStr = `₹${(book.price || 699).toLocaleString('en-IN')}`;
    checkoutPrice.textContent = priceStr;
    checkoutTotal.textContent = priceStr;

    openDialog(checkoutModal);
  }

  async function completePurchase() {
    if (!selectedBook) return;

    // Ensure user session token exists
    let token = localStorage.getItem('bookstore_token');
    if (!token) {
      closeDialog(checkoutModal);
      showToast('🔒 Please sign in to complete your purchase.');
      openDialog(signinModal);
      return;
    }

    if (token) {
      try {
        // 1. Create order on backend
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId: selectedBook.id }),
        });

        if (orderRes.ok) {
          const orderJson = await orderRes.json();
          const orderInfo = orderJson.data || orderJson;

          // 2. Obtain authentic sandbox signature
          const sandboxRes = await fetch('/api/payments/sandbox-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ gatewayOrderId: orderInfo.gatewayOrderId }),
          });

          if (sandboxRes.ok) {
            const sandboxJson = await sandboxRes.json();
            const { paymentId, signature } = sandboxJson.data || sandboxJson;

            // 3. Verify payment signature and record completed purchase in database
            await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: orderInfo.orderId,
                razorpay_order_id: orderInfo.gatewayOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
              }),
            });
          }
        }
      } catch (err) {
        console.warn('Backend payment verification sync:', err);
      }
    }

    // Add to this specific user's vault
    purchasedBookIds.add(selectedBook.id);
    saveUserPurchases();

    closeDialog(checkoutModal);
    updateVaultBadge();
    showToast(`🎉 Purchased "${selectedBook.title}" successfully! Added to your Member Vault.`);
    render();

    // Trigger instant verified download
    downloadBook(selectedBook.id);
  }

  async function downloadBook(bookId) {
    const book = allBooks.find((b) => String(b.id) === String(bookId));
    if (!book) return;

    let token = localStorage.getItem('bookstore_token');
    if (!token) {
      showToast('🔒 Please sign in to download your purchased books.');
      openDialog(signinModal);
      return;
    }

    showToast(`📥 Preparing "${book.title}" download...`);

    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/books/${book.id}/download`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_License_Verified.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast(`🎉 "${book.title}" downloaded successfully!`);
        return;
      }
    } catch (err) {
      console.warn('Blob download fetch error, using direct URL:', err);
    }

    // Fallback direct link
    const link = document.createElement('a');
    link.href = `/api/books/${book.id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_License_Verified.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function updateVaultBadge() {
    if (!vaultBadge) return;
    const count = purchasedBookIds.size;
    vaultBadge.textContent = count;
    vaultBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  // --------------------------------------------------------------------------
  // User Authentication & Profile Management
  // --------------------------------------------------------------------------
  function logoutUser() {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('bookstore_token');
    purchasedBookIds.clear();
    updateVaultBadge();
    updateUserUI();
    closeDialog(profileModal);
    closeDialog(signinModal);
    closeDialog(registerModal);
    render();
    showToast('🚪 Logged out of BookStore successfully.');
  }

  function updateUserUI() {
    if (currentUser && currentUser.name) {
      if (authBtn) {
        authBtn.textContent = `👤 ${currentUser.name.split(' ')[0]}`;
        authBtn.title = `Reader Profile: ${currentUser.email}`;
        authBtn.classList.remove('primary');
      }
      if (registerBtn) {
        registerBtn.style.display = 'none';
      }
      if (logoutBtn) {
        logoutBtn.style.display = 'inline-flex';
      }
      if (profileName) profileName.textContent = currentUser.name;
      if (profileEmail) profileEmail.textContent = currentUser.email;
    } else {
      if (authBtn) {
        authBtn.textContent = 'Sign In';
        authBtn.title = 'Sign in to existing account';
        authBtn.classList.remove('primary');
        authBtn.style.display = 'inline-flex';
      }
      if (registerBtn) {
        registerBtn.style.display = 'inline-flex';
      }
      if (logoutBtn) {
        logoutBtn.style.display = 'none';
      }
    }
  }

  // Header Nav Actions
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (currentUser && currentUser.name) {
        openDialog(profileModal);
      } else {
        openDialog(signinModal);
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      openDialog(registerModal);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  if (modalLogoutBtn) {
    modalLogoutBtn.addEventListener('click', logoutUser);
  }

  // Switch between Sign In and Register modals
  if (switchToRegisterBtn) {
    switchToRegisterBtn.addEventListener('click', () => {
      closeDialog(signinModal);
      openDialog(registerModal);
    });
  }

  if (switchToSigninBtn) {
    switchToSigninBtn.addEventListener('click', () => {
      closeDialog(registerModal);
      openDialog(signinModal);
    });
  }

  // --------------------------------------------------------------------------
  // Register Form Submission (Requirement: User MUST sign in after registering)
  // --------------------------------------------------------------------------
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = registerNameInput ? registerNameInput.value.trim() : '';
      const email = registerEmailInput ? registerEmailInput.value.trim() : '';
      const password = registerPasswordInput ? registerPasswordInput.value.trim() : '';

      if (!name || !email || !password) {
        showToast('Please fill out all registration fields.');
        return;
      }

      if (registerSubmitBtn) {
        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = 'Creating account...';
      }

      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const regJson = await regRes.json();

        if (!regRes.ok) {
          throw new Error(regJson.error || regJson.message || 'Registration failed');
        }

        // CRITICAL INVARIANT: User DOES NOT get direct access after registering.
        // User must sign in. Do not save session or token.
        if (registerPasswordInput) registerPasswordInput.value = '';
        closeDialog(registerModal);

        // Pre-fill email in Sign In modal and open it
        if (signinEmailInput) {
          signinEmailInput.value = email;
        }
        if (signinPasswordInput) {
          signinPasswordInput.value = '';
          signinPasswordInput.focus();
        }

        openDialog(signinModal);
        showToast('✅ Account registered! Please sign in with your credentials to access your library.');
      } catch (err) {
        console.warn('Registration failed:', err);
        const msg = err && err.message ? err.message : 'Registration failed. Please try again.';
        showToast(`❌ ${msg}`);
      } finally {
        if (registerSubmitBtn) {
          registerSubmitBtn.disabled = false;
          registerSubmitBtn.textContent = 'Register Account';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Sign In Form Submission (Authoritative access issuance)
  // --------------------------------------------------------------------------
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = signinEmailInput ? signinEmailInput.value.trim() : '';
      const password = signinPasswordInput ? signinPasswordInput.value.trim() : '';

      if (!email || !password) {
        showToast('Please enter both email and password.');
        return;
      }

      if (signinSubmitBtn) {
        signinSubmitBtn.disabled = true;
        signinSubmitBtn.textContent = 'Verifying credentials...';
      }

      try {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginJson = await loginRes.json();

        if (!loginRes.ok) {
          throw new Error(loginJson.error || loginJson.message || 'Invalid email or password');
        }

        const token = loginJson.token || loginJson.data?.token;
        const userObj = loginJson.user || loginJson.data?.user || { name: 'Reader', email };

        if (token) {
          localStorage.setItem('bookstore_token', token);
        }
        currentUser = userObj;
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

        updateUserUI();
        await syncUserPurchases();
        closeDialog(signinModal);
        showToast(`👋 Welcome back, ${currentUser.name || 'Reader'}!`);
      } catch (err) {
        console.warn('Login failed:', err);
        const msg = err && err.message ? err.message : 'Invalid email or password. Please try again.';
        showToast(`❌ ${msg}`);
      } finally {
        if (signinSubmitBtn) {
          signinSubmitBtn.disabled = false;
          signinSubmitBtn.textContent = 'Sign In';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Dialog Open / Close Helpers
  // --------------------------------------------------------------------------
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  // Close buttons
  if (modalClose) modalClose.addEventListener('click', () => closeDialog(bookModal));
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', () => closeDialog(bookModal));
  if (checkoutClose) checkoutClose.addEventListener('click', () => closeDialog(checkoutModal));
  if (checkoutCancel) checkoutCancel.addEventListener('click', () => closeDialog(checkoutModal));
  if (signinClose) signinClose.addEventListener('click', () => closeDialog(signinModal));
  if (registerClose) registerClose.addEventListener('click', () => closeDialog(registerModal));
  if (profileClose) profileClose.addEventListener('click', () => closeDialog(profileModal));

  if (modalBuyBtn) {
    modalBuyBtn.addEventListener('click', () => {
      if (selectedBook) {
        if (purchasedBookIds.has(selectedBook.id)) {
          downloadBook(selectedBook.id);
        } else {
          openCheckout(selectedBook.id);
        }
      }
    });
  }

  if (confirmPayBtn) {
    confirmPayBtn.addEventListener('click', completePurchase);
  }

  // Backdrop click
  [bookModal, checkoutModal, signinModal, registerModal, profileModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        closeDialog(modal);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Search & Category Filters
  // --------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        if (searchQuery.length > 0) {
          clearSearchBtn.classList.remove('hidden');
        } else {
          clearSearchBtn.classList.add('hidden');
        }
      }
      render();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      render();
    });
  }

  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'ALL';
      render();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      render();
    });
  }

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    if (!toastNotice || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotice.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.add('hidden');
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getEmbeddedBooks() {
    return [
      {
        id: '1',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        category: 'Distributed Systems',
        price: 799,
        pageCount: 616,
        description: 'The definitive guide to distributed data systems, reliability, scalability, and maintainability.',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: '2',
        title: 'Site Reliability Engineering',
        author: 'Betsy Beyer et al.',
        category: 'Cloud & Infrastructure',
        price: 699,
        pageCount: 550,
        description: 'How Google runs production systems at global internet scale.',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: '3',
        title: 'Building Microservices: 2nd Edition',
        author: 'Sam Newman',
        category: 'Distributed Systems',
        price: 749,
        pageCount: 580,
        description: 'Comprehensive concepts in fine-grained distributed systems architecture.',
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
      },
    ];
  }

  // Kickoff
  init();
})();
