// Main Application Class
class App {
  constructor() {
    this.currentPage = 'dashboard';
    this.pages = {};
    this.isInitialized = false;
    this.init();
  }

  // Initialize the application
  async init() {
    try {
      // Show loading screen
      loading.show('Initializing Tate Studies...');

      // Initialize pages
      this.initializePages();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Setup theme
      this.setupTheme();

      // Check authentication
      await this.checkAuthentication();

      // Initialize navigation
      this.initializeNavigation();

      this.isInitialized = true;
      loading.hide();

    } catch (error) {
      console.error('App initialization error:', error);
      loading.hide();
      Toast.error('Failed to initialize application');
    }
  }

  // Initialize page instances
  initializePages() {
    this.pages = {
      dashboard: new DashboardPage(),
      upload: new UploadPage(),
      summaries: new SummariesPage(),
      flashcards: new FlashcardsPage(),
      settings: new SettingsPage()
    };
  }

  // Setup global event listeners
  setupGlobalEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        if (page) {
          this.navigateToPage(page);
        }
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        this.toggleTheme(e.target.checked);
      });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.handleGlobalSearch(e.target.value);
      }, 300));
    }

    // Window events
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.navigateToPage(e.state.page, false);
      }
    });
  }

  // Setup theme
  setupTheme() {
    const savedTheme = Utils.getStorage(APP_CONFIG.STORAGE_KEYS.THEME, APP_CONFIG.THEME.LIGHT);
    const isDark = savedTheme === APP_CONFIG.THEME.DARK;
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.checked = isDark;
    }
  }

  // Toggle theme
  toggleTheme(isDark) {
    const theme = isDark ? APP_CONFIG.THEME.DARK : APP_CONFIG.THEME.LIGHT;
    document.documentElement.setAttribute('data-theme', theme);
    Utils.setStorage(APP_CONFIG.STORAGE_KEYS.THEME, theme);
  }

  // Check authentication
  async checkAuthentication() {
    if (authManager.checkAuth()) {
      try {
        // Refresh user profile to ensure token is still valid
        await authManager.refreshProfile();
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be invalid, but don't force logout here
        // Let individual API calls handle auth errors
      }
    }
  }

  // Initialize navigation
  initializeNavigation() {
    // Set initial active page
    this.setActiveNavItem(this.currentPage);
  }

  // Navigate to page
  async navigateToPage(page, updateHistory = true) {
    if (!this.pages[page]) {
      console.error(`Page "${page}" not found`);
      return;
    }

    try {
      // Update current page
      this.currentPage = page;

      // Update navigation
      this.setActiveNavItem(page);

      // Update URL
      if (updateHistory) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({ page }, '', url);
      }

      // Render page
      await this.pages[page].render();

      // Update page title
      document.title = `${this.getPageTitle(page)} - ${APP_CONFIG.NAME}`;

    } catch (error) {
      console.error(`Error navigating to page "${page}":`, error);
      Toast.error(`Failed to load ${page} page`);
    }
  }

  // Set active navigation item
  setActiveNavItem(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
  }

  // Get page title
  getPageTitle(page) {
    const titles = {
      dashboard: 'Dashboard',
      upload: 'Upload',
      summaries: 'Summaries',
      flashcards: 'Flashcards',
      settings: 'Settings'
    };
    return titles[page] || 'Page';
  }

  // Handle global search
  handleGlobalSearch(query) {
    // If current page has a search method, use it
    if (this.pages[this.currentPage] && typeof this.pages[this.currentPage].handleSearch === 'function') {
      this.pages[this.currentPage].handleSearch(query);
    }
  }

  // Refresh current page
  async refreshCurrentPage() {
    if (this.pages[this.currentPage] && typeof this.pages[this.currentPage].refresh === 'function') {
      try {
        await this.pages[this.currentPage].refresh();
      } catch (error) {
        console.error('Page refresh error:', error);
        Toast.error('Failed to refresh page');
      }
    }
  }

  // Get current page
  getCurrentPage() {
    return this.currentPage;
  }

  // Get page instance
  getPage(page) {
    return this.pages[page];
  }

  // Cleanup
  cleanup() {
    // Clean up any resources, event listeners, etc.
    Object.values(this.pages).forEach(page => {
      if (page.cleanup && typeof page.cleanup === 'function') {
        page.cleanup();
      }
    });
  }

  // Handle API errors globally
  static handleAPIError(error) {
    console.error('API Error:', error);

    if (error.isUnauthorized()) {
      // Token expired or invalid
      authManager.clearUser();
      Toast.error('Session expired. Please login again.');
    } else if (error.isForbidden()) {
      Toast.error('Access denied');
    } else if (error.isNotFound()) {
      Toast.error('Resource not found');
    } else if (error.isServerError()) {
      Toast.error('Server error. Please try again later.');
    } else {
      Toast.error(error.message || 'An error occurred');
    }
  }

  // Utility method to show loading with async operation
  static async withLoading(asyncFunction, message = 'Loading...') {
    return Loading.withLoading(asyncFunction, message);
  }

  // Utility method to show progress with async operation
  static async withProgress(asyncFunction, message = 'Loading...') {
    return Loading.withProgress(asyncFunction, message);
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  Toast.error('An unexpected error occurred');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  Toast.error('An unexpected error occurred');
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

// Export for global access
window.App = App;
