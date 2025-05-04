const pool = require('./database');

async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create tables
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('citizen', 'officer', 'admin') DEFAULT 'citizen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Officers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS officers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        officer_id VARCHAR(20) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        pin_codes TEXT NOT NULL,
        availability_status ENUM('available', 'busy', 'unavailable', 'on-leave') DEFAULT 'available',
        availability_reason TEXT,
        complaints_solved INT DEFAULT 0,
        complaints_pending INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Complaints table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id VARCHAR(20) NOT NULL UNIQUE,
        citizen_id INT NOT NULL,
        officer_id INT,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        pin_code VARCHAR(10) NOT NULL,
        location VARCHAR(255) NOT NULL,
        attachment_url VARCHAR(255),
        status ENUM('pending', 'assigned', 'in-progress', 'processing', 'resolved', 'closed', 'reopened') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE SET NULL
      )
    `);
    
    // Complaint updates table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS complaint_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id INT NOT NULL,
        officer_id INT,
        update_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
        FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE SET NULL
      )
    `);
    
    // Feedback table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id INT NOT NULL,
        citizen_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
        FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables created successfully');
    connection.release();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { initDatabase }; 