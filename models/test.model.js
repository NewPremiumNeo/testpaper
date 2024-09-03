import mongoose from "mongoose";
import { type } from "os";

// 1. Product Line Schema
const productLineSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    public: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });


// 2. Course Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    productLine: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductLine', required: true },
    test: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    public: { type: Boolean, default: false },
    // sysId: { type: String, default: uuidv4, unique: true },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

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
    },
    active: { type: Boolean, default: true },
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
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    date: { type: Date },
    // course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    // date: { type: Date, required: true },
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
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    attemptedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    solvedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]

}, { timestamps: true });

const ProductLine = mongoose.model('ProductLine', productLineSchema);
const Course = mongoose.model('Course', courseSchema);

export const Test = mongoose.model("Test", testSchema)
