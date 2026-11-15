const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageURL: {
    type: String,
    required: true,
    default: 'myface.jpeg'
  },
  imageCloudinaryId: {
    type: String,
    default: null
  },
  cvURL: {
    type: String,
    default: '/Valen-Jehaut.pdf'
  },
  cvCloudinaryId: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: 'Valentino Jehaut',
    trim: true
  },
  fullName: {
    type: String,
    default: 'Valentino Yudhistira Jehaut',
    trim: true
  },
  location: {
    type: String,
    default: 'Bali, Indonesia',
    trim: true
  },
  email: {
    type: String,
    default: 'valentinojehaut@gmail.com',
    trim: true
  },
  heroHeadline: {
    type: String,
    default: 'I design and build digital products 💻📱.',
    trim: true
  },
  heroSubheadline: {
    type: String,
    default: 'I turn ideas into useful digital products through design and development.',
    trim: true
  },
  yearsExperience: {
    type: String,
    default: '4+',
    trim: true
  },
  yearsExperienceLabel: {
    type: String,
    default: 'Years of experience',
    trim: true
  },
  selectedProjectsLabel: {
    type: String,
    default: 'Selected projects',
    trim: true
  },
  degreesCount: {
    type: String,
    default: '02',
    trim: true
  },
  degreesLabel: {
    type: String,
    default: 'Bachelor’s degrees',
    trim: true
  },
  workProcessSubtitle: {
    type: String,
    default: 'I combine design thinking with spec-driven development—from research and prototyping through structured engineering, automated testing, and iterative delivery.',
    trim: true
  },
  resumeSummary: {
    type: String,
    default: 'Bali-based web developer and UI/UX designer. React, TypeScript, WordPress, and Figma.',
    trim: true
  },
  contactHeading: {
    type: String,
    default: 'Tell me about your project',
    trim: true
  },
  contactSubtext: {
    type: String,
    default: 'Send me your project details or ask a question. I will reply by email.',
    trim: true
  },
  footerCtaHeading: {
    type: String,
    default: 'Let’s build something thoughtful together.',
    trim: true
  },
  footerBio: {
    type: String,
    default: 'UI/UX designer & full-stack product developer crafting fast, accessible web experiences.',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models?.About || mongoose.model('About', aboutSchema);
