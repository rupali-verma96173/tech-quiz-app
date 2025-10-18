import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDB } from "./config/db.js";
import userRouter from "./routes/quizRoutes.js";

dotenv.config();
const port = process.env.PORT || 4000;

const app = express();
ConnectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server running successfully!');
});

app.use('/api/auth', userRouter);
app.listen(port, () => {
  console.log(`Server is Running on http://localhost:${port}`);
});
