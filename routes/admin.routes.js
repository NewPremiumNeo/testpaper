import express from 'express';
import { Test } from '../models/test.model.js';
import { User } from '../models/user.model.js';
import { createTest } from '../controllers/admin.controller.js'
import { verifyJWT, verifyJWTAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get('/', verifyJWTAdmin, async  function (req, res, next) {
    const users = await User.find();
    const tests = await Test.find();
    res.render('admin', {users,tests});
});
router.get('/test/create', verifyJWTAdmin, function (req, res, next) {
    res.render('adminExam');
});

router.post('/test/create', verifyJWTAdmin, createTest);


// GET route to render admin users page
router.get('/users', verifyJWTAdmin, async (req, res) => {
    const { search } = req.query;
    if (search) {
        try {
            const users = await User.find({
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { fullName: { $regex: search, $options: 'i' } }
                ]
            }, 'fullName email mobile dob isAdmin roles solvedPapers');

            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        try {
            let users = await User.find({}, 'fullName email mobile dob isAdmin roles solvedPapers');
            const errorMessage = req.flash('error');
            const successMessage = req.flash('success');
            res.render('adminUsers', { users, successMessage, errorMessage });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    }
});

// POST route to update user details
router.post('/users/:userId', verifyJWTAdmin, async (req, res) => {
    const { fullName, email, mobile, dob, newPassword, isAdmin } = req.body;
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if ( !fullName || !email || !mobile || !isAdmin) {
            req.flash('error', 'Some Important Credintial Missing');
            return res.redirect('/admin/users');
        }
        user.fullName = fullName;
        user.email = email;
        user.mobile = mobile;
        user.dob = dob;
        user.isAdmin = isAdmin;

        await user.save();

        req.flash('success', 'User details updated successfully');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to update user details');
        res.redirect('/admin/users');
    }
});

export default router
