const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const { pool } = require('../config/database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Extract text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Extract text from image using OCR
const extractTextFromImage = async (filePath) => {
  try {
    // Optimize image for OCR
    const optimizedPath = filePath.replace(path.extname(filePath), '_optimized.png');
    await sharp(filePath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toFile(optimizedPath);

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(optimizedPath, 'eng', {
      logger: m => console.log(m)
    });

    // Clean up optimized image
    await fs.unlink(optimizedPath).catch(console.error);

    return text.trim();
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Extract text from text file
const extractTextFromTextFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('Text file reading error:', error);
    throw new Error('Failed to read text file');
  }
};

// Upload and process file
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const { title, tags } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileType = req.file.mimetype;

    // Determine file type for database
    let dbFileType;
    if (fileType === 'application/pdf') {
      dbFileType = 'pdf';
    } else if (fileType.startsWith('image/')) {
      dbFileType = 'image';
    } else if (fileType === 'text/plain') {
      dbFileType = 'text';
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Extract text content
    let content = '';
    try {
      if (dbFileType === 'pdf') {
        content = await extractTextFromPDF(filePath);
      } else if (dbFileType === 'image') {
        content = await extractTextFromImage(filePath);
      } else if (dbFileType === 'text') {
        content = await extractTextFromTextFile(filePath);
      }
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      // Continue with empty content rather than failing completely
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    // Save to database
    const [result] = await pool.execute(
      `INSERT INTO notes (user_id, title, content, file_path, file_type, tags, processed) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title || originalName,
        content,
        filePath,
        dbFileType,
        JSON.stringify(parsedTags),
        content.length > 0
      ]
    );

    // Award XP for upload
    const xpEarned = 10;
    await pool.execute(
      'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
      [xpEarned, userId]
    );

    // Log study session
    await pool.execute(
      'INSERT INTO study_sessions (user_id, session_type, xp_earned) VALUES (?, ?, ?)',
      [userId, 'upload', xpEarned]
    );

    res.json({
      message: 'File uploaded and processed successfully',
      note: {
        id: result.insertId,
        title: title || originalName,
        file_type: dbFileType,
        tags: parsedTags,
        processed: content.length > 0,
        xp_earned: xpEarned
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get upload history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [notes] = await pool.execute(
      `SELECT id, title, file_type, tags, processed, created_at 
       FROM notes 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    // Parse tags for each note
    const notesWithParsedTags = notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));

    res.json({ notes: notesWithParsedTags });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch upload history' });
  }
});

// Delete uploaded file
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;

    // Get file path
    const [notes] = await pool.execute(
      'SELECT file_path FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const filePath = notes[0].file_path;

    // Delete from database
    await pool.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);

    // Delete physical file
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('File deletion error:', fileError);
      // Continue even if file deletion fails
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
