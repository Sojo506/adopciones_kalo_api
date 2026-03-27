const express = require('express');
const userController = require('../controllers/userController');
const profileController = require('../controllers/profileController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/me', authenticateToken, userController.getMe);
router.get('/profile', authenticateToken, profileController.getCurrentProfile);
router.get('/profile/follow-ups', authenticateToken, profileController.getCurrentProfileFollowUps);
router.put(
    '/profile',
    authenticateToken,
    profileController.updateCurrentProfileValidation,
    profileController.updateCurrentProfile
);
router.post(
    '/profile/email/request-change',
    authenticateToken,
    profileController.requestCurrentEmailChangeValidation,
    profileController.requestCurrentEmailChange
);
router.post(
    '/profile/email/confirm-change',
    authenticateToken,
    profileController.confirmCurrentEmailChangeValidation,
    profileController.confirmCurrentEmailChange
);
router.post(
    '/profile/password/request-change',
    authenticateToken,
    profileController.requestCurrentPasswordChangeValidation,
    profileController.requestCurrentPasswordChange
);
router.post(
    '/profile/password/confirm-change',
    authenticateToken,
    profileController.confirmCurrentPasswordChangeValidation,
    profileController.confirmCurrentPasswordChange
);
router.get('/', authenticateToken, requireAdmin, userController.getUsers);
router.get('/:identificacion', authenticateToken, requireAdmin, userController.getUserByIdentification);
router.post('/', authenticateToken, requireAdmin, userController.dashboardUserValidation, userController.createDashboardUser);
router.post('/register', userController.signUpValidation, userController.signUp);
router.post('/login', userController.signInValidation, userController.signIn);
router.post('/refresh', userController.refreshSession);
router.post('/logout', userController.logout);
router.post('/verify-email', userController.verifyEmailValidation, userController.verifyEmail);
router.post('/resend-verification-email', userController.resendVerificationEmailValidation, userController.resendVerificationEmail);
router.put('/:identificacion', authenticateToken, requireAdmin, userController.dashboardUserUpdateValidation, userController.updateDashboardUser);
router.delete('/:identificacion', authenticateToken, requireAdmin, userController.deleteDashboardUser);

module.exports = router;
