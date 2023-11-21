const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
