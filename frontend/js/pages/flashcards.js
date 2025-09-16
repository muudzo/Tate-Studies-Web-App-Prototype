// Flashcards Page
class FlashcardsPage {
  constructor() {
    this.flashcards = [];
    this.currentCardIndex = 0;
    this.showAnswer = false;
    this.studyMode = false;
    this.init();
  }

  init() {
    // Initialize flashcards page
  }

  async render() {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = this.getHTML();
    this.setupPageEventListeners();
    
    try {
      await this.loadFlashcards();
    } catch (error) {
      console.error('Flashcards load error:', error);
      Toast.error('Failed to load flashcards');
    }
  }

  getHTML() {
    return `
      <div class="flashcards-page animate-fade-in">
        <div class="page-header">
          <h1 class="gradient-text">Flashcards</h1>
          <p class="page-subtitle">Study with AI-generated flashcards</p>
        </div>

        <div class="flashcards-container">
          <div class="study-controls">
            <div class="study-stats">
              <div class="stat-item">
                <span class="stat-label">Total Cards</span>
                <span class="stat-value" id="total-cards">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Due for Review</span>
                <span class="stat-value" id="due-cards">0</span>
              </div>
            </div>
            <div class="study-actions">
              <button class="btn btn-primary" id="start-study-btn">
                <i class="fas fa-play"></i>
                Start Study Session
              </button>
              <button class="btn btn-secondary" id="view-all-btn">
                <i class="fas fa-list"></i>
                View All Cards
              </button>
            </div>
          </div>

          <div class="study-session" id="study-session" style="display: none;">
            <div class="card-container">
              <div class="flashcard" id="flashcard">
                <div class="card-side front" id="card-front">
                  <div class="card-content">
                    <h3 id="card-question">Question will appear here</h3>
                  </div>
                </div>
                <div class="card-side back" id="card-back" style="display: none;">
                  <div class="card-content">
                    <h3 id="card-answer">Answer will appear here</h3>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="btn btn-danger" id="mark-wrong-btn">
                <i class="fas fa-times"></i>
                Wrong
              </button>
              <button class="btn btn-primary" id="show-answer-btn">
                <i class="fas fa-eye"></i>
                Show Answer
              </button>
              <button class="btn btn-success" id="mark-correct-btn">
                <i class="fas fa-check"></i>
                Correct
              </button>
            </div>

            <div class="study-progress">
              <div class="progress-info">
                <span id="current-card-number">1</span> of <span id="total-study-cards">0</span>
              </div>
              <div class="progress">
                <div class="progress-bar" id="study-progress-bar" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <div class="flashcards-list" id="flashcards-list">
            <!-- Flashcards will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  setupPageEventListeners() {
    // Study controls
    const startStudyBtn = document.getElementById('start-study-btn');
    const viewAllBtn = document.getElementById('view-all-btn');

    if (startStudyBtn) {
      startStudyBtn.addEventListener('click', () => this.startStudySession());
    }

    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => this.showAllCards());
    }

    // Study session controls
    const showAnswerBtn = document.getElementById('show-answer-btn');
    const markCorrectBtn = document.getElementById('mark-correct-btn');
    const markWrongBtn = document.getElementById('mark-wrong-btn');

    if (showAnswerBtn) {
      showAnswerBtn.addEventListener('click', () => this.showAnswer());
    }

    if (markCorrectBtn) {
      markCorrectBtn.addEventListener('click', () => this.markCard(true));
    }

    if (markWrongBtn) {
      markWrongBtn.addEventListener('click', () => this.markCard(false));
    }
  }

  async loadFlashcards() {
    try {
      const response = await api.getFlashcards();
      this.flashcards = response.flashcards || [];
      this.updateStats();
      this.renderFlashcardsList();
    } catch (error) {
      console.error('Error loading flashcards:', error);
      throw error;
    }
  }

  updateStats() {
    const totalCards = document.getElementById('total-cards');
    const dueCards = document.getElementById('due-cards');

    if (totalCards) {
      totalCards.textContent = this.flashcards.length;
    }

    if (dueCards) {
      const dueCount = this.flashcards.filter(card => 
        !card.next_review || new Date(card.next_review) <= new Date()
      ).length;
      dueCards.textContent = dueCount;
    }
  }

  renderFlashcardsList() {
    const flashcardsList = document.getElementById('flashcards-list');
    if (!flashcardsList) return;

    if (this.flashcards.length === 0) {
      flashcardsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-cards-blank empty-icon"></i>
          <h3>No flashcards yet</h3>
          <p>Generate flashcards from your notes to get started!</p>
          <button class="btn btn-primary" onclick="app.navigateToPage('summaries')">
            <i class="fas fa-magic"></i>
            Generate Flashcards
          </button>
        </div>
      `;
      return;
    }

