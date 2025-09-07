const express = require('express');
const TechTool = require('../models/TechTool');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const router = express.Router();

// @route   GET /api/tech-tools
// @desc    Get all tech tools
// @access  Public
router.get('/', async (req, res) => {
  try {
    const techTools = await TechTool.find().sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      data: techTools
    });
  } catch (error) {
    console.error('Get tech tools error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tech tools'
    });
  }
});

// @route   POST /api/tech-tools
// @desc    Create tech tool
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, imageURL, imageCloudinaryId, order } = req.body;

    if (!title || !imageURL) {
      return res.status(400).json({
        success: false,
        message: 'Title and image URL are required'
      });
    }

    const techTool = new TechTool({
      title,
      imageURL,
      imageCloudinaryId,
      order: order || 0
    });

    await techTool.save();

    res.status(201).json({
      success: true,
      message: 'Tech tool created successfully',
      data: techTool
    });
  } catch (error) {
    console.error('Create tech tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tech tool'
    });
  }
});

// @route   PUT /api/tech-tools/:id
// @desc    Update tech tool
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, imageURL, imageCloudinaryId, order } = req.body;
    
    const techTool = await TechTool.findById(req.params.id);
    if (!techTool) {
      return res.status(404).json({
        success: false,
        message: 'Tech tool not found'
      });
    }

    // Delete old image if new image is provided
    if (imageURL !== techTool.imageURL && techTool.imageCloudinaryId) {
      try {
        await deleteImage(techTool.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    techTool.title = title || techTool.title;
    techTool.imageURL = imageURL || techTool.imageURL;
    techTool.imageCloudinaryId = imageCloudinaryId || techTool.imageCloudinaryId;
    techTool.order = order !== undefined ? order : techTool.order;

    await techTool.save();

    res.json({
      success: true,
      message: 'Tech tool updated successfully',
      data: techTool
    });
  } catch (error) {
    console.error('Update tech tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tech tool'
    });
  }
});

// @route   DELETE /api/tech-tools/:id
// @desc    Delete tech tool
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const techTool = await TechTool.findById(req.params.id);
    if (!techTool) {
      return res.status(404).json({
        success: false,
        message: 'Tech tool not found'
      });
    }

    // Delete image from Cloudinary
    if (techTool.imageCloudinaryId) {
      try {
        await deleteImage(techTool.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await TechTool.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tech tool deleted successfully'
    });
  } catch (error) {
    console.error('Delete tech tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tech tool'
    });
  }
});

module.exports = router;
