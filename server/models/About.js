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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('About', aboutSchema);
