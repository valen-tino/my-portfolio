const mongoose = require('mongoose');

const techToolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
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
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TechTool', techToolSchema);
