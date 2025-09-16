// Summaries Page
class SummariesPage {
  constructor() {
    this.notes = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    // Initialize summaries page
  }

  async render() {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = this.getHTML();
    this.setupPageEventListeners();
    
    try {
      await this.loadNotes();
    } catch (error) {
      console.error('Summaries load error:', error);
      Toast.error('Failed to load notes');
    }
  }

  getHTML() {
    return `
      <div class="summaries-page animate-fade-in">
        <div class="page-header">
          <h1 class="gradient-text">Your Notes & Summaries</h1>
          <p class="page-subtitle">AI-powered summaries of your study materials</p>
        </div>

        <div class="notes-container">
          <div class="notes-filters">
            <div class="filter-tabs">
              <button class="filter-tab active" data-filter="all">All Notes</button>
              <button class="filter-tab" data-filter="processed">Processed</button>
              <button class="filter-tab" data-filter="unprocessed">Processing</button>
            </div>
            <div class="search-box">
              <input type="text" id="notes-search" placeholder="Search notes...">
              <i class="fas fa-search"></i>
            </div>
          </div>

          <div class="notes-grid" id="notes-grid">
            <!-- Notes will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  setupPageEventListeners() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Search
    const searchInput = document.getElementById('notes-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.setSearchQuery(e.target.value);
      }, 300));
    }
  }

  async loadNotes() {
    try {
      const response = await api.getNotes();
      this.notes = response.notes || [];
      this.renderNotes();
    } catch (error) {
      console.error('Error loading notes:', error);
      throw error;
    }
  }

  renderNotes() {
    const notesGrid = document.getElementById('notes-grid');
    if (!notesGrid) return;

    const filteredNotes = this.getFilteredNotes();

    if (filteredNotes.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-alt empty-icon"></i>
          <h3>No notes found</h3>
          <p>Upload some files to get started!</p>
        </div>
      `;
      return;
    }

    notesGrid.innerHTML = filteredNotes.map(note => this.createNoteCard(note)).join('');
  }

  getFilteredNotes() {
    let filtered = this.notes;

    // Apply filter
    if (this.currentFilter === 'processed') {
      filtered = filtered.filter(note => note.processed);
    } else if (this.currentFilter === 'unprocessed') {
      filtered = filtered.filter(note => !note.processed);
    }

    // Apply search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  createNoteCard(note) {
    return `
      <div class="note-card card" data-id="${note.id}">
        <div class="card-content">
          <div class="note-header">
            <h3 class="note-title">${Utils.escapeHtml(note.title)}</h3>
            <div class="note-status">
              ${note.processed ? 
                '<span class="badge badge-success">Processed</span>' : 
                '<span class="badge badge-warning">Processing</span>'
              }
            </div>
          </div>
          <div class="note-meta">
            <span class="note-type">${note.file_type.toUpperCase()}</span>
            <span class="note-date">${Utils.formatRelativeTime(note.created_at)}</span>
          </div>
          <div class="note-tags">
            ${note.tags.map(tag => `<span class="badge badge-secondary">${Utils.escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="note-actions">
            <button class="btn btn-sm btn-primary" onclick="app.getPage('summaries').viewNote(${note.id})">
              <i class="fas fa-eye"></i> View
            </button>
            ${note.processed ? `
              <button class="btn btn-sm btn-secondary" onclick="app.getPage('summaries').generateSummary(${note.id})">
                <i class="fas fa-magic"></i> Summarize
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === filter);
    });

    this.renderNotes();
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.renderNotes();
  }

  async viewNote(noteId) {
    try {
      const response = await api.getNote(noteId);
      this.showNoteModal(response.note);
    } catch (error) {
      console.error('Error loading note:', error);
      Toast.error('Failed to load note');
    }
  }

  showNoteModal(note) {
    const content = `
      <div class="note-modal-content">
        <div class="note-header">
          <h2>${Utils.escapeHtml(note.title)}</h2>
          <div class="note-meta">
            <span class="badge badge-primary">${note.file_type.toUpperCase()}</span>
            <span>${Utils.formatDate(note.created_at)}</span>
          </div>
        </div>
        <div class="note-content">
          <h3>Content</h3>
          <div class="content-preview">
            ${note.content ? Utils.escapeHtml(note.content.substring(0, 1000)) + '...' : 'No content available'}
          </div>
          ${note.summary ? `
            <h3>AI Summary</h3>
            <div class="summary-content">
              ${Utils.escapeHtml(note.summary)}
            </div>
          ` : ''}
        </div>
        <div class="note-actions">
          <button class="btn btn-primary" onclick="app.getPage('summaries').generateSummary(${note.id})">
            <i class="fas fa-magic"></i> Generate Summary
          </button>
          <button class="btn btn-secondary" onclick="app.getPage('summaries').generateFlashcards(${note.id})">
            <i class="fas fa-cards-blank"></i> Create Flashcards
          </button>
        </div>
      </div>
    `;

    const modal = Modal.create(content, { closable: true });
    modal.open();
  }

  async generateSummary(noteId) {
    try {
      const loadingId = Toast.loading('Generating summary...');
      const response = await api.generateSummary(noteId);
      Toast.updateLoading(loadingId, 'Summary generated successfully!', 'success');
      
      // Update user stats
      if (response.xp_earned) {
        authManager.updateUser({ xp_points: (authManager.getUser()?.xp_points || 0) + response.xp_earned });
      }

      // Refresh notes
      await this.loadNotes();
    } catch (error) {
      console.error('Error generating summary:', error);
      Toast.error('Failed to generate summary');
    }
  }

  async generateFlashcards(noteId) {
    try {
      const loadingId = Toast.loading('Generating flashcards...');
      const response = await api.generateFlashcards(noteId);
      Toast.updateLoading(loadingId, `Generated ${response.flashcards.length} flashcards!`, 'success');
      
      // Update user stats
      if (response.xp_earned) {
        authManager.updateUser({ xp_points: (authManager.getUser()?.xp_points || 0) + response.xp_earned });
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      Toast.error('Failed to generate flashcards');
    }
  }

  async refresh() {
    await this.loadNotes();
  }
}

window.SummariesPage = SummariesPage;
