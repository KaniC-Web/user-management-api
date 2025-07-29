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

// PUT update user
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, region, status, salesforce_id } = req.body;
  db.query(
    'UPDATE users SET name=?, email=?, phone=?, region=?, status=?, salesforce_id=? WHERE id=?',
    [name, email, phone, region, status, salesforce_id, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User updated' });
    }
  );
});

// DELETE user
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
});

// Webhook Endpoint: Receives data from Salesforce
router.post('/webhook', (req, res) => {
  const { name, email, phone, region, status, salesforce_id } = req.body;

 // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

// Simple cleaning logic (trimming whitespace, lowercase email)
const cleanedName = name.trim();
 const cleanedEmail = email.trim().toLowerCase();
 const cleanedPhone = phone ? phone.trim() : null;
 const cleanedRegion = region ? region.trim() : null;
 const cleanedStatus = status ? status.trim().toLowerCase() : 'active'; //added default status value as active
 const cleanedSFID = salesforce_id ? salesforce_id.trim() : null;

  // Insert into MySQL
  db.query(
    'INSERT INTO users (name, email, phone, region, status, salesforce_id) VALUES (?, ?, ?, ?, ?, ?)',
    [cleanedName, cleanedEmail, cleanedPhone, cleanedRegion, cleanedStatus, cleanedSFID],
    (err, result) => {
      if (err) {
        console.error('DB insert error:', err.message);
        return res.status(500).json({ error: 'Failed to insert data' });
      }

module.exports = router;