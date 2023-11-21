const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    enum: ['renters', 'partners', 'others'],
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
});

const Support = mongoose.model('Support', supportSchema);

module.exports = Support;
