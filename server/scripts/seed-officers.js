const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

console.log('Starting officer seeding script...');

// New Delhi PIN codes (15 PIN codes for 30 officers, 2 per PIN code)
const delhiPinCodes = [
  '110001', // Connaught Place
  '110002', // Darya Ganj
  '110003', // Aliganj
  '110004', // Karol Bagh
  '110005', // Babar Road
  '110006', // Delhi University North
  '110007', // Shastri Bhawan
  '110008', // Railway Colony
  '110009', // Civil Lines
  '110010', // Delhi Cantonment
  '110011', // Nirman Bhawan
  '110012', // Krishna Nagar
  '110013', // Laxmi Nagar
  '110014', // Naraina
  '110015'  // Kirti Nagar
];

console.log(`Using ${delhiPinCodes.length} PIN codes for New Delhi`);

// Generate officer ID (format: OFFICER-PIN-XX)
const generateOfficerId = (pincode, number) => {
  return `OFFICER-${pincode}-${number < 10 ? '0' + number : number}`;
};

// Function to create officer with user
const createOfficer = async (officerData, userData) => {
  try {
    console.log(`Creating officer ${userData.name} for pincode ${officerData.pincode}...`);
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      console.log('Transaction started');
      
      // Create user first
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      console.log(`Inserting user ${userData.email}...`);
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password, role, phone, pin_code, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [userData.name, userData.email, hashedPassword, 'officer', userData.phone, officerData.pincode]
      );
      
      const userId = userResult.insertId;
      console.log(`User created with ID: ${userId}`);
      
      // Then create officer linked to user
      console.log(`Inserting officer with ID ${officerData.officerId}...`);
      const [officerResult] = await connection.execute(
        'INSERT INTO officers (user_id, officer_id, department, designation, pin_codes, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [userId, officerData.officerId, officerData.department, officerData.designation, officerData.pincode]
      );
      
      await connection.commit();
      console.log(`Successfully created officer: ${userData.name} (${officerData.designation}) for pincode ${officerData.pincode}`);
      
      return { userId, officerId: officerResult.insertId };
    } catch (error) {
      console.error('Error in transaction:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`Error creating officer ${userData.name}:`, error);
    return null;
  }
};

// Seed 30 officers (2 for each PIN code)
const seedOfficers = async () => {
  try {
    console.log('Starting officer seeding process...');
    const connection = await pool.getConnection();
    
    try {
      // Check for existing officers
      console.log('Checking for existing officers...');
      const [checkResult] = await connection.execute('SELECT COUNT(*) as count FROM officers');
      console.log(`Found ${checkResult[0].count} existing officers`);
      
      // Clear existing officer data (except those linked to existing complaints)
      console.log('Identifying officers that can be safely deleted...');
      const [result] = await connection.execute('SELECT id FROM officers WHERE id NOT IN (SELECT DISTINCT officer_id FROM complaints WHERE officer_id IS NOT NULL)');
      
      if (result.length > 0) {
        const officerIds = result.map(row => row.id).join(',');
        console.log(`Deleting ${result.length} existing officers with IDs: ${officerIds}`);
        await connection.execute(`DELETE FROM officers WHERE id IN (${officerIds})`);
        console.log(`Deleted ${result.length} existing officers that weren't assigned to complaints`);
      } else {
        console.log('No eligible officers to delete');
      }
      
      const officers = [];
      const departments = ['Public Works', 'Water Supply', 'Electricity', 'Sanitation', 'Roads'];
      console.log(`Using departments: ${departments.join(', ')}`);
      
      // Create 2 officers for each pincode
      console.log('Creating officers for each PIN code...');
      for (const pincode of delhiPinCodes) {
        console.log(`Processing PIN code: ${pincode}`);
        
        // First officer - Senior designation
        const department1 = departments[Math.floor(Math.random() * departments.length)];
        const officerId1 = generateOfficerId(pincode, 1);
        console.log(`Creating first officer with ID ${officerId1} for department ${department1}`);
        const officer1 = await createOfficer(
          {
            officerId: officerId1,
            designation: 'Senior Officer',
            department: department1,
            pincode
          },
          {
            name: `Delhi Officer ${pincode}-1`,
            email: `officer${pincode}1@delhi.gov.in`,
            password: 'Password@123',
            phone: `98${Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 8)}`
          }
        );
        
        if (officer1) {
          officers.push(officer1);
          console.log(`First officer for ${pincode} created successfully`);
        }
        
        // Second officer - Junior designation
        const department2 = departments[Math.floor(Math.random() * departments.length)];
        const officerId2 = generateOfficerId(pincode, 2);
        console.log(`Creating second officer with ID ${officerId2} for department ${department2}`);
        const officer2 = await createOfficer(
          {
            officerId: officerId2,
            designation: 'Junior Officer',
            department: department2,
            pincode
          },
          {
            name: `Delhi Officer ${pincode}-2`,
            email: `officer${pincode}2@delhi.gov.in`,
            password: 'Password@123',
            phone: `98${Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 8)}`
          }
        );
        
        if (officer2) {
          officers.push(officer2);
          console.log(`Second officer for ${pincode} created successfully`);
        }
      }
      
      console.log(`Successfully created ${officers.length} officers for New Delhi`);
    } catch (error) {
      console.error('Error in seed operation:', error);
    } finally {
      connection.release();
      console.log('Connection released');
    }
  } catch (error) {
    console.error('Error getting database connection:', error);
  }
  
  console.log('Officer seeding complete!');
  process.exit(0);
};

// Run the seeding
console.log('Script execution starting...');
seedOfficers(); 