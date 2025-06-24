const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalTitle: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['movie', 'tv_show', 'documentary', 'standup'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  genres: [{
    type: String,
    required: true
  }],
  releaseYear: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'],
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  country: {
    type: String,
    default: 'US'
  },
  director: {
    type: String,
    required: true
  },
  cast: [{
    name: String,
    role: String,
    character: String
  }],
  crew: [{
    name: String,
    role: String // director, producer, writer, etc.
  }],
  poster: {
    type: String,
    required: true
  },
  banner: {
    type: String,
    required: true
  },
  trailer: {
    type: String
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoQuality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4K'],
    default: '1080p'
  },
  subtitles: [{
    language: String,
    url: String
  }],
  audioTracks: [{
    language: String,
    url: String
  }],
  // For TV shows
  seasons: [{
    seasonNumber: Number,
    episodes: [{
      episodeNumber: Number,
      title: String,
      description: String,
      duration: Number,
      videoUrl: String,
      thumbnail: String
    }]
  }],
  // Ratings and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  userRatings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 10
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Content flags
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  isExclusive: {
    type: Boolean,
    default: false
  },
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date
  },
  // Content tags for recommendations
  tags: [String],
  // Viewing statistics
  viewCount: {
    type: Number,
    default: 0
  },
  watchTime: {
    type: Number,
    default: 0 // total minutes watched
  }
}, {
  timestamps: true
});

// Index for search functionality
contentSchema.index({
  title: 'text',
  description: 'text',
  genres: 'text',
  cast: 'text'
});

// Virtual for full title
contentSchema.virtual('fullTitle').get(function() {
  return `${this.title} (${this.releaseYear})`;
});

// Method to update average rating
contentSchema.methods.updateAverageRating = function() {
  if (this.userRatings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const totalRating = this.userRatings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.userRatings.length;
    this.totalRatings = this.userRatings.length;
  }
};

// Pre-save middleware to update average rating
contentSchema.pre('save', function(next) {
  this.updateAverageRating();
  next();
});

module.exports = mongoose.model('Content', contentSchema); 