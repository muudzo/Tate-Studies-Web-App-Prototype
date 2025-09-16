const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all notes for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search, tags } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, content, file_type, tags, processed, summary, created_at, updated_at 
      FROM notes 
      WHERE user_id = ?
    `;
    let queryParams = [userId];

    // Add search filter
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query += ' AND JSON_OVERLAPS(tags, ?)';
      queryParams.push(JSON.stringify(tagArray));
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [notes] = await pool.execute(query, queryParams);

    // Parse tags for each note
    const notesWithParsedTags = notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));

    res.json({ notes: notesWithParsedTags });
  } catch (error) {
    console.error('Notes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;

    const [notes] = await pool.execute(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = notes[0];
    note.tags = note.tags ? JSON.parse(note.tags) : [];

    res.json({ note });
  } catch (error) {
    console.error('Note fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update note
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;
    const { title, tags, summary } = req.body;

    // Check if note exists
    const [existingNotes] = await pool.execute(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (existingNotes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (tags !== undefined) {
      const parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(parsedTags));
    }

    if (summary !== undefined) {
      updateFields.push('summary = ?');
      updateValues.push(summary);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(noteId, userId);

    await pool.execute(
      `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Note update error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;

    // Get file path for cleanup
    const [notes] = await pool.execute(
      'SELECT file_path FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete from database (cascade will handle related flashcards)
    await pool.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);

    // Clean up file if it exists
    if (notes[0].file_path) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(notes[0].file_path);
      } catch (fileError) {
        console.error('File cleanup error:', fileError);
        // Continue even if file cleanup fails
      }
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Note deletion error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get note statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total notes count
    const [totalNotes] = await pool.execute(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?',
      [userId]
    );

    // Get notes by type
    const [notesByType] = await pool.execute(
      'SELECT file_type, COUNT(*) as count FROM notes WHERE user_id = ? GROUP BY file_type',
      [userId]
    );

    // Get processed vs unprocessed
    const [processedStats] = await pool.execute(
      'SELECT processed, COUNT(*) as count FROM notes WHERE user_id = ? GROUP BY processed',
      [userId]
    );

    // Get recent activity (last 7 days)
    const [recentActivity] = await pool.execute(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
      [userId]
    );

    res.json({
      total_notes: totalNotes[0].count,
      notes_by_type: notesByType.reduce((acc, item) => {
        acc[item.file_type] = item.count;
        return acc;
      }, {}),
      processed_stats: processedStats.reduce((acc, item) => {
        acc[item.processed ? 'processed' : 'unprocessed'] = item.count;
        return acc;
      }, {}),
      recent_activity: recentActivity[0].count
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
