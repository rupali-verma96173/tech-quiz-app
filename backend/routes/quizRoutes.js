import express from "express";
import { Login, SignUp, listQuizzes, getQuiz, submitAttempt, myAttempts, createQuiz, updateQuiz, deleteQuiz, adminListQuizzes, adminGetQuiz, getTechnologies } from "../controllers/quizController.js";
import { auth, adminOnly } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", Login);
userRouter.post("/signup", SignUp);
userRouter.post("/logout", auth, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

userRouter.get("/quizzes", listQuizzes);
userRouter.get("/quizzes/technologies", getTechnologies);
userRouter.get("/quizzes/:id", getQuiz);
userRouter.post("/quizzes/:id/attempt", auth, submitAttempt);
userRouter.get("/me/attempts", auth, myAttempts);

userRouter.get("/admin/quizzes", auth, adminOnly, adminListQuizzes);
userRouter.get("/admin/quizzes/:id", auth, adminOnly, adminGetQuiz);
userRouter.post("/admin/quizzes", auth, adminOnly, createQuiz);
userRouter.put("/admin/quizzes/:id", auth, adminOnly, updateQuiz);
userRouter.delete("/admin/quizzes/:id", auth, adminOnly, deleteQuiz);

export default userRouter; 

