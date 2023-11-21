const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    companyPic: {
      type: String,
    },
    companyName: {
      type: String,
    },
    DBAName: {
      type: String,
    },
    contactFirstName: {
      type: String,
    },
    contactLastName: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    businessType: {
      type: String,
    },
    FEIN: {
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
    USDOT: {
      type: String,
    },
    employees: {
      type: Number,
    },
    drivers: {
      type: Number,
    },
    insuranceDoc: {
      type: String,
    },
    providerName: {
      type: String,
    },
    providerPhone: {
      type: String,
    },
    policyNumber: {
      type: String,
    },
    policyStartDate: {
      type: Date,
    },
    policyEndDate: {
      type: Date,
    },
    policyStreetAddress: {
      type: String,
    },
    policyCity: {
      type: String,
    },
    policyState: {
      type: String,
    },
    policyZipCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model('Company Profile', companySchema);

module.exports = CompanyProfile;
