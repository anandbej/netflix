# Netflix Clone - Streaming Service

A complete Netflix-like streaming service built with Node.js, Express, MongoDB, and modern web technologies. This project demonstrates a full-stack streaming platform with user authentication, content management, video streaming, and a responsive frontend.

## 🎬 Features

### Core Functionality
- **User Authentication**: JWT-based registration and login system
- **Video Streaming**: Range-request support for smooth video playback
- **Content Management**: CRUD operations for movies and TV shows
- **User Profiles**: Personalized experience with watch history and preferences
- **Watchlists**: Save and manage favorite content
- **Recommendations**: AI-powered content suggestions based on viewing history
- **Search & Filtering**: Advanced content discovery with multiple filters

### Technical Features
- **Responsive Design**: Netflix-like UI that works on all devices
- **Real-time Progress Tracking**: Resume watching from where you left off
- **Subscription Management**: Multiple subscription tiers (Basic, Standard, Premium)
- **Security**: Rate limiting, CORS, input validation, and secure authentication
- **Performance**: Optimized video streaming with compression and caching

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security middleware

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - ES6+ features
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Development
- **Nodemon** - Auto-restart development server
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
netflix/
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User data model
│   └── Content.js           # Content data model
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── config.js        # Configuration
│   │   ├── api.js           # API service
│   │   ├── auth.js          # Authentication module
│   │   ├── ui.js            # UI interactions
│   │   ├── player.js        # Video player
│   │   └── app.js           # Main application
│   └── index.html           # Main page
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── content.js           # Content management routes
│   ├── streaming.js         # Video streaming routes
│   └── users.js             # User management routes
├── scripts/
│   └── seedContent.js       # Database seeding
├── uploads/
│   ├── videos/              # Video files
│   ├── posters/             # Content posters
│   └── banners/             # Content banners
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/netflix-clone.git
   cd netflix-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/netflix-clone
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

5. **Seed the database with sample content**
   ```bash
   node scripts/seedContent.js
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### For Users
1. **Register/Login**: Create an account or sign in
2. **Browse Content**: Explore featured, trending, and new content
3. **Watch Videos**: Click play to start streaming
4. **Manage Watchlist**: Add/remove content from your list
5. **Track Progress**: Videos automatically save your progress
6. **Search**: Use the search bar to find specific content

### For Developers
- **API Documentation**: All endpoints are RESTful and well-documented
- **Modular Architecture**: Easy to extend and modify
- **Comprehensive Error Handling**: Proper error responses and logging
- **Security Best Practices**: Input validation, rate limiting, and secure headers

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Content
- `GET /api/content` - Get all content with filtering
- `GET /api/content/featured` - Get featured content
- `GET /api/content/trending` - Get trending content
- `GET /api/content/new` - Get new releases
- `GET /api/content/:id` - Get specific content
- `GET /api/content/recommendations` - Get personalized recommendations

### Streaming
- `GET /api/stream/:contentId` - Stream video content
- `POST /api/stream/:contentId/progress` - Update watch progress
- `GET /api/stream/watchlist` - Get user's watchlist
- `POST /api/stream/watchlist/:contentId` - Add to watchlist

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/stats` - Get user statistics

## 🎥 Sample Content

The application comes with 3 sample videos from the Blender Foundation (public domain):

1. **Big Buck Bunny** - Animated comedy about a giant rabbit
2. **Elephants Dream** - Sci-fi short about two characters in a machine world
3. **Sintel** - Fantasy adventure about a girl searching for a dragon

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Comprehensive validation for all inputs
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for additional security

## 🎨 UI/UX Features

- **Netflix-like Design**: Familiar and intuitive interface
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: CSS transitions and hover effects
- **Dark Theme**: Easy on the eyes for extended viewing
- **Loading States**: Proper feedback during operations
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
```env
PORT=3000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret-key
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Blender Foundation** for providing the sample videos
- **Netflix** for the UI/UX inspiration
- **Open source community** for the amazing tools and libraries

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Happy Streaming! 🎬✨**