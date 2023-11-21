const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter plan name!'],
    },
    interval: {
      type: String,
      required: true,
    },
    interval_count: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter plan price!'],
    },
    productId: {
      type: String,
      required: true,
    },
    priceId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
