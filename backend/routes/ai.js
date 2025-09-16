const express = require('express');
const OpenAI = require('openai');
const { pool } = require('../config/database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate summary for a note
router.post('/summarize/:noteId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.noteId;

    // Get note content
    const [notes] = await pool.execute(
      'SELECT content, title FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = notes[0];
    if (!note.content || note.content.trim().length === 0) {
      return res.status(400).json({ error: 'Note has no content to summarize' });
    }

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant. Create a concise, well-structured summary of the provided content. Focus on key concepts, main ideas, and important details. Use bullet points and clear headings to organize the information."
        },
        {
          role: "user",
          content: `Please summarize the following content from "${note.title}":\n\n${note.content}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const summary = completion.choices[0].message.content;

    // Update note with summary
    await pool.execute(
      'UPDATE notes SET summary = ? WHERE id = ? AND user_id = ?',
      [summary, noteId, userId]
    );

    // Award XP for AI usage
    const xpEarned = 5;
    await pool.execute(
      'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
      [xpEarned, userId]
    );

    res.json({
      message: 'Summary generated successfully',
      summary,
      xp_earned: xpEarned
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Generate flashcards from note content
router.post('/flashcards/:noteId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.noteId;
    const { count = 5 } = req.body;

    // Get note content
    const [notes] = await pool.execute(
      'SELECT content, title FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = notes[0];
    if (!note.content || note.content.trim().length === 0) {
      return res.status(400).json({ error: 'Note has no content to create flashcards from' });
    }

    // Generate flashcards using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful study assistant. Create ${count} high-quality flashcards from the provided content. Each flashcard should have a clear, concise question on the front and a detailed, accurate answer on the back. Focus on important concepts, definitions, and key information. Return the flashcards as a JSON array with "front" and "back" properties.`
        },
        {
          role: "user",
          content: `Create flashcards from the following content from "${note.title}":\n\n${note.content}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const responseText = completion.choices[0].message.content;
    
    // Parse JSON response
    let flashcards;
    try {
      flashcards = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse flashcards from AI response');
      }
    }

    // Validate flashcards structure
    if (!Array.isArray(flashcards)) {
      throw new Error('Invalid flashcards format');
    }

    // Save flashcards to database
    const savedFlashcards = [];
    for (const card of flashcards) {
      if (card.front && card.back) {
        const [result] = await pool.execute(
          'INSERT INTO flashcards (user_id, note_id, front, back) VALUES (?, ?, ?, ?)',
          [userId, noteId, card.front, card.back]
        );
        savedFlashcards.push({
          id: result.insertId,
          front: card.front,
          back: card.back
        });
      }
    }

    // Award XP for AI usage
    const xpEarned = savedFlashcards.length * 3;
    await pool.execute(
      'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
      [xpEarned, userId]
    );

    res.json({
      message: 'Flashcards generated successfully',
      flashcards: savedFlashcards,
      xp_earned: xpEarned
    });

  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Generate study questions
router.post('/questions/:noteId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.noteId;
    const { count = 5, difficulty = 'medium' } = req.body;

    // Get note content
    const [notes] = await pool.execute(
      'SELECT content, title FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = notes[0];
    if (!note.content || note.content.trim().length === 0) {
      return res.status(400).json({ error: 'Note has no content to create questions from' });
    }

    // Generate study questions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful study assistant. Create ${count} study questions of ${difficulty} difficulty from the provided content. Questions should test understanding, application, and analysis of the material. Return the questions as a JSON array with "question", "answer", and "explanation" properties.`
        },
        {
          role: "user",
          content: `Create study questions from the following content from "${note.title}":\n\n${note.content}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.4
    });

    const responseText = completion.choices[0].message.content;
    
    // Parse JSON response
    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse questions from AI response');
      }
    }

    // Award XP for AI usage
    const xpEarned = questions.length * 2;
    await pool.execute(
      'UPDATE users SET xp_points = xp_points + ? WHERE id = ?',
      [xpEarned, userId]
    );

    res.json({
      message: 'Study questions generated successfully',
      questions,
      xp_earned: xpEarned
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate study questions' });
  }
});

// Chat with AI about notes
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, noteId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let contextContent = '';
    if (noteId) {
      // Get note content for context
      const [notes] = await pool.execute(
        'SELECT content, title FROM notes WHERE id = ? AND user_id = ?',
        [noteId, userId]
      );
      
      if (notes.length > 0) {
        contextContent = `\n\nContext from note "${notes[0].title}":\n${notes[0].content}`;
      }
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant. Answer questions about the provided content and help with studying. Be concise but thorough in your explanations."
        },
        {
          role: "user",
          content: message + contextContent
        }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    const response = completion.choices[0].message.content;

    res.json({
      message: 'AI response generated successfully',
      response
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

module.exports = router;
