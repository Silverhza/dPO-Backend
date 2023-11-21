const express = require('express');

const auth = require('../middlewares/auth');

const supportController = require('../controllers/support-controller');

const router = express.Router();

/**
 * @swagger
 * /api/v1/support/:
 *   get:
 *     tags:
 *       - Support
 *     summary: Get all support questions.
 *     responses:
 *       200:
 *         description: A list of support questions.
 *       500:
 *         description: Internal server error.
 */
router.get('/', supportController.getAllQuestions);

/**
 * @swagger
 * /api/v1/support/tag/{tag}:
 *   get:
 *     tags:
 *       - Support
 *     summary: Get support questions by tag.
 *     parameters:
 *       - in: path
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *         description: Tag of the support question (e.g., renters, partners, others).
 *     responses:
 *       200:
 *         description: A list of support questions.
 *       500:
 *         description: Internal server error.
 */
router.get('/tag/:tag', supportController.getQuestionByTag);

/**
 * @swagger
 * /api/v1/support/search:
 *   get:
 *     tags:
 *       - Support
 *     summary: Search support questions by title.
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Keyword to search in the title.
 *     responses:
 *       200:
 *         description: A list of matched support questions.
 *       500:
 *         description: Internal server error.
 */
router.get('/search', supportController.searchQuestionByTitle);

/**
 * @swagger
 * /api/v1/support/:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Support
 *     summary: Add a new support question.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               tag:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Support question added successfully.
 *       500:
 *         description: Internal server error.
 */
router.post('/', auth, supportController.addQuestion);

/**
 * @swagger
 * /api/v1/support/{id}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Support
 *     summary: Delete a support question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the support question to delete.
 *     responses:
 *       204:
 *         description: Support question deleted successfully.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', auth, supportController.deleteQuestion);

module.exports = router;
