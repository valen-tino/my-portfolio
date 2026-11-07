const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  cloudinary,
  uploadProfile,
  uploadPortfolio,
  uploadPortfolioVideo,
  uploadEditorMedia,
  uploadTechTool,
  deleteImage,
  optimizeVideoUrl
} = require('../config/cloudinary');
const router = express.Router();

// @route   GET /api/upload/signature
// @desc    Generate signed Cloudinary upload parameters for direct browser uploads
// @access  Private
router.get('/signature', authMiddleware, (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary credentials are not configured on the server'
      });
    }

    const requestedFolder = req.query.folder || 'portfolio-videos';
    const folder = requestedFolder.startsWith('portfolio-cms/')
      ? requestedFolder
      : `portfolio-cms/${requestedFolder}`;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      folder,
      timestamp
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder
      }
    });
  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature'
    });
  }
});

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

// @route   POST /api/upload/portfolio-video
// @desc    Upload web-optimized portfolio video
// @access  Private
router.post('/portfolio-video', authMiddleware, (req, res) => {
  uploadPortfolioVideo.single('video')(req, res, (uploadErr) => {
    if (uploadErr) {
      console.error('Upload portfolio video error:', uploadErr);
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'Video file exceeds the 100MB limit'
        });
      }
      return res.status(400).json({
        success: false,
        message: uploadErr.message || 'Error uploading video'
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No video file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'Portfolio video uploaded and optimized successfully',
        data: {
          videoURL: optimizeVideoUrl(req.file.path),
          videoCloudinaryId: req.file.filename
        }
      });
    } catch (error) {
      console.error('Upload portfolio video error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during video upload'
      });
    }
  });
});

// @route   POST /api/upload/editor-media
// @desc    Upload single media file (image or video) for WYSIWYG editor
// @access  Private
router.post('/editor-media', authMiddleware, (req, res) => {
  uploadEditorMedia.single('media')(req, res, (uploadErr) => {
    if (uploadErr) {
      console.error('Upload editor media error:', uploadErr);
      return res.status(400).json({
        success: false,
        message: uploadErr.message || 'Error uploading media'
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No media file uploaded'
        });
      }

      const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video/');
      const url = isVideo ? optimizeVideoUrl(req.file.path) : req.file.path;

      res.json({
        success: true,
        message: 'Editor media uploaded successfully',
        data: {
          url,
          cloudinaryId: req.file.filename,
          mediaType: isVideo ? 'video' : 'image'
        }
      });
    } catch (error) {
      console.error('Upload editor media error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during media upload'
      });
    }
  });
});

// @route   POST /api/upload/editor-gallery
// @desc    Upload multiple media files (images/videos) for WYSIWYG gallery
// @access  Private
router.post('/editor-gallery', authMiddleware, (req, res) => {
  uploadEditorMedia.array('media', 20)(req, res, (uploadErr) => {
    if (uploadErr) {
      console.error('Upload editor gallery error:', uploadErr);
      return res.status(400).json({
        success: false,
        message: uploadErr.message || 'Error uploading gallery media'
      });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No media files uploaded'
        });
      }

      const items = req.files.map((file) => {
        const isVideo = file.mimetype && file.mimetype.startsWith('video/');
        return {
          url: isVideo ? optimizeVideoUrl(file.path) : file.path,
          cloudinaryId: file.filename,
          mediaType: isVideo ? 'video' : 'image'
        };
      });

      res.json({
        success: true,
        message: 'Gallery media uploaded successfully',
        data: items
      });
    } catch (error) {
      console.error('Upload editor gallery error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during gallery upload'
      });
    }
  });
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
