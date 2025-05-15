const express = require('express');
const Complaint = require('../models/complaint');
const Officer = require('../models/officer');
const Feedback = require('../models/feedback');
const ComplaintQueue = require('../models/complaint_queue');
const ComplaintAssigner = require('../services/complaintAssigner');
const { auth, isOfficer } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Submit a new complaint
router.post('/', auth, upload.single('attachment'), handleMulterError, async (req, res) => {
  try {
    const { title, description, pinCode, location } = req.body;
    const citizenId = req.user.id;
    
    // Validate input
    if (!title || !description || !pinCode || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Validate PIN code
    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({ message: 'Please provide a valid 6-digit PIN code' });
    }
    
    // Ensure pinCode is a string
    const pinCodeString = pinCode.toString();
    
    // Get file path if attachment was uploaded
    let attachmentUrl = null;
    if (req.file) {
      // Format the URL with date folder structure
      const today = new Date().toISOString().slice(0, 10);
      attachmentUrl = `/uploads/${today}/${req.file.filename}`;
    }
    
    // Create complaint
    const { id, complaintId } = await Complaint.create({
      citizenId,
      title,
      description,
      pinCode: pinCodeString,
      location,
      attachmentUrl
    });
    
    // Try to assign complaint using the new service
    const assignmentResult = await ComplaintAssigner.tryAssignComplaint(id, pinCodeString);
    
    // If assignment was successful, we have officer details
    const status = assignmentResult ? 'assigned' : 'pending';
    const assignmentInfo = assignmentResult ? {
      officerName: assignmentResult.officerName,
      officerDesignation: assignmentResult.officerDesignation,
      officerEmail: assignmentResult.officerEmail,
      officerPhone: assignmentResult.officerPhone
    } : { message: 'Complaint queued for assignment. An officer will be assigned soon.' };
    
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaintId,
      status,
      attachmentUrl,
      assignment: assignmentInfo
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaints for the logged-in user
router.get('/my-complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.getByUserId(req.user.id);
    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned complaints for the officer
router.get('/assigned', auth, isOfficer, async (req, res) => {
  try {
    // Get officer ID
    const officer = await Officer.findByUserId(req.user.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }
    
    const complaints = await Complaint.getByOfficerId(officer.id);
    res.json({ complaints });
  } catch (error) {
    console.error('Get assigned complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Get base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // If user is an officer, get the officer ID
    if (req.user.role === 'officer') {
      const officer = await Officer.findByUserId(req.user.id);
      
      if (officer) {
        // Add officer ID to request user object for authorization check
        req.user.officerId = officer.id;
      } else {
        console.log(`Warning: User ${req.user.id} has officer role but no officer profile found`);
      }
    }
    
    // Use the new method to get complaint with full attachment URL
    const complaint = await Complaint.findByIdWithFullAttachment(req.params.id, baseUrl);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user is authorized to view the complaint
    // Privacy enhancement: Allow access only if user is the complainant, the assigned officer, or an admin
    const isAuthorized = 
      complaint.citizen_id === req.user.id || 
      (req.user.role === 'officer' && complaint.officer_id == req.user.officerId) || 
      req.user.role === 'admin';
      
    if (!isAuthorized) {
      return res.status(403).json({ 
        message: 'Not authorized to view this complaint. For privacy reasons, officers can only access complaints assigned to them.' 
      });
    }
    
    // Get complaint updates
    const updates = await Complaint.getUpdates(req.params.id);
    
    // Get feedback if available
    const feedback = await Feedback.findByComplaintId(req.params.id);
    
    res.json({ complaint, updates, feedback });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete complaint (citizen or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get complaint
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check authorization: only the citizen who created it or an admin can delete
    if (complaint.citizen_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }
    
    // Check if complaint can be deleted (only pending, assigned or if admin)
    const canDelete = req.user.role === 'admin' || 
      ['pending', 'assigned'].includes(complaint.status);
      
    if (!canDelete) {
      return res.status(400).json({ 
        message: 'Cannot delete a complaint that is already in progress or resolved. Please contact the administrator.' 
      });
    }
    
    // Delete the complaint
    await Complaint.delete(req.params.id);
    
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint by complaint ID
router.get('/track/:complaintId', async (req, res) => {
  try {
    // Get base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Use the new method to get complaint with full attachment URL
    const complaint = await Complaint.findByComplaintIdWithFullAttachment(req.params.complaintId, baseUrl);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Get complaint updates
    const updates = await Complaint.getUpdates(complaint.id);
    
    // Prepare officer details if assigned
    const officerDetails = complaint.officer_id ? {
      name: complaint.officer_name,
      designation: complaint.officer_designation,
      email: complaint.officer_email,
      phone: complaint.officer_phone,
      availability: complaint.officer_availability
    } : null;
    
    res.json({
      complaintId: complaint.complaint_id,
      title: complaint.title,
      status: complaint.status,
      createdAt: complaint.created_at,
      updatedAt: complaint.updated_at,
      location: complaint.location,
      pinCode: complaint.pin_code,
      attachmentUrl: complaint.full_attachment_url,
      assignedOfficer: officerDetails,
      updates
    });
  } catch (error) {
    console.error('Track complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status (officer only)
router.put('/:id/status', auth, isOfficer, async (req, res) => {
  try {
    const { status, statusDetails } = req.body;
    
    // Validate status
    const validStatuses = ['assigned', 'in-progress', 'processing', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Get complaint
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Get officer ID
    const officer = await Officer.findByUserId(req.user.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }
    
    // Add officer ID to request user object for consistency
    req.user.officerId = officer.id;
    
    // Check if the complaint is assigned to this officer
    if (complaint.officer_id !== officer.id) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }
    
    // Update complaint status
    await Complaint.updateStatus(req.params.id, status);
    
    // Add update with details if provided
    const updateText = statusDetails 
      ? `Status updated to ${status}: ${statusDetails}` 
      : `Status updated to ${status}`;
      
    await Complaint.addUpdate(req.params.id, officer.id, updateText);
    
    // If status is resolved, update officer's counts
    if (status === 'resolved') {
      await Officer.updateComplaintCount(officer.id, { solved: 1, pending: -1 });
    }
    
    res.json({ 
      message: 'Complaint status updated successfully',
      status,
      updateText
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add update to complaint (officer only)
router.post('/:id/updates', auth, isOfficer, async (req, res) => {
  try {
    const { updateText } = req.body;
    
    if (!updateText) {
      return res.status(400).json({ message: 'Update text is required' });
    }
    
    // Get complaint
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Get officer ID
    const officer = await Officer.findByUserId(req.user.id);
    
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }
    
    // Add officer ID to request user object for consistency
    req.user.officerId = officer.id;
    
    // Check if the complaint is assigned to this officer
    if (complaint.officer_id !== officer.id) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }
    
    // Add update
    await Complaint.addUpdate(req.params.id, officer.id, updateText);
    
    res.status(201).json({ message: 'Update added successfully' });
  } catch (error) {
    console.error('Add update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Citizen: Submit feedback for resolved complaint
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) is required' });
    }
    
    // Get complaint
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user is the complaint owner
    if (complaint.citizen_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this complaint' });
    }
    
    // Check if complaint is resolved
    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return res.status(400).json({ message: 'Can only submit feedback for resolved or closed complaints' });
    }
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findByComplaintId(req.params.id);
    
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this complaint' });
    }
    
    // Submit feedback
    await Feedback.create({
      complaintId: req.params.id,
      citizenId: req.user.id,
      rating,
      comment
    });
    
    // Update complaint status to closed
    await Complaint.updateStatus(req.params.id, 'closed');
    
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Citizen: Reopen a complaint
router.post('/:id/reopen', auth, async (req, res) => {
  try {
    // Get complaint
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user is the complaint owner
    if (complaint.citizen_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reopen this complaint' });
    }
    
    // Check if complaint is resolved or closed
    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return res.status(400).json({ message: 'Can only reopen resolved or closed complaints' });
    }
    
    // Reopen complaint
    await Complaint.updateStatus(req.params.id, 'reopened');
    
    // Update officer pending count
    if (complaint.officer_id) {
      await Officer.updateComplaintCount(complaint.officer_id, { pending: 1, solved: -1 });
    }
    
    res.json({ message: 'Complaint reopened successfully' });
  } catch (error) {
    console.error('Reopen complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all complaints (for admin)
router.get('/', auth, async (req, res) => {
  try {
    // Only admins and officers can view all complaints
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({ message: 'Not authorized to view all complaints' });
    }
    
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const complaints = await Complaint.getAll(limit, offset);
    res.json({ complaints });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 