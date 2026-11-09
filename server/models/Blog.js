const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    index: true
  },
  desc: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['Event', 'Personal', 'News', 'Tech'],
    default: 'Personal',
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageURL: {
    type: String,
    default: ''
  },
  imageCloudinaryId: {
    type: String,
    default: null
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
    index: true
  },
  year: {
    type: String,
    default: null,
    trim: true,
    index: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  link: {
    type: String,
    default: '',
    trim: true
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  readTime: {
    type: String,
    default: '3 min read',
    trim: true
  },
  author: {
    type: String,
    default: 'Valentino Jehaut',
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save hook to derive year and slug
blogSchema.pre('save', function (next) {
  // Derive year if date is present
  if (this.date) {
    const parsedYear = String(this.date).match(/\b(19\d\d|20\d\d)\b/);
    if (parsedYear) {
      this.year = parsedYear[0];
    } else {
      const match = String(this.date).slice(0, 4);
      if (/^\d{4}$/.test(match)) {
        this.year = match;
      }
    }
  }

  // Derive slug if missing
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  next();
});

module.exports = mongoose.model('Blog', blogSchema);

