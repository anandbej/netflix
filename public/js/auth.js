class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check for existing token
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        if (token) {
            this.validateToken(token);
        }
    }

    async validateToken(token) {
        try {
            api.setToken(token);
            const response = await api.getProfile();
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            this.onAuthSuccess();
        } catch (error) {
            console.error('Token validation failed:', error);
            this.logout();
        }
    }

    async login(email, password) {
        try {
            const response = await api.login(email, password);
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            api.setToken(response.data.token);
            this.onAuthSuccess();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await api.register(userData);
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            api.setToken(response.data.token);
            this.onAuthSuccess();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            api.setToken(null);
            this.onLogout();
        }
    }

    onAuthSuccess() {
        // Update UI
        this.updateUI();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('auth:success', {
            detail: { user: this.currentUser }
        }));
    }

    onLogout() {
        // Update UI
        this.updateUI();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    updateUI() {
        const userMenu = document.querySelector('.user-menu');
        const userAvatar = document.getElementById('user-avatar');
        
        if (this.isAuthenticated) {
            // Show user menu
            if (userMenu) userMenu.style.display = 'block';
            
            // Update avatar
            if (userAvatar) {
                if (this.currentUser?.profilePicture) {
                    userAvatar.innerHTML = `<img src="${this.currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; border-radius: 4px;">`;
                } else {
                    userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
                }
            }
        } else {
            // Hide user menu
            if (userMenu) userMenu.style.display = 'none';
            
            // Reset avatar
            if (userAvatar) {
                userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
            }
        }
    }

    getUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    hasSubscription() {
        return this.currentUser?.subscription?.status === 'active';
    }

    hasPremium() {
        return this.currentUser?.subscription?.plan === 'premium' && this.hasSubscription();
    }
}

const auth = new Auth(); 