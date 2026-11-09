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
    default: ''
  },
  imageCloudinaryId: {
    type: String,
    default: null
  },
  videoURL: {
    type: String,
    default: null
  },
  videoCloudinaryId: {
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
  },
  // Year & Work Experience Link
  year: {
    type: String,
    default: null,
    trim: true
  },
  relatedExperience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience',
    default: null
  },
  relatedExperienceCompany: {
    type: String,
    default: null,
    trim: true
  },
  // Educational Background Link
  relatedEducation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Education',
    default: null
  },
  relatedEducationInstitution: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
