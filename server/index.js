const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database initialization
const { initDatabase } = require('./config/dbInit');
const { updateDatabase } = require('./config/updateSchema');

// Import services
const ComplaintAssigner = require('./services/complaintAssigner');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const complaintRoutes = require('./routes/complaints');
const officerRoutes = require('./routes/officers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  // Set Cache-Control header
  maxAge: '1d',
  // Set proper Content-Type based on file extension
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    // Set Content-Disposition for documents to force download
    if (['.pdf', '.doc', '.docx'].includes(ext)) {
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    
    // For images, allow inline display
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/officers', officerRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Online Complaint Portal API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer file size limit error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: 'File too large. Maximum file size is 5MB.' 
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database
initDatabase().then(() => {
  console.log('Database initialized');
  
  // Update schema for new fields
  updateDatabase().then(() => {
    console.log('Schema updated for new fields');
    
    // Start queue processing after database is ready
    // Process queue every 5 minutes
    const QUEUE_PROCESSING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Initial processing
    ComplaintAssigner.processQueue();
    
    // Schedule regular processing
    setInterval(() => {
      ComplaintAssigner.processQueue();
    }, QUEUE_PROCESSING_INTERVAL);
    
    console.log(`Complaint queue processing scheduled every ${QUEUE_PROCESSING_INTERVAL/60000} minutes`);
    
  }).catch(err => {
    console.error('Error updating schema:', err);
  });
}).catch(err => {
  console.error('Database initialization error:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = app; 