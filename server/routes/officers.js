const express = require('express');
const User = require('../models/user');
const Officer = require('../models/officer');
const { auth, isAdmin, isOfficer } = require('../middleware/auth');

const router = express.Router();

// Register a new officer (public endpoint for our registration)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, officerId, pinCode } = req.body;
    
    // Validate input
    if (!name || !email || !password || !officerId || !pinCode) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if officer ID is already in use
    const existingOfficer = await Officer.findByOfficerId(officerId);
    if (existingOfficer) {
      return res.status(400).json({ message: 'Officer ID is already in use' });
    }
    
    // Create user with officer role
    const userId = await User.create({ 
      name, 
      email, 
      password, 
      role: 'officer' 
    });
    
    // Create officer profile - ensure pinCode is a string
    await Officer.create({ 
      userId,
      officerId,
      department: 'General', // Default department
      designation: 'Field Officer', // Default designation
      pinCodes: pinCode.toString(),
      availability: 'available' // Default availability 
    });
    
    res.status(201).json({ message: 'Officer registered successfully' });
  } catch (error) {
    console.error('Register officer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a new officer (admin only)
router.post('/admin/register', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, department, designation, pinCodes, officerId } = req.body;
    
    // Validate input
    if (!name || !email || !password || !department || !designation || !pinCodes || !officerId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if officer ID is already in use
    const existingOfficer = await Officer.findByOfficerId(officerId);
    if (existingOfficer) {
      return res.status(400).json({ message: 'Officer ID is already in use' });
    }
    
    // Create user with officer role
    const userId = await User.create({ name, email, password, phone, role: 'officer' });
    
    // Create officer profile - ensure proper formatting for pinCodes
    const formattedPinCodes = Array.isArray(pinCodes) 
      ? pinCodes.map(pin => pin.toString()).join(',') 
      : pinCodes.toString();
      
    await Officer.create({ 
      userId, 
      officerId,
      department, 
      designation, 
      pinCodes: formattedPinCodes
    });
    
    res.status(201).json({ message: 'Officer registered successfully' });
  } catch (error) {
    console.error('Register officer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get officer profile
router.get('/profile', auth, isOfficer, async (req, res) => {
  try {
    const officer = await Officer.findByUserId(req.user.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }
    
    res.json({ officer });
  } catch (error) {
    console.error('Get officer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update officer profile
router.put('/profile', auth, isOfficer, async (req, res) => {
  try {
    const { department, designation, pinCodes } = req.body;
    
    // Get officer ID
    const officer = await Officer.findByUserId(req.user.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }
    
    // Format pin codes consistently
    const formattedPinCodes = Array.isArray(pinCodes) 
      ? pinCodes.map(pin => pin.toString()).join(',') 
      : pinCodes.toString();
      
    // Update officer
    const updated = await Officer.update(officer.id, { 
      department, 
      designation, 
      pinCodes: formattedPinCodes
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update profile' });
    }
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update officer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update officer availability
router.put('/availability', auth, isOfficer, async (req, res) => {
  try {
    const { status, reason = '' } = req.body;
    
    // Validate status
    const validStatuses = ['available', 'busy', 'unavailable', 'on-leave'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid availability status' });
    }
    
    // Get officer ID
    const officer = await Officer.findByUserId(req.user.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }
    
    // Update availability
    const updated = await Officer.updateAvailability(officer.id, status);
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update availability' });
    }
    
    // Log availability change if reason provided
    if (reason) {
      const logEntry = {
        officerId: officer.id,
        oldStatus: officer.availability_status,
        newStatus: status,
        reason: reason,
        timestamp: new Date()
      };
      
      // This could be stored in a separate table if needed
      console.log('Availability change log:', logEntry);
    }
    
    res.json({ 
      message: 'Availability updated successfully',
      status,
      officer: {
        id: officer.id,
        name: officer.name,
        availability: status
      }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all officers
router.get('/', auth, async (req, res) => {
  try {
    const officers = await Officer.getAll();
    
    // Format pin codes
    const formattedOfficers = officers.map(officer => ({
      ...officer,
      pin_codes: officer.pin_codes.split(',')
    }));
    
    res.json({ officers: formattedOfficers });
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get officer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }
    
    // Format pin codes
    officer.pin_codes = officer.pin_codes.split(',');
    
    res.json({ officer });
  } catch (error) {
    console.error('Get officer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 