const express = require('express');
const SocialLink = require('../models/SocialLink');
const { authMiddleware } = require('../middleware/auth');
const DEFAULT_SOCIAL_LINKS = require('../data/defaultSocialLinks');

const router = express.Router();

// @route   GET /api/social-links
// @desc    Get all social links sorted by order (supports ?published=true)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = req.query.published === 'true' ? { isPublished: { $ne: false } } : {};
    const links = await SocialLink.find(query).sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      data: links,
      count: links.length,
    });
  } catch (error) {
    console.error('Get social links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social links',
      error: error.message,
    });
  }
});

// @route   POST /api/social-links/seed
// @desc    Seed default social links when collection is empty (or force=true)
// @access  Private
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const existingCount = await SocialLink.countDocuments();

    if (existingCount > 0 && !force) {
      const existing = await SocialLink.find({}).sort({ order: 1, createdAt: 1 });
      return res.status(200).json({
        success: true,
        seeded: false,
        message: 'Social links already exist',
        data: existing,
        count: existing.length,
      });
    }

    if (force && existingCount > 0) {
      await SocialLink.deleteMany({});
    }

    const inserted = await SocialLink.insertMany(DEFAULT_SOCIAL_LINKS);
    res.status(201).json({
      success: true,
      seeded: true,
      message: `Seeded ${inserted.length} default social links`,
      data: inserted,
      count: inserted.length,
    });
  } catch (error) {
    console.error('Seed social links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed default social links',
      error: error.message,
    });
  }
});

// @route   GET /api/social-links/:id
// @desc    Get single social link by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const link = await SocialLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }
    res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error('Get social link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social link',
      error: error.message,
    });
  }
});

// @route   POST /api/social-links
// @desc    Create a new social link
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, handle, url, actionLabel, icon, order, isPublished } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Platform name is required',
      });
    }

    if (!url || !String(url).trim()) {
      return res.status(400).json({
        success: false,
        message: 'URL is required',
      });
    }

    let resolvedOrder = Number(order);
    if (order === undefined || order === null || Number.isNaN(resolvedOrder)) {
      const lastLink = await SocialLink.findOne().sort({ order: -1 });
      resolvedOrder = lastLink ? (lastLink.order || 0) + 1 : 1;
    }

    const link = new SocialLink({
      name: String(name).trim(),
      handle: handle ? String(handle).trim() : '',
      url: String(url).trim(),
      actionLabel: actionLabel ? String(actionLabel).trim() : 'Connect',
      icon: icon ? String(icon).trim() : 'globe',
      order: resolvedOrder,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    await link.save();

    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      data: link,
    });
  } catch (error) {
    console.error('Create social link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create social link',
      error: error.message,
    });
  }
});

// @route   PUT /api/social-links/:id
// @desc    Update an existing social link
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, handle, url, actionLabel, icon, order, isPublished } = req.body;

    const link = await SocialLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Platform name cannot be empty',
        });
      }
      link.name = String(name).trim();
    }

    if (handle !== undefined) {
      link.handle = String(handle).trim();
    }

    if (url !== undefined) {
      if (!String(url).trim()) {
        return res.status(400).json({
          success: false,
          message: 'URL cannot be empty',
        });
      }
      link.url = String(url).trim();
    }

    if (actionLabel !== undefined) {
      link.actionLabel = String(actionLabel).trim() || 'Connect';
    }

    if (icon !== undefined) {
      link.icon = String(icon).trim() || 'globe';
    }

    if (order !== undefined && Number.isFinite(Number(order))) {
      link.order = Number(order);
    }

    if (isPublished !== undefined) {
      link.isPublished = Boolean(isPublished);
    }

    await link.save();

    res.json({
      success: true,
      message: 'Social link updated successfully',
      data: link,
    });
  } catch (error) {
    console.error('Update social link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social link',
      error: error.message,
    });
  }
});

// @route   DELETE /api/social-links/:id
// @desc    Delete a social link
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await SocialLink.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }

    res.json({
      success: true,
      message: 'Social link deleted successfully',
    });
  } catch (error) {
    console.error('Delete social link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social link',
      error: error.message,
    });
  }
});

module.exports = router;

