/**
 * Before/After Slider Component
 * A lightweight, reusable component for comparing two media elements (video/image)
 * 
 * USAGE:
 * 1. Include this script in your HTML:
 *    <script src="assets/js/before-after.js" defer></script>
 * 
 * 2. Add the container HTML with data attributes:
 *    <div class="before-after-container"
 *         data-before="path/to/before.mp4"
 *         data-after="path/to/after.mp4"
 *         data-type="video"
 *         data-label-before="Original"
 *         data-label-after="VFX">
 *    </div>
 * 
 * 3. (Optional) Add a tip below the slider:
 *    <div class="slider-tip">
 *        <span class="tip-icon">💡</span>
 *        <span class="tip-text">Tip: Hover or drag the slider to compare before and after</span>
 *    </div>
 * 
 * DATA ATTRIBUTES:
 * - data-before: Path to the before media (required)
 * - data-after: Path to the after media (required)
 * - data-type: "video" or "image" (optional, auto-detected from file extension)
 * - data-label-before: Label for before side (default: "Before")
 * - data-label-after: Label for after side (default: "After")
 * 
 * FEATURES:
 * - Auto-detects media type (video/image) from file extension
 * - Synchronized video playback with autoplay and loop
 * - Mouse hover tracking for smooth comparison
 * - Drag functionality with visual feedback
 * - Touch support for mobile devices
 * - Keyboard navigation (arrow keys)
 * - Responsive design with mobile optimizations
 * - Glassmorphism styling matching the site theme
 * 
 * The component auto-initializes all containers with class "before-after-container"
 * on page load. No additional JavaScript required!
 */

class BeforeAfterSlider {
  constructor(container) {
    this.container = container;
    this.beforeSrc = container.dataset.before;
    this.afterSrc = container.dataset.after;
    this.mediaType = container.dataset.type || this.detectMediaType(this.beforeSrc);
    this.labelBefore = container.dataset.labelBefore || 'Before';
    this.labelAfter = container.dataset.labelAfter || 'After';
    
    this.sliderPosition = 50;
    this.isDragging = false;
    this.beforeMedia = null;
    this.afterMedia = null;
    
    this.init();
  }
  
