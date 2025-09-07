const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: 'info' // Default DaisyUI color class
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add index for order
RoleSchema.index({ order: 1 });

module.exports = mongoose.model('Role', RoleSchema);
