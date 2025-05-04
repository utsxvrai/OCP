const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Officer = require('../models/officer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, pinCode, aadhaarNumber } = req.body;
    
    // Validate input
    if (!name || !email || !password || !phone || !pinCode) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists with email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Check if user already exists with Aadhaar (if provided)
    if (aadhaarNumber) {
      // Validate Aadhaar format (12 digits)
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        return res.status(400).json({ message: 'Aadhaar number must be 12 digits' });
      }
      
      const existingAadhaarUser = await User.findByAadhaar(aadhaarNumber);
      if (existingAadhaarUser) {
        return res.status(400).json({ message: 'User already exists with this Aadhaar number' });
      }
    }
    
    try {
      // Create user
      const userId = await User.create({ 
        name, 
        email, 
        password, 
        phone, 
        role: 'citizen', 
        address, 
        pinCode, 
        aadhaarNumber 
      });
      
      // Create token
      const token = jwt.sign(
        { id: userId, name, email, role: 'citizen' },
        process.env.JWT_SECRET || 'ocp_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: userId, name, email, role: 'citizen', phone, address, pinCode, aadhaarNumber }
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      res.status(500).json({ message: 'Error creating user account', error: dbError.message });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, aadhaarNumber, password, role } = req.body;
    
    // Validate input - either email or Aadhaar is required
    if ((!email && !aadhaarNumber) || !password) {
      return res.status(400).json({ message: 'Please provide email/Aadhaar and password' });
    }
    
    // Find user by email or Aadhaar
    let user;
    if (email) {
      user = await User.findByEmail(email);
    } else if (aadhaarNumber) {
      user = await User.findByAadhaar(aadhaarNumber);
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if role matches if specified
    if (role && user.role !== role) {
      return res.status(400).json({ message: `Invalid credentials for ${role} login` });
    }
    
    // Verify password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // If officer, get officer details
    let tokenData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    let userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      aadhaarNumber: user.aadhaar_number,
      role: user.role
    };
    
    if (user.role === 'officer') {
      const officer = await Officer.findByUserId(user.id);
      if (officer) {
        // Add officer ID and PIN code to token data
        tokenData.officerId = officer.officer_id;
        userData.officerId = officer.officer_id;
        userData.pinCode = officer.pin_codes;
        userData.department = officer.department;
        userData.designation = officer.designation;
        userData.availabilityStatus = officer.availability_status;
      }
    }
    
    // Create token
    const token = jwt.sign(
      tokenData,
      process.env.JWT_SECRET || 'ocp_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      aadhaarNumber: user.aadhaar_number,
      phone: user.phone,
      role: user.role,
      address: user.address,
      pinCode: user.pin_code
    };
    
    // If officer, get additional details
    if (user.role === 'officer') {
      const officer = await Officer.findByUserId(user.id);
      if (officer) {
        userData.officerId = officer.officer_id;
        userData.pinCode = officer.pin_codes;
        userData.department = officer.department;
        userData.designation = officer.designation;
        userData.availabilityStatus = officer.availability_status;
        userData.complaintsPending = officer.complaints_pending;
        userData.complaintsSolved = officer.complaints_solved;
      }
    }
    
    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    // Find user
    const user = await User.findByEmail(req.user.email);
    
    // Verify current password
    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    await User.updatePassword(req.user.id, newPassword);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ocp_secret_key');
      
      // Token is valid, fetch up-to-date user data
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prepare token data
      let tokenData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      let userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      // If officer, add officer-specific data
      if (user.role === 'officer') {
        const officer = await Officer.findByUserId(user.id);
        if (officer) {
          tokenData.officerId = officer.officer_id;
          userData.officerId = officer.officer_id;
          userData.pinCode = officer.pin_codes;
          userData.department = officer.department;
          userData.designation = officer.designation;
          userData.availabilityStatus = officer.availability_status;
        }
      }
      
      // Generate new token
      const newToken = jwt.sign(
        tokenData,
        process.env.JWT_SECRET || 'ocp_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      res.json({
        message: 'Token refreshed successfully',
        token: newToken,
        user: userData
      });
    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 