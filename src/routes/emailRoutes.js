const express = require('express');
const emailController = require('../controllers/emailController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, emailController.getEmails);
router.get(
    '/:identificacion/:correo',
    authenticateToken,
    requireAdmin,
    emailController.emailKeyValidation,
    emailController.getEmailByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    emailController.createEmailValidation,
    emailController.createEmail
);
router.put(
    '/:identificacion/:correo',
    authenticateToken,
    requireAdmin,
    [...emailController.emailKeyValidation, ...emailController.updateEmailValidation],
    emailController.updateEmail
);
router.delete(
    '/:identificacion/:correo',
    authenticateToken,
    requireAdmin,
    emailController.emailKeyValidation,
    emailController.deleteEmail
);

module.exports = router;
