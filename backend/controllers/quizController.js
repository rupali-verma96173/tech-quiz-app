import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel, quizModel, attemptModel } from "../models/quizModel.js";

//  Login
export const Login = async (req, res) => {
  try {
    const { useremail, password } = req.body;
    if (!useremail || !password) {
      return res.status(501).json({
        success: false,
        message: "Please Enter the Required Field",
      });
    }
    // Check the email valid or not
    let userResult = await userModel.findOne({ useremail });
    if (!userResult) {
      return res.status(501).json({
        success: false,
        message: "Invalid Email",
      });
    }
    // Password
    bcrypt.compare(password, userResult.password, async (error, result) => {
      if (result) {
        // Token Generate
        const secret = process.env.SECRET_KEY || 'devsecret';
        let token = await jwt.sign(
          { userId: userResult._id },
          secret,
          {
            expiresIn: "2h",
          }
        );
        if (!token) {
          return res.status(401).json({
            success: false,
            message: "Invalid Token...",
            error,
          });
        }
        return res.status(201).json({
          success: true,
          message: "User Login Successfully",
          userResult,
          token,
        });
      } else {
        return res.status(501).json({
          success: false,
          message: "Invalid User",
          error,
        });
      }
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "Invalid User...",
    });
  }
};

// SignUp
export const SignUp = async (req, res) => {
  try {
    const { username, useremail, password } = req.body;
    // Check Email already exist or not?
    const mailExist = await userModel.find({
      useremail: useremail,
    });
    if (mailExist.length > 0) {
      return res.status(501).json({
        success: false,
        message: "email already exist...",
      });
    }
    // Password encryption
    bcrypt.hash(password, 10, async (error, hashcode) => {
      if (error) {
        return res.status(501).json({
          success: false,
          message: "Invalid Password",
        });
      }
      const user = userModel({ username, useremail, password: hashcode });
      // Save the data into the database
      let result = await user.save();
      if (result) {
        return res.status(201).json({
          success: true,
          message: "User Successfully Created...",
        });
      }
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "There Is An Error...",
    });
  }
};

export const listQuizzes = async (req, res) => {
  try {
    const { tech } = req.query;
    const filter = tech ? { technology: tech, isPublished: true } : { isPublished: true };
    const quizzes = await quizModel.find(filter).select("title technology createdAt isPublished");
    console.log('Backend returning quizzes:', quizzes);
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quizzes" });
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
    const quiz = await quizModel.findById(req.params.id).select("title technology questions isPublished");
    if (!quiz || !quiz.isPublished) return res.status(404).json({ success: false, message: "Quiz not found" });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz" });
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
    const { answers } = req.body; // [{questionIndex, selectedIndex}]
    const quiz = await quizModel.findById(req.params.id);
    if (!quiz || !quiz.isPublished) return res.status(404).json({ success: false, message: "Quiz not found" });

    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      const ans = answers.find(a => a.questionIndex === idx);
      if (ans && ans.selectedIndex === q.correctIndex) correct += 1;
    });
    const total = quiz.questions.length;
    const score = Math.round((correct / (total || 1)) * 100);

    const attempt = await attemptModel.create({
      userId: req.user._id,
      quizId: quiz._id,
      answers: answers || [],
      score,
      correctCount: correct,
      total
    });

    res.status(201).json({ success: true, score, correct, total, attemptId: attempt._id });
  } catch (error) {
    console.log('Submit attempt error:', error);
    res.status(500).json({ success: false, message: "Error submitting attempt" });
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
