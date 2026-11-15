const express = require('express');
const WorkProcess = require('../models/WorkProcess');
const { authMiddleware } = require('../middleware/auth');
const DEFAULT_WORK_PROCESS_STEPS = require('../data/defaultWorkProcessSteps');

const router = express.Router();

// @route   GET /api/work-process
// @desc    Get all work process steps sorted by order (supports ?published=true)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = req.query.published === 'true' ? { isPublished: { $ne: false } } : {};
    const steps = await WorkProcess.find(query).sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      data: steps
    });
  } catch (error) {
    console.error('Get work process steps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work process steps',
      error: error.message
    });
  }
});

// @route   POST /api/work-process/seed
// @desc    Seed default work process steps when collection is empty (or force=true)
// @access  Private
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const existingCount = await WorkProcess.countDocuments();

    if (existingCount > 0 && !force) {
      return res.status(400).json({
        success: false,
        message: 'Work process steps already exist'
      });
    }

    if (force && existingCount > 0) {
      await WorkProcess.deleteMany({});
    }

    const inserted = await WorkProcess.insertMany(DEFAULT_WORK_PROCESS_STEPS);
    res.status(201).json({
      success: true,
      message: `Seeded ${inserted.length} default work process steps`,
      data: inserted
    });
  } catch (error) {
    console.error('Seed work process steps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed default work process steps',
      error: error.message
    });
  }
});

// @route   GET /api/work-process/:id
// @desc    Get single work process step by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const step = await WorkProcess.findById(req.params.id);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Work process step not found'
      });
    }
    res.json({
      success: true,
      data: step
    });
  } catch (error) {
    console.error('Get work process step error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work process step',
      error: error.message
    });
  }
});

// @route   POST /api/work-process
// @desc    Create a new work process step
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, order, isPublished } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const existing = await WorkProcess.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A work process step with this title already exists'
      });
    }

    const parsedOrder = Number.isFinite(Number(order)) ? Number(order) : 0;
    const step = new WorkProcess({
      title: title.trim(),
      description: description.trim(),
      order: parsedOrder,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true
    });

    await step.save();

    res.status(201).json({
      success: true,
      message: 'Work process step created successfully',
      data: step
    });
  } catch (error) {
    console.error('Create work process step error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create work process step',
      error: error.message
    });
  }
});

// @route   PUT /api/work-process/:id
// @desc    Update an existing work process step
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, order, isPublished } = req.body;

    const step = await WorkProcess.findById(req.params.id);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Work process step not found'
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty'
        });
      }
      if (title.trim() !== step.title) {
        const existing = await WorkProcess.findOne({
          title: title.trim(),
          _id: { $ne: req.params.id }
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'A work process step with this title already exists'
          });
        }
      }
      step.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot be empty'
        });
      }
      step.description = description.trim();
    }

    if (order !== undefined && Number.isFinite(Number(order))) {
      step.order = Number(order);
    }

    if (isPublished !== undefined) {
      step.isPublished = Boolean(isPublished);
    }

    await step.save();

    res.json({
      success: true,
      message: 'Work process step updated successfully',
      data: step
    });
  } catch (error) {
    console.error('Update work process step error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update work process step',
      error: error.message
    });
  }
});

// @route   DELETE /api/work-process/:id
// @desc    Delete a work process step
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const step = await WorkProcess.findById(req.params.id);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Work process step not found'
      });
    }

    await WorkProcess.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Work process step deleted successfully'
    });
  } catch (error) {
    console.error('Delete work process step error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete work process step',
      error: error.message
    });
  }
});

module.exports = router;

