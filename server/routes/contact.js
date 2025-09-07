const express = require('express');
const Contact = require('../models/Contact');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/contact
// @desc    Get all contact entries
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact entries'
    });
  }
});

// @route   POST /api/contact
// @desc    Create contact entry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   PUT /api/contact/:id/read
// @desc    Mark contact as read
// @access  Private
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact entry not found'
      });
    }

    contact.isRead = true;
    await contact.save();

    res.json({
      success: true,
      message: 'Contact marked as read',
      data: contact
    });
  } catch (error) {
    console.error('Mark contact as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact status'
    });
  }
});

// @route   PUT /api/contact/:id/reply
// @desc    Mark contact as replied
// @access  Private
router.put('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact entry not found'
      });
    }

    contact.isReplied = true;
    contact.isRead = true; // Also mark as read when replied
    await contact.save();

    res.json({
      success: true,
      message: 'Contact marked as replied',
      data: contact
    });
  } catch (error) {
    console.error('Mark contact as replied error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact status'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact entry
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact entry not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact entry'
    });
  }
});

// @route   DELETE /api/contact
// @desc    Delete all contact entries
// @access  Private
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Contact.deleteMany({});

    res.json({
      success: true,
      message: 'All contact entries deleted successfully'
    });
  } catch (error) {
    console.error('Delete all contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact entries'
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ isRead: false });
    const replied = await Contact.countDocuments({ isReplied: true });
    
    // Get this week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await Contact.countDocuments({ 
      createdAt: { $gte: oneWeekAgo } 
    });

    res.json({
      success: true,
      data: {
        total,
        unread,
        replied,
        thisWeek
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact statistics'
    });
  }
});

module.exports = router;
