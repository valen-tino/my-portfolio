const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  projectDetails: {
    type: String,
    default: '',
    trim: true
  },
  linkTo: {
    type: String,
    default: '',
    trim: true
  },
  imageURL: {
    type: String,
    required: true
  },
  imageCloudinaryId: {
    type: String,
    default: null
  },
  tech: [{
    type: String,
    trim: true
  }],
  roles: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
