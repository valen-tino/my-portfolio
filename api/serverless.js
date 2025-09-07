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
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
    
    cachedDb = connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app', 'https://your-custom-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
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