  detectMediaType(src) {
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const extension = src.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension) ? 'video' : 'image';
  }
  
  init() {
    this.createDOM();
    this.bindEvents();
    
    if (this.mediaType === 'video') {
      this.syncVideos();
    }
  }
  
  createDOM() {
    this.container.classList.add('before-after-slider');
    this.container.innerHTML = `
      <div class="ba-wrapper">
        <div class="ba-before">
          ${this.createMediaElement('before')}
        </div>
        <div class="ba-after">
          ${this.createMediaElement('after')}
        </div>
        <div class="ba-label ba-label-before">${this.labelBefore}</div>
        <div class="ba-label ba-label-after">${this.labelAfter}</div>
        <div class="ba-slider" style="left: ${this.sliderPosition}%">
          <div class="ba-slider-line"></div>
          <button class="ba-slider-handle" aria-label="Drag to compare before and after">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 9L4 12L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 9L20 12L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    this.wrapper = this.container.querySelector('.ba-wrapper');
    this.beforeElement = this.container.querySelector('.ba-before');
    this.afterElement = this.container.querySelector('.ba-after');
    this.slider = this.container.querySelector('.ba-slider');
    this.handle = this.container.querySelector('.ba-slider-handle');
    this.beforeLabel = this.container.querySelector('.ba-label-before');
    this.afterLabel = this.container.querySelector('.ba-label-after');
    
    if (this.mediaType === 'video') {
      this.beforeMedia = this.container.querySelector('.ba-before video');
      this.afterMedia = this.container.querySelector('.ba-after video');
    } else {
      this.beforeMedia = this.container.querySelector('.ba-before img');
      this.afterMedia = this.container.querySelector('.ba-after img');
    }
    
    this.updateSliderPosition(this.sliderPosition);
  }
  
  createMediaElement(position) {
    const src = position === 'before' ? this.beforeSrc : this.afterSrc;
    
    if (this.mediaType === 'video') {
      return `
        <video 
          src="${src}" 
          autoplay 
          muted 
          loop 
          playsinline
          preload="auto"
          onerror="console.error('Failed to load video:', '${src}')"
          aria-label="${position === 'before' ? this.labelBefore : this.labelAfter} video">
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      return `
        <img 
          src="${src}" 
          alt="${position === 'before' ? this.labelBefore : this.labelAfter}"
          draggable="false"
          onerror="console.error('Failed to load image:', '${src}')">
      `;
    }
  }
  
  bindEvents() {
    // Mouse events
    this.handle.addEventListener('mousedown', this.startDrag.bind(this));
    document.addEventListener('mousemove', this.onDrag.bind(this));
    document.addEventListener('mouseup', this.endDrag.bind(this));
    
    // Touch events
    this.handle.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onDrag.bind(this), { passive: false });
    document.addEventListener('touchend', this.endDrag.bind(this));
    
    // Hover events
    this.wrapper.addEventListener('mouseenter', () => {
      if (!this.isDragging) {
        this.wrapper.classList.add('hovering');
      }
    });
    
    this.wrapper.addEventListener('mouseleave', () => {
      this.wrapper.classList.remove('hovering');
    });
    
    this.wrapper.addEventListener('mousemove', (e) => {
      if (!this.isDragging && this.wrapper.classList.contains('hovering')) {
        const position = this.getPositionFromEvent(e);
        this.updateSliderPosition(position);
      }
    });
    
    // Keyboard events
    this.handle.addEventListener('keydown', (e) => {
      const step = 2;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.updateSliderPosition(Math.max(0, this.sliderPosition - step));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.updateSliderPosition(Math.min(100, this.sliderPosition + step));
      }
    });
  }
  
  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;
    this.wrapper.classList.add('dragging');
    this.wrapper.classList.remove('hovering');
  }
  
  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    
    const position = this.getPositionFromEvent(e);
    this.updateSliderPosition(position);
  }
  
  endDrag() {
    this.isDragging = false;
    this.wrapper.classList.remove('dragging');
  }
  
  getPositionFromEvent(e) {
    const rect = this.wrapper.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const position = (x / rect.width) * 100;
    return Math.max(0, Math.min(100, position));
  }
  
  updateSliderPosition(position) {
    this.sliderPosition = position;
    this.slider.style.left = `${position}%`;
    // Clip from the right: position 0% shows before, position 100% shows after
    this.afterElement.style.clipPath = `inset(0 ${100 - position}% 0 0)`;

    // Update label visibility based on slider position
    if (this.beforeLabel) {
      this.beforeLabel.style.opacity = position >= 95 ? '0' : '1';
    }
    if (this.afterLabel) {
      this.afterLabel.style.opacity = position <= 5 ? '0' : '1';
    }
  }
  
  syncVideos() {
    if (!this.beforeMedia || !this.afterMedia) return;
    
    // Ensure videos start playing when loaded
    this.beforeMedia.addEventListener('loadeddata', () => {
      this.beforeMedia.play().catch(e => console.log('Autoplay prevented:', e));
    });
    
    this.afterMedia.addEventListener('loadeddata', () => {
      this.afterMedia.play().catch(e => console.log('Autoplay prevented:', e));
    });
    
    // Sync play/pause
    this.beforeMedia.addEventListener('play', () => {
      this.afterMedia.play();
    });
    
    this.beforeMedia.addEventListener('pause', () => {
      this.afterMedia.pause();
    });
    
    // Sync time on seek
    this.beforeMedia.addEventListener('seeked', () => {
      this.afterMedia.currentTime = this.beforeMedia.currentTime;
    });
    
    // Keep videos in sync during playback
    setInterval(() => {
      if (!this.beforeMedia.paused && 
          Math.abs(this.beforeMedia.currentTime - this.afterMedia.currentTime) > 0.1) {
        this.afterMedia.currentTime = this.beforeMedia.currentTime;
      }
    }, 100);
  }
}

// Auto-initialize all sliders on page load
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.before-after-container');
  containers.forEach(container => {
    new BeforeAfterSlider(container);
  });
});