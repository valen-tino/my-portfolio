const express = require('express');
const Education = require('../models/Education');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/education
// @desc    Get all education items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const education = await Education.find().sort({ startDate: -1 });
    res.json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching education data'
    });
  }
});

// @route   POST /api/education
// @desc    Create education item
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, institution, startDate, endDate, description, link } = req.body;

    if (!title || !institution || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, institution, and start date are required'
      });
    }

    const education = new Education({
      title,
      institution,
      startDate: new Date(startDate + '-01'), // Add day for month-year format
      endDate: endDate ? new Date(endDate + '-01') : null, // Add day for month-year format
      description: description || '',
      link: link || ''
    });

    await education.save();

    res.status(201).json({
      success: true,
      message: 'Education item created successfully',
      data: education
    });
  } catch (error) {
    console.error('Create education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating education item'
    });
  }
});

// @route   PUT /api/education/:id
// @desc    Update education item
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, institution, startDate, endDate, description, link } = req.body;
    
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education item not found'
      });
    }

    education.title = title || education.title;
    education.institution = institution || education.institution;
    education.startDate = startDate ? new Date(startDate + '-01') : education.startDate; // Add day for month-year format
    education.endDate = endDate ? new Date(endDate + '-01') : education.endDate; // Add day for month-year format
    education.description = description !== undefined ? description : education.description;
    education.link = link !== undefined ? link : education.link;

    await education.save();

    res.json({
      success: true,
      message: 'Education item updated successfully',
      data: education
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating education item'
    });
  }
});

// @route   DELETE /api/education/:id
// @desc    Delete education item
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education item not found'
      });
    }

    await Education.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Education item deleted successfully'
    });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting education item'
    });
  }
});

module.exports = router;
