const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  confirmationCode: {
    type: String,
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  numberOfDays: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
