const mysql = require('mysql2/promise');
require('dotenv').config();

// Simple SQL to create just the users table
const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('citizen', 'officer', 'admin') NOT NULL DEFAULT 'citizen',
  address TEXT,
  pin_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

// Admin user creation
const CREATE_ADMIN = `
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin User', 
  'admin@ocp.com', 
  '$2b$10$KInIIgHC3WQcHOXiJvsL/e2mV5QbFhvWZv3pQ7e8Z/39BJnV8DI2W', 
  'admin'
) ON DUPLICATE KEY UPDATE email = email`;

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
    
    // Create users table
    console.log('Creating users table...');
    await connection.query(CREATE_USERS_TABLE);
    
    // Create admin user
    console.log('Creating admin user...');
    await connection.query(CREATE_ADMIN);
    
    console.log('Database setup complete!');
    connection.end();
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup(); 