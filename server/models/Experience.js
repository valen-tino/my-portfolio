const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Experience title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Current', 'Past', 'Contract', 'Internship', 'Freelance', 'Volunteer'],
    default: 'Past'
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    default: null
  },
  duration: {
    type: String,
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters'],
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logoURL: {
    type: String,
    default: '',
    trim: true
  },
  logoCloudinaryId: {
    type: String,
    default: '',
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
experienceSchema.index({ order: 1, createdAt: -1 });
experienceSchema.index({ isPublished: 1 });
experienceSchema.index({ status: 1 });

// Virtual for formatted status
experienceSchema.virtual('formattedStatus').get(function() {
  const statusColors = {
    'Current': 'success',
    'Past': 'neutral',
    'Contract': 'info',
    'Internship': 'warning',
    'Freelance': 'accent',
    'Volunteer': 'secondary'
  };
  return {
    text: this.status,
    color: statusColors[this.status] || 'neutral'
  };
});

// Static method to get experiences sorted by order and date
experienceSchema.statics.getOrderedExperiences = function(publishedOnly = false) {
  const query = publishedOnly ? { isPublished: true } : {};
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

// Instance method to check if experience is current
experienceSchema.methods.isCurrent = function() {
  return this.status === 'Current';
};

module.exports = mongoose.model('Experience', experienceSchema);
