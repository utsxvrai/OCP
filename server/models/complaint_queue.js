const pool = require('../config/database');

class ComplaintQueue {
  // Add complaint to queue
  static async addToQueue(complaintId, pinCode, priority = 'normal') {
    try {
      const [result] = await pool.query(
        `INSERT INTO complaint_queue 
         (complaint_id, pin_code, priority, status) 
         VALUES (?, ?, ?, 'queued')`,
        [complaintId, pinCode, priority]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // Get next complaint in queue for a specific PIN code
  static async getNextComplaint(pinCode) {
    try {
      const [rows] = await pool.query(`
        SELECT cq.*, c.title, c.created_at as complaint_date
        FROM complaint_queue cq
        JOIN complaints c ON cq.complaint_id = c.id
        WHERE cq.pin_code = ? AND cq.status = 'queued'
        ORDER BY 
          CASE 
            WHEN cq.priority = 'high' THEN 1
            WHEN cq.priority = 'normal' THEN 2
            WHEN cq.priority = 'low' THEN 3
          END,
          cq.created_at ASC
        LIMIT 1
      `, [pinCode]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all queued complaints for a specific PIN code
  static async getQueuedComplaintsByPinCode(pinCode) {
    try {
      const [rows] = await pool.query(`
        SELECT cq.*, c.title, c.created_at as complaint_date
        FROM complaint_queue cq
        JOIN complaints c ON cq.complaint_id = c.id
        WHERE cq.pin_code = ? AND cq.status = 'queued'
        ORDER BY 
          CASE 
            WHEN cq.priority = 'high' THEN 1
            WHEN cq.priority = 'normal' THEN 2
            WHEN cq.priority = 'low' THEN 3
          END,
          cq.created_at ASC
      `, [pinCode]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Mark complaint as assigned
  static async markAsAssigned(queueId, officerId) {
    try {
      const [result] = await pool.query(
        `UPDATE complaint_queue 
         SET status = 'assigned', officer_id = ?, assigned_at = NOW() 
         WHERE id = ?`,
        [officerId, queueId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Check if a complaint is already in queue
  static async isInQueue(complaintId) {
    try {
      const [rows] = await pool.query(
        'SELECT id FROM complaint_queue WHERE complaint_id = ? AND status = "queued"',
        [complaintId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Get queue statistics
  static async getQueueStats() {
    try {
      const [rows] = await pool.query(`
        SELECT pin_code, COUNT(*) as count, 
               MAX(created_at) as latest_entry, 
               MIN(created_at) as oldest_entry
        FROM complaint_queue
        WHERE status = 'queued'
        GROUP BY pin_code
      `);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ComplaintQueue; 