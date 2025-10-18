# Tech Quiz Application - Backend

A comprehensive Tech Quiz Application backend built with MERN stack.

## Features

### Authentication System
- User registration and login
- JWT (JSON Web Tokens) authentication
- Password encryption using bcrypt
- Role-based access control (Admin/User)

### Quiz Management
- Create, edit, delete quizzes (Admin)
- Browse quizzes by technology
- Take quizzes and get instant results
- View performance history

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=4000
MONGO_URL=mongodb://localhost:27017/techquiz
SECRET_KEY=your_jwt_secret_key
```

3. Start server:
```bash
npm start
```

Server runs on `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

### Public Quizzes
- `GET /api/auth/quizzes` - List all quizzes
- `GET /api/auth/quizzes?tech=JavaScript` - Filter by technology
- `GET /api/auth/quizzes/:id` - Get quiz details
- `POST /api/auth/quizzes/:id/attempt` - Submit quiz attempt
- `GET /api/auth/me/attempts` - View attempt history

### Admin Quizzes (Requires Admin Token)
- `POST /api/auth/admin/quizzes` - Create quiz
- `PUT /api/auth/admin/quizzes/:id` - Update quiz
- `DELETE /api/auth/admin/quizzes/:id` - Delete quiz

## Database Schema

### Users
- username, useremail, password, role

### Quizzes
- title, technology, questions[], isPublished, createdBy

### Attempts
- userId, quizId, answers[], score, correctCount, total

## Authentication

Include JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```
