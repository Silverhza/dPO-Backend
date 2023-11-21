const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    profilePic: {
      type: String,
    },
    gender: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    companyTitle: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    language: {
      type: String,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    bio: {
      type: String,
    },
    emergencyFirstName: {
      type: String,
    },
    emergencyLastName: {
      type: String,
    },
    emergencyPhone: {
      type: String,
    },
    emergencyEmail: {
      type: String,
    },
    emergencyRelationship: {
      type: String,
    },
    emergencyLanguage: {
      type: String,
    },
    emergencyStreet: {
      type: String,
    },
    emergencyCity: {
      type: String,
    },
    emergencyState: {
      type: String,
    },
    emergencyZipCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const PersonalInfo = mongoose.model('Personal Info', personalInfoSchema);

module.exports = PersonalInfo;
