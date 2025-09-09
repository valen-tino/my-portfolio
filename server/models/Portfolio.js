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
  },
  // Password protection
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null,
    trim: true
  },
  // Pinning feature
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
