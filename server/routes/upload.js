const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { uploadProfile, uploadPortfolio, uploadTechTool, deleteImage } = require('../config/cloudinary');
const router = express.Router();

// @route   POST /api/upload/profile
// @desc    Upload profile image
// @access  Private
router.post('/profile', authMiddleware, uploadProfile.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageURL: req.file.path,
        imageCloudinaryId: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// @route   POST /api/upload/portfolio
// @desc    Upload portfolio image
// @access  Private
router.post('/portfolio', authMiddleware, uploadPortfolio.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio image uploaded successfully',
      data: {
        imageURL: req.file.path,
        imageCloudinaryId: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload portfolio image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// @route   POST /api/upload/tech-tool
// @desc    Upload tech tool icon
// @access  Private
router.post('/tech-tool', authMiddleware, uploadTechTool.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Tech tool icon uploaded successfully',
      data: {
        imageURL: req.file.path,
        imageCloudinaryId: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload tech tool icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// @route   POST /api/upload/experience
// @desc    Upload experience logo
// @access  Private
router.post('/experience', authMiddleware, uploadTechTool.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Experience logo uploaded successfully',
      data: {
        imageURL: req.file.path,
        imageCloudinaryId: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload experience logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// @route   DELETE /api/upload/:cloudinaryId
// @desc    Delete image from Cloudinary
// @access  Private
router.delete('/:cloudinaryId', authMiddleware, async (req, res) => {
  try {
    const { cloudinaryId } = req.params;
    
    if (!cloudinaryId) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary ID is required'
      });
    }

    const result = await deleteImage(cloudinaryId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image deletion'
    });
  }
});

module.exports = router;
