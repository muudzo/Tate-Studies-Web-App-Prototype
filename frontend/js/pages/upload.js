// Upload Page
class UploadPage {
  constructor() {
    this.selectedFiles = [];
    this.uploadProgress = new Map();
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Global file drop handler
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.target.closest('.file-upload')) {
        this.handleFileDrop(e);
      }
    });
  }

  // Render upload page
  async render() {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = this.getHTML();
    this.setupPageEventListeners();
  }

  // Get upload page HTML
  getHTML() {
    return `
      <div class="upload-page animate-fade-in">
        <!-- Header -->
        <div class="page-header">
          <h1 class="gradient-text">Upload Notes</h1>
          <p class="page-subtitle">Upload your study materials and let AI process them</p>
        </div>

        <!-- Upload Area -->
        <div class="upload-section">
          <div class="file-upload" id="file-upload-area">
            <div class="file-upload-content">
              <div class="file-upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
              </div>
              <div class="file-upload-text">
                <h3>Drag & drop files here</h3>
                <p>or click to browse</p>
                <p class="file-types">Supports: PDF, Images (JPG, PNG, GIF), Text files</p>
                <p class="file-size">Max file size: ${Utils.formatFileSize(APP_CONFIG.UPLOAD.MAX_FILE_SIZE)}</p>
              </div>
              <input type="file" id="file-input" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.txt" style="display: none;">
              <button class="btn btn-primary" id="browse-files-btn">
                <i class="fas fa-folder-open"></i>
                Browse Files
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Files -->
        <div class="selected-files" id="selected-files" style="display: none;">
          <h3>Selected Files</h3>
          <div class="files-list" id="files-list">
            <!-- Files will be listed here -->
          </div>
          <div class="files-actions">
            <button class="btn btn-secondary" id="clear-files-btn">
              <i class="fas fa-trash"></i>
              Clear All
            </button>
            <button class="btn btn-primary" id="upload-files-btn">
              <i class="fas fa-upload"></i>
              Upload Files
            </button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div class="upload-progress" id="upload-progress" style="display: none;">
          <h3>Upload Progress</h3>
          <div class="progress-list" id="progress-list">
            <!-- Progress items will be shown here -->
          </div>
        </div>

        <!-- Upload History -->
        <div class="upload-history">
          <div class="section-header">
            <h2>Recent Uploads</h2>
            <button class="btn btn-ghost" id="refresh-history-btn">
              <i class="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
          <div class="history-list" id="history-list">
            <!-- History will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  // Setup page-specific event listeners
  setupPageEventListeners() {
    // File input
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-files-btn');
    const uploadArea = document.getElementById('file-upload-area');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFileSelect(e.target.files);
      });
    }

    if (uploadArea) {
      uploadArea.addEventListener('click', () => fileInput.click());
    }

    // File actions
    const clearBtn = document.getElementById('clear-files-btn');
    const uploadBtn = document.getElementById('upload-files-btn');
    const refreshBtn = document.getElementById('refresh-history-btn');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearSelectedFiles());
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.uploadFiles());
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadUploadHistory());
    }

    // Load initial history
    this.loadUploadHistory();
  }

  // Handle file selection
  handleFileSelect(files) {
    const fileArray = Array.from(files);
    this.addFiles(fileArray);
  }

  // Handle file drop
  handleFileDrop(event) {
    const files = Array.from(event.dataTransfer.files);
    this.addFiles(files);
  }

  // Add files to selection
  addFiles(files) {
    const validFiles = files.filter(file => this.validateFile(file));
    
    if (validFiles.length === 0) {
      Toast.warning('No valid files selected');
      return;
    }

    this.selectedFiles.push(...validFiles);
    this.updateSelectedFilesDisplay();
  }

  // Validate file
  validateFile(file) {
    // Check file type
    if (!Utils.isValidFileType(file)) {
      Toast.error(`Invalid file type: ${file.name}. Supported types: PDF, Images, Text files`);
      return false;
    }

    // Check file size
    if (!Utils.isValidFileSize(file)) {
      Toast.error(`File too large: ${file.name}. Max size: ${Utils.formatFileSize(APP_CONFIG.UPLOAD.MAX_FILE_SIZE)}`);
      return false;
    }

    return true;
  }

  // Update selected files display
  updateSelectedFilesDisplay() {
    const selectedFilesDiv = document.getElementById('selected-files');
    const filesList = document.getElementById('files-list');

    if (!selectedFilesDiv || !filesList) return;

    if (this.selectedFiles.length === 0) {
      selectedFilesDiv.style.display = 'none';
      return;
    }

    selectedFilesDiv.style.display = 'block';
    filesList.innerHTML = this.selectedFiles.map((file, index) => this.createFileItem(file, index)).join('');
  }

  // Create file item HTML
  createFileItem(file, index) {
    const fileIcon = this.getFileIcon(file.type);
    const fileSize = Utils.formatFileSize(file.size);

    return `
      <div class="file-item" data-index="${index}">
        <div class="file-info">
          <div class="file-icon">
            <i class="${fileIcon}"></i>
          </div>
          <div class="file-details">
            <h4 class="file-name">${Utils.escapeHtml(file.name)}</h4>
            <p class="file-meta">${fileSize} • ${file.type}</p>
          </div>
        </div>
        <div class="file-actions">
          <button class="btn btn-sm btn-danger remove-file-btn" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Get file icon
  getFileIcon(fileType) {
    if (fileType === 'application/pdf') return 'fas fa-file-pdf text-danger';
    if (fileType.startsWith('image/')) return 'fas fa-image text-success';
    if (fileType === 'text/plain') return 'fas fa-file-alt text-primary';
    return 'fas fa-file text-muted';
  }

  // Remove file from selection
  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.updateSelectedFilesDisplay();
  }

  // Clear all selected files
  clearSelectedFiles() {
    this.selectedFiles = [];
    this.updateSelectedFilesDisplay();
  }

  // Upload files
  async uploadFiles() {
    if (this.selectedFiles.length === 0) {
      Toast.warning('No files selected');
      return;
    }

    const uploadProgressDiv = document.getElementById('upload-progress');
    const progressList = document.getElementById('progress-list');

    if (uploadProgressDiv && progressList) {
      uploadProgressDiv.style.display = 'block';
      progressList.innerHTML = this.selectedFiles.map((file, index) => this.createProgressItem(file, index)).join('');
    }

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      await this.uploadSingleFile(file, i);
    }

    // Clear selected files and refresh history
    this.clearSelectedFiles();
    this.loadUploadHistory();
    
    Toast.success('All files uploaded successfully!');
  }

  // Upload single file
  async uploadSingleFile(file, index) {
    const progressItem = document.querySelector(`[data-file-index="${index}"]`);
    const progressBar = progressItem?.querySelector('.progress-bar');
    const statusText = progressItem?.querySelector('.upload-status');

    try {
      // Update status
      if (statusText) statusText.textContent = 'Uploading...';
      if (progressBar) progressBar.style.width = '30%';

      // Upload file
      const response = await api.uploadFile(file, file.name, []);

      // Update progress
      if (progressBar) progressBar.style.width = '100%';
      if (statusText) statusText.textContent = 'Completed';

      // Update user stats
      if (response.xp_earned) {
        authManager.updateUser({ xp_points: (authManager.getUser()?.xp_points || 0) + response.xp_earned });
      }

      Toast.success(`${file.name} uploaded successfully! (+${response.xp_earned || 0} XP)`);

    } catch (error) {
      console.error('Upload error:', error);
      
      if (progressBar) progressBar.style.width = '100%';
      if (statusText) statusText.textContent = 'Failed';
      if (progressItem) progressItem.classList.add('error');

      Toast.error(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  // Create progress item HTML
  createProgressItem(file, index) {
    return `
      <div class="progress-item" data-file-index="${index}">
        <div class="progress-info">
          <div class="file-icon">
            <i class="${this.getFileIcon(file.type)}"></i>
          </div>
          <div class="file-details">
            <h4 class="file-name">${Utils.escapeHtml(file.name)}</h4>
            <p class="upload-status">Preparing...</p>
          </div>
        </div>
        <div class="progress-bar-container">
          <div class="progress">
            <div class="progress-bar" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Load upload history
  async loadUploadHistory() {
    try {
      const response = await api.getUploadHistory({ limit: 10 });
      this.renderUploadHistory(response.notes || []);
    } catch (error) {
      console.error('Error loading upload history:', error);
      Toast.error('Failed to load upload history');
    }
  }

  // Render upload history
  renderUploadHistory(history) {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history empty-icon"></i>
          <h3>No uploads yet</h3>
          <p>Your upload history will appear here</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = history.map(item => this.createHistoryItem(item)).join('');
  }

  // Create history item HTML
  createHistoryItem(item) {
    const fileIcon = this.getFileIconByType(item.file_type);
    const processedBadge = item.processed ? 
      '<span class="badge badge-success"><i class="fas fa-check"></i> Processed</span>' : 
      '<span class="badge badge-warning"><i class="fas fa-clock"></i> Processing</span>';

    return `
      <div class="history-item card">
        <div class="card-content">
          <div class="history-header">
            <div class="file-icon">
              <i class="${fileIcon}"></i>
            </div>
            <div class="file-details">
              <h4 class="file-name">${Utils.escapeHtml(item.title)}</h4>
              <p class="file-meta">
                <i class="fas fa-clock"></i>
                ${Utils.formatRelativeTime(item.created_at)}
              </p>
            </div>
            <div class="file-status">
              ${processedBadge}
            </div>
          </div>
          <div class="file-tags">
            ${item.tags.map(tag => `<span class="badge badge-secondary">${Utils.escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Get file icon by type
  getFileIconByType(fileType) {
    const icons = {
      pdf: 'fas fa-file-pdf text-danger',
      image: 'fas fa-image text-success',
      text: 'fas fa-file-alt text-primary'
    };
    return icons[fileType] || 'fas fa-file text-muted';
  }

  // Setup event listeners for dynamic content
  setupDynamicEventListeners() {
    // Remove file buttons
    document.querySelectorAll('.remove-file-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.remove-file-btn').dataset.index);
        this.removeFile(index);
      });
    });
  }
}

// Export for use in app
window.UploadPage = UploadPage;
