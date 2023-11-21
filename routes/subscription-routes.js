const express = require('express');
const { check } = require('express-validator');

const subscriptionController = require('../controllers/subscription-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/subscription/newsletter:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Create a new subscription for newsletter
 *     tags:
 *       - Subscriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: subscription created successfully
 *       400:
 *         description: Invalid request body
 */
router.post('/newsletter', auth, subscriptionController.createSubscription);
module.exports = router;

//@todo: add verification route
//@todo: add unsubscribe route
