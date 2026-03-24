const dotenv = require('dotenv');
const path = require('path');

console.log('Current working directory:', process.cwd());

// Test default load
dotenv.config();
console.log('Default load (root/.env):', process.env.DB_PASS ? '********' : '(not set)');

// Test server load
dotenv.config({ path: path.resolve(__dirname, 'server', '.env') });
console.log('Server load (server/.env):', process.env.DB_PASS ? '********' : '(not set)');
