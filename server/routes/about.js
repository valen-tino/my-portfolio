const express = require('express');
const About = require('../models/About');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const router = express.Router();

// @route   GET /api/about
// @desc    Get about data
// @access  Public
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    
    // If no about data exists, create default
    if (!about) {
      about = new About({
        description: `Well, name's Valentino Yudhistira Jehaut (A.k.a Valen) and nice to know you!\n\nI'm 20 years old now and currently living in Bali, Indonesia. I just graduated from SMK TI Bali Global Denpasar majoring in Software Engineering and currently pursuing Double Bachelor's Degree in Information Systems (ITB Stikom Bali) & Information Technology (HELP University)\n\nI've had experience as a web developer for more than 2.5 years now and as a UI/UX Designer for more than a year. At that time, i'm always curious and open to trying new technologies just to enhance my skills so that i didn't miss out on the current trends.\n\nNow, i'm currently as a UI/UX Designer & Part-time Web Developer at Bendega.id, a Web Developer at Bali Mountain Retreat and Mashup R Japan.`,
        imageURL: 'myface.jpeg'
      });
      await about.save();
    }

    res.json({
      success: true,
      data: about
    });
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching about data'
    });
  }
});

// @route   PUT /api/about
// @desc    Update about data
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { description, imageURL, imageCloudinaryId } = req.body;

    // Validation
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    let about = await About.findOne();
    
    if (about) {
      // If image is being updated and old image exists in cloudinary, delete it
      if (imageURL !== about.imageURL && about.imageCloudinaryId) {
        try {
          await deleteImage(about.imageCloudinaryId);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
          // Continue with update even if delete fails
        }
      }

      // Update existing
      about.description = description;
      if (imageURL) about.imageURL = imageURL;
      if (imageCloudinaryId) about.imageCloudinaryId = imageCloudinaryId;
      
      await about.save();
    } else {
      // Create new
      about = new About({
        description,
        imageURL: imageURL || 'myface.jpeg',
        imageCloudinaryId: imageCloudinaryId || null
      });
      await about.save();
    }

    res.json({
      success: true,
      message: 'About section updated successfully',
      data: about
    });
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating about data'
    });
  }
});

module.exports = router;
