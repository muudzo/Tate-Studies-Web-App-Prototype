// Settings Page
class SettingsPage {
  constructor() {
    this.userSettings = {};
    this.init();
  }

  init() {
    // Initialize settings page
  }

  async render() {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = this.getHTML();
    this.setupPageEventListeners();
    
    try {
      await this.loadUserSettings();
    } catch (error) {
      console.error('Settings load error:', error);
      Toast.error('Failed to load settings');
    }
  }

  getHTML() {
    return `
      <div class="settings-page animate-fade-in">
        <div class="page-header">
          <h1 class="gradient-text">Settings</h1>
          <p class="page-subtitle">Manage your account and preferences</p>
        </div>

        <div class="settings-container">
          <div class="settings-sections">
            <!-- Profile Settings -->
            <div class="settings-section">
              <h2>Profile</h2>
              <div class="settings-card card">
                <div class="card-content">
                  <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" value="${authManager.getUser()?.username || ''}">
                  </div>
                  <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${authManager.getUser()?.email || ''}">
                  </div>
                  <button class="btn btn-primary" id="update-profile-btn">
                    <i class="fas fa-save"></i>
                    Update Profile
                  </button>
                </div>
              </div>
            </div>

            <!-- Study Preferences -->
            <div class="settings-section">
              <h2>Study Preferences</h2>
              <div class="settings-card card">
                <div class="card-content">
                  <div class="form-group">
                    <label for="study-reminders">Study Reminders</label>
                    <div class="switch-container">
                      <label class="switch">
                        <input type="checkbox" id="study-reminders">
                        <span class="slider"></span>
                      </label>
                      <span class="switch-label">Enable daily study reminders</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="flashcard-difficulty">Default Flashcard Difficulty</label>
                    <select id="flashcard-difficulty">
                      <option value="easy">Easy</option>
                      <option value="medium" selected>Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="study-session-length">Study Session Length (minutes)</label>
                    <input type="number" id="study-session-length" min="5" max="120" value="25">
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Settings -->
            <div class="settings-section">
              <h2>AI Settings</h2>
              <div class="settings-card card">
                <div class="card-content">
                  <div class="form-group">
                    <label for="ai-summary-length">Summary Length</label>
                    <select id="ai-summary-length">
                      <option value="short">Short</option>
                      <option value="medium" selected>Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="flashcard-count">Default Flashcard Count</label>
                    <input type="number" id="flashcard-count" min="3" max="20" value="5">
                  </div>
                  <div class="form-group">
                    <label for="ai-creativity">AI Creativity Level</label>
                    <select id="ai-creativity">
                      <option value="conservative">Conservative</option>
                      <option value="balanced" selected>Balanced</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Actions -->
            <div class="settings-section">
              <h2>Account</h2>
              <div class="settings-card card">
                <div class="card-content">
                  <div class="account-stats">
                    <div class="stat-item">
                      <span class="stat-label">Study Streak</span>
                      <span class="stat-value">${authManager.getUser()?.study_streak || 0} days</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Total XP</span>
                      <span class="stat-value">${Utils.formatNumber(authManager.getUser()?.xp_points || 0)}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Member Since</span>
                      <span class="stat-value">${Utils.formatDate(authManager.getUser()?.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <div class="account-actions">
                    <button class="btn btn-secondary" id="export-data-btn">
                      <i class="fas fa-download"></i>
                      Export Data
                    </button>
                    <button class="btn btn-danger" id="logout-btn">
                      <i class="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Settings -->
            <div class="settings-section">
              <h2>Appearance</h2>
              <div class="settings-card card">
                <div class="card-content">
                  <div class="form-group">
                    <label>Theme</label>
                    <div class="theme-options">
                      <div class="theme-option">
                        <input type="radio" id="theme-light" name="theme" value="light">
                        <label for="theme-light">
                          <div class="theme-preview light-theme">
                            <div class="preview-header"></div>
                            <div class="preview-content"></div>
                          </div>
                          <span>Light</span>
                        </label>
                      </div>
                      <div class="theme-option">
                        <input type="radio" id="theme-dark" name="theme" value="dark">
                        <label for="theme-dark">
                          <div class="theme-preview dark-theme">
                            <div class="preview-header"></div>
                            <div class="preview-content"></div>
                          </div>
                          <span>Dark</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupPageEventListeners() {
    // Profile update
    const updateProfileBtn = document.getElementById('update-profile-btn');
    if (updateProfileBtn) {
      updateProfileBtn.addEventListener('click', () => this.updateProfile());
    }

    // Account actions
    const exportDataBtn = document.getElementById('export-data-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportData());
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Theme selection
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.changeTheme(e.target.value);
      });
    });

    // Settings changes
    document.querySelectorAll('#study-reminders, #flashcard-difficulty, #study-session-length, #ai-summary-length, #flashcard-count, #ai-creativity').forEach(input => {
      input.addEventListener('change', () => {
        this.saveSettings();
      });
    });
  }

  async loadUserSettings() {
    try {
      // Load user profile
      const profile = await api.getProfile();
      this.userSettings = profile.user || {};

      // Set current theme
      const currentTheme = Utils.getStorage(APP_CONFIG.STORAGE_KEYS.THEME, APP_CONFIG.THEME.LIGHT);
      const themeRadio = document.querySelector(`input[name="theme"][value="${currentTheme}"]`);
      if (themeRadio) {
        themeRadio.checked = true;
      }

      // Load saved settings
      const savedSettings = Utils.getStorage('user_settings', {});
      Object.entries(savedSettings).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
          } else {
            element.value = value;
          }
        }
      });

    } catch (error) {
      console.error('Error loading user settings:', error);
      throw error;
    }
  }

  async updateProfile() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    if (!username.trim() || !email.trim()) {
      Toast.warning('Please fill in all fields');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      Toast.warning('Please enter a valid email address');
      return;
    }

    try {
      await api.updateProfile({ username, email });
      Toast.success('Profile updated successfully');
      
      // Update local user data
      const currentUser = authManager.getUser();
      authManager.updateUser({ ...currentUser, username, email });
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.error('Failed to update profile');
    }
  }

  changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Utils.setStorage(APP_CONFIG.STORAGE_KEYS.THEME, theme);
    
    // Update theme toggle in sidebar
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.checked = theme === APP_CONFIG.THEME.DARK;
    }
  }

  saveSettings() {
    const settings = {
      'study-reminders': document.getElementById('study-reminders').checked,
      'flashcard-difficulty': document.getElementById('flashcard-difficulty').value,
      'study-session-length': document.getElementById('study-session-length').value,
      'ai-summary-length': document.getElementById('ai-summary-length').value,
      'flashcard-count': document.getElementById('flashcard-count').value,
      'ai-creativity': document.getElementById('ai-creativity').value
    };

    Utils.setStorage('user_settings', settings);
    Toast.success('Settings saved');
  }

  async exportData() {
    try {
      const loadingId = Toast.loading('Preparing your data...');
      
      // Get user data
      const [profile, notes, flashcards] = await Promise.all([
        api.getProfile(),
        api.getNotes(),
        api.getFlashcards()
      ]);

      const exportData = {
        profile: profile.user,
        notes: notes.notes,
        flashcards: flashcards.flashcards,
        settings: Utils.getStorage('user_settings', {}),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const filename = `tate-studies-export-${new Date().toISOString().split('T')[0]}.json`;
      
      Utils.downloadFile(dataStr, filename, 'application/json');
      
      Toast.updateLoading(loadingId, 'Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      Toast.error('Failed to export data');
    }
  }

  async logout() {
    const confirmed = await Modal.confirm(
      'Are you sure you want to logout?',
      { title: 'Logout' }
    );

    if (confirmed) {
      await authManager.logout();
    }
  }

  async refresh() {
    await this.loadUserSettings();
  }
}

window.SettingsPage = SettingsPage;
