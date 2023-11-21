const express = require('express');

const reviewController = require('../controllers/review-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/review/:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: List all reviews
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: Returns a list of all reviews
 */
router.get('/', auth, reviewController.listReviews);

/**
 * @swagger
 * /api/v1/review/add-review/:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add a review
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               revieweeId: 64ee1c6598cf0925206aad75
 *               content: Good!
 *     responses:
 *       200:
 *         description: Review added successfully
 */
router.post('/add-review/', auth, reviewController.addReview);

module.exports = router;
