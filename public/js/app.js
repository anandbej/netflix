class NetflixApp {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        try {
            // Check if user is already logged in
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
            if (token) {
                api.setToken(token);
                await this.loadUserProfile();
            }

            // Initialize UI
            this.initUI();
            
            // Load content
            await this.loadContent();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showAuthModal();
        }
    }

    async loadUserProfile() {
        try {
            const response = await api.getProfile();
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            this.updateUIForAuthenticatedUser();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.logout();
        }
    }

    initUI() {
        // Show/hide elements based on authentication status
        if (this.isAuthenticated) {
            this.updateUIForAuthenticatedUser();
        } else {
            this.updateUIForUnauthenticatedUser();
        }
    }

    updateUIForAuthenticatedUser() {
        // Update user avatar
        const userAvatar = document.getElementById('user-avatar');
        if (this.currentUser?.profilePicture) {
            userAvatar.innerHTML = `<img src="${this.currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; border-radius: 4px;">`;
        } else {
            userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
        }

        // Show user menu
        document.querySelector('.user-menu').style.display = 'block';
    }

    updateUIForUnauthenticatedUser() {
        // Hide user menu
        document.querySelector('.user-menu').style.display = 'none';
        
        // Show auth modal
        this.showAuthModal();
    }

    async loadContent() {
        try {
            this.showLoading(true);

            // Load different content sections
            const [featured, trending, newContent, recommendations] = await Promise.all([
                api.getFeatured(),
                api.getTrending(),
                api.getNew(),
                this.isAuthenticated ? api.getRecommendations() : Promise.resolve({ data: { recommendations: [] } })
            ]);

            // Render content sections
            this.renderContentSection('featured-content', featured.data.featured);
            this.renderContentSection('trending-content', trending.data.trending);
            this.renderContentSection('new-content', newContent.data.newContent);
            
            if (this.isAuthenticated && recommendations.data.recommendations.length > 0) {
                this.renderContentSection('recommendations-content', recommendations.data.recommendations);
            }

            // Set hero content
            if (featured.data.featured.length > 0) {
                this.setHeroContent(featured.data.featured[0]);
            }

        } catch (error) {
            console.error('Error loading content:', error);
            this.showError('Failed to load content');
        } finally {
            this.showLoading(false);
        }
    }

    renderContentSection(containerId, content) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = content.map(item => this.createContentCard(item)).join('');
    }

    createContentCard(content) {
        const posterUrl = content.poster || '/uploads/posters/big_buck_bunny.jpg';
        const duration = this.formatDuration(content.duration);
        
        return `
            <div class="content-card" data-content-id="${content._id}">
                <img src="${posterUrl}" alt="${content.title}" loading="lazy">
                <div class="content-card-info">
                    <h3 class="content-card-title">${content.title}</h3>
                    <div class="content-card-meta">
                        <span>${content.releaseYear}</span>
                        <span>${content.rating}</span>
                        <span>${duration}</span>
                    </div>
                    <div class="content-card-actions">
                        <button class="btn btn-play btn-sm" onclick="app.playContent('${content._id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-add btn-sm" onclick="app.addToWatchlist('${content._id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-more btn-sm" onclick="app.showContentDetails('${content._id}')">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setHeroContent(content) {
        const heroTitle = document.getElementById('hero-title');
        const heroDescription = document.getElementById('hero-description');
        const playBtn = document.getElementById('play-btn');
        const moreInfoBtn = document.getElementById('more-info-btn');

        if (heroTitle) heroTitle.textContent = content.title;
        if (heroDescription) heroDescription.textContent = content.shortDescription || content.description;
        
        if (playBtn) {
            playBtn.onclick = () => this.playContent(content._id);
        }
        
        if (moreInfoBtn) {
            moreInfoBtn.onclick = () => this.showContentDetails(content._id);
        }

        // Set hero background
        const hero = document.getElementById('hero');
        if (hero && content.banner) {
            hero.style.backgroundImage = `url(${content.banner})`;
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'center';
        }
    }

    async playContent(contentId) {
        if (!this.isAuthenticated) {
            this.showAuthModal();
            return;
        }

        try {
            const videoUrl = await api.getVideoUrl(contentId);
            this.showVideoModal(contentId, videoUrl);
        } catch (error) {
            console.error('Error playing content:', error);
            this.showError('Failed to play content');
        }
    }

    async showContentDetails(contentId) {
        try {
            const response = await api.getContentById(contentId);
            const content = response.data.content;
            
            // Populate details modal
            document.getElementById('details-title').textContent = content.title;
            document.getElementById('details-poster').src = content.poster || '/uploads/posters/big_buck_bunny.jpg';
            document.getElementById('details-year').textContent = content.releaseYear;
            document.getElementById('details-rating').textContent = content.rating;
            document.getElementById('details-duration').textContent = this.formatDuration(content.duration);
            document.getElementById('details-description').textContent = content.description;
            document.getElementById('details-cast').textContent = content.cast.map(c => c.name).join(', ');
            document.getElementById('details-genres').textContent = content.genres.join(', ');

            // Set up action buttons
            document.getElementById('details-play-btn').onclick = () => this.playContent(contentId);
            document.getElementById('add-to-list-btn').onclick = () => this.addToWatchlist(contentId);

            // Show modal
            this.showModal('details-modal');
        } catch (error) {
            console.error('Error loading content details:', error);
            this.showError('Failed to load content details');
        }
    }

    async addToWatchlist(contentId) {
        if (!this.isAuthenticated) {
            this.showAuthModal();
            return;
        }

        try {
            await api.addToWatchlist(contentId);
            this.showSuccess('Added to watchlist');
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            this.showError('Failed to add to watchlist');
        }
    }

    showVideoModal(contentId, videoUrl) {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('video-player');
        const title = document.getElementById('modal-title');

        // Set video source
        video.src = videoUrl;
        title.textContent = 'Now Playing';

        // Show modal
        this.showModal('video-modal');

        // Start playing
        video.play();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    showAuthModal() {
        this.showModal('auth-modal');
    }

    async login(email, password) {
        try {
            this.showLoading(true);
            const response = await api.login(email, password);
            
            api.setToken(response.data.token);
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            
            this.hideModal('auth-modal');
            this.updateUIForAuthenticatedUser();
            await this.loadContent();
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Login failed');
        } finally {
            this.showLoading(false);
        }
    }

    async register(userData) {
        try {
            this.showLoading(true);
            const response = await api.register(userData);
            
            api.setToken(response.data.token);
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            
            this.hideModal('auth-modal');
            this.updateUIForAuthenticatedUser();
            await this.loadContent();
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message || 'Registration failed');
        } finally {
            this.showLoading(false);
        }
    }

    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            api.setToken(null);
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateUIForUnauthenticatedUser();
        }
    }

    setupEventListeners() {
        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('auth-email').value;
                const password = document.getElementById('auth-password').value;
                this.login(email, password);
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // User menu
        const userAvatar = document.getElementById('user-avatar');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (userAvatar && dropdownMenu) {
            userAvatar.addEventListener('click', () => {
                dropdownMenu.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    async performSearch(query) {
        if (!query.trim()) return;

        try {
            const response = await api.getContent({ search: query });
            // For now, just show results in console
            console.log('Search results:', response.data.content);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.toggle('show', show);
        }
    }

    showError(message) {
        // Simple error display - you can enhance this
        alert(message);
    }

    showSuccess(message) {
        // Simple success display - you can enhance this
        console.log('Success:', message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NetflixApp();
}); 