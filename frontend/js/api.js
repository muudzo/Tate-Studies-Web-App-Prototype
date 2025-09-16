// API Client Class
class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = Utils.getStorage(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      Utils.setStorage(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
    } else {
      Utils.removeStorage(APP_CONFIG.STORAGE_KEYS.TOKEN);
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new APIError(data.error || data.message || 'Request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError('Network error or server unavailable', 0, { originalError: error.message });
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    return this.request(url.pathname + url.search, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Upload file
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.error || data.message || 'Upload failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Upload failed', 0, { originalError: error.message });
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
    Utils.removeStorage(APP_CONFIG.STORAGE_KEYS.USER);
  }

  async getProfile() {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  async updateProfile(userData) {
    return this.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, userData);
  }

  // Notes methods
  async getNotes(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.NOTES.LIST, params);
  }

  async getNote(id) {
    return this.get(`${API_CONFIG.ENDPOINTS.NOTES.GET}/${id}`);
  }

  async updateNote(id, data) {
    return this.put(`${API_CONFIG.ENDPOINTS.NOTES.UPDATE}/${id}`, data);
  }

  async deleteNote(id) {
    return this.delete(`${API_CONFIG.ENDPOINTS.NOTES.DELETE}/${id}`);
  }

  async getNoteStats() {
    return this.get(API_CONFIG.ENDPOINTS.NOTES.STATS);
  }

  // Upload methods
  async uploadFile(file, title = '', tags = []) {
    return this.uploadFile(API_CONFIG.ENDPOINTS.UPLOAD.UPLOAD, file, {
      title,
      tags: JSON.stringify(tags)
    });
  }

  async getUploadHistory(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.UPLOAD.HISTORY, params);
  }

  async deleteUpload(id) {
    return this.delete(`${API_CONFIG.ENDPOINTS.UPLOAD.DELETE}/${id}`);
  }

  // AI methods
  async generateSummary(noteId) {
    return this.post(`${API_CONFIG.ENDPOINTS.AI.SUMMARIZE}/${noteId}`);
  }

  async generateFlashcards(noteId, count = 5) {
    return this.post(`${API_CONFIG.ENDPOINTS.AI.FLASHCARDS}/${noteId}`, { count });
  }

  async generateQuestions(noteId, count = 5, difficulty = 'medium') {
    return this.post(`${API_CONFIG.ENDPOINTS.AI.QUESTIONS}/${noteId}`, { count, difficulty });
  }

  async chatWithAI(message, noteId = null) {
    return this.post(API_CONFIG.ENDPOINTS.AI.CHAT, { message, noteId });
  }

  // Flashcard methods
  async getFlashcards(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.FLASHCARDS.LIST, params);
  }

  async getStudyFlashcards(params = {}) {
    return this.get(API_CONFIG.ENDPOINTS.FLASHCARDS.STUDY, params);
  }

  async createFlashcard(data) {
    return this.post(API_CONFIG.ENDPOINTS.FLASHCARDS.CREATE, data);
  }

  async updateFlashcard(id, data) {
    return this.put(`${API_CONFIG.ENDPOINTS.FLASHCARDS.UPDATE}/${id}`, data);
  }

  async deleteFlashcard(id) {
    return this.delete(`${API_CONFIG.ENDPOINTS.FLASHCARDS.DELETE}/${id}`);
  }

  async reviewFlashcard(id, correct, difficulty = null) {
    return this.post(`${API_CONFIG.ENDPOINTS.FLASHCARDS.REVIEW}/${id}/review`, {
      correct,
      difficulty
    });
  }

  async getFlashcardStats() {
    return this.get(API_CONFIG.ENDPOINTS.FLASHCARDS.STATS);
  }
}

// Custom API Error class
class APIError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }

  isUnauthorized() {
    return this.status === 401;
  }

  isForbidden() {
    return this.status === 403;
  }

  isNotFound() {
    return this.status === 404;
  }

  isServerError() {
    return this.status >= 500;
  }
}

// Create global API client instance
window.api = new APIClient();
window.APIError = APIError;
