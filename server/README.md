# Online Complaint Portal - Backend

This is the backend server for the Online Complaint Portal (OCP) application, built with Node.js, Express, and MySQL.

## Features

- User authentication (citizens, officers, admin)
- Complaint submission with file uploads
- Automatic complaint assignment to officers based on PIN code
- Status tracking and updates for complaints
- Officer management with availability status
- Feedback and ratings system

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the `.env.template`:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=complaint_portal

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
```

4. Set up the database:

```bash
node scripts/setup-db.js
```

5. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new citizen
- `POST /api/auth/login` - Login (citizens, officers, admin)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Complaints

- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/assigned` - Get complaints assigned to an officer
- `GET /api/complaints/:id` - Get complaint details
- `GET /api/complaints/track/:complaintId` - Track complaint by ID
- `PUT /api/complaints/:id/status` - Update complaint status
- `POST /api/complaints/:id/updates` - Add update to complaint
- `POST /api/complaints/:id/feedback` - Submit feedback

### Officers

- `POST /api/officers/register` - Register a new officer
- `GET /api/officers/profile` - Get officer profile
- `PUT /api/officers/profile` - Update officer profile
- `PUT /api/officers/availability` - Update officer availability
- `GET /api/officers` - Get all officers
- `GET /api/officers/:id` - Get officer by ID

## File Upload

The application uses Multer for handling file uploads. The uploaded files are stored in the `uploads` directory.

Supported file types: JPEG, JPG, PNG, GIF, PDF, DOC, DOCX
Maximum file size: 5MB

## Database Schema

The database schema includes tables for:

- Users (citizens, officers, admin)
- Officers (profile, availability, assignments)
- Complaints (details, status, attachments)
- Complaint Updates (progress updates)
- Feedback (ratings and comments)
- Notifications (user notifications)

## License

This project is licensed under the MIT License.
