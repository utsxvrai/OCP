require('dotenv').config();
const mysql = require('mysql2/promise');

async function executeMigration() {
  console.log('Starting Aadhaar migration...');
  
  // Create MySQL connection
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'OCP'
  });

  try {
    console.log('Connected to database');
    
    // First check if the column already exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'aadhaar_number'
    `, [process.env.DB_NAME || 'OCP']);
    
    if (columns.length > 0) {
      console.log('Aadhaar column already exists. Migration not needed.');
      return;
    }
    
    // Execute the migration
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN aadhaar_number VARCHAR(12) DEFAULT NULL UNIQUE AFTER email
    `);
    
    console.log('Aadhaar column added successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close the connection
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the migration
executeMigration(); 