const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const User = require('./models/User');
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
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
          console.log('✅ Admin user bootstrapped');
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
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
