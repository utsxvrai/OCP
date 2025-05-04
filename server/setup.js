const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  console.log('Setting up database...');
  
  try {
    // Create connection to MySQL without database selection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    // Create database if it doesn't exist
    console.log('Creating database if it doesn\'t exist...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'complaint_portal'}`);
    
    // Switch to the database
    console.log('Switching to database...');
    await connection.query(`USE ${process.env.DB_NAME || 'complaint_portal'}`);
    
    // Read and execute schema.sql
    console.log('Applying base schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'migrations', 'schema.sql'), 'utf8');
    await connection.query(schemaSQL);
    
    // Read and execute update_users_table.sql
    console.log('Applying user table updates...');
    const updateUsersSQL = fs.readFileSync(path.join(__dirname, 'migrations', 'update_users_table.sql'), 'utf8');
    await connection.query(updateUsersSQL);
    
    console.log('Database setup complete!');
    connection.end();
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup(); 