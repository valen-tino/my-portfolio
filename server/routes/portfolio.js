const express = require('express');
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const TechTool = require('../models/TechTool');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const router = express.Router();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const syncUncatalogedSkills = async (techList) => {
  if (!Array.isArray(techList) || techList.length === 0) return;
  try {
    const uniqueSkills = Array.from(new Set(techList.map(s => String(s).trim()).filter(Boolean)));
    for (const skill of uniqueSkills) {
      await TechTool.findOneAndUpdate(
        { title: { $regex: new RegExp(`^${escapeRegex(skill)}$`, 'i') } },
        {
          $setOnInsert: {
            title: skill,
            imageURL: '/placeholder-tech.svg',
            imageCloudinaryId: null,
            order: 0,
            isPublished: false
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  } catch (err) {
    console.warn('Non-blocking tech tools auto-sync warning:', err);
  }
};

// @route   GET /api/portfolio
// @desc    Get all portfolio items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { published } = req.query;
    const filter = published === 'true' ? { isPublished: { $ne: false } } : {};
    
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
    const { title, desc, projectDetails, linkTo, imageURL, imageCloudinaryId, videoURL, videoCloudinaryId, tech, roles, order, isPublished, isPasswordProtected, password, isPinned, year, relatedExperience, relatedExperienceCompany, relatedEducation, relatedEducationInstitution } = req.body;

    if (!title || !desc || (!imageURL && !videoURL)) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and either image URL or video URL are required'
      });
    }

    if (isPasswordProtected && (!password || !password.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Password is required when enabling password protection'
      });
    }

    const portfolio = new Portfolio({
      title,
      desc,
      projectDetails: projectDetails || '',
      linkTo: linkTo || '',
      imageURL: imageURL || '',
      imageCloudinaryId: imageCloudinaryId || null,
      videoURL: videoURL || null,
      videoCloudinaryId: videoCloudinaryId || null,
      tech: tech || [],
      roles: roles || [],
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      // New fields
      isPasswordProtected: !!isPasswordProtected,
      password: isPasswordProtected ? (password || null) : null,
      isPinned: !!isPinned,
      year: year || null,
      relatedExperience: (relatedExperience && mongoose.Types.ObjectId.isValid(relatedExperience)) ? relatedExperience : null,
      relatedExperienceCompany: relatedExperienceCompany || null,
      relatedEducation: (relatedEducation && mongoose.Types.ObjectId.isValid(relatedEducation)) ? relatedEducation : null,
      relatedEducationInstitution: relatedEducationInstitution || null
    });

    await portfolio.save();
    await syncUncatalogedSkills(portfolio.tech);

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
    const { title, desc, projectDetails, linkTo, imageURL, imageCloudinaryId, videoURL, videoCloudinaryId, tech, roles, order, isPublished, isPasswordProtected, password, isPinned, year, relatedExperience, relatedExperienceCompany, relatedEducation, relatedEducationInstitution } = req.body;
    
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // If enabling password protection, ensure a password exists (either provided or already set)
    if (isPasswordProtected === true) {
      const pwdToUse = typeof password !== 'undefined' ? password : portfolio.password;
      if (!pwdToUse || !String(pwdToUse).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Password is required when enabling password protection'
        });
      }
    }

    // Delete old image if new image is provided
    if (imageURL !== undefined && imageURL !== portfolio.imageURL && portfolio.imageCloudinaryId) {
      try {
        await deleteImage(portfolio.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    // Delete old video if new video is provided or removed
    if (videoURL !== undefined && videoURL !== portfolio.videoURL && portfolio.videoCloudinaryId) {
      try {
        await deleteImage(portfolio.videoCloudinaryId, 'video');
      } catch (deleteError) {
        console.error('Error deleting old video:', deleteError);
      }
    }

    portfolio.title = title || portfolio.title;
    portfolio.desc = desc || portfolio.desc;
    portfolio.projectDetails = projectDetails !== undefined ? projectDetails : portfolio.projectDetails;
    portfolio.linkTo = linkTo !== undefined ? linkTo : portfolio.linkTo;
    portfolio.imageURL = imageURL !== undefined ? imageURL : portfolio.imageURL;
    portfolio.imageCloudinaryId = imageCloudinaryId !== undefined ? imageCloudinaryId : portfolio.imageCloudinaryId;
    portfolio.videoURL = videoURL !== undefined ? videoURL : portfolio.videoURL;
    portfolio.videoCloudinaryId = videoCloudinaryId !== undefined ? videoCloudinaryId : portfolio.videoCloudinaryId;
    portfolio.tech = tech || portfolio.tech;
    portfolio.roles = roles || portfolio.roles;
    portfolio.order = order !== undefined ? order : portfolio.order;
    portfolio.isPublished = isPublished !== undefined ? isPublished : portfolio.isPublished;

    // New fields
    if (typeof isPinned !== 'undefined') {
      portfolio.isPinned = isPinned;
    }
    if (typeof isPasswordProtected !== 'undefined') {
      portfolio.isPasswordProtected = isPasswordProtected;
      if (!isPasswordProtected) {
        portfolio.password = null;
      }
    }
    if (typeof password !== 'undefined') {
      // Only set password if protection is enabled (either via this request or already enabled)
      if (portfolio.isPasswordProtected) {
        portfolio.password = password;
      }
    }
    if (typeof year !== 'undefined') {
      portfolio.year = year || null;
    }
    if (typeof relatedExperience !== 'undefined') {
      portfolio.relatedExperience = (relatedExperience && mongoose.Types.ObjectId.isValid(relatedExperience)) ? relatedExperience : null;
    }
    if (typeof relatedExperienceCompany !== 'undefined') {
      portfolio.relatedExperienceCompany = relatedExperienceCompany || null;
    }
    if (typeof relatedEducation !== 'undefined') {
      portfolio.relatedEducation = (relatedEducation && mongoose.Types.ObjectId.isValid(relatedEducation)) ? relatedEducation : null;
    }
    if (typeof relatedEducationInstitution !== 'undefined') {
      portfolio.relatedEducationInstitution = relatedEducationInstitution || null;
    }

    await portfolio.save();
    await syncUncatalogedSkills(portfolio.tech);

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

    // Delete video from Cloudinary
    if (portfolio.videoCloudinaryId) {
      try {
        await deleteImage(portfolio.videoCloudinaryId, 'video');
      } catch (deleteError) {
        console.error('Error deleting video:', deleteError);
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
