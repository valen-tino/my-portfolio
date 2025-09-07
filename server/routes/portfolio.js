const express = require('express');
const Portfolio = require('../models/Portfolio');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const router = express.Router();

// @route   GET /api/portfolio
// @desc    Get all portfolio items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { published } = req.query;
    const filter = published === 'true' ? { isPublished: true } : {};
    
    const portfolios = await Portfolio.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      data: portfolios
    });
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching portfolio data'
    });
  }
});

// @route   GET /api/portfolio/:id
// @desc    Get single portfolio item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching portfolio item'
    });
  }
});

// @route   POST /api/portfolio
// @desc    Create portfolio item
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, desc, projectDetails, linkTo, imageURL, imageCloudinaryId, tech, roles, order, isPublished } = req.body;

    if (!title || !desc || !imageURL) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and image URL are required'
      });
    }

    const portfolio = new Portfolio({
      title,
      desc,
      projectDetails: projectDetails || '',
      linkTo: linkTo || '',
      imageURL,
      imageCloudinaryId,
      tech: tech || [],
      roles: roles || [],
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    await portfolio.save();

    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating portfolio item'
    });
  }
});

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio item
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, desc, projectDetails, linkTo, imageURL, imageCloudinaryId, tech, roles, order, isPublished } = req.body;
    
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Delete old image if new image is provided
    if (imageURL !== portfolio.imageURL && portfolio.imageCloudinaryId) {
      try {
        await deleteImage(portfolio.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    portfolio.title = title || portfolio.title;
    portfolio.desc = desc || portfolio.desc;
    portfolio.projectDetails = projectDetails !== undefined ? projectDetails : portfolio.projectDetails;
    portfolio.linkTo = linkTo !== undefined ? linkTo : portfolio.linkTo;
    portfolio.imageURL = imageURL || portfolio.imageURL;
    portfolio.imageCloudinaryId = imageCloudinaryId || portfolio.imageCloudinaryId;
    portfolio.tech = tech || portfolio.tech;
    portfolio.roles = roles || portfolio.roles;
    portfolio.order = order !== undefined ? order : portfolio.order;
    portfolio.isPublished = isPublished !== undefined ? isPublished : portfolio.isPublished;

    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating portfolio item'
    });
  }
});

// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio item
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Delete image from Cloudinary
    if (portfolio.imageCloudinaryId) {
      try {
        await deleteImage(portfolio.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting portfolio item'
    });
  }
});

module.exports = router;
