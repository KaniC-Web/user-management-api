// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.send('User Management API is working!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
