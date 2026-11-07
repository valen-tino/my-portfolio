const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Custom Multer Storage Engine for Cloudinary v2 + Multer v2 compatibility
class CloudinaryStorage {
  constructor(opts = {}) {
    if (!opts.cloudinary) {
      throw new Error('`cloudinary` option required');
    }
    this.cloudinary = opts.cloudinary;
    this.params = opts.params || {};
  }

  async _handleFile(req, file, cb) {
    try {
      const resolvedParams = typeof this.params === 'function'
        ? await this.params(req, file)
        : { ...this.params };

      let callbackCalled = false;
      const safeCb = (err, info) => {
        if (callbackCalled) return;
        callbackCalled = true;
        cb(err, info);
      };

      const uploadStream = this.cloudinary.uploader.upload_stream(
        resolvedParams,
        (err, result) => {
          if (err) return safeCb(err);
          safeCb(null, {
            path: result.secure_url || result.url,
            filename: result.public_id,
            size: result.bytes,
            format: result.format,
            resource_type: result.resource_type
          });
        }
      );

      uploadStream.on('error', (err) => safeCb(err));
      file.stream.on('error', (err) => safeCb(err));
      file.stream.pipe(uploadStream);
    } catch (err) {
      cb(err);
    }
  }

  _removeFile(req, file, cb) {
    if (!file.filename) return cb(null);
    this.cloudinary.uploader.destroy(
      file.filename,
      { resource_type: file.resource_type || 'image', invalidate: true },
      cb
    );
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create different storage configurations for different types of uploads
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `portfolio-cms/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    },
  });
};

// Storage for profile images
const profileStorage = createCloudinaryStorage('profiles');

// Storage for portfolio images (also supports general media when needed)
const portfolioStorage = createCloudinaryStorage('portfolios');

// Storage for portfolio videos (web-optimized via delivery URL: f_auto, q_auto, max 1920px width)
const portfolioVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio-cms/portfolio-videos',
    resource_type: 'video'
  },
});

// Storage for editor media (images + videos inside WYSIWYG editor & galleries)
const editorMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    const isVideo = file.mimetype && file.mimetype.startsWith('video/');
    if (isVideo) {
      return {
        folder: 'portfolio-cms/editor-media',
        resource_type: 'video'
      };
    }
    return {
      folder: 'portfolio-cms/editor-media',
      resource_type: 'image',
      transformation: [
        { width: 1920, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
      ]
    };
  },
});

// Storage for tech tool icons
const techToolStorage = createCloudinaryStorage('tech-tools');

// Video file filter
const videoFileFilter = (_req, file, cb) => {
  const allowedExtensions = /\.(mp4|webm|mov|mkv|m4v|avi)$/i;
  const isVideoMime = (file.mimetype && file.mimetype.startsWith('video/')) || file.mimetype === 'application/octet-stream';
  if (isVideoMime && allowedExtensions.test(file.originalname || '')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Supported formats: MP4, WebM, MOV, MKV, M4V.'));
  }
};

// Editor media file filter (images + videos)
const editorMediaFileFilter = (_req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|mkv|m4v)$/i;
  const isAllowedMime =
    (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))) ||
    file.mimetype === 'application/octet-stream';
  if (isAllowedMime && allowedExtensions.test(file.originalname || '')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported media format.'));
  }
};

// Multer upload middleware
const uploadProfile = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadPortfolio = multer({ 
  storage: portfolioStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadPortfolioVideo = multer({
  storage: portfolioVideoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

const uploadEditorMedia = multer({
  storage: editorMediaStorage,
  fileFilter: editorMediaFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

const uploadTechTool = multer({ 
  storage: techToolStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Helper function to delete image or video from Cloudinary
const deleteImage = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Error deleting media from Cloudinary:', error);
    throw error;
  }
};

// Helper to ensure Cloudinary video URLs include web optimization transformations
const optimizeVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/video/upload/') && !url.includes('q_auto')) {
    return url.replace('/video/upload/', '/video/upload/q_auto,f_auto,w_1920,c_limit/');
  }
  return url;
};

// Helper function to upload image directly (for migration)
const uploadImageBuffer = async (buffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: `portfolio-cms/${folder}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    };
    
    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }
    
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }).end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadProfile,
  uploadPortfolio,
  uploadPortfolioVideo,
  uploadEditorMedia,
  uploadTechTool,
  deleteImage,
  optimizeVideoUrl,
  uploadImageBuffer
};
