// userRoutes
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

// POST create user
router.post('/', (req, res) => {
  const { name, email, phone, region, status, salesforce_id } = req.body;
  db.query(
    'INSERT INTO users (name, email, phone, region, status, salesforce_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, region, status, salesforce_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, message: 'User created' });
    }
  );
});