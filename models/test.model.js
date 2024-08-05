import mongoose from "mongoose";
import { type } from "os";

// Define the schema for questions
const questionSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['MCQ', 'MSQ'],
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: [{
        option_number: {
            type: Number,
            required: true
        },
        option: {
            type: String,
            required: true
        },
        option_image: {
            type: String, 
            default: ''
        }
    }],
    correctAnswers: [{
        type: String,
        required: true
    }],
    positive_marks: {
        type: String,
        required: true
    },
    negative_marks: {
        type: String,
        required: true
    },
    question_number: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
    }
}, { timestamps: true });

// Define the schema for the test paper
const testSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    questions: [questionSchema],
    timeLimit: {
        type: Number, // time limit in minutes
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    tags: [{
        type: String,
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    attemptedUser:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    solvedUser:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]

}, { timestamps: true });

export const Test = mongoose.model("Test", testSchema)
