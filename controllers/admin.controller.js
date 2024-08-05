import { Test } from "../models/test.model.js";


const createTest = async (req, res) => {
    try {
        // Destructure data from the request body
        const {
            marks,
            questionsCount,
            time,
            title,
            description,
            questions
        } = req.body;

        // Create a new test object
        const newTest = new Test({
            title,
            description,
            totalMarks:marks,
            timeLimit: time,
            createdBy: req.user._id,

            questions: questions.map(q => ({
                    type: q.question_type, // assuming you have question_type in the body
                    questionText: q.question,
                    options: q.options.map(opt => ({
                        option_number: opt.option_number,
                        option: opt.option,
                        option_image: opt.option_image || '' // handle if image is optional
                    })),
                    correctAnswers: [q.answer], // assuming answer is the correct option number
                    positive_marks: q.positive_marks,
                    negative_marks: q.negative_marks,
                    question_number: q.question_number,
                    explanation: q.explanation || '' // handle optional explanation
                }))
        });

        // Save the test to the database
        await newTest.save();
        res.status(201).json({ message: 'Test created successfully', test: newTest });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ message: 'Failed to create test', error: error.message });
    }
};

export { createTest };
