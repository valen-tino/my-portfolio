const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('../server/routes/auth');
const aboutRoutes = require('../server/routes/about');
const techToolsRoutes = require('../server/routes/techTools');
const rolesRoutes = require('../server/routes/roles');
const educationRoutes = require('../server/routes/education');
const portfolioRoutes = require('../server/routes/portfolios');
const contactRoutes = require('../server/routes/contacts');
const experiencesRoutes = require('../server/routes/experiences');
const uploadRoutes = require('../server/routes/upload');
const aiRoutes = require('../server/routes/ai');

// Create Express app
const app = express();

// MongoDB connection with connection pooling for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    
    cachedDb = connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Connection string:', process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET');
    throw error;
  }
}

// Middleware - More permissive CORS for Vercel deployment
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Additional CORS middleware to ensure headers are set
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed' 
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/tech-tools', techToolsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown';
    
    res.json({ 
      success: true, 
      message: 'API is running',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatusText,
        mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
      },
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasAdminEmail: !!process.env.ADMIN_EMAIL,
        hasCloudinaryName: !!process.env.CLOUDINARY_CLOUD_NAME
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  });
});

// Export for Vercel
module.exports = app;

// Also export as default for Vercel Edge Functions
module.exports.default = app;
