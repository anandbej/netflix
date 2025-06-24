const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Content = require('../models/Content');
const { auth, optionalAuth, requireSubscription } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/content/featured
// @desc    Get featured content
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const featured = await Content.find({ 
      isFeatured: true, 
      isAvailable: true 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-userRatings -seasons.episodes.videoUrl');

    res.json({
      success: true,
      data: { featured }
    });

  } catch (error) {
    console.error('Get featured content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting featured content'
    });
  }
});

// @route   GET /api/content/trending
// @desc    Get trending content
// @access  Public
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const trending = await Content.find({ 
      isTrending: true, 
      isAvailable: true 
    })
    .sort({ viewCount: -1 })
    .limit(10)
    .select('-userRatings -seasons.episodes.videoUrl');

    res.json({
      success: true,
      data: { trending }
    });

  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting trending content'
    });
  }
});

// @route   GET /api/content/new
// @desc    Get new content
// @access  Public
router.get('/new', optionalAuth, async (req, res) => {
  try {
    const newContent = await Content.find({ 
      isNew: true, 
      isAvailable: true 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-userRatings -seasons.episodes.videoUrl');

    res.json({
      success: true,
      data: { newContent }
    });

  } catch (error) {
    console.error('Get new content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting new content'
    });
  }
});

// @route   GET /api/content/recommendations
// @desc    Get personalized recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get user's watch history genres
    const userGenres = req.user.watchHistory
      .map(history => history.contentId)
      .filter(Boolean);

    if (userGenres.length === 0) {
      // If no watch history, return popular content
      const recommendations = await Content.find({ 
        isAvailable: true 
      })
      .sort({ viewCount: -1, averageRating: -1 })
      .limit(10)
      .select('-userRatings -seasons.episodes.videoUrl');

      return res.json({
        success: true,
        data: { recommendations }
      });
    }

    // Get content with similar genres
    const recommendations = await Content.find({
      isAvailable: true,
      genres: { $in: userGenres },
      _id: { $nin: req.user.watchHistory.map(h => h.contentId) }
    })
    .sort({ averageRating: -1, viewCount: -1 })
    .limit(10)
    .select('-userRatings -seasons.episodes.videoUrl');

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting recommendations'
    });
  }
});

// @route   GET /api/content/genres
// @desc    Get all available genres
// @access  Public
router.get('/genres', async (req, res) => {
  try {
    const genres = await Content.distinct('genres');
    
    res.json({
      success: true,
      data: { genres }
    });

  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting genres'
    });
  }
});

// @route   GET /api/content
// @desc    Get all content with filtering and pagination
// @access  Public
router.get('/', [
  optionalAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('genre').optional().isString().withMessage('Genre must be a string'),
  query('type').optional().isIn(['movie', 'tv_show', 'documentary', 'standup']).withMessage('Invalid content type'),
  query('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
  query('rating').optional().isIn(['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA']).withMessage('Invalid rating'),
  query('sort').optional().isIn(['title', 'releaseYear', 'averageRating', 'viewCount', 'createdAt']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      genre,
      type,
      year,
      rating,
      sort = 'createdAt',
      order = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (genre) filter.genres = { $in: [genre] };
    if (type) filter.type = type;
    if (year) filter.releaseYear = year;
    if (rating) filter.rating = rating;

    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get content
    const content = await Content.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-userRatings -seasons.episodes.videoUrl');

    // Get total count
    const total = await Content.countDocuments(filter);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting content'
    });
  }
});

// @route   GET /api/content/:id
// @desc    Get content by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .select('-userRatings -seasons.episodes.videoUrl');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (!content.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Content not available'
      });
    }

    res.json({
      success: true,
      data: { content }
    });

  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting content'
    });
  }
});

// @route   POST /api/content/:id/rate
// @desc    Rate content
// @access  Private
router.post('/:id/rate', [
  auth,
  requireSubscription,
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { rating, review } = req.body;
    const contentId = req.params.id;

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user already rated this content
    const existingRatingIndex = content.userRatings.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      content.userRatings[existingRatingIndex].rating = rating;
      content.userRatings[existingRatingIndex].review = review;
      content.userRatings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      content.userRatings.push({
        userId: req.user._id,
        rating,
        review
      });
    }

    await content.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        averageRating: content.averageRating,
        totalRatings: content.totalRatings
      }
    });

  } catch (error) {
    console.error('Rate content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rating content'
    });
  }
});

module.exports = router; 