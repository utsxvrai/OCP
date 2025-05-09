const Complaint = require('../models/complaint');
const Officer = require('../models/officer');
const ComplaintQueue = require('../models/complaint_queue');

class ComplaintAssigner {
  static async processQueue() {
    try {
      console.log('Running complaint assignment process...');
      
      const queueStats = await ComplaintQueue.getQueueStats();
      
      for (const pinCodeStat of queueStats) {
        await this.processQueueForPinCode(pinCodeStat.pin_code);
      }
      
      console.log('Complaint assignment process completed.');
    } catch (error) {
      console.error('Error in complaint assignment process:', error);
    }
  }
  
  static async processQueueForPinCode(pinCode) {
    try {
      console.log(`Processing queue for PIN code: ${pinCode}`);
      
      const nextComplaint = await ComplaintQueue.getNextComplaint(pinCode);
      
      if (!nextComplaint) {
        console.log(`No complaints in queue for PIN code: ${pinCode}`);
        return;
      }
      
      const officer = await Officer.findLeastBusyOfficerForPinCode(pinCode);
      
      if (!officer) {
        console.log(`No available officers for PIN code: ${pinCode}`);
        return;
      }
      
      console.log(`Assigning complaint ID ${nextComplaint.complaint_id} to officer ID ${officer.id}`);
      
      await Complaint.assignToOfficer(nextComplaint.complaint_id, officer.id);
      
      await Officer.updateComplaintCount(officer.id, { pending: 1 });
      
      await Complaint.addUpdate(
        nextComplaint.complaint_id, 
        officer.id,
        `Complaint assigned to ${officer.name} (${officer.designation})`
      );
      
      await ComplaintQueue.markAsAssigned(nextComplaint.id, officer.id);
      
      console.log(`Successfully assigned complaint ID ${nextComplaint.complaint_id} to officer ID ${officer.id}`);
    } catch (error) {
      console.error(`Error processing queue for PIN code ${pinCode}:`, error);
    }
  }
  
  static async tryAssignComplaint(complaintId, pinCode) {
    try {
      console.log(`Trying to assign complaint ${complaintId} for PIN code ${pinCode}`);
      
      const officer = await Officer.findLeastBusyOfficerForPinCode(pinCode);
      
      if (!officer) {
        console.log(`No available officers for PIN code: ${pinCode}, queueing complaint ${complaintId}`);
        
        const isAlreadyQueued = await ComplaintQueue.isInQueue(complaintId);
        if (!isAlreadyQueued) {
          await ComplaintQueue.addToQueue(complaintId, pinCode);
          console.log(`Added complaint ${complaintId} to queue for PIN code ${pinCode}`);
        }
        
        return null;
      }
      
      console.log(`Found officer for PIN code ${pinCode}: ID=${officer.id}, Name=${officer.name}, PIN codes=${officer.pin_codes}`);
      
      await Complaint.assignToOfficer(complaintId, officer.id);
      
      await Officer.updateComplaintCount(officer.id, { pending: 1 });
      
      await Complaint.addUpdate(
        complaintId, 
        officer.id,
        `Complaint assigned to ${officer.name} (${officer.designation})`
      );
      
      console.log(`Successfully assigned complaint ID ${complaintId} to officer ID ${officer.id}`);
      
      return {
        officerId: officer.id,
        officerName: officer.name,
        officerDesignation: officer.designation,
        officerEmail: officer.email,
        officerPhone: officer.phone
      };
    } catch (error) {
      console.error(`Error assigning complaint ${complaintId}:`, error);
      return null;
    }
  }
}

module.exports = ComplaintAssigner; 