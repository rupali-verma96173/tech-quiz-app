import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    "username":{
        type:String,
        required:[true, "username is required"]
    },
    "useremail":{
        type:String,
        required:[true, "useremail is required"],
        unique:true
    },
    "password":{
        type:String,
        required:[true, "password is required"]
    },
    "role":{
        type:String,
        default: "reader"
    }
}, {timestamps:true})

export const userModel = mongoose.model('users', userSchema); 
 
const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true }
}, { _id: false })

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    technology: { type: String, required: true },
    questions: { type: [questionSchema], default: [] },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, { timestamps: true })

export const quizModel = mongoose.model('quizzes', quizSchema)

const answerSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    selectedIndex: { type: Number, required: true }
}, { _id: false })

const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'quizzes', required: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
}, { timestamps: true })

export const attemptModel = mongoose.model('attempts', attemptSchema)