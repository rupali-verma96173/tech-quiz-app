import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel, quizModel, attemptModel } from "../models/quizModel.js";

/**
 * User login endpoint with JWT authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const Login = async (req, res) => {
  try {
    const { useremail, password } = req.body;
    
    // Input validation
    if (!useremail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(useremail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Find user by email
    const userResult = await userModel.findOne({ useremail });
    if (!userResult) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    bcrypt.compare(password, userResult.password, async (error, result) => {
      if (error) {
        console.error('Password comparison error:', error);
        return res.status(500).json({
          success: false,
          message: "Authentication error",
        });
      }

      if (result) {
        try {
          // Generate JWT token
          const secret = process.env.SECRET_KEY || 'devsecret';
          const token = jwt.sign(
            { userId: userResult._id },
            secret,
            { expiresIn: "24h" }
          );

          // Remove password from response
          const userResponse = {
            _id: userResult._id,
            username: userResult.username,
            useremail: userResult.useremail,
            role: userResult.role
          };

          return res.status(200).json({
            success: true,
            message: "Login successful",
            user: userResponse,
            token,
          });
        } catch (tokenError) {
          console.error('Token generation error:', tokenError);
          return res.status(500).json({
            success: false,
            message: "Authentication error",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * User registration endpoint with input validation and password hashing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const SignUp = async (req, res) => {
  try {
    const { username, useremail, password } = req.body;
    
    // Input validation
    if (!username || !useremail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Username validation
    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters long",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(useremail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ useremail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    bcrypt.hash(password, 12, async (error, hashcode) => {
      if (error) {
        console.error('Password hashing error:', error);
        return res.status(500).json({
          success: false,
          message: "Registration failed. Please try again.",
        });
      }

      try {
        // Create new user
        const user = new userModel({ 
          username: username.trim(), 
          useremail: useremail.toLowerCase().trim(), 
          password: hashcode 
        });
        
        // Save user to database
        const result = await user.save();
        
        if (result) {
          return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
              _id: result._id,
              username: result.username,
              useremail: result.useremail,
              role: result.role
            }
          });
        }
      } catch (saveError) {
        console.error('User save error:', saveError);
        return res.status(500).json({
          success: false,
          message: "Registration failed. Please try again.",
        });
      }
    });
  } catch (error) {
    console.error('SignUp error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const listQuizzes = async (req, res) => {
  try {
    const { tech, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    
    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
    }

    // Build filter object
    let filter = { isPublished: true };
    
    // Handle technology filter with case-insensitive search
    if (tech && tech.trim()) {
      const techRegex = new RegExp(tech.trim(), 'i');
      filter.technology = techRegex;
    }

    // Validate sort parameter
    const allowedSortFields = ['createdAt', 'title', 'technology'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = sort === 'title' ? 1 : -1; // title asc, others desc

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [quizzes, totalCount] = await Promise.all([
      quizModel.find(filter)
        .select("title technology createdAt isPublished questions")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      quizModel.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({ 
      success: true, 
      quizzes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error in listQuizzes:', error);
    
    // Handle specific database errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid query parameters" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Unable to fetch quizzes at this time. Please try again later." 
    });
  }
};

export const getTechnologies = async (req, res) => {
  try {
    const technologies = await quizModel.distinct("technology", { isPublished: true });
    res.json({ success: true, technologies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching technologies" });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid quiz ID format" 
      });
    }

    const quiz = await quizModel.findById(id)
      .select("title technology questions isPublished createdAt")
      .lean();

    // Handle quiz not found
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz not found or has been removed" 
      });
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return res.status(403).json({ 
        success: false, 
        message: "This quiz is not yet available to the public" 
      });
    }

    // Validate quiz has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "This quiz has no questions available" 
      });
    }

    // Sanitize questions for security (don't send correct answers to frontend)
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        text: q.text,
        options: q.options,
        // Don't include correctIndex in response
      }))
    };

    res.json({ 
      success: true, 
      quiz: sanitizedQuiz,
      questionCount: quiz.questions.length
    });
  } catch (error) {
    console.error('Error in getQuiz:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid quiz ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Unable to fetch quiz details. Please try again later." 
    });
  }
};

// Admin list with full data (no published filter)
export const adminListQuizzes = async (req, res) => {
  try {
    const { tech } = req.query;
    const filter = tech ? { technology: tech } : {};
    const quizzes = await quizModel.find(filter);
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quizzes" });
  }
};

// Admin get single quiz regardless of published
export const adminGetQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz" });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const { id: quizId } = req.params;
    const userId = req.user._id;

    // Validate quiz ID format
    if (!quizId || !/^[0-9a-fA-F]{24}$/.test(quizId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid quiz ID format" 
      });
    }

    // Validate answers array
    if (!Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false, 
        message: "Answers must be provided as an array" 
      });
    }

    // Check for duplicate attempts (prevent spam)
    const recentAttempt = await attemptModel.findOne({
      userId,
      quizId,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes ago
    });

    if (recentAttempt) {
      return res.status(429).json({ 
        success: false, 
        message: "Please wait before attempting this quiz again" 
      });
    }

    // Fetch quiz with all questions
    const quiz = await quizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz not found or has been removed" 
      });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({ 
        success: false, 
        message: "This quiz is not available for attempts" 
      });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "This quiz has no questions" 
      });
    }

    // Validate answers structure and range
    const validAnswers = answers.filter(answer => {
      return answer && 
             typeof answer.questionIndex === 'number' && 
             typeof answer.selectedIndex === 'number' &&
             answer.questionIndex >= 0 && 
             answer.questionIndex < quiz.questions.length &&
             answer.selectedIndex >= 0 && 
             answer.selectedIndex < quiz.questions[answer.questionIndex].options.length;
    });

    if (validAnswers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid answers provided" 
      });
    }

    // Calculate score
    let correct = 0;
    const total = quiz.questions.length;
    
    quiz.questions.forEach((question, questionIndex) => {
      const userAnswer = validAnswers.find(a => a.questionIndex === questionIndex);
      if (userAnswer && userAnswer.selectedIndex === question.correctIndex) {
        correct += 1;
      }
    });

    const score = Math.round((correct / total) * 100);

    // Create attempt record
    const attempt = await attemptModel.create({
      userId,
      quizId: quiz._id,
      answers: validAnswers,
      score,
      correctCount: correct,
      total
    });

    // Determine performance message
    let performanceMessage = "";
    if (score >= 90) performanceMessage = "Excellent work!";
    else if (score >= 80) performanceMessage = "Great job!";
    else if (score >= 70) performanceMessage = "Good effort!";
    else if (score >= 60) performanceMessage = "Not bad, keep practicing!";
    else performanceMessage = "Keep studying and try again!";

    res.status(201).json({ 
      success: true, 
      score, 
      correct, 
      total, 
      attemptId: attempt._id,
      performanceMessage,
      percentage: score
    });
  } catch (error) {
    console.error('Error in submitAttempt:', error);
    
    // Handle specific database errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid attempt data provided" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Unable to submit quiz attempt. Please try again later." 
    });
  }
};

export const myAttempts = async (req, res) => {
  try {
    const userId = req.user?._id;
    const attempts = await attemptModel.find({ userId }).populate("quizId", "title technology").sort({ createdAt: -1 });
    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching attempts" });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const data = req.body; // {title, technology, questions[], isPublished}
    const quiz = await quizModel.create({ ...data, createdBy: req.user._id });
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: "Could not create quiz" });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: "Could not update quiz" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Could not delete quiz" });
  }
};
