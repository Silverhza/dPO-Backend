const express = require('express');
const { check } = require('express-validator');

const spaceController = require('../controllers/space-controller');
const spaceUpload = require('../helpers/space-upload');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/space/:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get spaces
 *     tags: [Space]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', auth, spaceController.getSpaces);

/**
 * @swagger
 * /api/v1/space/:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Add Space
 *     tags: [Space]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *            type: object
 *            properties:
 *              spaces_imgs:
 *                type: string
 *                format: binary
 *              name:
 *                type: string
 *                example: Sample space
 *              address:
 *                type: string
 *                example: Canada Line - SkyTrain, Metro Vancouver, BC, Canada
 *              dayRate:
 *                type: integer
 *                example: '17'
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/',
  auth,
  spaceUpload.any('spaces_imgs'),
  [
    check('name').not().isEmpty(),
    check('address').not().isEmpty(),
    check('dayRate').isInt().not().isEmpty(),
  ],
  spaceController.addSpace
);

module.exports = router;
