const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get flashcards for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, difficulty, note_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT f.*, n.title as note_title 
      FROM flashcards f 
      LEFT JOIN notes n ON f.note_id = n.id 
      WHERE f.user_id = ?
    `;
    let queryParams = [userId];

    // Add filters
    if (difficulty) {
      query += ' AND f.difficulty = ?';
      queryParams.push(difficulty);
    }

    if (note_id) {
      query += ' AND f.note_id = ?';
      queryParams.push(note_id);
    }

    query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [flashcards] = await pool.execute(query, queryParams);

    res.json({ flashcards });
  } catch (error) {
    console.error('Flashcards fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get flashcards for study session
router.get('/study', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, difficulty } = req.query;

    let query = `
      SELECT f.*, n.title as note_title 
      FROM flashcards f 
      LEFT JOIN notes n ON f.note_id = n.id 
      WHERE f.user_id = ?
    `;
    let queryParams = [userId];

    // Filter by difficulty if specified
    if (difficulty) {
      query += ' AND f.difficulty = ?';
      queryParams.push(difficulty);
    }

    // Prioritize cards that need review
    query += ` ORDER BY 
      CASE 
        WHEN f.next_review IS NULL THEN 1
        WHEN f.next_review <= NOW() THEN 2
        ELSE 3
      END,
      f.created_at ASC
      LIMIT ?`;
    queryParams.push(parseInt(limit));

    const [flashcards] = await pool.execute(query, queryParams);

    res.json({ flashcards });
  } catch (error) {
    console.error('Study flashcards fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch study flashcards' });
  }
});

// Create new flashcard
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { front, back, note_id, difficulty = 'medium' } = req.body;

    if (!front || !back) {
      return res.status(400).json({ error: 'Front and back content are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO flashcards (user_id, note_id, front, back, difficulty) VALUES (?, ?, ?, ?, ?)',
      [userId, note_id || null, front, back, difficulty]
    );

    res.status(201).json({
      message: 'Flashcard created successfully',
      flashcard: {
        id: result.insertId,
        front,
        back,
        difficulty,
        note_id
      }
    });
  } catch (error) {
    console.error('Flashcard creation error:', error);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// Update flashcard
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcardId = req.params.id;
    const { front, back, difficulty } = req.body;

    // Check if flashcard exists
    const [existingCards] = await pool.execute(
      'SELECT id FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, userId]
    );

    if (existingCards.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (front !== undefined) {
      updateFields.push('front = ?');
      updateValues.push(front);
    }

    if (back !== undefined) {
      updateFields.push('back = ?');
      updateValues.push(back);
    }

    if (difficulty !== undefined) {
      updateFields.push('difficulty = ?');
      updateValues.push(difficulty);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(flashcardId, userId);

    await pool.execute(
      `UPDATE flashcards SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    res.json({ message: 'Flashcard updated successfully' });
  } catch (error) {
    console.error('Flashcard update error:', error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Submit flashcard review
router.post('/:id/review', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcardId = req.params.id;
    const { correct, difficulty } = req.body;

    if (typeof correct !== 'boolean') {
      return res.status(400).json({ error: 'Correct field must be boolean' });
    }

    // Get current flashcard data
    const [cards] = await pool.execute(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, userId]
    );

    if (cards.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const card = cards[0];
    const newReviewCount = card.review_count + 1;
    const newCorrectCount = card.correct_count + (correct ? 1 : 0);

    // Calculate next review date using spaced repetition
    let nextReviewDate = new Date();
    const daysToAdd = correct ? 
      Math.min(Math.pow(2, Math.floor(newCorrectCount / 3)), 30) : 1;
    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

    // Update flashcard
    await pool.execute(
      `UPDATE flashcards 
       SET review_count = ?, correct_count = ?, last_reviewed = NOW(), next_review = ?
       WHERE id = ? AND user_id = ?`,
      [newReviewCount, newCorrectCount, nextReviewDate, flashcardId, userId]
    );

    // Award XP based on performance
    const xpEarned = correct ? 2 : 1;
    await pool.execute(
      'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
      [xpEarned, userId]
    );

    // Log study session
    await pool.execute(
      'INSERT INTO study_sessions (user_id, session_type, xp_earned) VALUES (?, ?, ?)',
      [userId, 'flashcard', xpEarned]
    );

    res.json({
      message: 'Review submitted successfully',
      xp_earned: xpEarned,
      next_review: nextReviewDate
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Delete flashcard
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcardId = req.params.id;

    const [result] = await pool.execute(
      'DELETE FROM flashcards WHERE id = ? AND user_id = ?',
      [flashcardId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Flashcard deletion error:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

// Get flashcard statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total flashcards count
    const [totalCards] = await pool.execute(
      'SELECT COUNT(*) as count FROM flashcards WHERE user_id = ?',
      [userId]
    );

    // Get cards by difficulty
    const [cardsByDifficulty] = await pool.execute(
      'SELECT difficulty, COUNT(*) as count FROM flashcards WHERE user_id = ? GROUP BY difficulty',
      [userId]
    );

    // Get cards due for review
    const [cardsDue] = await pool.execute(
      'SELECT COUNT(*) as count FROM flashcards WHERE user_id = ? AND (next_review IS NULL OR next_review <= NOW())',
      [userId]
    );

    // Get study streak (consecutive days with flashcard reviews)
    const [studyStreak] = await pool.execute(
      `SELECT COUNT(DISTINCT DATE(last_reviewed)) as streak 
       FROM flashcards 
       WHERE user_id = ? AND last_reviewed >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY last_reviewed DESC`,
      [userId]
    );

    res.json({
      total_flashcards: totalCards[0].count,
      cards_by_difficulty: cardsByDifficulty.reduce((acc, item) => {
        acc[item.difficulty] = item.count;
        return acc;
      }, {}),
      cards_due_for_review: cardsDue[0].count,
      study_streak: studyStreak[0].streak || 0
    });
  } catch (error) {
    console.error('Flashcard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard statistics' });
  }
});

module.exports = router;
