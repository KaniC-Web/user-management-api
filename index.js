// index.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/users');

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Root Ping
app.get('/', (req, res) => {
  res.send('User Management API is working!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
