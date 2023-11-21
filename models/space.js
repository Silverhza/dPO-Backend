const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please enter space name!'],
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
    },
    rating: {
      type: Number,
    },
    dayRate: {
      type: Number,
      required: true,
    },
    images: [String],
  },
  { timestamps: true }
);

spaceSchema.index({ location: '2dsphere' });

const Space = mongoose.model('Space', spaceSchema);

module.exports = Space;
