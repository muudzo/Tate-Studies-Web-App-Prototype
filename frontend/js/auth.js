// Authentication Manager
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  // Initialize authentication state
  init() {
    const token = Utils.getStorage(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const user = Utils.getStorage(APP_CONFIG.STORAGE_KEYS.USER);
    
    if (token && user) {
      this.setUser(user, token);
    }
  }

  // Set current user
  setUser(user, token = null) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    if (token) {
      api.setToken(token);
    }
    
    Utils.setStorage(APP_CONFIG.STORAGE_KEYS.USER, user);
    this.updateUI();
  }

  // Clear user data
  clearUser() {
    this.currentUser = null;
    this.isAuthenticated = false;
    api.logout();
    Utils.clearAppStorage();
    this.updateUI();
  }

  // Update UI based on authentication state
  updateUI() {
    const authModal = document.getElementById('auth-modal');
    const app = document.getElementById('app');
    const userName = document.getElementById('user-name');
    const userXp = document.getElementById('user-xp');
    const userStreak = document.getElementById('user-streak');

    if (this.isAuthenticated) {
      authModal.classList.remove('active');
      app.style.display = 'flex';
      
      if (this.currentUser) {
        userName.textContent = this.currentUser.username;
        userXp.textContent = `${this.currentUser.xp_points || 0} XP`;
        userStreak.textContent = `${this.currentUser.study_streak || 0} day streak`;
      }
    } else {
      authModal.classList.add('active');
      app.style.display = 'none';
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.login(credentials);
      this.setUser(response.user, response.token);
      
      Toast.show('Login successful!', 'success');
      return response;
    } catch (error) {
      console.error('Login error:', error);
      Toast.show(error.message || 'Login failed', 'error');
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await api.register(userData);
      this.setUser(response.user, response.token);
      
      Toast.show('Registration successful!', 'success');
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show(error.message || 'Registration failed', 'error');
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await api.logout();
      this.clearUser();
      Toast.show('Logged out successfully', 'info');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      this.clearUser();
    }
  }

  // Check if user is authenticated
  checkAuth() {
    return this.isAuthenticated && this.currentUser;
  }

  // Get current user
  getUser() {
    return this.currentUser;
  }

  // Update user data
  updateUser(userData) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...userData };
      Utils.setStorage(APP_CONFIG.STORAGE_KEYS.USER, this.currentUser);
      this.updateUI();
    }
  }

  // Refresh user profile
  async refreshProfile() {
    try {
      const response = await api.getProfile();
      this.updateUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Profile refresh error:', error);
      // If token is invalid, logout user
      if (error.isUnauthorized()) {
        this.clearUser();
      }
      throw error;
    }
  }
}

// Authentication UI Handlers
class AuthUI {
  constructor(authManager) {
    this.authManager = authManager;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormValidation();
  }

  setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(e.target);
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister(e.target);
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.authManager.logout();
      });
    }
  }

  setupFormValidation() {
    // Real-time validation
    const inputs = document.querySelectorAll('.auth-form input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.toggle('active', form.id === `${tab}-form`);
    });
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    // Validate form
    if (!this.validateForm(form)) {
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    try {
      await this.authManager.login(credentials);
    } catch (error) {
      // Error handling is done in AuthManager
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async handleRegister(form) {
    const formData = new FormData(form);
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    // Validate form
    if (!this.validateForm(form)) {
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;

    try {
      await this.authManager.register(userData);
    } catch (error) {
      // Error handling is done in AuthManager
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (input.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = `${this.capitalize(fieldName)} is required`;
    }

    // Email validation
    if (fieldName === 'email' && value && !Utils.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    // Password validation
    if (fieldName === 'password' && value && value.length < 6) {
      isValid = false;
      errorMessage = 'Password must be at least 6 characters long';
    }

    // Username validation
    if (fieldName === 'username' && value && value.length < 3) {
      isValid = false;
      errorMessage = 'Username must be at least 3 characters long';
    }

    if (!isValid) {
      this.showFieldError(input, errorMessage);
    } else {
      this.clearFieldError(input);
    }

    return isValid;
  }

  showFieldError(input, message) {
    this.clearFieldError(input);
    
    input.classList.add('error');
    const errorDiv = Utils.createElement('div', {
      className: 'field-error',
      textContent: message
    });
    
    input.parentNode.appendChild(errorDiv);
  }

  clearFieldError(input) {
    input.classList.remove('error');
    const errorDiv = input.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Create global instances
window.authManager = new AuthManager();
window.authUI = new AuthUI(authManager);
