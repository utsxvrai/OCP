const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Register a new user
  static async create({ name, email, password, phone, role = 'citizen', address, pinCode, aadhaarNumber = null }) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await pool.query(
        'INSERT INTO users (name, email, aadhaar_number, password, phone, role, address, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, aadhaarNumber, hashedPassword, phone, role, address, pinCode]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by Aadhaar number
  static async findByAadhaar(aadhaarNumber) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE aadhaar_number = ?', [aadhaarNumber]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT id, name, email, aadhaar_number, phone, role, address, pin_code, created_at FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Update user
  static async update(id, { name, phone, aadhaarNumber }) {
    try {
      // Build the query dynamically based on which fields are provided
      let query = 'UPDATE users SET ';
      const params = [];
      
      if (name) {
        query += 'name = ?, ';
        params.push(name);
      }
      
      if (phone) {
        query += 'phone = ?, ';
        params.push(phone);
      }
      
      if (aadhaarNumber) {
        query += 'aadhaar_number = ?, ';
        params.push(aadhaarNumber);
      }
      
      // Remove trailing comma and space
      query = query.slice(0, -2);
      
      // Add WHERE clause
      query += ' WHERE id = ?';
      params.push(id);
      
      const [result] = await pool.query(query, params);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Update password
  static async updatePassword(id, password) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  // Get all users
  static async findAll() {
    try {
      return await pool.query(
        'SELECT id, name, email, aadhaar_number, phone, role, created_at FROM users ORDER BY created_at DESC'
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 