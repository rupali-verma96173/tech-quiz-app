import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDB } from "./config/db.js";
import userRouter from "./routes/quizRoutes.js";

// Load environment variables
dotenv.config();

const port = process.env.PORT || 4000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/tech-quiz-app';
const secretKey = process.env.SECRET_KEY || 'dev-secret-key-change-in-production';

// Set environment variables if not provided
if (!process.env.MONGO_URL) {
  process.env.MONGO_URL = mongoUrl;
}
if (!process.env.SECRET_KEY) {
  process.env.SECRET_KEY = secretKey;
}

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Tech Quiz API Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    port: port,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Connect to database
ConnectDB();

// API routes
app.use('/api/auth', userRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('🚀 Tech Quiz API Server Started!');
  console.log(`📍 Server running on: http://localhost:${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${mongoUrl}`);
  console.log('✅ Ready to accept requests!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
