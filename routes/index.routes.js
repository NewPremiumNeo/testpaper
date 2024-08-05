import express from 'express';
import { User } from '../models/user.model.js';
import { Test } from '../models/test.model.js';
import { verifyJWT, verifyUser } from "../middlewares/auth.middleware.js";
import { renderTestPage, submitTest, postTestPage, saveTestPage } from '../controllers/test.controller.js';
const router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
    try {
        const tests = await Test.find({}).populate('solvedUser'); // Populate solvedUser to get user details
        const user = await verifyUser(req);

        res.render('index', { tests, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/register', function (req, res, next) {
    res.render('register', { messages: req.flash('error') });
});

router.get('/login', function (req, res) {
    res.render('login', { messages: req.flash('error') });
});

router.get('/about', function (req, res, next) {
    res.render('about');
});

router.get('/test/:id', verifyJWT, renderTestPage);
router.get('/api/test/:id/data', verifyJWT, postTestPage);
router.post('/api/test/:id/data/save', verifyJWT, saveTestPage);

router.get('/test/:id/result', verifyJWT, async function (req, res, next) {
    const userId = req.user._id; 
    const testId = req.params.id; 
    const user = await User.findById(userId).populate('solvedPapers');
    res.render('result', {});
});

router.get('/api/test/:id/result', verifyJWT, async function (req, res, next) {
    try {
        const userId = req.user._id; 
        const testId = req.params.id; 
        const user = await User.findById(userId).populate('solvedPapers');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const solvedPaper = user.solvedPapers.find(paper => paper.testId.toString() === testId);
        if (!solvedPaper) {
            return res.status(404).json({ error: 'Test result not found' });
        }
        res.json(solvedPaper);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
});




// Route to handle test submission
router.post('/test/submit', verifyJWT, submitTest);




export default router
