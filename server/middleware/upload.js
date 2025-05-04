const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectory for current date (YYYY-MM-DD) to organize uploads
    const today = new Date().toISOString().slice(0, 10);
    const dateDir = path.join(uploadDir, today);
    
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }
    
    cb(null, dateDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    cb(null, uniqueFilename);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file extensions and their corresponding MIME types
  const allowedTypes = {
    // Images
    '.jpg': ['image/jpeg', 'image/jpg'],
    '.jpeg': ['image/jpeg', 'image/jpg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    // Documents
    '.pdf': ['application/pdf'],
    '.doc': ['application/msword'],
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  
  // Get file extension and convert to lowercase
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if extension is allowed and MIME type matches
  if (allowedTypes[ext] && allowedTypes[ext].includes(file.mimetype)) {
    return cb(null, true);
  } else {
    return cb(new Error(`File type not supported. Allowed types: jpeg, jpg, png, gif, pdf, doc, docx. Received: ${file.mimetype}`));
  }
};

// Error handling function for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum file size is 5MB.'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      message: err.message
    });
  }
  next();
};

// Init upload middleware
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only 1 file per request
  },
  fileFilter: fileFilter
});

module.exports = { upload, handleMulterError }; 