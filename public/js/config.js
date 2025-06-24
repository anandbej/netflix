const CONFIG = {
    API_BASE_URL: '/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            ME: '/auth/me',
            REFRESH: '/auth/refresh-token'
        },
        CONTENT: {
            ALL: '/content',
            FEATURED: '/content/featured',
            TRENDING: '/content/trending',
            NEW: '/content/new',
            RECOMMENDATIONS: '/content/recommendations',
            GENRES: '/content/genres'
        },
        STREAM: {
            VIDEO: '/stream',
            PROGRESS: '/stream/progress',
            WATCHLIST: '/stream/watchlist',
            HISTORY: '/stream/history'
        },
        USERS: {
            PROFILE: '/users/profile',
            PREFERENCES: '/users/preferences',
            SUBSCRIPTION: '/users/subscription',
            STATS: '/users/stats'
        }
    },
    STORAGE_KEYS: {
        TOKEN: 'netflix_token',
        USER: 'netflix_user'
    }
}; 