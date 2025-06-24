class UI {
    constructor() {
        this.activeModals = new Set();
        this.init();
    }

    init() {
        this.setupModalHandlers();
        this.setupDropdownHandlers();
        this.setupScrollEffects();
    }

    setupModalHandlers() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Close modals with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Close button handlers
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    setupDropdownHandlers() {
        const userAvatar = document.getElementById('user-avatar');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (userAvatar && dropdownMenu) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    }

    setupScrollEffects() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            this.activeModals.add(modalId);
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            this.activeModals.delete(modalId);
            
            // Re-enable body scroll if no modals are open
            if (this.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        }
    }

    hideAllModals() {
        this.activeModals.forEach(modalId => {
            this.hideModal(modalId);
        });
    }

    showLoading(show = true) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.toggle('show', show);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e50914' : type === 'success' ? '#00ff00' : '#333'};
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    // Content card hover effects
    setupContentCardEffects() {
        document.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.content-card');
            if (card) {
                card.style.transform = 'scale(1.05)';
                card.style.zIndex = '10';
            }
        });

        document.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.content-card');
            if (card) {
                card.style.transform = 'scale(1)';
                card.style.zIndex = '1';
            }
        });
    }

    // Search functionality
    setupSearch() {
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

            // Search suggestions
            searchInput.addEventListener('input', (e) => {
                this.showSearchSuggestions(e.target.value);
            });
        }
    }

    async performSearch(query) {
        if (!query.trim()) return;

        try {
            this.showLoading(true);
            const response = await api.getContent({ search: query });
            
            // Display search results
            this.displaySearchResults(response.data.content);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed');
        } finally {
            this.showLoading(false);
        }
    }

    displaySearchResults(results) {
        // Create a modal to show search results
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Search Results</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-results">
                        ${results.length > 0 ? 
                            results.map(item => this.createSearchResultCard(item)).join('') :
                            '<p>No results found</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.showModal(modal.id);
    }

    createSearchResultCard(content) {
        return `
            <div class="search-result-card" onclick="app.showContentDetails('${content._id}')">
                <img src="${content.poster || '/uploads/posters/big_buck_bunny.jpg'}" alt="${content.title}">
                <div class="search-result-info">
                    <h4>${content.title}</h4>
                    <p>${content.shortDescription || content.description}</p>
                    <span>${content.releaseYear} • ${content.rating} • ${this.formatDuration(content.duration)}</span>
                </div>
            </div>
        `;
    }

    showSearchSuggestions(query) {
        // Implement search suggestions if needed
        // For now, just a placeholder
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    // Responsive menu toggle
    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('show');
            });
        }
    }
}

const ui = new UI(); 