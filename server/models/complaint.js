const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Complaint {
  // Create new complaint
  static async create({ citizenId, title, description, pinCode, location, attachmentUrl = null }) {
    try {
      // Generate unique complaint ID
      const complaintId = `OCP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      const [result] = await pool.query(
        `INSERT INTO complaints 
         (complaint_id, citizen_id, title, description, pin_code, location, attachment_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [complaintId, citizenId, title, description, pinCode, location, attachmentUrl]
      );
      
      return { id: result.insertId, complaintId };
    } catch (error) {
      throw error;
    }
  }
  
  // Find complaint by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.name as citizen_name, u.email as citizen_email,
               o.id as officer_id,
               (SELECT name FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_name,
               (SELECT designation FROM officers WHERE id = c.officer_id) as officer_designation,
               (SELECT email FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_email,
               (SELECT phone FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_phone,
               (SELECT availability_status FROM officers WHERE id = c.officer_id) as officer_availability
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        LEFT JOIN officers o ON c.officer_id = o.id
        WHERE c.id = ?
      `, [id]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find complaint by unique complaint ID
  static async findByComplaintId(complaintId) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.name as citizen_name, u.email as citizen_email,
               o.id as officer_id,
               (SELECT name FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_name,
               (SELECT designation FROM officers WHERE id = c.officer_id) as officer_designation,
               (SELECT email FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_email,
               (SELECT phone FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_phone,
               (SELECT availability_status FROM officers WHERE id = c.officer_id) as officer_availability
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        LEFT JOIN officers o ON c.officer_id = o.id
        WHERE c.complaint_id = ?
      `, [complaintId]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Get complaints by citizen ID
  static async getByUserId(userId) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, 
               o.id as officer_id,
               (SELECT name FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_name,
               (SELECT designation FROM officers WHERE id = c.officer_id) as officer_designation,
               (SELECT email FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_email,
               (SELECT phone FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_phone,
               (SELECT availability_status FROM officers WHERE id = c.officer_id) as officer_availability
        FROM complaints c
        LEFT JOIN officers o ON c.officer_id = o.id
        WHERE c.citizen_id = ?
        ORDER BY c.created_at DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Get complaints by officer ID
  static async getByOfficerId(officerId) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.name as citizen_name, u.email as citizen_email
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        WHERE c.officer_id = ?
        ORDER BY c.created_at DESC
      `, [officerId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Assign complaint to officer
  static async assignToOfficer(id, officerId) {
    try {
      const [result] = await pool.query(
        'UPDATE complaints SET officer_id = ?, status = "assigned" WHERE id = ?',
        [officerId, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Update complaint status
  static async updateStatus(id, status) {
    try {
      const [result] = await pool.query(
        'UPDATE complaints SET status = ? WHERE id = ?',
        [status, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Add update to complaint
  static async addUpdate(complaintId, officerId, updateText) {
    try {
      const [result] = await pool.query(
        'INSERT INTO complaint_updates (complaint_id, officer_id, update_text) VALUES (?, ?, ?)',
        [complaintId, officerId, updateText]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // Get updates for a complaint
  static async getUpdates(complaintId) {
    try {
      const [rows] = await pool.query(`
        SELECT cu.*, u.name as officer_name
        FROM complaint_updates cu
        LEFT JOIN officers o ON cu.officer_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE cu.complaint_id = ?
        ORDER BY cu.created_at DESC
      `, [complaintId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all complaints
  static async getAll(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.name as citizen_name, o.id as officer_id, 
               (SELECT name FROM users WHERE id = o.user_id) as officer_name
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        LEFT JOIN officers o ON c.officer_id = o.id
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Get count of complaints by status
  static async getCountByStatus() {
    try {
      const [rows] = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM complaints
        GROUP BY status
      `);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Get complaints by PIN code
  static async getByPinCode(pinCode) {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, 
               u.name AS citizen_name, 
               o.officer_id,
               ou.name AS officer_name
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        LEFT JOIN officers o ON c.officer_id = o.id
        LEFT JOIN users ou ON o.user_id = ou.id
        WHERE c.pin_code = ?
        ORDER BY c.created_at DESC
      `, [pinCode]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Get complaint by ID with formatted attachment URL
  static async findByIdWithFullAttachment(id, baseUrl = 'http://localhost:5000') {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.name as citizen_name, u.email as citizen_email,
               o.id as officer_id,
               (SELECT name FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_name,
               (SELECT designation FROM officers WHERE id = c.officer_id) as officer_designation,
               (SELECT email FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_email,
               (SELECT phone FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_phone,
               (SELECT availability_status FROM officers WHERE id = c.officer_id) as officer_availability
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        LEFT JOIN officers o ON c.officer_id = o.id
        WHERE c.id = ?
      `, [id]);
      
      if (rows.length) {
        const complaint = rows[0];
        
        // Add full URL for attachment if exists
        if (complaint.attachment_url) {
          complaint.full_attachment_url = `${baseUrl}${complaint.attachment_url}`;
        }
        
        return complaint;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find complaint by unique complaint ID with formatted attachment URL
  static async findByComplaintIdWithFullAttachment(complaintId, baseUrl = 'http://localhost:5000') {
    try {
      const [rows] = await pool.query(`
        SELECT c.*, u.name as citizen_name, u.email as citizen_email,
               o.id as officer_id,
               (SELECT name FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_name,
               (SELECT designation FROM officers WHERE id = c.officer_id) as officer_designation,
               (SELECT email FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_email,
               (SELECT phone FROM users WHERE id = (SELECT user_id FROM officers WHERE id = c.officer_id)) as officer_phone,
               (SELECT availability_status FROM officers WHERE id = c.officer_id) as officer_availability
        FROM complaints c
        JOIN users u ON c.citizen_id = u.id
        LEFT JOIN officers o ON c.officer_id = o.id
        WHERE c.complaint_id = ?
      `, [complaintId]);
      
      if (rows.length) {
        const complaint = rows[0];
        
        // Add full URL for attachment if exists
        if (complaint.attachment_url) {
          complaint.full_attachment_url = `${baseUrl}${complaint.attachment_url}`;
        }
        
        return complaint;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Complaint; 