const express = require('express');

const bookingController = require('../controllers/booking-controller');

const auth = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/booking/:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Bookings
 *     description: Get a list of bookings for a user.
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [upcoming, current, past]
 *         description: Filter the bookings by their status.
 *     responses:
 *       200:
 *         description: A list of bookings.
 *       500:
 *         description: Internal server error.
 */
router.get('/', auth, bookingController.listBookings);

/**
 * @swagger
 * /api/v1/booking/payments:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Bookings
 *     description: Initiate payment for a booking.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *             example:
 *               bookingId: 64f79d13de627ea40be7bc8b
 *               amount: 500
 *               currency: gbp
 *               paymentMethod: pm_card_visa
 *     responses:
 *       201:
 *         description: Payment initiated successfully.
 *       400:
 *         description: Invalid input or other client error.
 *       500:
 *         description: Internal server error.
 */
router.post('/payments', auth, bookingController.initiatePayment);

/**
 * @swagger
 * /api/v1/booking/check-payment-detail:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Bookings
 *     description: getPaymentIntentDetails.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *             example:
 *               paymentIntentId: pi_3NroGcGK6Yb1Azu3151rb6mu
 *     responses:
 *       201:
 *         description: Payment initiated successfully.
 *       400:
 *         description: Invalid input or other client error.
 *       500:
 *         description: Internal server error.
 */
router.post('/check-payment-detail', auth, bookingController.getPaymentIntentDetails);

/**
 * @swagger
 * /api/v1/booking/get-payment-list:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Bookings
 *     description: listCharges.
 *     responses:
 *       201:
 *         description: Payment initiated successfully.
 *       400:
 *         description: Invalid input or other client error.
 *       500:
 *         description: Internal server error.
 */
router.post('/get-payment-list', auth, bookingController.listCharges);

/**
 * @swagger
 * /api/v1/booking/{spaceId}:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Bookings
 *     description: Create a new booking for a space.
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the space to book.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking successfully created.
 *       400:
 *         description: Invalid input or other client error.
 *       500:
 *         description: Internal server error.
 */
router.post('/:spaceId', auth, bookingController.createBooking);

module.exports = router;
