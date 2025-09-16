// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      LOGOUT: '/auth/logout'
    },
    NOTES: {
      LIST: '/notes',
      CREATE: '/notes',
      GET: '/notes',
      UPDATE: '/notes',
      DELETE: '/notes',
      STATS: '/notes/stats/overview'
    },
    UPLOAD: {
      UPLOAD: '/upload',
      HISTORY: '/upload/history',
      DELETE: '/upload'
    },
    AI: {
      SUMMARIZE: '/ai/summarize',
      FLASHCARDS: '/ai/flashcards',
      QUESTIONS: '/ai/questions',
      CHAT: '/ai/chat'
    },
    FLASHCARDS: {
      LIST: '/flashcards',
      STUDY: '/flashcards/study',
      CREATE: '/flashcards',
      UPDATE: '/flashcards',
      DELETE: '/flashcards',
      REVIEW: '/flashcards',
      STATS: '/flashcards/stats/overview'
    }
  }
};

// App Configuration
const APP_CONFIG = {
  NAME: 'Tate Studies',
  TAGLINE: 'Bullshitting Through School',
  VERSION: '1.0.0',
  THEME: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  STORAGE_KEYS: {
    TOKEN: 'tate_studies_token',
    USER: 'tate_studies_user',
    THEME: 'tate_studies_theme',
    SETTINGS: 'tate_studies_settings'
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt']
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  },
  ANIMATIONS: {
    DURATION: 300,
    EASING: 'ease-in-out'
  }
};

// Export for use in other modules
window.API_CONFIG = API_CONFIG;
window.APP_CONFIG = APP_CONFIG;
