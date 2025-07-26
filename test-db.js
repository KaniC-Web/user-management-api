const connection = require('./db');

connection.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) {
    console.error('Query failed:', err.message);
  } else {
    console.log('Query success! The solution is:', results[0].solution);
  }

  connection.end();
});
