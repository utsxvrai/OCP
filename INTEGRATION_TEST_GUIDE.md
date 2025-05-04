# Integration Testing Guide

This guide will help you test the integration between frontend and backend, focusing on the registration and authentication flow.

## Prerequisites

Ensure both frontend and backend servers are running:

- Backend: `cd server && npm run dev` (running on http://localhost:5000)
- Frontend: `cd client && npm run dev` (running on http://localhost:5173)

## Testing Registration & Authentication Flow

### 1. Database Setup

Before testing, ensure your database is ready:

```bash
cd server
npm run setup
```

### 2. Frontend Registration Test

1. Navigate to http://localhost:5173/register in your browser
2. Fill out the registration form with:
   - Name: Test User
   - Email: test@example.com
   - Password: Password123
   - Confirm Password: Password123
   - Phone: 1234567890
   - Address: 123 Test Street
   - PIN Code: 123456
   - User Type: Citizen
3. Submit the form
4. You should be redirected to the dashboard if successful

### 3. Frontend Login Test

1. Log out if you're already logged in
2. Navigate to http://localhost:5173/login
3. Use the credentials:
   - Email: test@example.com
   - Password: Password123
4. You should be redirected to the dashboard if successful

### 4. Backend API Tests (with Postman)

#### Citizen Registration

- **Request**:

  - Method: POST
  - URL: http://localhost:5000/api/auth/register
  - Headers: Content-Type: application/json
  - Body:
    ```json
    {
      "name": "API Test User",
      "email": "apitest@example.com",
      "password": "Password123",
      "phone": "9876543210",
      "address": "456 API Street",
      "pinCode": "654321"
    }
    ```

- **Expected Response**:
  - Status: 201 Created
  - Body containing token and user object

#### Citizen Login

- **Request**:

  - Method: POST
  - URL: http://localhost:5000/api/auth/login
  - Headers: Content-Type: application/json
  - Body:
    ```json
    {
      "email": "apitest@example.com",
      "password": "Password123"
    }
    ```

- **Expected Response**:
  - Status: 200 OK
  - Body containing token and user object

#### Get User Profile

- **Request**:

  - Method: GET
  - URL: http://localhost:5000/api/auth/me
  - Headers:
    - Content-Type: application/json
    - Authorization: Bearer {token_from_login_response}

- **Expected Response**:
  - Status: 200 OK
  - Body containing user object with profile details

### 5. Data Verification

To verify data is being stored correctly:

1. Check database records:

   ```sql
   SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
   ```

2. Verify all fields are properly stored:
   - name
   - email
   - phone
   - address
   - pin_code

### 6. Common Issues

- **Missing fields in database**: Ensure you've run the migration script
- **JWT errors**: Check the token format and JWT_SECRET in .env
- **CORS errors**: Ensure backend has CORS enabled for frontend origin
- **Form validation errors**: Check both frontend and backend validation

## End-to-End Testing

For a complete test of the integration:

1. Register as a new citizen
2. Log in with those credentials
3. Submit a complaint
4. Register as an officer
5. Log in as the officer
6. View and update the complaint
7. Log in as the citizen again
8. Check the complaint status updates
