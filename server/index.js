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

const LAN_ORIGIN_RE =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/i;

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) return true;
  if (LAN_ORIGIN_RE.test(origin)) return true;
  return false;
}

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers for allowed origins
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // For same-origin requests (no Origin header)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
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

// MongoDB Connection helper (ensures handshake completes before serving requests)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
let cachedDb = null;
let cachedPromise = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (cachedDb && mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cachedDb = null;
    cachedPromise = null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 10,
      })
      .then((conn) => {
        cachedDb = conn;
        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        cachedDb = null;
        throw err;
      });
  }

  return await cachedPromise;
}

// Ensure database is connected before handling API requests & bootstrap admin once
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();

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

    next();
  } catch (e) {
    console.error('Database middleware error:', e?.message || e);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

connectToDatabase()
.then(() => {
  console.log('✅ Connected to MongoDB');
  setImmediate(() => {
    syncAllPortfolioSkills()
      .then((syncResult) => {
        if (syncResult && syncResult.createdCount > 0) {
          console.log(`🛠️ Auto-migrated ${syncResult.createdCount} new skills from existing portfolios to TechTool.`);
        }
      })
      .catch((syncErr) => {
        console.warn('Portfolio skills startup sync warning:', syncErr?.message || syncErr);
      });
  });
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
const workProcessRoutes = require('./routes/workProcess');
const socialLinksRoutes = require('./routes/socialLinks');

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
app.use('/api/blogs', blogRoutes); // Parity alias
app.use('/api/work-process', workProcessRoutes);
app.use('/api/social-links', socialLinksRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown';
  res.json({
    success: dbStatus === 1,
    status: dbStatus === 1 ? 'OK' : 'DEGRADED',
    message: 'Portfolio CMS API is running',
    database: {
      connected: dbStatus === 1,
      status: dbStatusText,
      name: mongoose.connection?.name || null,
    },
  });
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
