const pool = require('./database');

async function updateDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Update officers table to add availability fields
    try {
      await connection.query(`
        ALTER TABLE officers 
        ADD COLUMN IF NOT EXISTS officer_id VARCHAR(20) UNIQUE AFTER user_id,
        ADD COLUMN IF NOT EXISTS availability_status ENUM('available', 'busy', 'unavailable', 'on-leave') DEFAULT 'available' AFTER pin_codes,
        ADD COLUMN IF NOT EXISTS availability_reason TEXT AFTER availability_status,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER complaints_pending,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at
      `);
      console.log('Officers table updated successfully');
    } catch (err) {
      console.error('Error updating officers table:', err);
    }
    
    // Update complaints table to add processing status
    try {
      // First check if the ENUM already has 'processing'
      const [columns] = await connection.query(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'complaints' 
        AND COLUMN_NAME = 'status'
      `);
      
      if (columns.length > 0) {
        const enumValues = columns[0].COLUMN_TYPE;
        
        // If 'processing' is not already in the ENUM
        if (!enumValues.includes('processing')) {
          await connection.query(`
            ALTER TABLE complaints 
            MODIFY COLUMN status ENUM('pending', 'assigned', 'in-progress', 'processing', 'resolved', 'closed', 'reopened') DEFAULT 'pending'
          `);
          console.log('Complaints table status ENUM updated successfully');
        } else {
          console.log('Processing status already exists in complaints table');
        }
      }
    } catch (err) {
      console.error('Error updating complaints table:', err);
    }
    
    // Create complaint_queue table if it doesn't exist
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS complaint_queue (
          id INT AUTO_INCREMENT PRIMARY KEY,
          complaint_id INT NOT NULL,
          pin_code VARCHAR(6) NOT NULL,
          priority ENUM('high', 'normal', 'low') DEFAULT 'normal',
          status ENUM('queued', 'assigned', 'error') DEFAULT 'queued',
          officer_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          assigned_at TIMESTAMP NULL,
          FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
          FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE SET NULL,
          INDEX (pin_code),
          INDEX (status),
          INDEX (priority)
        )
      `);
      console.log('complaint_queue table created/updated successfully');
    } catch (err) {
      console.error('Error creating/updating complaint_queue table:', err);
    }
    
    connection.release();
    console.log('Database schema update completed');
  } catch (error) {
    console.error('Error updating database schema:', error);
  }
}

module.exports = { updateDatabase };

// If this file is run directly
if (require.main === module) {
  updateDatabase()
    .then(() => console.log('Schema update complete'))
    .catch(err => console.error('Schema update failed:', err))
    .finally(() => process.exit());
} 