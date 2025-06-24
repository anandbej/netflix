class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request(CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        return this.request(CONFIG.ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST'
        });
    }

    async getProfile() {
        return this.request(CONFIG.ENDPOINTS.AUTH.ME);
    }

    // Content endpoints
    async getContent(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${CONFIG.ENDPOINTS.CONTENT.ALL}?${queryString}` : CONFIG.ENDPOINTS.CONTENT.ALL;
        return this.request(endpoint);
    }

    async getFeatured() {
        return this.request(CONFIG.ENDPOINTS.CONTENT.FEATURED);
    }

    async getTrending() {
        return this.request(CONFIG.ENDPOINTS.CONTENT.TRENDING);
    }

    async getNew() {
        return this.request(CONFIG.ENDPOINTS.CONTENT.NEW);
    }

    async getRecommendations() {
        return this.request(CONFIG.ENDPOINTS.CONTENT.RECOMMENDATIONS);
    }

    async getContentById(id) {
        return this.request(`${CONFIG.ENDPOINTS.CONTENT.ALL}/${id}`);
    }

    async getGenres() {
        return this.request(CONFIG.ENDPOINTS.CONTENT.GENRES);
    }

    // Stream endpoints
    async getVideoUrl(contentId) {
        return `${this.baseURL}${CONFIG.ENDPOINTS.STREAM.VIDEO}/${contentId}`;
    }

    async updateProgress(contentId, progress, duration) {
        return this.request(`${CONFIG.ENDPOINTS.STREAM.VIDEO}/${contentId}/progress`, {
            method: 'POST',
            body: JSON.stringify({ progress, duration })
        });
    }

    async getProgress(contentId) {
        return this.request(`${CONFIG.ENDPOINTS.STREAM.VIDEO}/${contentId}/progress`);
    }

    async getWatchlist() {
        return this.request(CONFIG.ENDPOINTS.STREAM.WATCHLIST);
    }

    async addToWatchlist(contentId) {
        return this.request(`${CONFIG.ENDPOINTS.STREAM.WATCHLIST}/${contentId}`, {
            method: 'POST'
        });
    }

    async removeFromWatchlist(contentId) {
        return this.request(`${CONFIG.ENDPOINTS.STREAM.WATCHLIST}/${contentId}`, {
            method: 'DELETE'
        });
    }

    async getHistory() {
        return this.request(CONFIG.ENDPOINTS.STREAM.HISTORY);
    }

    // User endpoints
    async updateProfile(profileData) {
        return this.request(CONFIG.ENDPOINTS.USERS.PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async updatePreferences(preferences) {
        return this.request(CONFIG.ENDPOINTS.USERS.PREFERENCES, {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async updateSubscription(subscriptionData) {
        return this.request(CONFIG.ENDPOINTS.USERS.SUBSCRIPTION, {
            method: 'PUT',
            body: JSON.stringify(subscriptionData)
        });
    }

    async getUserStats() {
        return this.request(CONFIG.ENDPOINTS.USERS.STATS);
    }
}

const api = new API(); 