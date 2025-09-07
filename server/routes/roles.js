const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { authMiddleware } = require('../middleware/auth');

// Get all roles (public)
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().sort({ order: 1, title: 1 });
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
});

// Get single role (public)
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message
    });
  }
});

// Create role (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, color, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Check if role with same title already exists
    const existingRole = await Role.findOne({ title: title.trim() });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this title already exists'
      });
    }

    const role = new Role({
      title: title.trim(),
      description: description?.trim(),
      color: color || 'info',
      order: order || 0
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
});

// Update role (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, color, order } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if title is being changed and if new title already exists
    if (title && title.trim() !== role.title) {
      const existingRole = await Role.findOne({ 
        title: title.trim(),
        _id: { $ne: req.params.id }
      });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role with this title already exists'
        });
      }
    }

    // Update fields
    if (title !== undefined) role.title = title.trim();
    if (description !== undefined) role.description = description?.trim();
    if (color !== undefined) role.color = color;
    if (order !== undefined) role.order = order;

    await role.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
});

// Delete role (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
});

module.exports = router;
