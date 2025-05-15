require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'ocp'
    });
    
    console.log('Connected to database successfully');
    
    // Check if users table exists
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
      if (tables.length === 0) {
        console.log('Creating users table...');
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(15),
            role ENUM('citizen', 'officer', 'admin') NOT NULL DEFAULT 'citizen',
            address TEXT,
            pin_code VARCHAR(10),
            aadhaar_number VARCHAR(12) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('Users table created successfully');
      } else {
        console.log('Users table already exists');
      }
    } catch (error) {
      console.error('Error checking/creating users table:', error.message);
      return;
    }
    
    // Create admin user with bcrypt hashed password
    const adminEmail = 'admin@ocp.com';
    const adminPassword = 'admin123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Check if admin already exists
    const [existingAdmin] = await connection.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (existingAdmin.length > 0) {
      // Update existing admin
      await connection.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, adminEmail]
      );
      console.log('Admin user updated successfully');
    } else {
      // Create new admin user
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('Admin user created successfully');
    }
    
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@ocp.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

createAdminUser().catch(console.error); 