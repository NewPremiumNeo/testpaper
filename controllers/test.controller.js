import { Test } from "../models/test.model.js";
import { User } from "../models/user.model.js";

const renderTestPage = async (req, res) => {
    try {
        const userId = req.user._id;
        const test = await Test.findById(req.params.id).populate('questions');
        if (!test) {
            return res.status(404).send('Test not found');
        }
        if (!test.attemptedUser.includes(userId)) {
            test.attemptedUser.push(userId);
        }
        res.render('exam', { test });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const saveTestPage = async (req, res) => {
    try {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@") 
        const userId = req.user._id; 
        const testAttemptData = req.body.testAttemptData;
        const testId = req.params.id;
        console.log(testAttemptData);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingPaperIndex = user.solvedPapers.findIndex(paper => paper.testId.toString() === testId);

        if (existingPaperIndex !== -1) {
            user.solvedPapers[existingPaperIndex].testAttemptData = JSON.stringify(testAttemptData);
        } else {
            const newSolvedPaper = {
                testId: testId,
                testAttemptData: JSON.stringify(testAttemptData) 
            };
            user.solvedPapers.push(newSolvedPaper);
        }

        await user.save();

        const response = {
            status: 'success',
            message: 'Test attempt data saved successfully'
        };
        res.json(response);
    } catch (error) {
        console.error("Error ", error.message)
        res.status(500).json({ error: error.message });
    }
};


const postTestPage = async (req, res) => {
    try {
        const userId = req.user._id;
        const test = await Test.findById(req.params.id).populate('questions');
        
        if (!test) {
            return res.status(404).send('Test not found');
        }

        if (!test.attemptedUser.includes(userId)) {
            test.attemptedUser.push(userId);
            await test.save();
        }

        const testSections = test.questions.map((question, index) => ({
            question: question.questionText,
            question_type: question.type,
            answer: question.correctAnswers[0],
            negative_marks: question.negative_marks,
            positive_marks: question.positive_marks,
            question_number: question.question_number, // Make sure this is a string
            options: question.options.map((option, optionIndex) => ({
                option: option.option,
                option_number: optionIndex + 1,
                option_image: option.option_image || "",
                selected: false
            })),
            question_id: question._id,
            state: "1",
            answered: false,
            visited: false,
            time_consumed: 0
        }));

        const response = {
            marks: test.totalMarks,
            questions: testSections.length,
            time: test.timeLimit,
            title: test.title,
            test_sections: [
                {
                    questions: testSections,
                    section_title: "NULL",
                    time_remaining: 0,
                    total_questions: testSections.length,
                }
            ],
            time_remaining: test.timeLimit * 60,
            current_section_position: 0,
            current_question_position: 0,
            is_test_ended: false,
            test_id: req.params.id
        };

        res.json(response);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};



const submitTest = async (req, res) => {
    try {
        const { testId, answers } = req.body;
        const userId = req.user._id;

        // Fetch the test
        const test = await Test.findById(testId).populate('questions');
        if (!test) {
            return res.status(404).send('Test not found');
        }

        // Process the answers
        let score = 0;
        let marks = test.totalMarks/test.questions.length;
        test.questions.forEach((question) => {
            const userAnswer = answers[question._id] || [];
            const correctAnswer = question.correctAnswers || [];
            if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                const userAnswerSorted = userAnswer.sort();
                const correctAnswerSorted = correctAnswer.sort();

                if (JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted)) {
                    score += marks;
                }
            } else if (userAnswer === correctAnswer[0]) {
                score += marks;
            }
        });
        score = Math.ceil(score)

        // Save the user's solved paper
        const solvedPaper = {
            testId: testId,
            score: score,
            totalMarks: test.totalMarks,
            date: new Date(),
            duration: test.timeLimit // Assuming you want to save the duration as well
        };

        const user = await User.findById(userId);
        
        // Check if the user already solved the paper
        const existingPaperIndex = user.solvedPapers.findIndex(paper => paper.testId.toString() === testId);
        
        if (existingPaperIndex !== -1) {
            // If the paper was already solved, update the existing record
            user.solvedPapers[existingPaperIndex] = solvedPaper;
        } else {
            // If not solved, push the new solved paper
            user.solvedPapers.push(solvedPaper);
        }
        
        await user.save();

        if (!test.solvedUser.includes(userId)) {
            test.solvedUser.push(userId);
        }
        await test.save();

        return res.render('result', {score, totalMarks: test.totalMarks})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export { renderTestPage, submitTest, postTestPage, saveTestPage };
