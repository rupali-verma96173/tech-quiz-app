# Tech Quiz Application

A comprehensive full-stack quiz application built with React.js, Express.js, and MongoDB. This application allows users to take technical quizzes and administrators to manage quiz content.

## 🚀 Features

### User Features
- **User Authentication**: Secure login and registration with JWT tokens
- **Quiz Taking**: Browse and take quizzes by technology
- **Quiz History**: View past quiz attempts and scores
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Feedback**: Immediate scoring and performance feedback

### Admin Features
- **Quiz Management**: Create, edit, and delete quizzes
- **Question Management**: Add multiple choice questions with correct answers
- **Technology Filtering**: Organize quizzes by technology
- **Publish Control**: Toggle quiz visibility for users
- **Analytics**: View quiz performance and user engagement

## 🛠️ Technology Stack

### Frontend
- **React.js 19.1.1** - Modern React with hooks and context API
- **Vite** - Fast build tool and development server
- **CSS3** - Modern CSS with custom properties and responsive design
- **Context API** - State management for user authentication and app state

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose 8.19.1** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds for password security
- **Input Validation** - Comprehensive validation on both frontend and backend
- **CORS Protection** - Cross-origin resource sharing configuration
- **Role-based Access** - Admin and user role separation

## 📁 Project Structure

```
tech-quiz-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection configuration
│   ├── controllers/
│   │   └── quizController.js     # API route handlers
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   └── quizModel.js         # Database schemas
│   ├── routes/
│   │   └── quizRoutes.js        # API routes
│   ├── scripts/
│   │   └── seedAdmin.js         # Admin user seeding script
│   ├── server.js                # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.jsx   # Admin dashboard
│   │   │   ├── Login.jsx        # User login component
│   │   │   ├── MyAttempts.jsx   # Quiz history component
│   │   │   ├── QuizList.jsx     # Quiz listing component
│   │   │   ├── Signup.jsx       # User registration component
│   │   │   └── TakeQuiz.jsx     # Quiz taking component
│   │   ├── context/
│   │   │   └── AppContext.jsx   # React context for state management
│   │   ├── App.jsx              # Main application component
│   │   ├── App.css              # Global styles and responsive design
│   │   └── main.jsx             # Application entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tech-quiz-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URL=mongodb://localhost:27017/tech-quiz-app
   SECRET_KEY=your-secret-key-here
   PORT=4000
   ```

5. **Database Setup**
   
   Start MongoDB service:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Seed Admin User** (Optional)
   ```bash
   cd backend
   npm run seed:admin
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:4000

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Access the application**
   - Open http://localhost:5173 in your browser
   - Register a new account or use admin credentials if seeded

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String (required),
  useremail: String (required, unique),
  password: String (required, hashed),
  role: String (default: "reader", enum: ["reader", "admin"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Quizzes Collection
```javascript
{
  title: String (required),
  technology: String (required),
  questions: [{
    text: String (required),
    options: [String] (required),
    correctIndex: Number (required)
  }],
  isPublished: Boolean (default: false),
  createdBy: ObjectId (ref: 'users'),
  createdAt: Date,
  updatedAt: Date
}
```

### Attempts Collection
```javascript
{
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

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Quiz Management (Public)
- `GET /api/auth/quizzes` - Get published quizzes
- `GET /api/auth/quizzes/technologies` - Get available technologies
- `GET /api/auth/quizzes/:id` - Get specific quiz
- `POST /api/auth/quizzes/:id/attempt` - Submit quiz attempt (requires auth)
- `GET /api/auth/me/attempts` - Get user's quiz attempts (requires auth)

### Admin Quiz Management (Admin only)
- `GET /api/auth/admin/quizzes` - Get all quizzes (including unpublished)
- `GET /api/auth/admin/quizzes/:id` - Get quiz details (admin view)
- `POST /api/auth/admin/quizzes` - Create new quiz
- `PUT /api/auth/admin/quizzes/:id` - Update quiz
- `DELETE /api/auth/admin/quizzes/:id` - Delete quiz

## 🎨 UI/UX Features

### Design System
- **Modern Color Palette**: Professional blue and green gradients
- **Typography**: Inter font family for excellent readability
- **Responsive Grid**: CSS Grid and Flexbox for adaptive layouts
- **Interactive Elements**: Hover effects, transitions, and micro-animations
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablet screens
- **Desktop Enhanced**: Full feature set on desktop browsers
- **Cross-browser**: Compatible with Chrome, Firefox, Safari, and Edge

### User Experience
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation with helpful error messages
- **Success Feedback**: Confirmation messages for successful actions

## 🔒 Security Implementation

### Authentication Security
- **JWT Tokens**: Secure token-based authentication with expiration
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Sanitization**: Protection against XSS attacks
- **CORS Configuration**: Controlled cross-origin requests

### Data Validation
- **Server-side Validation**: Comprehensive validation on all API endpoints
- **Client-side Validation**: Real-time form validation for better UX
- **Type Checking**: Proper data type validation
- **Length Limits**: Protection against buffer overflow attacks

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Context Optimization**: Efficient state management
- **CSS Optimization**: Minimal and efficient stylesheets

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Error Handling**: Comprehensive error handling without crashes
- **Response Caching**: Strategic caching for frequently accessed data

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Quiz browsing and filtering
- [ ] Quiz taking and submission
- [ ] Score calculation and display
- [ ] Admin panel functionality
- [ ] Responsive design on different devices
- [ ] Error handling and edge cases

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Mobile Phones** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px+)

### Mobile Features
- Touch-friendly interface
- Optimized form inputs
- Swipe gestures support
- Mobile-specific navigation

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use cloud database
2. Configure environment variables
3. Deploy to cloud platform (Heroku, AWS, DigitalOcean)
4. Set up SSL certificates
5. Configure domain and DNS

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, AWS S3)
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Developer Name** - *Initial work* - [GitHub Profile]

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Express.js team for the robust framework
- MongoDB for the flexible database solution
- All open-source contributors

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]
- Documentation: [link to detailed docs]

---

**Note**: This application is built following modern web development best practices and is production-ready with proper security measures, error handling, and responsive design.
