# Tech Quiz App - Database Schema Documentation

## 📊 Overview

This document describes the database schema for the Tech Quiz Application, including collections, fields, relationships, and indexes.

---

## 🗄️ Database Information

- **Database Name**: `tech-quiz-app`
- **Database Type**: MongoDB (NoSQL)
- **ODM**: Mongoose
- **Connection**: MongoDB Atlas (Production) / Local MongoDB (Development)

---

## 📋 Collections

### 1. Users Collection

**Collection Name**: `users`

**Purpose**: Stores user account information including authentication details and roles.

#### Schema Definition
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [50, "Username cannot exceed 50 characters"]
  },
  useremail: {
    type: String,
    required: [true, "useremail is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false // Never include in queries by default
  },
  role: {
    type: String,
    enum: ["reader", "admin"],
    default: "reader"
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

#### Field Descriptions
| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|--------------|
| `_id` | ObjectId | Yes | Yes | Primary key (auto-generated) |
| `username` | String | Yes | No | User's display name |
| `useremail` | String | Yes | Yes | User's email address |
| `password` | String | Yes | No | Hashed password (bcrypt) |
| `role` | String | No | No | User role (reader/admin) |
| `createdAt` | Date | Yes | No | Account creation timestamp |
| `updatedAt` | Date | Yes | No | Last update timestamp |

#### Indexes
```javascript
// Compound index for efficient queries
db.users.createIndex({ "useremail": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });
```

#### Sample Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "useremail": "john@example.com",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Q8Q8Q8",
  "role": "reader",
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

---

### 2. Quizzes Collection

**Collection Name**: `quizzes`

**Purpose**: Stores quiz information including questions, metadata, and publication status.

#### Schema Definition
```javascript
const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
    maxlength: [500, "Question text cannot exceed 500 characters"]
  },
  options: {
    type: [String],
    required: [true, "Question options are required"],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 6;
      },
      message: "Question must have between 2 and 6 options"
    }
  },
  correctIndex: {
    type: Number,
    required: [true, "Correct answer index is required"],
    min: [0, "Correct index must be at least 0"],
    validate: {
      validator: function(index) {
        return index < this.options.length;
      },
      message: "Correct index must be within options range"
    }
  }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Quiz title is required"],
    trim: true,
    maxlength: [100, "Quiz title cannot exceed 100 characters"]
  },
  technology: {
    type: String,
    required: [true, "Technology is required"],
    trim: true,
    maxlength: [50, "Technology name cannot exceed 50 characters"]
  },
  questions: {
    type: [questionSchema],
    default: [],
    validate: {
      validator: function(questions) {
        return questions.length >= 1 && questions.length <= 50;
      },
      message: "Quiz must have between 1 and 50 questions"
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key (auto-generated) |
| `title` | String | Yes | Quiz title |
| `technology` | String | Yes | Technology category |
| `questions` | Array | Yes | Array of question objects |
| `questions[].text` | String | Yes | Question text |
| `questions[].options` | Array | Yes | Multiple choice options |
| `questions[].correctIndex` | Number | Yes | Index of correct answer |
| `isPublished` | Boolean | No | Publication status |
| `createdBy` | ObjectId | Yes | Reference to user who created quiz |
| `createdAt` | Date | Yes | Quiz creation timestamp |
| `updatedAt` | Date | Yes | Last update timestamp |

#### Indexes
```javascript
// Compound indexes for efficient queries
db.quizzes.createIndex({ "technology": 1, "isPublished": 1 });
db.quizzes.createIndex({ "createdBy": 1 });
db.quizzes.createIndex({ "createdAt": -1 });
db.quizzes.createIndex({ "title": "text", "technology": "text" }); // Text search
```

#### Sample Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "title": "JavaScript Fundamentals",
  "technology": "JavaScript",
  "questions": [
    {
      "text": "What is JavaScript?",
      "options": ["Programming Language", "Database", "Framework", "Library"],
      "correctIndex": 0
    },
    {
      "text": "Which keyword is used to declare variables in JavaScript?",
      "options": ["var", "let", "const", "All of the above"],
      "correctIndex": 3
    }
  ],
  "isPublished": true,
  "createdBy": ObjectId("507f1f77bcf86cd799439011"),
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

---

### 3. Attempts Collection

**Collection Name**: `attempts`

**Purpose**: Stores user quiz attempts, answers, and scores.

#### Schema Definition
```javascript
const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: [true, "Question index is required"],
    min: [0, "Question index must be at least 0"]
  },
  selectedIndex: {
    type: Number,
    required: [true, "Selected answer index is required"],
    min: [0, "Selected index must be at least 0"]
  }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: [true, "User ID is required"]
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'quizzes',
    required: [true, "Quiz ID is required"]
  },
  answers: {
    type: [answerSchema],
    default: []
  },
  score: {
    type: Number,
    default: 0,
    min: [0, "Score cannot be negative"],
    max: [100, "Score cannot exceed 100"]
  },
  correctCount: {
    type: Number,
    default: 0,
    min: [0, "Correct count cannot be negative"]
  },
  total: {
    type: Number,
    default: 0,
    min: [0, "Total cannot be negative"]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key (auto-generated) |
| `userId` | ObjectId | Yes | Reference to user who took the quiz |
| `quizId` | ObjectId | Yes | Reference to the quiz taken |
| `answers` | Array | No | User's answers to questions |
| `answers[].questionIndex` | Number | Yes | Index of the question |
| `answers[].selectedIndex` | Number | Yes | Index of selected answer |
| `score` | Number | No | Percentage score (0-100) |
| `correctCount` | Number | No | Number of correct answers |
| `total` | Number | No | Total number of questions |
| `createdAt` | Date | Yes | Attempt timestamp |

#### Indexes
```javascript
// Compound indexes for efficient queries
db.attempts.createIndex({ "userId": 1, "createdAt": -1 });
db.attempts.createIndex({ "quizId": 1, "createdAt": -1 });
db.attempts.createIndex({ "userId": 1, "quizId": 1 });
db.attempts.createIndex({ "score": -1 });
```

#### Sample Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "quizId": ObjectId("507f1f77bcf86cd799439012"),
  "answers": [
    {
      "questionIndex": 0,
      "selectedIndex": 0
    },
    {
      "questionIndex": 1,
      "selectedIndex": 3
    }
  ],
  "score": 100,
  "correctCount": 2,
  "total": 2,
  "createdAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

---

## 🔗 Relationships

### User-Quiz Relationship
- **One-to-Many**: One user can create many quizzes
- **Foreign Key**: `quizzes.createdBy` → `users._id`
- **Cascade**: When user is deleted, their quizzes are also deleted

### User-Attempt Relationship
- **One-to-Many**: One user can have many quiz attempts
- **Foreign Key**: `attempts.userId` → `users._id`
- **Cascade**: When user is deleted, their attempts are also deleted

### Quiz-Attempt Relationship
- **One-to-Many**: One quiz can have many attempts
- **Foreign Key**: `attempts.quizId` → `quizzes._id`
- **Cascade**: When quiz is deleted, related attempts are also deleted

---

## 📊 Database Statistics

### Collection Sizes (Estimated)
- **Users**: ~1KB per user
- **Quizzes**: ~5-50KB per quiz (depending on number of questions)
- **Attempts**: ~1-5KB per attempt (depending on number of questions)

### Performance Considerations
- **Read Operations**: Optimized with proper indexing
- **Write Operations**: Batch operations for better performance
- **Storage**: Estimated 1MB per 1000 users with average usage

---

## 🔍 Query Examples

### Common Queries

#### Get Published Quizzes by Technology
```javascript
db.quizzes.find({
  "technology": "JavaScript",
  "isPublished": true
}).sort({ "createdAt": -1 });
```

#### Get User's Quiz Attempts
```javascript
db.attempts.find({
  "userId": ObjectId("507f1f77bcf86cd799439011")
}).populate("quizId", "title technology").sort({ "createdAt": -1 });
```

#### Get Quiz Statistics
```javascript
db.attempts.aggregate([
  { $match: { "quizId": ObjectId("507f1f77bcf86cd799439012") } },
  { $group: {
    _id: null,
    totalAttempts: { $sum: 1 },
    averageScore: { $avg: "$score" },
    maxScore: { $max: "$score" },
    minScore: { $min: "$score" }
  }}
]);
```

#### Get User Performance
```javascript
db.attempts.aggregate([
  { $match: { "userId": ObjectId("507f1f77bcf86cd799439011") } },
  { $group: {
    _id: "$quizId",
    attempts: { $sum: 1 },
    bestScore: { $max: "$score" },
    averageScore: { $avg: "$score" }
  }},
  { $lookup: {
    from: "quizzes",
    localField: "_id",
    foreignField: "_id",
    as: "quiz"
  }}
]);
```

---

## 🚀 Performance Optimization

### Indexing Strategy
```javascript
// Primary indexes
db.users.createIndex({ "useremail": 1 }, { unique: true });
db.quizzes.createIndex({ "technology": 1, "isPublished": 1 });
db.attempts.createIndex({ "userId": 1, "createdAt": -1 });

// Secondary indexes
db.quizzes.createIndex({ "createdBy": 1 });
db.attempts.createIndex({ "quizId": 1, "createdAt": -1 });
db.attempts.createIndex({ "score": -1 });

// Text search index
db.quizzes.createIndex({ "title": "text", "technology": "text" });
```

### Query Optimization
- Use `select()` to limit returned fields
- Use `populate()` efficiently for references
- Implement pagination for large result sets
- Use aggregation pipelines for complex queries

---

## 🔒 Data Validation

### Schema Validation Rules
- **Username**: 3-50 characters, required
- **Email**: Valid email format, unique, required
- **Password**: Minimum 6 characters, hashed with bcrypt
- **Quiz Title**: Maximum 100 characters, required
- **Question Text**: Maximum 500 characters, required
- **Options**: 2-6 options per question, required
- **Score**: 0-100 range, calculated automatically

### Data Integrity
- **Referential Integrity**: Foreign key constraints
- **Unique Constraints**: Email addresses, quiz titles
- **Required Fields**: All critical fields are required
- **Data Types**: Strict type checking with Mongoose

---

## 📈 Monitoring and Maintenance

### Database Health Checks
```javascript
// Check collection sizes
db.stats();

// Check index usage
db.attempts.aggregate([{ $indexStats: {} }]);

// Check slow queries
db.setProfilingLevel(2, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

### Backup Strategy
```bash
# Create backup
mongodump --db tech-quiz-app --out ./backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db tech-quiz-app ./backup/20240101/tech-quiz-app
```

### Maintenance Tasks
- **Index Optimization**: Regular index analysis and optimization
- **Data Cleanup**: Remove old attempts and inactive users
- **Performance Monitoring**: Track query performance and optimize
- **Backup Verification**: Regular backup testing and restoration

---

## 🔧 Migration Scripts

### Database Migration Example
```javascript
// Add new field to existing collection
db.quizzes.updateMany(
  { "difficulty": { $exists: false } },
  { $set: { "difficulty": "medium" } }
);

// Create new indexes
db.quizzes.createIndex({ "difficulty": 1, "isPublished": 1 });

// Data transformation
db.quizzes.find().forEach(function(quiz) {
  quiz.questions.forEach(function(question, index) {
    question.order = index;
  });
  db.quizzes.save(quiz);
});
```

---

*This database schema documentation is regularly updated. Check back for the latest schema changes and optimizations.*

**Last Updated**: January 2024
**Version**: 1.0.0
