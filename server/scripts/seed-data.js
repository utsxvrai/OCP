const pool = require('../config/database');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create admin user if not exists
    const adminEmail = 'admin@ocp.com';
    const adminPassword = 'admin123'; // This should be stronger in production
    
    const [adminExists] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (adminExists.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Insert admin user
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create sample PIN codes if needed for testing
    const pinCodes = ['110001', '110002', '110003', '110004', '110005'];
    console.log(`Sample PIN codes for testing: ${pinCodes.join(', ')}`);
    
    // Create sample officer accounts if needed
    const officerEmails = [
      'officer1@ocp.com',
      'officer2@ocp.com',
      'officer3@ocp.com'
    ];
    
    const officerPassword = 'officer123'; // This should be stronger in production
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(officerPassword, salt);
    
    for (let i = 0; i < officerEmails.length; i++) {
      const [officerExists] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [officerEmails[i]]
      );
      
      if (officerExists.length === 0) {
        // Insert officer user
        const [result] = await pool.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [`Officer ${i+1}`, officerEmails[i], hashedPassword, 'officer']
        );
        
        const userId = result.insertId;
        
        // Create officer profile
        await pool.query(
          'INSERT INTO officers (user_id, officer_id, department, designation, pin_codes) VALUES (?, ?, ?, ?, ?)',
          [
            userId,
            `221b${String(i+1).padStart(3, '0')}`,
            'General',
            'Field Officer',
            pinCodes[i % pinCodes.length]
          ]
        );
        
        console.log(`Officer ${i+1} created successfully`);
      } else {
        console.log(`Officer ${i+1} already exists`);
      }
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    // Close the pool connection
    await pool.end();
    console.log('Database connection closed');
  }
}

seedDatabase(); 