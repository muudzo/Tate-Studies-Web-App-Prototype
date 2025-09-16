# Tate Studies Web App

A modern study notes application with AI-powered features for students. Upload your study materials and let AI generate summaries, flashcards, and study questions.

## Features

- 📚 **File Upload**: Support for PDF, images, and text files
- 🤖 **AI Integration**: OpenAI-powered summaries and flashcard generation
- 🎯 **Smart Flashcards**: Spaced repetition system for effective learning
- 📊 **Progress Tracking**: XP system and study streaks
- 🎨 **Modern UI**: Clean, responsive design with dark/light themes
- 🔐 **User Authentication**: Secure login and registration
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Vanilla JavaScript** (no frameworks for simplicity)
- **CSS Grid & Flexbox** for layout
- **Font Awesome** for icons
- **Google Fonts** (Inter) for typography

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **Multer** for file uploads
- **OpenAI API** for AI features
- **PDF-parse** for PDF text extraction
- **Tesseract.js** for OCR (image text extraction)
- **Sharp** for image processing

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- OpenAI API key

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Tate Studies Web App Prototype"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Database Setup

1. **Create MySQL database**:
   ```sql
   CREATE DATABASE tate_studies;
   ```

2. **Initialize database tables**:
   ```bash
   node init-db.js
   ```

### 4. Environment Configuration

1. **Copy the example environment file**:
   ```bash
   cp config.example.env .env
   ```

2. **Update `.env` with your settings**:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=tate_studies

   # JWT Secret (generate a random string)
   JWT_SECRET=your_jwt_secret_key_here

   # OpenAI API Key (get from https://platform.openai.com/api-keys)
   OPENAI_API_KEY=your_openai_api_key_here

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

### 5. Frontend Setup

The frontend is already set up with vanilla HTML, CSS, and JavaScript. No build process required!

### 6. Start the Application

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Open the frontend**:
   - Open `frontend/index.html` in your web browser
   - Or serve it with a local server:
     ```bash
     cd frontend
     python -m http.server 8080
     # Then visit http://localhost:8080
     ```

## Usage

### 1. Registration/Login
- Create a new account or login with existing credentials
- The app uses JWT tokens for authentication

### 2. Upload Notes
- Click "Upload" in the sidebar
- Drag & drop files or click to browse
- Supported formats: PDF, JPG, PNG, GIF, TXT
- Files are automatically processed for text extraction

### 3. View Summaries
- Go to "Summaries" to see all your uploaded notes
- Click "Generate Summary" to create AI-powered summaries
- View processed content and AI-generated insights

### 4. Study with Flashcards
- Navigate to "Flashcards" section
- Start a study session with due cards
- Use spaced repetition for effective learning
- Earn XP for correct answers

### 5. Track Progress
- View your study streak and XP points on the dashboard
- Monitor your learning progress over time

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Notes
- `GET /api/notes` - Get user's notes
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/history` - Get upload history
- `DELETE /api/upload/:id` - Delete uploaded file

### AI Features
- `POST /api/ai/summarize/:noteId` - Generate summary
- `POST /api/ai/flashcards/:noteId` - Generate flashcards
- `POST /api/ai/questions/:noteId` - Generate study questions
- `POST /api/ai/chat` - Chat with AI about notes

### Flashcards
- `GET /api/flashcards` - Get user's flashcards
- `GET /api/flashcards/study` - Get cards for study
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard
- `POST /api/flashcards/:id/review` - Submit review

## File Structure

```
Tate Studies Web App Prototype/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── upload.js
│   │   ├── ai.js
│   │   └── flashcards.js
│   ├── uploads/          # Uploaded files storage
│   ├── server.js
│   ├── init-db.js
│   ├── package.json
│   └── config.example.env
├── frontend/
│   ├── js/
│   │   ├── config.js
│   │   ├── utils.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── app.js
│   │   ├── components/
│   │   │   ├── modal.js
│   │   │   ├── toast.js
│   │   │   └── loading.js
│   │   └── pages/
│   │       ├── dashboard.js
│   │       ├── upload.js
│   │       ├── summaries.js
│   │       ├── flashcards.js
│   │       └── settings.js
│   ├── styles/
│   │   ├── main.css
│   │   ├── components.css
│   │   └── animations.css
│   └── index.html
└── README.md
```

## Configuration

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

### Database Configuration
- Update database credentials in `.env`
- Ensure MySQL server is running
- Run `node init-db.js` to create tables

### File Upload Limits
- Default max file size: 10MB
- Supported file types: PDF, JPG, PNG, GIF, TXT
- Files are stored in `backend/uploads/` directory

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
- No build process required
- Edit files directly in `frontend/` directory
- Refresh browser to see changes

### Adding New Features
1. **Backend**: Add routes in `backend/routes/`
2. **Frontend**: Add pages in `frontend/js/pages/`
3. **API**: Update `frontend/js/api.js` for new endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL server is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **File Upload Fails**
   - Check file size limits
   - Verify file type is supported
   - Ensure `uploads/` directory exists and is writable

3. **OpenAI API Errors**
   - Verify API key is correct
   - Check API quota and billing
   - Ensure internet connection

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret in `.env`
   - Verify token expiration

### Logs
- Backend logs appear in terminal
- Frontend errors in browser console
- Check network tab for API errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions:
- Check the troubleshooting section
- Review the code comments
- Open an issue on GitHub

---

**Happy Studying! 📚✨**