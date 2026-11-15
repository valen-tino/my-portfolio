const mongoose = require('mongoose');

const WorkProcessSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
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
  timestamps: true
});

WorkProcessSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.models?.WorkProcess || mongoose.model('WorkProcess', WorkProcessSchema);

