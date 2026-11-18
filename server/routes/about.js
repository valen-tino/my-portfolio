const express = require('express');
const About = require('../models/About');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const { handleRouteError } = require('../utils/errorHandler');
const {
  getCachedResponse,
  setCachedResponse,
  invalidateServerCache,
  setPublicCacheHeaders,
  execLean,
} = require('../utils/responseCache');
const router = express.Router();

// @route   GET /api/about
// @desc    Get about data
// @access  Public
router.get('/', async (req, res) => {
  try {
    const isAuth = Boolean(req.headers && req.headers.authorization);
    const cacheKey = 'about:main';

    setPublicCacheHeaders(res, 60, 300, 600, req);
    if (!isAuth) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    let about = await execLean(About.findOne());
    
    // If no about data exists, create default
    if (!about) {
      about = new About({
        description: `Well, name's Valentino Yudhistira Jehaut (A.k.a Valen) and nice to know you!\n\nI'm 20 years old now and currently living in Bali, Indonesia. I just graduated from SMK TI Bali Global Denpasar majoring in Software Engineering and currently pursuing Double Bachelor's Degree in Information Systems (ITB Stikom Bali) & Information Technology (HELP University)\n\nI've had experience as a web developer for more than 2.5 years now and as a UI/UX Designer for more than a year. At that time, i'm always curious and open to trying new technologies just to enhance my skills so that i didn't miss out on the current trends.\n\nNow, i'm currently as a UI/UX Designer & Part-time Web Developer at Bendega.id, a Web Developer at Bali Mountain Retreat and Mashup R Japan.`,
        imageURL: 'myface.jpeg',
        cvURL: '/Valen-Jehaut.pdf',
        cvCloudinaryId: null
      });
      await about.save();
    }

    const payload = {
      success: true,
      data: about
    };
    if (!isAuth) {
      setCachedResponse(cacheKey, payload);
    }

    res.json(payload);
  } catch (error) {
    console.error('Get about error:', error);
    return handleRouteError(res, error, 'Server error while fetching about data');
  }
});

const OPTIONAL_ABOUT_TEXT_FIELDS = [
  'name',
  'fullName',
  'location',
  'email',
  'heroHeadline',
  'heroSubheadline',
  'yearsExperience',
  'yearsExperienceLabel',
  'selectedProjectsLabel',
  'degreesCount',
  'degreesLabel',
  'workProcessSubtitle',
  'resumeSummary',
  'contactHeading',
  'contactSubtext',
  'footerCtaHeading',
  'footerBio'
];

// @route   PUT /api/about
// @desc    Update about data
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { description, imageURL, imageCloudinaryId, cvURL, cvCloudinaryId } = req.body;

    // Validation
    if (!description || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
        errors: ['Description is required'],
        fieldErrors: { description: 'Description is required' }
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

      // If CV is being updated and old CV exists in cloudinary, delete it as raw resource
      if (cvCloudinaryId && about.cvCloudinaryId && cvCloudinaryId !== about.cvCloudinaryId) {
        try {
          await deleteImage(about.cvCloudinaryId, 'raw');
        } catch (deleteError) {
          console.error('Error deleting old CV:', deleteError);
        }
      }

      // Update existing
      about.description = description;
      if (imageURL) about.imageURL = imageURL;
      if (imageCloudinaryId !== undefined) about.imageCloudinaryId = imageCloudinaryId;
      if (cvURL !== undefined) about.cvURL = cvURL || '/Valen-Jehaut.pdf';
      if (cvCloudinaryId !== undefined) about.cvCloudinaryId = cvCloudinaryId || null;

      for (const field of OPTIONAL_ABOUT_TEXT_FIELDS) {
        if (req.body[field] !== undefined) {
          about[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
        }
      }
      
      await about.save();
    } else {
      const extraFields = {};
      for (const field of OPTIONAL_ABOUT_TEXT_FIELDS) {
        if (req.body[field] !== undefined) {
          extraFields[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
        }
      }

      // Create new
      about = new About({
        description,
        imageURL: imageURL || 'myface.jpeg',
        imageCloudinaryId: imageCloudinaryId || null,
        cvURL: cvURL || '/Valen-Jehaut.pdf',
        cvCloudinaryId: cvCloudinaryId || null,
        ...extraFields
      });
      await about.save();
    }

    invalidateServerCache('about:');

    res.json({
      success: true,
      message: 'About section updated successfully',
      data: about
    });
  } catch (error) {
    console.error('Update about error:', error);
    return handleRouteError(res, error, 'Server error while updating about data');
  }
});

module.exports = router;
