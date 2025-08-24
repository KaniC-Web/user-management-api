// userRoutes
const express = require('express');
const router = express.Router();
const db = require('../db');

// Utility function:  email validator
function isValidEmail(email) {
  if (!email || email.length > 254) return false;
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  const parts = email.split("@");
  if (parts[0].length > 64) return false;

  const domainParts = parts[1].split(".");
  if (domainParts.some(part => part.length > 63)) return false;

  return true;
}

function isValidPhone(phone) {
  const regex = /^[0-9]{7,15}$/; // only digits, length 7–15
  return regex.test(phone);
}

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

 // Basic field cleaning validation
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

 // Validation rules
  let rejectionReason = null;
  if (!cleanedName || !cleanedEmail) {
    rejectionReason = 'Name and Email are required';
  } else if (!isValidEmail(cleanedEmail)) {
    rejectionReason = 'Invalid email format';
  } else if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    rejectionReason = 'Invalid phone format';
  }

  if (rejectionReason){
     // Save to rejected_users table
      db.query(
      'INSERT INTO rejected_users (name, email, phone, region, status, salesforce_id, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cleanedName, cleanedEmail, cleanedPhone, cleanedRegion, cleanedStatus, cleanedSFID, rejectionReason],
      (err, result) => {
        if (err) {
          console.error('DB insert error (rejected):', err.message);
          return res.status(500).json({ error: 'Failed to insert rejected data' });
        }
        // Insert log for rejection
         db.query(
          'INSERT INTO logs (rejected_id, action_type, message) VALUES (?, ?, ?)',
          [result.insertId, 'validation_fail', `Rejected: ${rejectionReason}`],
          (logErr) => {
            if (logErr) console.error('Log insert error:', logErr.message);
          }
        );
         console.log('Rejected data logged:', { name: cleanedName, email: cleanedEmail, reason: rejectionReason });
        return res.status(400).json({ error: rejectionReason });
      }
      );
  }else {
    // UPSERT logic: if salesforce_id exists, update; else insert new
    db.query(
      `INSERT INTO users (name, email, phone, region, status, salesforce_id)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name),
         phone=VALUES(phone),
         region=VALUES(region),
         status=VALUES(status),
         salesforce_id = VALUES(salesforce_id)`,
      [cleanedName, cleanedEmail, cleanedPhone, cleanedRegion, cleanedStatus, cleanedSFID],
      (err, result) => {
        if (err) {
          console.error('DB insert error (users):', err.message);
          return res.status(500).json({ error: 'Failed to insert user data' });
        }
           // Insert log for successful validation
        db.query(
          'INSERT INTO logs (user_id, action_type, message) VALUES (?, ?, ?)',
          [result.insertId, 'validation_pass', 'Record validated and inserted/updated'],
          (logErr) => {
            if (logErr) console.error('Log insert error:', logErr.message);
          }
        );
        console.log('Cleaned data inserted from Salesforce webhook:', {
          id: result.insertId,
          name: cleanedName,
          email: cleanedEmail,
        });
res.status(201).json({
          message: 'Salesforce data cleaned and inserted',
          id: result.insertId,
        });
    }
 );
 }
});

// NEW: Stale data detection endpoint
router.get('/stale/:months', (req, res) => {
  const months = parseInt(req.params.months, 10) || 6; // default 6 months
  db.query(
    `SELECT * FROM users 
     WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? MONTH)`,
    [months],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ stale_after_months: months, records: results });
    }
  );
});

module.exports = router;