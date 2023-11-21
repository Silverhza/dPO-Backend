const express = require('express');
const { check } = require('express-validator');

const feedbackController = require('../controllers/feedback-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/feedback:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Create a feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - details
 *             properties:
 *               subject:
 *                 type: string
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Internal Server Error
 */

router.post('/', auth, feedbackController.createFeedback);

module.exports = router;
