const bcrypt = require('bcrypt');

console.log('Testing bcrypt...');

bcrypt.hash('password123', 10)
  .then(hash => {
    console.log('Hash created:', hash);
    return bcrypt.compare('password123', hash);
  })
  .then(result => {
    console.log('Password match:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Bcrypt error:', err);
    process.exit(1);
  });