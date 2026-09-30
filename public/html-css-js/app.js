/**
 * BookStore — Pure Vanilla JavaScript Application Logic
 * Standard Web APIs · Zero Framework Dependencies
 */

(function () {
  'use strict';

  // State Management
  let allBooks = [];
  let filteredBooks = [];
  let currentCategory = 'ALL';
  let currentSearchQuery = '';
  let currentSort = 'featured';
  let selectedBook = null;

  // DOM Element References
  const booksGrid = document.getElementById('books-grid');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryPills = document.querySelectorAll('.category-pill');
  const sortSelect = document.getElementById('sort-select');
  const catalogHeading = document.getElementById('catalog-heading');
  const totalBooksCount = document.getElementById('total-books-count');
  const currentYearSpan = document.getElementById('current-year');

  // Modal Elements
  const bookModal = document.getElementById('book-modal');
  const modalClose = document.getElementById('modal-close');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalBuyBtn = document.getElementById('modal-buy-btn');
  const modalCover = document.getElementById('modal-cover');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalAuthor = document.getElementById('modal-author');
  const modalPrice = document.getElementById('modal-price');
  const modalDescription = document.getElementById('modal-description');
  const modalPages = document.getElementById('modal-pages');

  // Checkout Dialog Elements
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutClose = document.getElementById('checkout-close');
  const checkoutCancel = document.getElementById('checkout-cancel');
  const checkoutBookTitle = document.getElementById('checkout-book-title');
  const checkoutBookPrice = document.getElementById('checkout-book-price');
  const checkoutTotal = document.getElementById('checkout-total');
  const checkoutReactLink = document.getElementById('checkout-react-link');

  // Set current year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     Theme Management (HTML5 data-theme attribute & localStorage)
     -------------------------------------------------------------------------- */
  const THEME_KEY = 'bookstore_html_theme';

  window.setTheme = function (themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    try {
      localStorage.setItem(THEME_KEY, themeName);
    } catch (e) {
      // ignore
    }

    // Update active state on theme buttons
    document.querySelectorAll('.theme-btn').forEach((btn) => {
      if (btn.getAttribute('data-set-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Initialize theme from storage or default
  const savedTheme = localStorage.getItem(THEME_KEY) || 'classic';
  window.setTheme(savedTheme);

  // Theme switch button listeners
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-set-theme');
      window.setTheme(theme);
    });
  });

  /* --------------------------------------------------------------------------
     Data Fetching from REST API
     -------------------------------------------------------------------------- */
  async function fetchBooks() {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      allBooks = Array.isArray(data) ? data : data.books || [];
      if (totalBooksCount) {
        totalBooksCount.textContent = allBooks.length;
      }
      applyFiltersAndRender();
    } catch (err) {
      console.warn('Could not fetch from /api/books, using fallback seed data:', err);
      // Fallback fallback seed items in case static file opened directly via file://
      allBooks = generateFallbackBooks();
      if (totalBooksCount) {
        totalBooksCount.textContent = allBooks.length;
      }
      applyFiltersAndRender();
    }
  }

  /* --------------------------------------------------------------------------
     Filtering, Sorting & Rendering
     -------------------------------------------------------------------------- */
  function applyFiltersAndRender() {
    let list = [...allBooks];

    // 1. Category filter
    if (currentCategory !== 'ALL') {
      list = list.filter((b) => b.category && b.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // 2. Search query filter
    if (currentSearchQuery.trim()) {
      const q = currentSearchQuery.toLowerCase().trim();
      list = list.filter((b) =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    }

    // 3. Sorting
    if (currentSort === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (currentSort === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    filteredBooks = list;
    renderBooks(list);
  }

  function renderBooks(books) {
    if (!booksGrid) return;

    if (books.length === 0) {
      booksGrid.innerHTML = `
        <div class="empty-state">
          <h3>No matching monographs found</h3>
          <p>Try clearing your search query or choosing another category.</p>
        </div>
      `;
      return;
    }

    booksGrid.innerHTML = books
      .map((book) => {
        const priceFormatted = `₹${(book.price || 699).toLocaleString('en-IN')}`;
        const pages = book.pageCount || 320;
        return `
          <article class="book-card" data-id="${book.id}">
            <div class="card-media">
              <span class="card-spine"></span>
              <img src="${book.coverImage}" alt="${escapeHtml(book.title)}" class="card-cover" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'">
              <span class="card-badge">PDF · ${pages} pp</span>
            </div>
            <div class="card-body">
              <div class="card-category">${escapeHtml(book.category || 'Engineering')}</div>
              <h3 class="card-title">${escapeHtml(book.title)}</h3>
              <p class="card-author">by ${escapeHtml(book.author)}</p>
              <p class="card-description">${escapeHtml(book.description || '')}</p>
              <div class="card-footer">
                <span class="card-price">${priceFormatted}</span>
                <div class="card-actions">
                  <button class="btn btn-secondary preview-btn" data-id="${book.id}">Details</button>
                  <button class="btn btn-primary buy-btn" data-id="${book.id}">Purchase</button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    // Attach click events
    booksGrid.querySelectorAll('.preview-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openBookModal(id);
      });
    });

    booksGrid.querySelectorAll('.buy-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openCheckoutModal(id);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Modal Handlers
     -------------------------------------------------------------------------- */
  function openBookModal(bookId) {
    const book = allBooks.find((b) => String(b.id) === String(bookId));
    if (!book || !bookModal) return;

    selectedBook = book;
    modalCover.src = book.coverImage;
    modalCover.alt = book.title;
    modalCategory.textContent = book.category || 'Engineering';
    modalTitle.textContent = book.title;
    modalAuthor.textContent = `by ${book.author}`;
    modalPrice.textContent = `₹${(book.price || 699).toLocaleString('en-IN')}`;
    modalDescription.textContent = book.description || 'Full technical collector edition with cryptographic DRM-free license.';
    modalPages.textContent = `${book.pageCount || 340} pages`;

    if (typeof bookModal.showModal === 'function') {
      bookModal.showModal();
    } else {
      bookModal.setAttribute('open', '');
    }
  }

  function closeBookModal() {
    if (!bookModal) return;
    if (typeof bookModal.close === 'function') {
      bookModal.close();
    } else {
      bookModal.removeAttribute('open');
    }
  }

  function openCheckoutModal(bookId) {
    closeBookModal();
    const book = allBooks.find((b) => String(b.id) === String(bookId));
    if (!book || !checkoutModal) return;

    checkoutBookTitle.textContent = book.title;
    const priceStr = `₹${(book.price || 699).toLocaleString('en-IN')}`;
    checkoutBookPrice.textContent = priceStr;
    checkoutTotal.textContent = priceStr;
    if (checkoutReactLink) {
      checkoutReactLink.href = `/books/${book.id}`;
    }

    if (typeof checkoutModal.showModal === 'function') {
      checkoutModal.showModal();
    } else {
      checkoutModal.setAttribute('open', '');
    }
  }

  function closeCheckoutModal() {
    if (!checkoutModal) return;
    if (typeof checkoutModal.close === 'function') {
      checkoutModal.close();
    } else {
      checkoutModal.removeAttribute('open');
    }
  }

  /* --------------------------------------------------------------------------
     Event Listeners
     -------------------------------------------------------------------------- */
  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (clearSearchBtn) {
        if (currentSearchQuery.length > 0) {
          clearSearchBtn.classList.remove('hidden');
        } else {
          clearSearchBtn.classList.add('hidden');
        }
      }
      applyFiltersAndRender();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      currentSearchQuery = '';
      clearSearchBtn.classList.add('hidden');
      applyFiltersAndRender();
    });
  }

  // Category filter tabs
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'ALL';
      if (catalogHeading) {
        catalogHeading.textContent = currentCategory === 'ALL' ? 'All Monograph Volumes' : `${currentCategory} Volumes`;
      }
      applyFiltersAndRender();
    });
  });

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Modal close buttons
  if (modalClose) modalClose.addEventListener('click', closeBookModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeBookModal);
  if (modalBuyBtn) {
    modalBuyBtn.addEventListener('click', () => {
      if (selectedBook) {
        openCheckoutModal(selectedBook.id);
      }
    });
  }

  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);
  if (checkoutCancel) checkoutCancel.addEventListener('click', closeCheckoutModal);

  // Close modals when clicking backdrop
  [bookModal, checkoutModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          if (modal === bookModal) closeBookModal();
          if (modal === checkoutModal) closeCheckoutModal();
        }
      });
    }
  });

  // Utility to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function generateFallbackBooks() {
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

  // Start initialization
  fetchBooks();
})();
