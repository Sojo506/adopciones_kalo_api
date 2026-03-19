const express = require('express');
const accountController = require('../controllers/accountController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, accountController.getAccounts);
router.get(
    '/:idCuenta',
    authenticateToken,
    requireAdmin,
    accountController.accountIdValidation,
    accountController.getAccountById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    accountController.createAccountValidation,
    accountController.createAccount
);
router.put(
    '/:idCuenta',
    authenticateToken,
    requireAdmin,
    [...accountController.accountIdValidation, ...accountController.updateAccountValidation],
    accountController.updateAccount
);
router.delete(
    '/:idCuenta',
    authenticateToken,
    requireAdmin,
    accountController.accountIdValidation,
    accountController.deleteAccount
);

module.exports = router;
