const pool = require('../config/database');

class Officer {
  // Create new officer profile
  static async create({ userId, department, designation, pinCodes, officerId, availability = 'available' }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO officers (user_id, department, designation, pin_codes, officer_id, availability_status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, department, designation, pinCodes, officerId, availability]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // Find officer by user ID
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.query('SELECT * FROM officers WHERE user_id = ?', [userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find officer by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name, u.email, u.phone
        FROM officers o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [id]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find officer by officer ID
  static async findByOfficerId(officerId) {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name, u.email, u.phone
        FROM officers o
        JOIN users u ON o.user_id = u.id
        WHERE o.officer_id = ?
      `, [officerId]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Update officer
  static async update(id, { department, designation, pinCodes, availability }) {
    try {
      const updateFields = [];
      const values = [];
      
      if (department) {
        updateFields.push('department = ?');
        values.push(department);
      }
      
      if (designation) {
        updateFields.push('designation = ?');
        values.push(designation);
      }
      
      if (pinCodes) {
        updateFields.push('pin_codes = ?');
        values.push(pinCodes);
      }
      
      if (availability) {
        updateFields.push('availability_status = ?');
        values.push(availability);
      }
      
      // Add id as the last value
      values.push(id);
      
      const [result] = await pool.query(
        `UPDATE officers SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Update officer availability
  static async updateAvailability(id, status, reason = null) {
    try {
      let query = 'UPDATE officers SET availability_status = ?';
      const values = [status];
      
      if (reason) {
        query += ', availability_reason = ?';
        values.push(reason);
      }
      
      query += ', updated_at = NOW() WHERE id = ?';
      values.push(id);
      
      const [result] = await pool.query(query, values);
      
      // If the officer becomes unavailable, we might want to reassign their pending complaints
      if (status === 'unavailable' || status === 'on-leave') {
        // This could trigger a notification to admins or auto-reassignment
        console.log(`Officer ${id} is now ${status}. Pending complaints may need reassignment.`);
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Find officers by pin code
  static async findByPinCode(pinCode) {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name, u.email, u.phone
        FROM officers o
        JOIN users u ON o.user_id = u.id
        WHERE o.pin_codes = ? 
              OR o.pin_codes LIKE ? 
              OR o.pin_codes LIKE ? 
              OR o.pin_codes LIKE ?
      `, [
        pinCode,                // exact match
        `${pinCode},%`,         // starts with pinCode
        `%,${pinCode},%`,       // contains pinCode in the middle
        `%,${pinCode}`          // ends with pinCode
      ]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Update complaint counts
  static async updateComplaintCount(id, { solved = 0, pending = 0 }) {
    try {
      const [result] = await pool.query(`
        UPDATE officers
        SET complaints_solved = complaints_solved + ?,
            complaints_pending = complaints_pending + ?
        WHERE id = ?
      `, [solved, pending, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all officers
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name, u.email, u.phone
        FROM officers o
        JOIN users u ON o.user_id = u.id
      `);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Find officer with least pending complaints for a pin code
  static async findLeastBusyOfficerForPinCode(pinCode) {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, u.name, u.email, u.phone
        FROM officers o
        JOIN users u ON o.user_id = u.id
        WHERE (o.pin_codes = ? 
              OR o.pin_codes LIKE ? 
              OR o.pin_codes LIKE ? 
              OR o.pin_codes LIKE ?) 
              AND o.availability_status = 'available'
        ORDER BY o.complaints_pending ASC
        LIMIT 1
      `, [
        pinCode,                // exact match
        `${pinCode},%`,         // starts with pinCode
        `%,${pinCode},%`,       // contains pinCode in the middle
        `%,${pinCode}`          // ends with pinCode
      ]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Officer; 