import React from 'react';

function ProjectReport() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Online Complaint Portal</h1>
        <h2 className="text-xl text-gray-700">Software Engineering Project Report</h2>
        <div className="mt-4 flex justify-center">
          <img 
            src="/assets/juet_logo.png" 
            alt="JUET Logo" 
            className="h-24 w-auto"
            onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=JUET+Logo"}}
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-lg">Team Members</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Utsav Rai (221b425)</li>
              <li>Tulja Rathore (221b413)</li>
              <li>Sujal (221b400)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Supervised By</h3>
            <p className="mt-2">Dr. Amit Kumar Srivastava</p>
            <p className="text-sm text-gray-600">Jaypee University of Engineering and Technology, Guna</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Project Overview</h2>
        <p className="mb-4">
          The Online Complaint Portal is a comprehensive system designed to streamline the process of registering, tracking, and resolving citizen complaints. It bridges the gap between citizens and government officials, providing a transparent platform for grievance redressal.
        </p>
        <p>
          The system employs role-based access control with three main user types: Citizens, Officers, and Administrators. Each role has specific permissions and functionalities tailored to their responsibilities in the complaint resolution process.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Software Requirements Specification</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h3>
        <p className="mb-4">
          The Online Complaint Portal (OCP) is designed to provide citizens with a convenient way to submit complaints to government authorities and track their resolution. This system aims to improve transparency, efficiency, and accountability in the complaint resolution process.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2. Functional Requirements</h3>
        <div className="space-y-3">
          <h4 className="text-lg font-medium">2.1 User Authentication</h4>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>The system shall allow users to register with their personal details.</li>
            <li>The system shall provide login functionality with email/password and Aadhaar-based authentication.</li>
            <li>The system shall support role-based access control for citizens, officers, and administrators.</li>
          </ul>

          <h4 className="text-lg font-medium mt-4">2.2 Complaint Management</h4>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Citizens shall be able to submit complaints with details, location, and attachments.</li>
            <li>Complaints shall be automatically assigned to officers based on PIN code.</li>
            <li>Officers shall be able to update the status of complaints assigned to them.</li>
            <li>Citizens shall be able to track the status of their complaints using unique complaint IDs.</li>
            <li>The system shall allow citizens to provide feedback after complaint resolution.</li>
          </ul>

          <h4 className="text-lg font-medium mt-4">2.3 Officer Management</h4>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Officers shall be able to update their availability status.</li>
            <li>The system shall track officer performance metrics.</li>
            <li>Officers shall be able to view complaints assigned to them.</li>
            <li>Officers shall be able to add updates to complaints they are handling.</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">3. Non-Functional Requirements</h3>
        <div className="space-y-3">
          <h4 className="text-lg font-medium">3.1 Security</h4>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>The system shall encrypt all sensitive data.</li>
            <li>The system shall implement JWT-based authentication.</li>
            <li>The system shall enforce privacy controls to protect citizen information.</li>
          </ul>

          <h4 className="text-lg font-medium mt-4">3.2 Performance</h4>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>The system shall handle multiple concurrent users.</li>
            <li>The system shall respond to user requests within 2 seconds.</li>
          </ul>

          <h4 className="text-lg font-medium mt-4">3.3 Usability</h4>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>The interface shall be intuitive and easy to navigate.</li>
            <li>The system shall be accessible on mobile and desktop devices.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">System Design</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">1. Architecture</h3>
        <p className="mb-4">
          The application follows a client-server architecture using the following technologies:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1 mb-4">
          <li><strong>Frontend:</strong> React.js, Tailwind CSS</li>
          <li><strong>Backend:</strong> Node.js, Express.js</li>
          <li><strong>Database:</strong> MySQL</li>
          <li><strong>Authentication:</strong> JSON Web Tokens (JWT)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">2. Database Design</h3>
        <p className="mb-4">
          The database consists of the following primary entities:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-1">
          <li><strong>Users:</strong> Stores user information and authentication details</li>
          <li><strong>Officers:</strong> Extends users with officer-specific attributes</li>
          <li><strong>Complaints:</strong> Stores complaint details with references to citizens and officers</li>
          <li><strong>Complaint Updates:</strong> Tracks progress updates for each complaint</li>
          <li><strong>Feedback:</strong> Stores citizen feedback on resolved complaints</li>
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Software Development Methodology</h2>
        <div className="my-4">
          <h3 className="text-xl font-semibold mb-3">Incremental Model</h3>
          <p className="mb-4">
            For this project, we selected the Incremental Development Model, which combines elements of the waterfall model applied in an iterative fashion. Each iteration produces a deliverable "increment" of the software.
          </p>
          
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h4 className="font-medium">Reasons for choosing this model:</h4>
            <ul className="list-disc list-inside pl-4 space-y-1 mt-2">
              <li>The concept of our software is vast with multiple modules that need to be built incrementally</li>
              <li>This approach reduces the risk of errors by developing and testing smaller components</li>
              <li>We can deliver core functionality early and incrementally add features</li>
              <li>It allows for user feedback after each increment, helping improve subsequent iterations</li>
            </ul>
          </div>
          
          <div className="flex justify-center my-6">
            <div className="w-full md:w-3/4">
              <img 
                src="/assets/incremental_model.png" 
                alt="Incremental Model Diagram" 
                className="w-full h-auto border rounded-lg shadow-md"
                onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x400?text=Incremental+Model+Diagram"}}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">UML Diagrams</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">1. Use Case Diagram</h3>
        <div className="flex justify-center my-6">
          <div className="w-full md:w-3/4">
            <img 
              src="/assets/usecase_diagram.png" 
              alt="Use Case Diagram" 
              className="w-full h-auto border rounded-lg shadow-md"
              onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x600?text=Use+Case+Diagram"}}
            />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">2. Entity Relationship Diagram</h3>
        <div className="flex justify-center my-6">
          <div className="w-full md:w-3/4">
            <img 
              src="/assets/erd.png" 
              alt="Entity Relationship Diagram" 
              className="w-full h-auto border rounded-lg shadow-md"
              onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x600?text=ERD+Diagram"}}
            />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">3. Data Flow Diagram</h3>
        <div className="flex justify-center my-6">
          <div className="w-full md:w-3/4">
            <img 
              src="/assets/dfd.png" 
              alt="Data Flow Diagram" 
              className="w-full h-auto border rounded-lg shadow-md"
              onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x600?text=Data+Flow+Diagram"}}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Testing</h2>
        <p className="mb-4">
          We employed various testing methodologies to ensure the quality and reliability of the application:
        </p>
        
        <h3 className="text-xl font-semibold mt-4">1. Unit Testing</h3>
        <p className="mb-4">
          Individual components were tested in isolation to verify their functionality.
        </p>
        
        <h3 className="text-xl font-semibold mt-4">2. Integration Testing</h3>
        <p className="mb-4">
          Interactions between different components were tested to ensure proper communication.
        </p>
        
        <h3 className="text-xl font-semibold mt-4">3. System Testing</h3>
        <p className="mb-4">
          The complete application was tested as a whole to verify all requirements were met.
        </p>
        
        <h3 className="text-xl font-semibold mt-4">4. User Acceptance Testing</h3>
        <p>
          End users tested the application to ensure it met their needs and expectations.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Conclusion</h2>
        <p className="mb-4">
          The Online Complaint Portal successfully addresses the need for an efficient system to manage citizen complaints. By implementing role-based access control, automatic assignment of complaints, and a transparent tracking mechanism, the system streamlines the complaint resolution process.
        </p>
        <p>
          The project demonstrates the application of software engineering principles and methodologies in creating a practical solution for real-world problems. The incremental development approach allowed for continuous improvement and adaptation based on feedback.
        </p>
      </div>

      <div className="text-center text-gray-600 mt-10 pt-6 border-t">
        <p>© {new Date().getFullYear()} | Jaypee University of Engineering and Technology, Guna</p>
      </div>
    </div>
  );
}

export default ProjectReport; 