require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seedComplaints() {
  console.log('Starting to seed dummy complaints...');
  
  // Create MySQL connection
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'OCP'
  });

  try {
    console.log('Connected to database');
    
    // First check if we have a citizen user to assign complaints to
    const [users] = await pool.query('SELECT * FROM users WHERE role = "citizen" LIMIT 1');
    let citizenId;
    
    if (users.length === 0) {
      // Create a test citizen user if none exists
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, phone, role, address, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Test Citizen', 'citizen@example.com', hashedPassword, '9876543210', 'citizen', 'Test Address', '274401']
      );
      
      citizenId = result.insertId;
      console.log('Created test citizen user with ID:', citizenId);
    } else {
      citizenId = users[0].id;
      console.log('Using existing citizen with ID:', citizenId);
    }
    
    // Check if we have an officer for pin code 274401
    const [officers] = await pool.query(`
      SELECT o.* FROM officers o 
      JOIN users u ON o.user_id = u.id 
      WHERE o.pin_codes LIKE ?
    `, ['%274401%']);
    
    let officerId = null;
    if (officers.length > 0) {
      officerId = officers[0].id;
      console.log('Using existing officer with ID:', officerId);
    }
    
    // Define dummy complaints for different pincodes
    const complaints = [
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-001`,
        title: 'Road damage in sector 5',
        description: 'There is a large pothole that needs urgent attention. It has caused multiple accidents.',
        pin_code: '274401',
        location: 'Sector 5, Main Road',
        status: 'pending'
      },
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-002`,
        title: 'Broken street lights',
        description: 'The street lights in our area have not been working for over a week, causing safety concerns.',
        pin_code: '274401',
        location: 'Sector 7, Park Avenue',
        status: 'assigned',
        officer_id: officerId
      },
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-003`,
        title: 'Garbage not collected',
        description: 'Garbage has not been collected from our area for the past 3 days and is causing sanitation issues.',
        pin_code: '274401',
        location: 'Housing Colony, Block C',
        status: 'in-progress',
        officer_id: officerId
      },
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-004`,
        title: 'Water supply interruption',
        description: 'We have been facing water supply issues for the last week. Please resolve urgently.',
        pin_code: '110001',
        location: 'Delhi, Central Area',
        status: 'pending'
      },
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-005`,
        title: 'Electricity fluctuation',
        description: 'There have been frequent electricity fluctuations damaging our appliances.',
        pin_code: '400001',
        location: 'Mumbai, Marine Drive',
        status: 'pending'
      },
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-006`,
        title: 'Stray dog menace',
        description: 'There are aggressive stray dogs in our neighborhood threatening children and elderly.',
        pin_code: '274401',
        location: 'Green Park, Block D',
        status: 'pending'
      },
      {
        complaint_id: `OCP-${Date.now().toString().slice(-6)}-007`,
        title: 'Sewage overflow',
        description: 'The sewage system is overflowing on the main street causing health hazards.',
        pin_code: '274401',
        location: 'Main Market Area',
        status: 'pending'
      }
    ];
    
    // Insert complaints
    for (const complaint of complaints) {
      try {
        const values = [
          complaint.complaint_id,
          citizenId,
          complaint.officer_id || null,
          complaint.title,
          complaint.description,
          complaint.pin_code,
          complaint.location,
          complaint.status
        ];
        
        await pool.query(`
          INSERT INTO complaints 
          (complaint_id, citizen_id, officer_id, title, description, pin_code, location, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, values);
        
        console.log(`Added complaint: ${complaint.title} for PIN code ${complaint.pin_code}`);
      } catch (error) {
        console.error(`Failed to add complaint: ${complaint.title}`, error);
      }
    }
    
    console.log('Dummy complaints seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding complaints:', error);
  } finally {
    // Close the connection
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedComplaints(); 