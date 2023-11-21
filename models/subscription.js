const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
