const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://rice_user:rice_password_2024@localhost:5433/rice_db",
  ssl: false
});

console.log('Testing database connection...');

pool.query('SELECT COUNT(*) FROM users')
  .then(result => {
    console.log('Database connection successful!');
    console.log('User count:', result.rows[0].count);
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });