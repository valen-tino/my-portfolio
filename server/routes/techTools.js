const express = require('express');
const TechTool = require('../models/TechTool');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const { syncAllPortfolioSkills } = require('../utils/skillMigration');
const { handleRouteError } = require('../utils/errorHandler');
const {
  getCachedResponse,
  setCachedResponse,
  invalidateServerCache,
  setPublicCacheHeaders,
  execLean,
} = require('../utils/responseCache');
const router = express.Router();

// @route   POST /api/tech-tools/sync-from-portfolios
// @desc    Scan all portfolios and auto-provision uncataloged skills into TechTool
// @access  Private
router.post('/sync-from-portfolios', authMiddleware, async (req, res) => {
  try {
    const result = await syncAllPortfolioSkills();
    invalidateServerCache('techTools:');
    res.json({
      success: true,
      message: `Scanned ${result.totalSkillsFound} skills from portfolios. Added ${result.createdCount} new draft tools.`,
      data: result
    });
  } catch (error) {
    console.error('Sync skills from portfolios error:', error);
    return handleRouteError(res, error, 'Server error while syncing skills from portfolios');
  }
});

// @route   GET /api/tech-tools
// @desc    Get all tech tools
// @access  Public
router.get('/', async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const isAuth = Boolean(req.headers && req.headers.authorization);
    const cacheKey = `techTools:list:${publishedOnly ? 'pub' : 'all'}`;

    setPublicCacheHeaders(res, 60, 300, 600, req);
    if (!isAuth) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const filter = publishedOnly ? { isPublished: { $ne: false } } : {};
    const techTools = await execLean(TechTool.find(filter).sort({ order: 1, createdAt: 1 }));
    const payload = {
      success: true,
      data: techTools
    };
    if (!isAuth) {
      setCachedResponse(cacheKey, payload);
    }
    res.json(payload);
  } catch (error) {
    console.error('Get tech tools error:', error);
    return handleRouteError(res, error, 'Server error while fetching tech tools');
  }
});

// @route   POST /api/tech-tools
// @desc    Create tech tool
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, imageURL, imageCloudinaryId, order, isPublished } = req.body;

    const missingFieldErrors = {};
    if (!title || !String(title).trim()) missingFieldErrors.title = 'Tool title is required';
    if (!imageURL || !String(imageURL).trim()) missingFieldErrors.imageURL = 'Icon image is required';

    if (Object.keys(missingFieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and image URL are required',
        errors: Object.values(missingFieldErrors),
        fieldErrors: missingFieldErrors
      });
    }

    const techTool = new TechTool({
      title,
      imageURL,
      imageCloudinaryId,
      order: order || 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true
    });

    await techTool.save();
    invalidateServerCache('techTools:');

    res.status(201).json({
      success: true,
      message: 'Tech tool created successfully',
      data: techTool
    });
  } catch (error) {
    console.error('Create tech tool error:', error);
    return handleRouteError(res, error, 'Server error while creating tech tool');
  }
});

// @route   PUT /api/tech-tools/:id
// @desc    Update tech tool
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, imageURL, imageCloudinaryId, order, isPublished } = req.body;
    
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
    if (isPublished !== undefined) {
      techTool.isPublished = Boolean(isPublished);
    }

    await techTool.save();
    invalidateServerCache('techTools:');

    res.json({
      success: true,
      message: 'Tech tool updated successfully',
      data: techTool
    });
  } catch (error) {
    console.error('Update tech tool error:', error);
    return handleRouteError(res, error, 'Server error while updating tech tool');
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
    invalidateServerCache('techTools:');

    res.json({
      success: true,
      message: 'Tech tool deleted successfully'
    });
  } catch (error) {
    console.error('Delete tech tool error:', error);
    return handleRouteError(res, error, 'Server error while deleting tech tool');
  }
});

module.exports = router;
