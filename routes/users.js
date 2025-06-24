const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
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

    const { firstName, lastName, username, profilePicture } = req.body;

    // Check if username is already taken (if provided)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update user profile
    if (firstName) req.user.firstName = firstName;
    if (lastName) req.user.lastName = lastName;
    if (username) req.user.username = username;
    if (profilePicture) req.user.profilePicture = profilePicture;

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.getProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('genres')
    .optional()
    .isArray()
    .withMessage('Genres must be an array'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters'),
  body('subtitles')
    .optional()
    .isBoolean()
    .withMessage('Subtitles must be a boolean'),
  body('autoplay')
    .optional()
    .isBoolean()
    .withMessage('Autoplay must be a boolean')
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

    const { genres, language, subtitles, autoplay } = req.body;

    // Update preferences
    if (genres !== undefined) req.user.preferences.genres = genres;
    if (language !== undefined) req.user.preferences.language = language;
    if (subtitles !== undefined) req.user.preferences.subtitles = subtitles;
    if (autoplay !== undefined) req.user.preferences.autoplay = autoplay;

    await req.user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: req.user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

// @route   PUT /api/users/subscription
// @desc    Update subscription
// @access  Private
router.put('/subscription', [
  auth,
  body('plan')
    .isIn(['basic', 'standard', 'premium'])
    .withMessage('Invalid subscription plan'),
  body('status')
    .isIn(['active', 'inactive', 'cancelled'])
    .withMessage('Invalid subscription status')
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

    const { plan, status } = req.body;

    // Update subscription
    req.user.subscription.plan = plan;
    req.user.subscription.status = status;
    
    if (status === 'active') {
      req.user.subscription.startDate = new Date();
      // Set end date to 30 days from now (for demo purposes)
      req.user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (status === 'cancelled') {
      req.user.subscription.endDate = new Date();
    }

    await req.user.save();

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: req.user.subscription
      }
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    // Deactivate account instead of deleting
    req.user.isActive = false;
    await req.user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.contentId', 'title duration');

    const totalWatchTime = user.watchHistory.reduce((total, history) => {
      if (history.contentId && history.progress > 0) {
        return total + (history.contentId.duration * history.progress / 100);
      }
      return total;
    }, 0);

    const favoriteGenres = user.watchHistory.reduce((genres, history) => {
      if (history.contentId) {
        history.contentId.genres.forEach(genre => {
          genres[genre] = (genres[genre] || 0) + 1;
        });
      }
      return genres;
    }, {});

    const topGenres = Object.entries(favoriteGenres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    res.json({
      success: true,
      data: {
        totalWatchTime: Math.round(totalWatchTime), // in minutes
        totalWatched: user.watchHistory.length,
        watchlistCount: user.watchlist.length,
        favoriteGenres: topGenres,
        subscriptionStatus: user.subscription.status,
        subscriptionPlan: user.subscription.plan
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting stats'
    });
  }
});

module.exports = router; 