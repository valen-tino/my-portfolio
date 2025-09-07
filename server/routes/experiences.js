const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Experience = require('../models/Experience');

const router = express.Router();

// @route   GET /api/experiences
// @desc    Get all experiences (public endpoint supports publishedOnly query)
// @access  Public/Private
router.get('/', async (req, res) => {
  try {
    const { published } = req.query;
    const publishedOnly = published === 'true';
    
    const experiences = await Experience.getOrderedExperiences(publishedOnly);
    
    res.json({
      success: true,
      message: `Retrieved ${experiences.length} experiences`,
      data: experiences
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching experiences'
    });
  }
});

// @route   GET /api/experiences/:id
// @desc    Get single experience by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Experience retrieved successfully',
      data: experience
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching experience'
    });
  }
});

// @route   POST /api/experiences
// @desc    Create new experience
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      status,
      companyName,
      startDate,
      endDate,
      duration,
      description,
      logoURL,
      logoCloudinaryId,
      order,
      isPublished
    } = req.body;

    // Validation
    if (!title || !companyName || !startDate || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, company name, start date, and description'
      });
    }

    const experience = new Experience({
      title: title.trim(),
      status: status || 'Past',
      companyName: companyName.trim(),
      startDate: new Date(startDate + '-01'), // Add day for month-year format
      endDate: endDate ? new Date(endDate + '-01') : null, // Add day for month-year format
      duration: duration || '', // Keep for backward compatibility
      description: description.trim(),
      logoURL: logoURL || '',
      logoCloudinaryId: logoCloudinaryId || '',
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    const savedExperience = await experience.save();

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: savedExperience
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating experience'
    });
  }
});

// @route   PUT /api/experiences/:id
// @desc    Update experience
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      status,
      companyName,
      startDate,
      endDate,
      duration,
      description,
      logoURL,
      logoCloudinaryId,
      order,
      isPublished
    } = req.body;

    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Update fields if provided
    if (title !== undefined) experience.title = title.trim();
    if (status !== undefined) experience.status = status;
    if (companyName !== undefined) experience.companyName = companyName.trim();
    if (startDate !== undefined) experience.startDate = new Date(startDate + '-01'); // Add day for month-year format
    if (endDate !== undefined) experience.endDate = endDate ? new Date(endDate + '-01') : null; // Add day for month-year format
    if (duration !== undefined) experience.duration = duration.trim();
    if (description !== undefined) experience.description = description.trim();
    if (logoURL !== undefined) experience.logoURL = logoURL;
    if (logoCloudinaryId !== undefined) experience.logoCloudinaryId = logoCloudinaryId;
    if (order !== undefined) experience.order = order;
    if (isPublished !== undefined) experience.isPublished = isPublished;

    const updatedExperience = await experience.save();

    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: updatedExperience
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating experience'
    });
  }
});

// @route   DELETE /api/experiences/:id
// @desc    Delete experience
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    await Experience.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting experience'
    });
  }
});

// @route   GET /api/experiences/stats
// @desc    Get experiences statistics
// @access  Private
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const total = await Experience.countDocuments();
    const published = await Experience.countDocuments({ isPublished: true });
    const current = await Experience.countDocuments({ status: 'Current' });
    const byStatus = await Experience.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      message: 'Experience statistics retrieved successfully',
      data: {
        total,
        published,
        current,
        unpublished: total - published,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching experience stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
