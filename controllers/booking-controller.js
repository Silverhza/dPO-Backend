const Booking = require('../models/booking');
const User = require('../models/user');
const Space = require('../models/space');
const { USER_ROLES, MINIMUM_BOOKING_GAP, ONE_DAY } = require('../constants/index');
const { generateRandomCode } = require('../helpers/utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const spaceId = req.params.spaceId;
    const { startDate, endDate, quantity } = req.body;

    // Check if the user exists and has the 'renter' role
    const user = await User.findById(userId);
    if (!user || user.role !== USER_ROLES.renter) {
      return res.status(400).json({ error: 'Invalid user or user role' });
    }

    // Check if the space exists
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    // Validate start and end dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (startDateTime >= endDateTime || endDateTime - startDateTime < MINIMUM_BOOKING_GAP) {
      // At least 1 day difference required
      return res.status(400).json({ error: 'Invalid start or end date/time' });
    }

    const currentDate = new Date();

    if (startDateTime < currentDate || endDateTime < currentDate) {
      return res.status(400).json({ error: 'Start and end dates cannot be in the past' });
    }

    // Check if the space is already booked for the specified date range
    const existingBooking = await Booking.findOne({
      space: spaceId,
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ error: 'Space is already booked for the specified date range' });
    }

    // Calculate the number of days
    const numberOfDays = Math.ceil((endDateTime - startDateTime) / ONE_DAY);

    // Calculate the total
    const total = space.dayRate * quantity * numberOfDays;

    // Create a new booking
    const booking = new Booking({
      confirmationCode: generateRandomCode(12),
      renter: userId,
      space: spaceId,
      startDate,
      endDate,
      price: space.dayRate,
      quantity,
      numberOfDays,
      serviceFee: 0,
      tax: 0,
      total,
    });

    // Save the booking to the database
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listBookings = async (req, res) => {
  try {
    const { filter } = req.query;
    const userId = req.userId;

    // Define date for the current moment
    const currentDate = new Date();

    // Define query conditions based on the filter
    let query = {};

    switch (filter) {
      case 'upcoming':
        query = {
          renter: userId,
          startDate: { $gte: currentDate },
        };
        break;
      case 'current':
        query = {
          renter: userId,
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        };
        break;
      case 'past':
        query = {
          renter: userId,
          endDate: { $lt: currentDate },
        };
        break;
      default:
        // No filter or invalid filter provided, return all bookings for the user
        query = { renter: userId };
        break;
    }

    // Retrieve bookings based on the query conditions
    const bookings = await Booking.find(query)
      .populate('space') // Populate the space details if needed
      .exec();

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const initiatePayment = async (req, res) => {
  try {
    const { bookingId, amount, currency, paymentMethod } = req.body;

    // Check if the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in cents
      currency: currency,
      payment_method: paymentMethod,
      confirm: true,
    });

    // Store the payment intent ID in the booking (this is a mock, actual implementation might differ)
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res
      .status(201)
      .json({ message: 'Payment initiated successfully', paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPaymentIntentDetails = async (req, res) => {
  const paymentIntentId = req.body.paymentIntentId;

  if (!paymentIntentId) {
    return res.status(400).send({ error: 'paymentIntentId is required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.status(201).json(paymentIntent);
  } catch (error) {
    console.error('Error fetching PaymentIntent:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

const listCharges = async (req, res) => {
  try {
    const charges = await stripe.charges.list({
      // limit: 10, // Get first 10 charges
      // created: {
      //     // Check for charges in the last 24 hours
      //     gte: Math.floor((Date.now() / 1000) - 24*60*60)
      // }
    });
    for (let charge of charges.data) {
      console.log(
        `Charge ID: ${charge.id}, Amount: ${charge.amount / 100}, Currency: ${charge.currency}`
      );
    }
    res.status(200).json(charges.data);
  } catch (error) {
    console.error('Error fetching charges:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

exports.createBooking = createBooking;
exports.listBookings = listBookings;
exports.initiatePayment = initiatePayment;
exports.getPaymentIntentDetails = getPaymentIntentDetails;
exports.listCharges = listCharges;
