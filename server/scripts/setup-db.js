const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection to MySQL server
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'complaint_portal';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database "${dbName}" created or already exists`);
    
    // Switch to the database
    await connection.query(`USE ${dbName}`);
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../migrations/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    for (const statement of statements) {
      await connection.query(statement);
    }
    
    console.log('Database schema created successfully');
    
    // Seed initial data if needed
    // ...
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupDatabase(); 