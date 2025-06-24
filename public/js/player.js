class VideoPlayer {
    constructor() {
        this.currentVideo = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.progressInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Video player event listeners
        const video = document.getElementById('video-player');
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                this.duration = video.duration;
                this.loadProgress();
            });

            video.addEventListener('timeupdate', () => {
                this.currentTime = video.currentTime;
                this.updateProgress();
            });

            video.addEventListener('ended', () => {
                this.onVideoEnd();
            });

            video.addEventListener('play', () => {
                this.isPlaying = true;
                this.startProgressTracking();
            });

            video.addEventListener('pause', () => {
                this.isPlaying = false;
                this.stopProgressTracking();
            });

            video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                ui.showError('Video playback error');
            });
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.id === 'video-modal') {
                this.stopVideo();
            }
        });
    }

    async playVideo(contentId, videoUrl) {
        try {
            this.currentVideo = contentId;
            const video = document.getElementById('video-player');
            const modal = document.getElementById('video-modal');
            const title = document.getElementById('modal-title');

            // Set video source
            video.src = videoUrl;
            title.textContent = 'Now Playing';

            // Show modal
            ui.showModal('video-modal');

            // Load video metadata
            await video.load();

            // Start playing
            try {
                await video.play();
            } catch (error) {
                console.error('Autoplay failed:', error);
                // User interaction required for autoplay
            }

        } catch (error) {
            console.error('Error playing video:', error);
            ui.showError('Failed to play video');
        }
    }

    stopVideo() {
        const video = document.getElementById('video-player');
        if (video) {
            video.pause();
            video.src = '';
            this.currentTime = 0;
            this.duration = 0;
            this.stopProgressTracking();
        }

        ui.hideModal('video-modal');
        this.currentVideo = null;
    }

    async loadProgress() {
        if (!this.currentVideo || !auth.isLoggedIn()) return;

        try {
            const response = await api.getProgress(this.currentVideo);
            const progress = response.data.progress;
            
            if (progress > 0 && this.duration > 0) {
                const video = document.getElementById('video-player');
                const resumeTime = (progress / 100) * this.duration;
                video.currentTime = resumeTime;
                
                // Show resume prompt
                this.showResumePrompt(progress);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    showResumePrompt(progress) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Resume Watching</h3>
                </div>
                <div class="modal-body">
                    <p>You were ${Math.round(progress)}% through this video. Would you like to resume?</p>
                    <div class="resume-actions">
                        <button class="btn btn-play" onclick="player.resumeFromProgress()">Resume</button>
                        <button class="btn btn-more" onclick="player.startFromBeginning()">Start Over</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.resumeModal = modal;
    }

    resumeFromProgress() {
        if (this.resumeModal) {
            document.body.removeChild(this.resumeModal);
            this.resumeModal = null;
        }
        
        const video = document.getElementById('video-player');
        if (video) {
            video.play();
        }
    }

    startFromBeginning() {
        if (this.resumeModal) {
            document.body.removeChild(this.resumeModal);
            this.resumeModal = null;
        }
        
        const video = document.getElementById('video-player');
        if (video) {
            video.currentTime = 0;
            video.play();
        }
    }

    startProgressTracking() {
        this.stopProgressTracking();
        this.progressInterval = setInterval(() => {
            this.saveProgress();
        }, 10000); // Save progress every 10 seconds
    }

    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    updateProgress() {
        if (this.duration > 0) {
            const progress = (this.currentTime / this.duration) * 100;
            // Update progress bar if exists
            const progressBar = document.querySelector('.video-progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    async saveProgress() {
        if (!this.currentVideo || !auth.isLoggedIn() || this.duration === 0) return;

        try {
            const progress = (this.currentTime / this.duration) * 100;
            await api.updateProgress(this.currentVideo, progress, this.duration);
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    onVideoEnd() {
        // Save 100% progress
        this.saveProgress();
        
        // Show completion message
        ui.showSuccess('Video completed!');
        
        // Auto-close after a delay
        setTimeout(() => {
            this.stopVideo();
        }, 2000);
    }

    // Video controls
    play() {
        const video = document.getElementById('video-player');
        if (video) {
            video.play();
        }
    }

    pause() {
        const video = document.getElementById('video-player');
        if (video) {
            video.pause();
        }
    }

    seek(time) {
        const video = document.getElementById('video-player');
        if (video) {
            video.currentTime = time;
        }
    }

    setVolume(volume) {
        const video = document.getElementById('video-player');
        if (video) {
            video.volume = Math.max(0, Math.min(1, volume));
        }
    }

    toggleMute() {
        const video = document.getElementById('video-player');
        if (video) {
            video.muted = !video.muted;
        }
    }

    toggleFullscreen() {
        const video = document.getElementById('video-player');
        if (video) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                video.requestFullscreen();
            }
        }
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const video = document.getElementById('video-player');
            if (!video || !this.currentVideo) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    if (this.isPlaying) {
                        this.pause();
                    } else {
                        this.play();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seek(this.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seek(this.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.setVolume(video.volume + 0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.setVolume(video.volume - 0.1);
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        });
    }

    // Quality selection
    setQuality(quality) {
        // For now, just log the quality change
        // In a real implementation, you'd switch video sources
        console.log('Quality changed to:', quality);
    }

    // Subtitle handling
    setSubtitle(language) {
        // For now, just log the subtitle change
        console.log('Subtitle language changed to:', language);
    }

    // Audio track handling
    setAudioTrack(language) {
        // For now, just log the audio track change
        console.log('Audio track changed to:', language);
    }
}

const player = new VideoPlayer(); 