    flashcardsList.innerHTML = this.flashcards.map(card => this.createFlashcardItem(card)).join('');
  }

  createFlashcardItem(card) {
    const isDue = !card.next_review || new Date(card.next_review) <= new Date();
    const dueBadge = isDue ? '<span class="badge badge-warning">Due</span>' : '';

    return `
      <div class="flashcard-item card" data-id="${card.id}">
        <div class="card-content">
          <div class="flashcard-header">
            <h4 class="flashcard-title">${Utils.escapeHtml(card.front)}</h4>
            <div class="flashcard-status">
              ${dueBadge}
              <span class="badge badge-secondary">${card.difficulty}</span>
            </div>
          </div>
          <div class="flashcard-content">
            <p class="flashcard-answer">${Utils.escapeHtml(card.back)}</p>
          </div>
          <div class="flashcard-meta">
            <span class="review-count">Reviews: ${card.review_count || 0}</span>
            <span class="correct-rate">Correct: ${card.correct_count || 0}/${card.review_count || 0}</span>
          </div>
          <div class="flashcard-actions">
            <button class="btn btn-sm btn-primary" onclick="app.getPage('flashcards').reviewCard(${card.id})">
              <i class="fas fa-play"></i> Review
            </button>
            <button class="btn btn-sm btn-secondary" onclick="app.getPage('flashcards').editCard(${card.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="app.getPage('flashcards').deleteCard(${card.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async startStudySession() {
    try {
      const response = await api.getStudyFlashcards({ limit: 10 });
      this.studyCards = response.flashcards || [];
      
      if (this.studyCards.length === 0) {
        Toast.warning('No cards available for study');
        return;
      }

      this.studyMode = true;
      this.currentCardIndex = 0;
      this.showAnswer = false;

      this.showStudySession();
      this.displayCurrentCard();
    } catch (error) {
      console.error('Error starting study session:', error);
      Toast.error('Failed to start study session');
    }
  }

  showStudySession() {
    const studySession = document.getElementById('study-session');
    const flashcardsList = document.getElementById('flashcards-list');

    if (studySession) studySession.style.display = 'block';
    if (flashcardsList) flashcardsList.style.display = 'none';
  }

  hideStudySession() {
    const studySession = document.getElementById('study-session');
    const flashcardsList = document.getElementById('flashcards-list');

    if (studySession) studySession.style.display = 'none';
    if (flashcardsList) flashcardsList.style.display = 'block';
  }

  displayCurrentCard() {
    if (!this.studyCards || this.studyCards.length === 0) return;

    const card = this.studyCards[this.currentCardIndex];
    const question = document.getElementById('card-question');
    const answer = document.getElementById('card-answer');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    const showAnswerBtn = document.getElementById('show-answer-btn');
    const currentCardNumber = document.getElementById('current-card-number');
    const totalStudyCards = document.getElementById('total-study-cards');
    const studyProgressBar = document.getElementById('study-progress-bar');

    if (question) question.textContent = card.front;
    if (answer) answer.textContent = card.back;
    if (cardFront) cardFront.style.display = 'block';
    if (cardBack) cardBack.style.display = 'none';
    if (showAnswerBtn) showAnswerBtn.style.display = 'inline-flex';
    if (currentCardNumber) currentCardNumber.textContent = this.currentCardIndex + 1;
    if (totalStudyCards) totalStudyCards.textContent = this.studyCards.length;
    if (studyProgressBar) {
      const progress = ((this.currentCardIndex + 1) / this.studyCards.length) * 100;
      studyProgressBar.style.width = `${progress}%`;
    }

    this.showAnswer = false;
  }

  showAnswer() {
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    const showAnswerBtn = document.getElementById('show-answer-btn');

    if (cardFront) cardFront.style.display = 'none';
    if (cardBack) cardBack.style.display = 'block';
    if (showAnswerBtn) showAnswerBtn.style.display = 'none';

    this.showAnswer = true;
  }

  async markCard(correct) {
    if (!this.showAnswer) {
      Toast.warning('Please show the answer first');
      return;
    }

    const card = this.studyCards[this.currentCardIndex];
    
    try {
      await api.reviewFlashcard(card.id, correct);
      
      // Update user stats
      const xpEarned = correct ? 2 : 1;
      authManager.updateUser({ 
        xp_points: (authManager.getUser()?.xp_points || 0) + xpEarned 
      });

      Toast.success(correct ? 'Correct! (+2 XP)' : 'Keep studying! (+1 XP)');

      // Move to next card
      this.currentCardIndex++;
      
      if (this.currentCardIndex >= this.studyCards.length) {
        // Study session complete
        this.completeStudySession();
      } else {
        this.displayCurrentCard();
      }
    } catch (error) {
      console.error('Error reviewing card:', error);
      Toast.error('Failed to save review');
    }
  }

  completeStudySession() {
    Toast.success('Study session complete! Great job!');
    this.hideStudySession();
    this.loadFlashcards(); // Refresh stats
  }

  showAllCards() {
    this.hideStudySession();
  }

  async reviewCard(cardId) {
    // Start a single card review
    try {
      const response = await api.getFlashcards({ note_id: cardId });
      if (response.flashcards.length > 0) {
        this.studyCards = response.flashcards;
        this.currentCardIndex = 0;
        this.showAnswer = false;
        this.showStudySession();
        this.displayCurrentCard();
      }
    } catch (error) {
      console.error('Error loading card for review:', error);
      Toast.error('Failed to load card');
    }
  }

  async editCard(cardId) {
    // Show edit modal
    const card = this.flashcards.find(c => c.id === cardId);
    if (!card) return;

    const content = `
      <div class="edit-card-modal">
        <div class="form-group">
          <label>Question</label>
          <textarea id="edit-front" rows="3">${Utils.escapeHtml(card.front)}</textarea>
        </div>
        <div class="form-group">
          <label>Answer</label>
          <textarea id="edit-back" rows="3">${Utils.escapeHtml(card.back)}</textarea>
        </div>
        <div class="form-group">
          <label>Difficulty</label>
          <select id="edit-difficulty">
            <option value="easy" ${card.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
            <option value="medium" ${card.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="hard" ${card.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="app.getPage('flashcards').saveCardEdit(${cardId})">
            Save Changes
          </button>
        </div>
      </div>
    `;

    const modal = Modal.create(content, { closable: true });
    modal.open();
  }

  async saveCardEdit(cardId) {
    const front = document.getElementById('edit-front').value;
    const back = document.getElementById('edit-back').value;
    const difficulty = document.getElementById('edit-difficulty').value;

    if (!front.trim() || !back.trim()) {
      Toast.warning('Please fill in both question and answer');
      return;
    }

    try {
      await api.updateFlashcard(cardId, { front, back, difficulty });
      Toast.success('Card updated successfully');
      await this.loadFlashcards();
    } catch (error) {
      console.error('Error updating card:', error);
      Toast.error('Failed to update card');
    }
  }

  async deleteCard(cardId) {
    const confirmed = await Modal.confirm(
      'Are you sure you want to delete this flashcard?',
      { title: 'Delete Flashcard' }
    );

    if (!confirmed) return;

    try {
      await api.deleteFlashcard(cardId);
      Toast.success('Card deleted successfully');
      await this.loadFlashcards();
    } catch (error) {
      console.error('Error deleting card:', error);
      Toast.error('Failed to delete card');
    }
  }

  async refresh() {
    await this.loadFlashcards();
  }
}

window.FlashcardsPage = FlashcardsPage;
