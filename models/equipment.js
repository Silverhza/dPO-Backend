const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    equipmentType: {
      type: String,
    },
    equipmentIdentity: {
      type: String,
    },
    equipmentLength: {
      type: String,
    },
    equipmentUnitNo: {
      type: String,
    },
    equipmentYear: {
      type: String,
    },
    equipmentMake: {
      type: String,
    },
    equipmentModel: {
      type: String,
    },
    equipmentColor: {
      type: String,
    },
    plateNo: {
      type: String,
    },
    plateState: {
      type: String,
    },
    chassis: {
      type: String,
    },
  },
  { timestamps: true }
);

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
