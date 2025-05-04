-- Create users table
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
);

-- Create the admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin User', 
  'admin@ocp.com', 
  '$2b$10$KInIIgHC3WQcHOXiJvsL/e2mV5QbFhvWZv3pQ7e8Z/39BJnV8DI2W', 
  'admin'
) ON DUPLICATE KEY UPDATE email = email; 