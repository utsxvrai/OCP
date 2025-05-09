const pool = require('../config/database');

class Feedback {
  // Create new feedback
  static async create({ complaintId, citizenId, rating, comment = null }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO feedback (complaint_id, citizen_id, rating, comment) VALUES (?, ?, ?, ?)',
        [complaintId, citizenId, rating, comment]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByComplaintId(complaintId) {
    try {
      const [rows] = await pool.query(`
        SELECT f.*, u.name as citizen_name
        FROM feedback f
        JOIN users u ON f.citizen_id = u.id
        WHERE f.complaint_id = ?
      `, [complaintId]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Get average rating for officer
  static async getAverageRatingForOfficer(officerId) {
    try {
      const [rows] = await pool.query(`
        SELECT AVG(f.rating) as average_rating
        FROM feedback f
        JOIN complaints c ON f.complaint_id = c.id
        WHERE c.officer_id = ?
      `, [officerId]);
      
      return rows[0]?.average_rating || 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all feedback
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT f.*, u.name as citizen_name, c.complaint_id, c.title
        FROM feedback f
        JOIN users u ON f.citizen_id = u.id
        JOIN complaints c ON f.complaint_id = c.id
        ORDER BY f.created_at DESC
      `);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Feedback; 