const express = require('express');
const questionController = require('../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', questionController.getQuestions);
router.get(
    '/:idPregunta',
    questionController.questionIdValidation,
    questionController.getQuestionById
);
router.post('/', questionController.questionValidation, questionController.createQuestion);
router.put(
    '/:idPregunta',
    [...questionController.questionIdValidation, ...questionController.questionValidation],
    questionController.updateQuestion
);
router.delete(
    '/:idPregunta',
    questionController.questionIdValidation,
    questionController.deleteQuestion
);

module.exports = router;
