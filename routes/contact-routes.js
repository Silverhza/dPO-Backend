const express = require('express');
const { check } = require('express-validator');

const contactController = require('../controllers/contact-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/contactus/:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Create a new contact
 *     tags:
 *       - Contacts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - details
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Invalid request body
 */
router.post('/', auth, contactController.createContact);

/**
 * @swagger
 * /api/v1/contactus/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get a single contact by ID
 *     tags:
 *       - Contacts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the contact to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact fetched successfully
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, contactController.getContactById);

/**
 * @swagger
 * /api/v1/contactus/all:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get all contacts
 *     tags:
 *       - Contacts
 *     responses:
 *       200:
 *         description: List of all contacts
 *       500:
 *         description: Server error
 */
router.get('/all', auth, contactController.getAllContacts);

module.exports = router;
