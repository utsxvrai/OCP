const express = require('express');
const User = require('../models/user');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Update user
    const updated = await User.update(req.user.id, { name, phone });
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update profile' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    // This is a simple implementation for now - in a real app you would add pagination
    const [rows] = await User.findAll();
    
    res.json({ users: rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 