const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/me', authenticateToken, userController.getMe);
router.post('/register', userController.signUpValidation, userController.signUp);
router.post('/login', userController.signInValidation, userController.signIn);
router.post('/verify-email', userController.verifyEmailValidation, userController.verifyEmail);
router.post('/resend-verification-email', userController.resendVerificationEmailValidation, userController.resendVerificationEmail);

module.exports = router;
