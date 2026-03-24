/**
 * Programmatic migration runner
 * Usage: npm run migrate
 *
 * This reads and executes the init.sql file against the configured database.
 * For production, consider using Sequelize CLI migrations.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    console.log('Reading migration file...');
    const sqlPath = path.join(__dirname, '../../migrations/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Running migration...');
    await connection.query(sql);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
