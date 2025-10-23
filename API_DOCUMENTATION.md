# Tech Quiz App - API Documentation

## Base URL
```
http://localhost:4000/api/auth
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array
}
```

---

## 🔐 Authentication Endpoints

### POST /login
User login endpoint.

**Request Body:**
```json
{
  "useremail": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "useremail": "user@example.com",
    "role": "reader"
  },
  "token": "jwt_token_here"
}
```

**Response (Error - 400/401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### POST /signup
User registration endpoint.

**Request Body:**
```json
{
  "username": "john_doe",
  "useremail": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "useremail": "user@example.com",
    "role": "reader"
  }
}
```

**Response (Error - 400/409):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## 📚 Quiz Endpoints (Public)

### GET /quizzes
Get all published quizzes with optional technology filter.

**Query Parameters:**
- `tech` (optional): Filter by technology (e.g., "JavaScript", "React", "Node.js")

**Example Request:**
```
GET /quizzes?tech=JavaScript
```

**Response (Success - 200):**
```json
{
  "success": true,
  "quizzes": [
    {
      "_id": "quiz_id",
      "title": "JavaScript Fundamentals",
      "technology": "JavaScript",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isPublished": true
    }
  ]
}
```

### GET /quizzes/technologies
Get list of available technologies.

**Response (Success - 200):**
```json
{
  "success": true,
  "technologies": ["JavaScript", "React", "Node.js", "Python"]
}
```

### GET /quizzes/:id
Get specific quiz details.

**Response (Success - 200):**
```json
{
  "success": true,
  "quiz": {
    "_id": "quiz_id",
    "title": "JavaScript Fundamentals",
    "technology": "JavaScript",
    "questions": [
      {
        "text": "What is JavaScript?",
        "options": ["Programming Language", "Database", "Framework", "Library"],
        "correctIndex": 0
      }
    ],
    "isPublished": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Quiz not found"
}
```

### POST /quizzes/:id/attempt
Submit quiz attempt. **Requires Authentication**

**Request Body:**
```json
{
  "answers": [
    {
      "questionIndex": 0,
      "selectedIndex": 1
    },
    {
      "questionIndex": 1,
      "selectedIndex": 0
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "score": 85,
  "correct": 17,
  "total": 20,
  "attemptId": "attempt_id"
}
```

### GET /me/attempts
Get user's quiz attempts. **Requires Authentication**

**Response (Success - 200):**
```json
{
  "success": true,
  "attempts": [
    {
      "_id": "attempt_id",
      "quizId": {
        "_id": "quiz_id",
        "title": "JavaScript Fundamentals",
        "technology": "JavaScript"
      },
      "score": 85,
      "correctCount": 17,
      "total": 20,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 👨‍💼 Admin Endpoints

### GET /admin/quizzes
Get all quizzes (including unpublished). **Requires Admin Authentication**

**Query Parameters:**
- `tech` (optional): Filter by technology

**Response (Success - 200):**
```json
{
  "success": true,
  "quizzes": [
    {
      "_id": "quiz_id",
      "title": "JavaScript Fundamentals",
      "technology": "JavaScript",
      "questions": [...],
      "isPublished": true,
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /admin/quizzes/:id
Get quiz details (admin view). **Requires Admin Authentication**

**Response (Success - 200):**
```json
{
  "success": true,
  "quiz": {
    "_id": "quiz_id",
    "title": "JavaScript Fundamentals",
    "technology": "JavaScript",
    "questions": [...],
    "isPublished": true,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /admin/quizzes
Create new quiz. **Requires Admin Authentication**

**Request Body:**
```json
{
  "title": "New Quiz Title",
  "technology": "JavaScript",
  "questions": [
    {
      "text": "What is JavaScript?",
      "options": ["Programming Language", "Database", "Framework", "Library"],
      "correctIndex": 0
    }
  ],
  "isPublished": false
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "quiz": {
    "_id": "new_quiz_id",
    "title": "New Quiz Title",
    "technology": "JavaScript",
    "questions": [...],
    "isPublished": false,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /admin/quizzes/:id
Update quiz. **Requires Admin Authentication**

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "technology": "React",
  "isPublished": true
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "quiz": {
    "_id": "quiz_id",
    "title": "Updated Quiz Title",
    "technology": "React",
    "questions": [...],
    "isPublished": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /admin/quizzes/:id
Delete quiz. **Requires Admin Authentication**

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Quiz deleted"
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Quiz not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String (required, min: 3),
  useremail: String (required, unique, email format),
  password: String (required, hashed),
  role: String (enum: ["reader", "admin"], default: "reader"),
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  technology: String (required),
  questions: [{
    text: String (required),
    options: [String] (required, min: 2),
    correctIndex: Number (required, min: 0)
  }],
  isPublished: Boolean (default: false),
  createdBy: ObjectId (ref: 'users'),
  createdAt: Date,
  updatedAt: Date
}
```

### Attempt Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required),
  quizId: ObjectId (ref: 'quizzes', required),
  answers: [{
    questionIndex: Number (required),
    selectedIndex: Number (required)
  }],
  score: Number (default: 0),
  correctCount: Number (default: 0),
  total: Number (default: 0),
  createdAt: Date
}
```

---

## 🔒 Security Notes

1. **Authentication**: All protected endpoints require valid JWT tokens
2. **Authorization**: Admin endpoints require admin role
3. **Input Validation**: All inputs are validated on both client and server
4. **Password Security**: Passwords are hashed using bcrypt with 12 salt rounds
5. **CORS**: Configured for specific origins in production
6. **Rate Limiting**: Consider implementing rate limiting for production use

---

## 🧪 Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"useremail":"user@example.com","password":"password123"}'
```

**Get Quizzes:**
```bash
curl -X GET http://localhost:4000/api/auth/quizzes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Submit Quiz Attempt:**
```bash
curl -X POST http://localhost:4000/api/auth/quizzes/QUIZ_ID/attempt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"answers":[{"questionIndex":0,"selectedIndex":1}]}'
```

### Using Postman

1. Import the API collection
2. Set the base URL to `http://localhost:4000/api/auth`
3. For protected endpoints, add the JWT token to the Authorization header
4. Test all endpoints with various scenarios

---

## 📊 Rate Limiting

Consider implementing rate limiting for production:
- Login attempts: 5 per minute per IP
- API calls: 100 per hour per user
- Quiz submissions: 10 per hour per user

---

## 🔄 Webhook Support

For future enhancements, consider adding webhook support for:
- Quiz completion notifications
- Admin alerts for new quiz submissions
- User registration confirmations

---

*This API documentation is comprehensive and covers all endpoints, request/response formats, error handling, and security considerations for the Tech Quiz Application.*
