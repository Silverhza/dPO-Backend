const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const PersonalInfo = require('./personal-info');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['Renter', 'Lister'],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    customerId: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    lastActive: {
      type: String,
      required: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    verified: { type: Boolean, default: false },
    personalInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'Personal Info' },
    connections: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastCommunication: { type: Date, default: null },
      },
    ],
    reviews: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who gave the review
        content: { type: String, required: true }, // Review content
        reviewTime: { type: Date, default: Date.now }, // Time the review was given
      },
    ],
  },

  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.isPasswordMatch = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.verifyOtp = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
