const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  institution: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  link: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Education', educationSchema);
