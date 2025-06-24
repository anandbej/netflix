const mongoose = require('mongoose');
const Content = require('../models/Content');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix-clone';

const sampleContent = [
  {
    title: 'Big Buck Bunny',
    originalTitle: 'Big Buck Bunny',
    type: 'movie',
    description: 'A giant rabbit takes a comical revenge on a group of bullying rodents. A short animated film by the Blender Institute.',
    shortDescription: 'A giant rabbit takes revenge on bullying rodents.',
    genres: ['Animation', 'Comedy', 'Family'],
    releaseYear: 2008,
    duration: 10,
    rating: 'PG',
    language: 'en',
    country: 'NL',
    director: 'Sacha Goedegebure',
    cast: [
      { name: 'Big Buck Bunny', role: 'Main', character: 'Big Buck Bunny' }
    ],
    crew: [
      { name: 'Sacha Goedegebure', role: 'Director' }
    ],
    poster: '/uploads/posters/big_buck_bunny.jpg',
    banner: '/uploads/banners/big_buck_bunny_banner.jpg',
    trailer: '',
    videoUrl: 'big_buck_bunny.mp4',
    videoQuality: '1080p',
    subtitles: [],
    audioTracks: [],
    isFeatured: true,
    isTrending: true,
    isNew: false,
    isExclusive: false,
    isAvailable: true,
    tags: ['bunny', 'animation', 'blender'],
  },
  {
    title: 'Elephants Dream',
    originalTitle: 'Elephants Dream',
    type: 'movie',
    description: 'The story of two strange characters exploring a capricious and seemingly infinite machine. The first open movie made with Blender.',
    shortDescription: 'Two characters explore a bizarre machine world.',
    genres: ['Animation', 'Sci-Fi', 'Short'],
    releaseYear: 2006,
    duration: 11,
    rating: 'PG',
    language: 'en',
    country: 'NL',
    director: 'Bassam Kurdali',
    cast: [
      { name: 'Proog', role: 'Main', character: 'Proog' },
      { name: 'Emo', role: 'Main', character: 'Emo' }
    ],
    crew: [
      { name: 'Bassam Kurdali', role: 'Director' }
    ],
    poster: '/uploads/posters/big_buck_bunny.jpg',
    banner: '/uploads/banners/big_buck_bunny_banner.jpg',
    trailer: '',
    videoUrl: 'elephants_dream.mp4',
    videoQuality: '1080p',
    subtitles: [],
    audioTracks: [],
    isFeatured: false,
    isTrending: true,
    isNew: false,
    isExclusive: false,
    isAvailable: true,
    tags: ['elephant', 'dream', 'blender'],
  },
  {
    title: 'Sintel',
    originalTitle: 'Sintel',
    type: 'movie',
    description: 'A girl named Sintel embarks on a quest to find a baby dragon she once cared for. An open movie by the Blender Foundation.',
    shortDescription: 'A girl searches for a lost baby dragon.',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    releaseYear: 2010,
    duration: 15,
    rating: 'PG-13',
    language: 'en',
    country: 'NL',
    director: 'Colin Levy',
    cast: [
      { name: 'Sintel', role: 'Main', character: 'Sintel' }
    ],
    crew: [
      { name: 'Colin Levy', role: 'Director' }
    ],
    poster: '/uploads/posters/sintel.jpg',
    banner: '/uploads/banners/sintel_banner.jpg',
    trailer: '',
    videoUrl: 'sintel.mp4',
    videoQuality: '1080p',
    subtitles: [],
    audioTracks: [],
    isFeatured: true,
    isTrending: false,
    isNew: true,
    isExclusive: false,
    isAvailable: true,
    tags: ['sintel', 'dragon', 'blender'],
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    await Content.deleteMany({});
    await Content.insertMany(sampleContent);
    console.log('Sample content inserted!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding content:', err);
    process.exit(1);
  }
}

seed(); 