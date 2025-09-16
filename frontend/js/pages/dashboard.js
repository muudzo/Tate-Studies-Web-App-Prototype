// Dashboard Page
class DashboardPage {
  constructor() {
    this.userStats = null;
    this.recentUploads = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }
  }

  // Render dashboard page
  async render() {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = this.getHTML();
    this.setupPageEventListeners();
    
    try {
      await this.loadData();
    } catch (error) {
      console.error('Dashboard load error:', error);
      Toast.error('Failed to load dashboard data');
    }
  }

  // Get dashboard HTML
  getHTML() {
    return `
      <div class="dashboard-page animate-fade-in">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="gradient-text">Welcome back to Tate Studies</h1>
            <p class="page-subtitle">Turn notes into knowledge.</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid grid grid-cols-3 mb-5">
          <div class="stat-card card">
            <div class="card-content">
              <div class="stat-header">
                <h3 class="stat-label">Study Streak</h3>
                <i class="fas fa-fire stat-icon text-success"></i>
              </div>
              <div class="stat-value">
                <span class="stat-number" id="streak-value">0</span>
                <span class="stat-unit">days</span>
              </div>
              <div class="stat-progress">
                <div class="progress">
                  <div class="progress-bar" id="streak-progress" style="width: 0%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-card card">
            <div class="card-content">
              <div class="stat-header">
                <h3 class="stat-label">Total Notes</h3>
                <i class="fas fa-file-alt stat-icon text-primary"></i>
              </div>
              <div class="stat-value">
                <span class="stat-number" id="notes-value">0</span>
                <span class="stat-unit">files</span>
              </div>
            </div>
          </div>

          <div class="stat-card card">
            <div class="card-content">
              <h3 class="stat-label">XP Points</h3>
              <i class="fas fa-bolt stat-icon text-warning"></i>
              <div class="stat-value">
                <span class="stat-number" id="xp-value">0</span>
                <span class="stat-unit">pts</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Action Card -->
        <div class="main-action-card card mb-5">
          <div class="card-content text-center">
            <div class="action-icon">
              <i class="fas fa-upload"></i>
            </div>
            <h3>Ready to learn something new?</h3>
            <p class="text-muted">Upload your notes and let AI do the heavy lifting</p>
            <button class="btn btn-primary btn-lg" id="upload-notes-btn">
              <i class="fas fa-upload"></i>
              Upload Notes
            </button>
          </div>
        </div>

        <!-- Recent Uploads -->
        <div class="recent-uploads">
          <div class="section-header">
            <h2>Recent Uploads</h2>
            <button class="btn btn-ghost" id="view-all-btn">View All</button>
          </div>
          
          <div class="uploads-grid" id="uploads-grid">
            <!-- Uploads will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  // Setup page-specific event listeners
  setupPageEventListeners() {
    // Upload notes button
    const uploadBtn = document.getElementById('upload-notes-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        this.navigateToPage('upload');
      });
    }

    // View all button
    const viewAllBtn = document.getElementById('view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        this.navigateToPage('summaries');
      });
    }
  }

  // Load dashboard data
  async loadData() {
    try {
      // Load user stats and recent uploads in parallel
      const [userProfile, uploadHistory] = await Promise.all([
        api.getProfile(),
        api.getUploadHistory({ limit: 6 })
      ]);

      this.userStats = userProfile.user;
      this.recentUploads = uploadHistory.notes || [];

      this.updateStats();
      this.renderRecentUploads();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }

  // Update stats display
  updateStats() {
    if (!this.userStats) return;

    // Update streak
    const streakValue = document.getElementById('streak-value');
    const streakProgress = document.getElementById('streak-progress');
    if (streakValue) {
      streakValue.textContent = this.userStats.study_streak || 0;
    }
    if (streakProgress) {
      const streakPercent = Math.min(100, ((this.userStats.study_streak || 0) / 10) * 100);
      streakProgress.style.width = `${streakPercent}%`;
    }

    // Update XP
    const xpValue = document.getElementById('xp-value');
    if (xpValue) {
      xpValue.textContent = Utils.formatNumber(this.userStats.xp_points || 0);
    }

    // Update notes count
    const notesValue = document.getElementById('notes-value');
    if (notesValue) {
      notesValue.textContent = this.recentUploads.length;
    }
  }

  // Render recent uploads
  renderRecentUploads() {
    const uploadsGrid = document.getElementById('uploads-grid');
    if (!uploadsGrid) return;

    if (this.recentUploads.length === 0) {
      uploadsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-upload empty-icon"></i>
          <h3>No uploads yet</h3>
          <p>Start by uploading your first note!</p>
          <button class="btn btn-primary" onclick="app.navigateToPage('upload')">
            <i class="fas fa-upload"></i>
            Upload Notes
          </button>
        </div>
      `;
      return;
    }

    uploadsGrid.innerHTML = this.recentUploads.map(upload => this.createUploadCard(upload)).join('');
  }

  // Create upload card HTML
  createUploadCard(upload) {
    const fileIcon = this.getFileIcon(upload.file_type);
    const processedBadge = upload.processed ? 
      '<span class="badge badge-success"><i class="fas fa-brain"></i> Processed</span>' : 
      '<span class="badge badge-warning"><i class="fas fa-clock"></i> Processing</span>';

    return `
      <div class="upload-card card hover-lift" data-id="${upload.id}">
        <div class="card-content">
          <div class="upload-header">
            <div class="upload-icon">
              <i class="${fileIcon}"></i>
            </div>
            <div class="upload-info">
              <h4 class="upload-title">${Utils.escapeHtml(upload.title)}</h4>
              <div class="upload-meta">
                <i class="fas fa-clock"></i>
                <span>${Utils.formatRelativeTime(upload.created_at)}</span>
              </div>
            </div>
            <div class="upload-status">
              ${processedBadge}
            </div>
          </div>
          
          <div class="upload-tags">
            ${upload.tags.map(tag => `<span class="badge badge-secondary">${Utils.escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Get file type icon
  getFileIcon(fileType) {
    const icons = {
      pdf: 'fas fa-file-pdf text-danger',
      image: 'fas fa-image text-success',
      text: 'fas fa-file-alt text-primary'
    };
    return icons[fileType] || 'fas fa-file text-muted';
  }

  // Handle search
  handleSearch(query) {
    if (!query.trim()) {
      this.renderRecentUploads();
      return;
    }

    const filteredUploads = this.recentUploads.filter(upload => 
      upload.title.toLowerCase().includes(query.toLowerCase()) ||
      upload.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    const uploadsGrid = document.getElementById('uploads-grid');
    if (uploadsGrid) {
      uploadsGrid.innerHTML = filteredUploads.map(upload => this.createUploadCard(upload)).join('');
    }
  }

  // Navigate to page
  navigateToPage(page) {
    if (window.app) {
      window.app.navigateToPage(page);
    }
  }

  // Refresh data
  async refresh() {
    try {
      await this.loadData();
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    }
  }
}

// Export for use in app
window.DashboardPage = DashboardPage;
