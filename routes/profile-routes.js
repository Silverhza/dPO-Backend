const express = require('express');

const profileController = require('../controllers/profile-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/profile/{userId}/overview/header:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Retrieve the profile of the user
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user.
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:userId/overview/header', auth, profileController.overviewHeader);

/**
 * @swagger
 * /api/v1/profile/{userId}/overview/info:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Retrieve the profile info of the user
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user.
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:userId/overview/info', auth, profileController.overviewInfo);

/**
 * @swagger
 * /api/v1/profile/{userId}/renter-profile/:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Retrieve the profile info of the renter
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the renter.
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:userId/renter-profile/', auth, profileController.getRenterProfile);

module.exports = router;
