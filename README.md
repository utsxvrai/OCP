#Online Complaint Portal [OCP]

## Complete Setup Guide

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- MySQL (v5.7 or higher)

### Database Setup

1. Create a MySQL database named `complaint_portal`:

   ```sql
   CREATE DATABASE complaint_portal;
   ```

2. Run the initial schema setup:

   ```bash
   mysql -u root -p complaint_portal < server/migrations/schema.sql
   ```

3. Apply the Aadhaar number migration:

   ```bash
   mysql -u root -p complaint_portal < server/migrations/add_aadhaar_to_users.sql
   ```

4. Alternatively, you can run the setup script:
   ```bash
   cd server
   npm run setup
   ```

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:

   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=complaint_portal
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```

4. Start the server:

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application at:
   ```
   http://localhost:5173
   ```

### Seed Test Data

To seed test data including officers and complaints:

1. For officer accounts:

   ```bash
   cd server
   npm run seed-data
   ```

2. For sample complaints:
   ```bash
   cd server
   npm run seed-complaints
   ```

## Using the Application

### User Roles

1. **Citizens** can:

   - Register and login
   - Submit complaints
   - Track complaint status
   - Provide feedback on resolved complaints

2. **Officers** can:

   - View complaints assigned to them
   - Update complaint status
   - Add updates to assigned complaints
   - Manage their availability status

3. **Administrators** can:
   - Manage officers
   - View all complaints
   - Generate reports
   - Configure system settings

### Sample Credentials

After seeding the database, you can use these sample credentials:

- **Citizen**:

  - Email: citizen@example.com
  - Password: password123

- **Officer**:

  - Email: officer@example.com
  - Password: password123
  - Officer ID: 221b123

- **Admin**:
  - Email: admin@ocp.com
  - Password: admin123

## Project Documentation

The complete Software Engineering Project Report is available within the application. Visit the "Project Report" page to access:

- Software Requirements Specification (SRS)
- System Design Documents
- UML Diagrams
- Development Methodology
- Testing Documentation

## Troubleshooting

### Database Connection Issues

- Verify your MySQL credentials in the `.env` file
- Ensure MySQL service is running
- Check that the database exists and migrations have been applied:
  ```bash
  cd server
  npm run migrate-aadhaar
  ```

### Authentication Problems

- Make sure the JWT_SECRET in `.env` is set
- Clear browser cookies and local storage
- Verify user credentials

### Frontend Connection Issues

- Ensure backend server is running on port 5000
- Check for CORS settings if accessing from a different origin
- Verify API endpoints in the frontend services

## License

This project is licensed under the MIT License.

