const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const AIService = require('../services/aiService');
const TechTool = require('../models/TechTool');
const Role = require('../models/Role');

const router = express.Router();

// Initialize AI service
let aiService;
try {
  aiService = new AIService();
} catch (error) {
  console.error('Failed to initialize AI service:', error.message);
}

// @route   POST /api/ai/rewrite-project-details
// @desc    Rewrite project details using AI
// @access  Private
router.post('/rewrite-project-details', authMiddleware, async (req, res) => {
  try {
    if (!aiService) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available. Please check server configuration.'
      });
    }

    const { projectDetails, projectTitle } = req.body;

    // Validation
    if (!projectDetails || !projectDetails.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project details are required'
      });
    }

    if (projectDetails.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Project details are too short. Please provide more content for meaningful improvements.'
      });
    }

    if (projectDetails.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Project details are too long. Please keep under 5000 characters.'
      });
    }

    // Call AI service
    const result = await aiService.rewriteProjectDetails(
      projectDetails,
      projectTitle || 'Project'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to rewrite project details'
      });
    }

    res.json({
      success: true,
      message: 'Project details rewritten successfully',
      data: {
        rewrittenContent: result.data
      }
    });

  } catch (error) {
    console.error('Error in rewrite-project-details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project rewriting'
    });
  }
});

// @route   POST /api/ai/create-portfolio-from-text
// @desc    Create portfolio item from text description using AI
// @access  Private
router.post('/create-portfolio-from-text', authMiddleware, async (req, res) => {
  try {
    if (!aiService) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available. Please check server configuration.'
      });
    }

    const { textDescription } = req.body;

    // Validation
    if (!textDescription || !textDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project description is required'
      });
    }

    if (textDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Description is too short. Please provide more details (at least 50 characters).'
      });
    }

    if (textDescription.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description is too long. Please keep under 2000 characters.'
      });
    }

    // Get available tech tools and roles
    const [techTools, roles] = await Promise.all([
      TechTool.find().select('title'),
      Role.find().select('title')
    ]);

    const availableTechTools = techTools.map(tool => tool.title);
    const availableRoles = roles.map(role => role.title);

    // Call AI service
    const result = await aiService.createPortfolioFromText(
      textDescription.trim(),
      availableTechTools,
      availableRoles
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to create portfolio from text'
      });
    }

    // Parse the JSON result
    let portfolioData;
    try {
      portfolioData = JSON.parse(result.data);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio item generated successfully',
      data: portfolioData
    });

  } catch (error) {
    console.error('Error in create-portfolio-from-text:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during portfolio generation'
    });
  }
});

// @route   GET /api/ai/test-connection
// @desc    Test AI service connection
// @access  Private
router.get('/test-connection', authMiddleware, async (req, res) => {
  try {
    if (!aiService) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not initialized. Check DEEPSEEK_API_KEY environment variable.'
      });
    }

    const result = await aiService.testConnection();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'AI service connection failed'
      });
    }

    res.json({
      success: true,
      message: 'AI service connection successful',
      data: {
        response: result.data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in test-connection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during connection test'
    });
  }
});

// @route   GET /api/ai/status
// @desc    Get AI service status
// @access  Private
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY;
    const hasService = !!aiService;

    res.json({
      success: true,
      data: {
        isConfigured: hasApiKey,
        isInitialized: hasService,
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        models: {
          chat: 'deepseek-chat',
          reasoner: 'deepseek-reasoner'
        },
        status: hasApiKey && hasService ? 'ready' : 'not configured'
      }
    });

  } catch (error) {
    console.error('Error getting AI status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking AI status'
    });
  }
});

module.exports = router;
