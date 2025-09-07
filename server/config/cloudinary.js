const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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

// Storage for portfolio images
const portfolioStorage = createCloudinaryStorage('portfolios');

// Storage for tech tool icons
const techToolStorage = createCloudinaryStorage('tech-tools');

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

const uploadTechTool = multer({ 
  storage: techToolStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
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
  uploadTechTool,
  deleteImage,
  uploadImageBuffer
};
