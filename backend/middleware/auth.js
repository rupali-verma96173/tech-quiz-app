import jwt from "jsonwebtoken";
import { userModel } from "../models/quizModel.js";

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format. Use 'Bearer <token>'" 
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    // Verify JWT token
    const secret = process.env.SECRET_KEY || 'devsecret';
    const decoded = jwt.verify(token, secret);
    
    if (!decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token payload" 
      });
    }

    // Find user in database
    const user = await userModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found. Token may be invalid." 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired. Please login again." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Authentication error" 
    });
  }
};

/**
 * Admin-only middleware to restrict access to admin users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Authorization error" 
    });
  }
};
