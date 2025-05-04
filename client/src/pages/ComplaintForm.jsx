import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';

function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pinCode: '',
    location: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [success, setSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFile = (file) => {
    // Check if file exists
    if (!file) return true;
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError('File size exceeds 5MB limit');
      return false;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setFileError('File type not supported. Please upload JPEG, PNG, GIF, PDF, or DOC files');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (!file) {
      setAttachment(null);
      setAttachmentPreview(null);
      return;
    }
    
    if (validateFile(file)) {
      setAttachment(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, show file icon
        setAttachmentPreview(null);
      }
    } else {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setAttachment(null);
      setAttachmentPreview(null);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFileError('');
    
    // Validate PIN code
    if (formData.pinCode.length !== 6 || !/^\d+$/.test(formData.pinCode)) {
      setError('Please enter a valid 6-digit PIN code');
      return;
    }
    
    // Ensure PIN code is a string to match the format stored in the database
    const pinCodeString = formData.pinCode.toString();
    
    // Final validation for attachment
    if (attachment && !validateFile(attachment)) {
      return;
    }
    
    setLoading(true);

    try {
      // Create FormData object for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('pinCode', pinCodeString);
      data.append('location', formData.location);
      
      if (attachment) {
        data.append('attachment', attachment);
      }

      const response = await complaintAPI.submit(data);
      setSuccess(true);
      setComplaintId(response.data.complaintId);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        pinCode: '',
        location: '',
      });
      setAttachment(null);
      setAttachmentPreview(null);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaints = () => {
    navigate('/dashboard');
  };
  
  const getFileIcon = () => {
    if (!attachment) return null;
    
    if (attachment.type === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (attachment.type.includes('word')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container max-w-3xl">
        {success ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your complaint has been registered with ID: <span className="font-semibold">{complaintId}</span>
            </p>
            <div className="bg-blue-50 border border-blue-200 p-4 mb-6 text-left rounded-md">
              <p className="font-medium text-blue-700 mb-1">Important:</p>
              <p className="text-blue-700">
                Please save this ID for future reference. You'll need it to track the status of your complaint.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleViewComplaints}
                className="btn btn-primary"
              >
                View My Complaints
              </button>
              <button
                onClick={() => navigate('/track')}
                className="btn btn-secondary"
              >
                Track This Complaint
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800">File a New Complaint</h1>
              <p className="text-gray-600 mt-1">
                Please provide accurate information to help us address your issue efficiently.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Complaint Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief title describing your issue"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Complaint Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  className="input !h-auto"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about your complaint"
                  required
                ></textarea>
                <p className="text-gray-500 text-sm mt-1">
                  Please include all relevant details such as date, time, and specific issues faced.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="pinCode" className="block text-gray-700 font-medium mb-2">
                    PIN Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="pinCode"
                    name="pinCode"
                    className="input"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit PIN code"
                    maxLength={6}
                    required
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Your complaint will be assigned based on this PIN code
                  </p>
                </div>
                <div>
                  <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                    Location Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="input"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter complete location address"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="attachment" className="block text-gray-700 font-medium mb-2">
                  Attachment
                </label>
                
                {fileError && (
                  <div className="text-red-600 text-sm mb-2">{fileError}</div>
                )}
                
                <div className="flex items-center mb-2">
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-white
                      hover:file:cursor-pointer hover:file:bg-primary/90"
                    onChange={handleFileChange}
                  />
                </div>
                
                {/* File preview */}
                {attachment && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {attachmentPreview ? (
                          <img 
                            src={attachmentPreview} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-md mr-3"
                          />
                        ) : (
                          <div className="mr-3">
                            {getFileIcon()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate w-56">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(2)} KB • {attachment.type.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-500 text-sm mt-1">
                  Supported formats: JPEG, PNG, PDF, DOC (Max 5MB). Upload photos or documents related to your complaint.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your complaint will be automatically assigned to the concerned officer based on your PIN code. You can track the status using the complaint ID.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintForm; 