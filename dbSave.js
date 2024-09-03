const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Install uuid package for generating GUIDs
const Schema = mongoose.Schema;

// 1. Product Line Schema
const productLineSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    public: { type: Boolean, default: false },
    sysId: { type: String, default: uuidv4, unique: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 2. Course Schema
const courseSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    productLine: { type: Schema.Types.ObjectId, ref: 'ProductLine', required: true },
    public: { type: Boolean, default: false },
    sysId: { type: String, default: uuidv4, unique: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 3. Exam Schema
const examSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    public: { type: Boolean, default: false },
    sysId: { type: String, default: uuidv4, unique: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 4. Question Schema (Reusable for MCQ and MSQ)
const questionSchema = new Schema({
    number: { type: Number, required: true }, // Question number or mark
    positiveMark: { type: Number, default: 1 }, // Default positive mark
    negativeMark: { type: Number, default: 0 }, // Default negative mark
    sequence: { type: Number, required: true }, // Order in which the question appears
    questionText: { type: String, required: true },
    description: { type: String }, // Additional details about the question
    type: { type: String, enum: ['MCQ', 'MSQ'], required: true },
    options: [{ text: String }],
    correctAnswers: [{ type: Number }], // Array of index(es) of correct options
    public: { type: Boolean, default: false },
    sysId: { type: String, default: uuidv4, unique: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

questionSchema.methods.isCorrect = function (selectedAnswers) {
    if (this.type === 'MCQ') {
        return selectedAnswers.length === 1 && this.correctAnswers.includes(selectedAnswers[0]);
    } else if (this.type === 'MSQ') {
        return selectedAnswers.length > 1 && selectedAnswers.every(answer => this.correctAnswers.includes(answer));
    }
    return false;
};

// Model creation
const ProductLine = mongoose.model('ProductLine', productLineSchema);
const Course = mongoose.model('Course', courseSchema);
const Exam = mongoose.model('Exam', examSchema);
const Question = mongoose.model('Question', questionSchema);

// Export models
module.exports = {
    ProductLine,
    Course,
    Exam,
    Question
};
