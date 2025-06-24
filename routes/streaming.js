const express = require('express');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Content = require('../models/Content');
const User = require('../models/User');
const { auth, requireSubscription } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stream/:contentId
// @desc    Stream video content
// @access  Private
router.get('/:contentId', auth, requireSubscription, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { range } = req.headers;

    // Get content
    const content = await Content.findById(contentId);
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

    // Get video file path
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', content.videoUrl);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Handle full file request
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }

    // Update view count
    content.viewCount += 1;
    await content.save();

  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error streaming video'
    });
  }
});

// @route   POST /api/stream/:contentId/progress
// @desc    Update watch progress
// @access  Private
router.post('/:contentId/progress', auth, requireSubscription, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { progress, duration } = req.body;

    // Validate progress
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid progress value'
      });
    }

    // Get content
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Update user's watch history
    const user = await User.findById(req.user._id);
    const existingHistoryIndex = user.watchHistory.findIndex(
      history => history.contentId.toString() === contentId
    );

    if (existingHistoryIndex !== -1) {
      // Update existing history
      user.watchHistory[existingHistoryIndex].progress = progress;
      user.watchHistory[existingHistoryIndex].watchedAt = new Date();
    } else {
      // Add new history
      user.watchHistory.push({
        contentId,
        progress,
        watchedAt: new Date()
      });
    }

    await user.save();

    // Update content watch time
    if (duration && progress > 0) {
      const watchTimeMinutes = (duration * progress) / 100 / 60;
      content.watchTime += watchTimeMinutes;
      await content.save();
    }

    res.json({
      success: true,
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating progress'
    });
  }
});

// @route   GET /api/stream/:contentId/progress
// @desc    Get watch progress for content
// @access  Private
router.get('/:contentId/progress', auth, requireSubscription, async (req, res) => {
  try {
    const { contentId } = req.params;

    const user = await User.findById(req.user._id);
    const history = user.watchHistory.find(
      h => h.contentId.toString() === contentId
    );

    res.json({
      success: true,
      data: {
        progress: history ? history.progress : 0,
        lastWatched: history ? history.watchedAt : null
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting progress'
    });
  }
});

// @route   GET /api/stream/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/watchlist', auth, requireSubscription, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchlist', '-userRatings -seasons.episodes.videoUrl');

    res.json({
      success: true,
      data: {
        watchlist: user.watchlist
      }
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting watchlist'
    });
  }
});

// @route   POST /api/stream/watchlist/:contentId
// @desc    Add content to watchlist
// @access  Private
router.post('/watchlist/:contentId', auth, requireSubscription, async (req, res) => {
  try {
    const { contentId } = req.params;

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Check if already in watchlist
    if (user.watchlist.includes(contentId)) {
      return res.status(400).json({
        success: false,
        message: 'Content already in watchlist'
      });
    }

    user.watchlist.push(contentId);
    await user.save();

    res.json({
      success: true,
      message: 'Added to watchlist successfully'
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to watchlist'
    });
  }
});

// @route   DELETE /api/stream/watchlist/:contentId
// @desc    Remove content from watchlist
// @access  Private
router.delete('/watchlist/:contentId', auth, requireSubscription, async (req, res) => {
  try {
    const { contentId } = req.params;

    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter(
      id => id.toString() !== contentId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Removed from watchlist successfully'
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from watchlist'
    });
  }
});

// @route   GET /api/stream/history
// @desc    Get user's watch history
// @access  Private
router.get('/history', auth, requireSubscription, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.contentId', '-userRatings -seasons.episodes.videoUrl');

    // Sort by most recent
    const sortedHistory = user.watchHistory.sort((a, b) => 
      new Date(b.watchedAt) - new Date(a.watchedAt)
    );

    res.json({
      success: true,
      data: {
        history: sortedHistory
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting history'
    });
  }
});

// @route   DELETE /api/stream/history/:contentId
// @desc    Remove content from watch history
// @access  Private
router.delete('/history/:contentId', auth, requireSubscription, async (req, res) => {
  try {
    const { contentId } = req.params;

    const user = await User.findById(req.user._id);
    user.watchHistory = user.watchHistory.filter(
      history => history.contentId.toString() !== contentId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Removed from history successfully'
    });

  } catch (error) {
    console.error('Remove from history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from history'
    });
  }
});

module.exports = router; 