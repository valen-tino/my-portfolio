const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const User = require('./models/User');
const { syncAllPortfolioSkills } = require('./utils/skillMigration');
let adminBootstrapped = false;

// Middleware
const allowedOrigins = [
  process.env.VITE_APP_URL,
  process.env.VITE_APP_URL_DEV,
  process.env.VITE_APP_URL_PREVIEW,
  process.env.VITE_APP_URL_PROD,
  process.env.APP_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // For same-origin requests (no Origin header)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5174');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Bootstrap admin user once if configured
app.use(async (req, res, next) => {
  try {
    if (!adminBootstrapped) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (adminEmail && adminPassword) {
        const existing = await User.findOne({ email: adminEmail.toLowerCase() });
        if (!existing) {
          await User.create({ email: adminEmail.toLowerCase(), password: adminPassword, role: 'admin', isActive: true });
        }
      }
      adminBootstrapped = true;
    }
  } catch (e) {
    console.error('Admin bootstrap error:', e?.message || e);
  } finally {
    next();
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('✅ Connected to MongoDB');
  try {
    const syncResult = await syncAllPortfolioSkills();
    if (syncResult && syncResult.createdCount > 0) {
      console.log(`🛠️ Auto-migrated ${syncResult.createdCount} new skills from existing portfolios to TechTool.`);
    }
  } catch (syncErr) {
    console.warn('Portfolio skills startup sync warning:', syncErr?.message || syncErr);
  }
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const aboutRoutes = require('./routes/about');
const techToolsRoutes = require('./routes/techTools');
const educationRoutes = require('./routes/education');
const portfolioRoutes = require('./routes/portfolio');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');
const roleRoutes = require('./routes/roles');
const aiRoutes = require('./routes/ai');
const experienceRoutes = require('./routes/experiences');
const blogRoutes = require('./routes/blog');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/tech-tools', techToolsRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/blog', blogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Portfolio CMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, (err) => {
  if (err) {
    console.error(`❌ Failed to start server on port ${PORT}:`, err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
