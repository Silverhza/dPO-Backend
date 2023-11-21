const express = require('express');

const connectionController = require('../controllers/connection-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/connection/:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: List all connections
 *     tags: [Connection]
 *     responses:
 *       200:
 *         description: Returns a list of all connections
 */
router.get('/', auth, connectionController.listConnections);

/**
 * @swagger
 * /api/v1/connection/send-request/{recipientId}:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Send a connection request
 *     tags: [Connection]
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         description: ID of the recipient user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 */
router.post('/send-request/:recipientId', auth, connectionController.sendRequest);

/**
 * @swagger
 * /api/v1/connection/approve-request/{senderId}:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Approve a connection request
 *     tags: [Connection]
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         description: ID of the sender user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request approved successfully
 */
router.post('/approve-request/:senderId', auth, connectionController.approveRequest);
// router.post('/search/')

module.exports = router;
