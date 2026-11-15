const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
    },
    handle: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    actionLabel: {
      type: String,
      default: 'Connect',
      trim: true,
    },
    icon: {
      type: String,
      default: 'globe',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

socialLinkSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.models?.SocialLink || mongoose.model('SocialLink', socialLinkSchema);

