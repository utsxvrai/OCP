import { useState } from 'react';

function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Online Complaint Portal',
    contactEmail: 'admin@ocp.com',
    contactPhone: '1800-123-4567',
    enableNotifications: true
  });
  
  const [complaintSettings, setComplaintSettings] = useState({
    defaultAssignmentDeadline: 48, // hours
    enableAutoAssignment: true,
    maxAttachmentsPerComplaint: 5,
    allowAnonymousComplaints: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    enableEmailNotifications: true,
    complainantNotifications: true,
    officerNotifications: true,
    adminNotifications: true,
    emailFooter: 'This is an automated message from the Online Complaint Portal. Please do not reply to this email.'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle general settings change
  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle complaint settings change
  const handleComplaintSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setComplaintSettings({
      ...complaintSettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };
  
  // Handle email settings change
  const handleEmailSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);
      
      // In a real application, you would save settings to a backend API
      console.log('Saving settings:', {
        generalSettings,
        complaintSettings,
        emailSettings
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Settings saved successfully.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralSettingsChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={generalSettings.contactPhone}
                onChange={handleGeneralSettingsChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableNotifications"
                name="enableNotifications"
                checked={generalSettings.enableNotifications}
                onChange={handleGeneralSettingsChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-700">
                Enable system notifications
              </label>
            </div>
          </div>
        </div>
        
        {/* Complaint Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Complaint Settings</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Assignment Deadline (hours)</label>
              <input
                type="number"
                name="defaultAssignmentDeadline"
                value={complaintSettings.defaultAssignmentDeadline}
                onChange={handleComplaintSettingsChange}
                min="1"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Attachments Per Complaint</label>
              <input
                type="number"
                name="maxAttachmentsPerComplaint"
                value={complaintSettings.maxAttachmentsPerComplaint}
                onChange={handleComplaintSettingsChange}
                min="0"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableAutoAssignment"
                name="enableAutoAssignment"
                checked={complaintSettings.enableAutoAssignment}
                onChange={handleComplaintSettingsChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="enableAutoAssignment" className="ml-2 block text-sm text-gray-700">
                Enable automatic assignment of complaints to officers
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowAnonymousComplaints"
                name="allowAnonymousComplaints"
                checked={complaintSettings.allowAnonymousComplaints}
                onChange={handleComplaintSettingsChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="allowAnonymousComplaints" className="ml-2 block text-sm text-gray-700">
                Allow anonymous complaints
              </label>
            </div>
          </div>
        </div>
        
        {/* Email Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Email Notification Settings</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                name="enableEmailNotifications"
                checked={emailSettings.enableEmailNotifications}
                onChange={handleEmailSettingsChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-700">
                Enable email notifications
              </label>
            </div>
            
            <div className="pl-6 space-y-3 border-l-2 border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="complainantNotifications"
                  name="complainantNotifications"
                  checked={emailSettings.complainantNotifications}
                  onChange={handleEmailSettingsChange}
                  disabled={!emailSettings.enableEmailNotifications}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="complainantNotifications" className={`ml-2 block text-sm text-gray-700 ${!emailSettings.enableEmailNotifications && 'opacity-50'}`}>
                  Send notifications to complainants
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="officerNotifications"
                  name="officerNotifications"
                  checked={emailSettings.officerNotifications}
                  onChange={handleEmailSettingsChange}
                  disabled={!emailSettings.enableEmailNotifications}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="officerNotifications" className={`ml-2 block text-sm text-gray-700 ${!emailSettings.enableEmailNotifications && 'opacity-50'}`}>
                  Send notifications to officers
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminNotifications"
                  name="adminNotifications"
                  checked={emailSettings.adminNotifications}
                  onChange={handleEmailSettingsChange}
                  disabled={!emailSettings.enableEmailNotifications}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="adminNotifications" className={`ml-2 block text-sm text-gray-700 ${!emailSettings.enableEmailNotifications && 'opacity-50'}`}>
                  Send notifications to administrators
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Footer Text</label>
              <textarea
                name="emailFooter"
                value={emailSettings.emailFooter}
                onChange={handleEmailSettingsChange}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:opacity-50"
                disabled={!emailSettings.enableEmailNotifications}
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminSettings; 