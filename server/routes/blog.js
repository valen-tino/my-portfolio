const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { authMiddleware } = require('../middleware/auth');
const { deleteImage } = require('../config/cloudinary');
const { handleRouteError } = require('../utils/errorHandler');
const {
  getCachedResponse,
  setCachedResponse,
  invalidateServerCache,
  setPublicCacheHeaders,
  execLean,
} = require('../utils/responseCache');
const router = express.Router();

// @route   GET /api/blog
// @desc    Get all blog posts (with optional filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { published, category, tag, search } = req.query;
    const isAuth = Boolean(req.headers && req.headers.authorization);
    const cacheKey = `blog:list:${published || 'all'}:${category || 'all'}:${tag || ''}:${search || ''}`;

    setPublicCacheHeaders(res, 60, 300, 600, req);
    if (!isAuth) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const filter = {};

    if (published === 'true') {
      filter.isPublished = { $ne: false };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search && String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { desc: searchRegex }
      ];
    }

    const blogs = await execLean(Blog.find(filter).sort({ isPinned: -1, date: -1, createdAt: -1 }));
    const payload = {
      success: true,
      data: blogs
    };
    if (!isAuth) {
      setCachedResponse(cacheKey, payload);
    }

    res.json(payload);
  } catch (error) {
    console.error('Get blogs error:', error);
    return handleRouteError(res, error, 'Server error while fetching blogs');
  }
});

// @route   GET /api/blog/:id
// @desc    Get single blog post by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    const isAuth = Boolean(req.headers && req.headers.authorization);
    const cacheKey = `blog:item:${param}`;

    setPublicCacheHeaders(res, 60, 300, 600, req);
    if (!isAuth) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const filter = isObjectId
      ? { $or: [{ _id: param }, { slug: param }] }
      : { slug: param };

    const blog = await execLean(Blog.findOne(filter));
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const payload = {
      success: true,
      data: blog
    };
    if (!isAuth) {
      setCachedResponse(cacheKey, payload);
    }
    res.json(payload);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return handleRouteError(res, error, 'Server error while fetching blog post');
  }
});

// @route   POST /api/blog
// @desc    Create blog post
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      slug,
      desc,
      content,
      category,
      tags,
      imageURL,
      imageCloudinaryId,
      date,
      location,
      link,
      isPinned,
      isPublished,
      readTime,
      author
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
        errors: ['Title is required'],
        fieldErrors: { title: 'Title is required' }
      });
    }

    const blog = new Blog({
      title: title.trim(),
      slug: slug ? slug.trim() : undefined,
      desc: desc || '',
      content: content || '',
      category: category || 'Personal',
      tags: Array.isArray(tags) ? tags : [],
      imageURL: imageURL || '',
      imageCloudinaryId: imageCloudinaryId || null,
      date: date || new Date().toISOString().split('T')[0],
      location: location || '',
      link: link || '',
      isPinned: !!isPinned,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      readTime: readTime || '3 min read',
      author: author || 'Valentino Jehaut'
    });

    await blog.save();
    invalidateServerCache('blog:');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    return handleRouteError(res, error, 'Server error while creating blog post');
  }
});

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const param = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const filter = isObjectId
      ? { $or: [{ _id: param }, { slug: param }] }
      : { slug: param };

    const blog = await Blog.findOne(filter);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const {
      title,
      slug,
      desc,
      content,
      category,
      tags,
      imageURL,
      imageCloudinaryId,
      date,
      location,
      link,
      isPinned,
      isPublished,
      readTime,
      author
    } = req.body;

    // Delete old image if new image is provided
    if (imageURL !== undefined && imageURL !== blog.imageURL && blog.imageCloudinaryId) {
      try {
        await deleteImage(blog.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting old blog image:', deleteError);
      }
    }

    if (title !== undefined) blog.title = title.trim();
    if (slug !== undefined) blog.slug = slug.trim();
    if (desc !== undefined) blog.desc = desc;
    if (content !== undefined) blog.content = content;
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : [];
    if (imageURL !== undefined) blog.imageURL = imageURL;
    if (imageCloudinaryId !== undefined) blog.imageCloudinaryId = imageCloudinaryId;
    if (date !== undefined) blog.date = date;
    if (location !== undefined) blog.location = location;
    if (link !== undefined) blog.link = link;
    if (isPinned !== undefined) blog.isPinned = Boolean(isPinned);
    if (isPublished !== undefined) blog.isPublished = Boolean(isPublished);
    if (readTime !== undefined) blog.readTime = readTime;
    if (author !== undefined) blog.author = author;

    await blog.save();
    invalidateServerCache('blog:');

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    return handleRouteError(res, error, 'Server error while updating blog post');
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete blog post
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const param = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(param);
    const filter = isObjectId
      ? { $or: [{ _id: param }, { slug: param }] }
      : { slug: param };

    const blog = await Blog.findOne(filter);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (blog.imageCloudinaryId) {
      try {
        await deleteImage(blog.imageCloudinaryId);
      } catch (deleteError) {
        console.error('Error deleting blog image:', deleteError);
      }
    }

    await Blog.deleteOne({ _id: blog._id });
    invalidateServerCache('blog:');

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return handleRouteError(res, error, 'Server error while deleting blog post');
  }
});

module.exports = router;

