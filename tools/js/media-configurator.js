// Media Configurator - Visual Layout Designer

class MediaConfigurator {
    constructor() {
        this.projectsData = { projects: [] };
        this.currentProject = null;
        this.processMediaBlocks = [];
        this.hasChanges = false;
        this.init();
    }

    async init() {
        document.body.classList.add('loading');

        // Load projects data
        this.projectsData = await Utils.loadProjectsData();

        // Setup UI
        this.setupProjectGrid();
        this.setupHeroSection();
        this.setupProcessSection();
        this.setupEventListeners();
        this.setupDragAndDrop();

        document.body.classList.remove('loading');
    }

    setupProjectGrid() {
        const grid = document.getElementById('projectGrid');
        grid.innerHTML = '';

        this.projectsData.projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-grid-item';
            item.dataset.id = project.id;

            item.innerHTML = `
                <div class="thumbnail">
                    <img src="${Utils.getProjectThumbnail(project)}" alt="${project.displayTitle}">
                </div>
                <div class="info">
                    <div class="title">${project.displayTitle}</div>
                    <div class="id">ID: ${project.id}</div>
                </div>
            `;

            item.addEventListener('click', () => this.selectProject(project.id));
            grid.appendChild(item);
        });
    }

    selectProject(projectId) {
        // Update selected state
        document.querySelectorAll('.project-grid-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === projectId);
        });

        // Load project data
        this.currentProject = this.projectsData.projects.find(p => p.id === projectId);
        if (!this.currentProject) return;

        // Update UI
        document.getElementById('currentProject').textContent = this.currentProject.displayTitle;

        // Load hero media configuration
        this.loadHeroMedia();

        // Load process media configuration
        this.loadProcessMedia();

        // Update preview
        this.updatePreview();
    }

    loadHeroMedia() {
        const project = this.currentProject;

        // Use heroMedia if available, otherwise fall back to mainVideo/heroImage
        let heroType = 'video';
        let heroSrc = '';
        let heroPoster = '';
        let heroAlt = '';

        if (project.heroMedia) {
            heroType = project.heroMedia.type;
            heroSrc = project.heroMedia.src;
            heroPoster = project.heroMedia.poster || '';
            heroAlt = project.heroMedia.alt || '';
        } else if (project.mainVideo) {
            heroType = 'video';
            heroSrc = project.mainVideo;
            heroPoster = project.videoPoster || '';
        } else if (project.heroImage) {
            heroType = 'image';
            heroSrc = project.heroImage;
            heroAlt = project.fullTitle;
        }

        // Update UI
        document.querySelector(`input[name="heroType"][value="${heroType}"]`).checked = true;
        this.toggleHeroConfig(heroType);

        if (heroType === 'video') {
            document.getElementById('heroVideoSrc').value = heroSrc;
            document.getElementById('heroVideoPoster').value = heroPoster;
        } else {
            document.getElementById('heroImageSrc').value = heroSrc;
            document.getElementById('heroImageAlt').value = heroAlt;
        }
    }

    loadProcessMedia() {
        const project = this.currentProject;
        const container = document.getElementById('processMediaBlocks');

        // Clear existing blocks
        container.innerHTML = '';
        this.processMediaBlocks = [];

        // Load from processMedia if available, otherwise convert from beforeAfterMedia
        let mediaItems = [];
        if (project.processMedia && project.processMedia.length > 0) {
            mediaItems = project.processMedia;
        } else if (project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
            // Convert old format
            mediaItems = project.beforeAfterMedia.map((item, index) => ({
                type: item.type === 'video' ? 'before-after-video' : 'before-after-image',
                before: item.before,
                after: item.after,
                label: item.label || `Comparison ${index + 1}`,
                labelBefore: 'Before',
                labelAfter: 'After'
            }));
        }

        // Create blocks for each media item
        if (mediaItems.length > 0) {
            mediaItems.forEach((item, index) => {
                this.addMediaBlock(item.type, item, index);
            });
        } else {
            // Show empty state
            container.innerHTML = `
                <div class="empty-state">
                    <p>Drag media types here or click to add</p>
                    <button id="addMediaBtn" class="btn btn-secondary">+ Add Media Block</button>
                </div>
            `;
        }

        // Update grid preview
        this.updateGridPreview();
    }

    addMediaBlock(type, data = {}, index = null) {
        const container = document.getElementById('processMediaBlocks');

        // Remove empty state if present
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Check max limit
        if (this.processMediaBlocks.length >= 6) {
            this.showStatus('Maximum 6 media blocks allowed', 'error');
            return;
        }

        const blockIndex = index !== null ? index : this.processMediaBlocks.length;
        const block = this.createMediaBlock(type, data, blockIndex);

        container.appendChild(block);
        this.processMediaBlocks.push({ type, data, element: block });

        // Update grid preview
        this.updateGridPreview();

        // Mark as changed
        this.hasChanges = true;
    }

    createMediaBlock(type, data, index) {
        const block = document.createElement('div');
        block.className = 'media-block';
        block.dataset.type = type;
        block.dataset.index = index;

        const icons = {
            'video': '🎬',
            'image': '🖼️',
            'before-after-video': '🎬↔️',
            'before-after-image': '🖼️↔️'
        };

        const titles = {
            'video': 'Video',
            'image': 'Image',
            'before-after-video': 'Before/After Video',
            'before-after-image': 'Before/After Image'
        };

        block.innerHTML = `
            <div class="block-header">
                <span class="block-icon">${icons[type]}</span>
                <span class="block-title">${titles[type]} #${index + 1}</span>
                <div class="block-actions">
                    <button class="btn-icon settings-btn" title="Settings">⚙️</button>
                    <button class="btn-icon remove-btn" title="Remove">🗑️</button>
                </div>
            </div>
            <div class="block-preview">
                ${this.getBlockPreview(type, data)}
            </div>
        `;

        // Add event listeners
        block.querySelector('.settings-btn').addEventListener('click', () => {
            this.openSettingsModal(block, type, data);
        });

        block.querySelector('.remove-btn').addEventListener('click', () => {
            this.removeMediaBlock(block);
        });

        return block;
    }

    getBlockPreview(type, data) {
        switch (type) {
            case 'video':
                return `<div>📹 ${data.src || 'No video set'}</div>`;
            case 'image':
                return `<div>🖼️ ${data.src || 'No image set'}</div>`;
            case 'before-after-video':
                return `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px;">
                            Before: ${data.before ? '✓' : '✗'}
                        </div>
                        <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px;">
                            After: ${data.after ? '✓' : '✗'}
                        </div>
                    </div>
                    ${data.label ? `<div style="margin-top: 0.5rem;">Label: ${data.label}</div>` : ''}
                `;
            case 'before-after-image':
                return `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px;">
                            Before: ${data.before ? '✓' : '✗'}
                        </div>
                        <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px;">
                            After: ${data.after ? '✓' : '✗'}
                        </div>
                    </div>
                    ${data.label ? `<div style="margin-top: 0.5rem;">Label: ${data.label}</div>` : ''}
                `;
            default:
                return '<div>Configure media...</div>';
        }
    }

    removeMediaBlock(block) {
        const index = parseInt(block.dataset.index);

        // Remove from array
        this.processMediaBlocks.splice(index, 1);

        // Remove from DOM
        block.remove();

        // Re-index remaining blocks
        this.reindexBlocks();

        // Update grid preview
        this.updateGridPreview();

        // Show empty state if no blocks
        if (this.processMediaBlocks.length === 0) {
            const container = document.getElementById('processMediaBlocks');
            container.innerHTML = `
                <div class="empty-state">
                    <p>Drag media types here or click to add</p>
                    <button id="addMediaBtn" class="btn btn-secondary">+ Add Media Block</button>
                </div>
            `;
        }

        this.hasChanges = true;
    }

    reindexBlocks() {
        const blocks = document.querySelectorAll('.media-block');
        blocks.forEach((block, index) => {
            block.dataset.index = index;
            block.querySelector('.block-title').textContent =
                block.querySelector('.block-title').textContent.replace(/#\d+/, `#${index + 1}`);
        });
    }

    openSettingsModal(block, type, data) {
        const modal = document.getElementById('mediaSettingsModal');
        const modalBody = modal.querySelector('.modal-body');

        // Generate form based on type
        let formHTML = '';
        switch (type) {
            case 'video':
                formHTML = `
                    <div class="form-group">
                        <label>Video Path</label>
                        <input type="text" id="modalVideoSrc" value="${data.src || ''}" placeholder="assets/videos/[id]/video.mp4">
                    </div>
                    <div class="form-group">
                        <label>Poster Image (optional)</label>
                        <input type="text" id="modalVideoPoster" value="${data.poster || ''}" placeholder="assets/images/[id]/poster.jpg">
                    </div>
                    <div class="form-group">
                        <label>Caption (optional)</label>
                        <input type="text" id="modalVideoCaption" value="${data.caption || ''}" placeholder="Video caption">
                    </div>
                `;
                break;

            case 'image':
                formHTML = `
                    <div class="form-group">
                        <label>Image Path</label>
                        <input type="text" id="modalImageSrc" value="${data.src || ''}" placeholder="assets/images/[id]/image.jpg">
                    </div>
                    <div class="form-group">
                        <label>Caption (optional)</label>
                        <input type="text" id="modalImageCaption" value="${data.caption || ''}" placeholder="Image caption">
                    </div>
                    <div class="form-group">
                        <label>Alt Text (optional)</label>
                        <input type="text" id="modalImageAlt" value="${data.alt || ''}" placeholder="Image description">
                    </div>
                `;
                break;

            case 'before-after-video':
            case 'before-after-image':
                const mediaType = type.includes('video') ? 'videos' : 'images';
                const extension = type.includes('video') ? 'mp4' : 'jpg';
                formHTML = `
                    <div class="form-group">
                        <label>Before Path</label>
                        <input type="text" id="modalBefore" value="${data.before || ''}" placeholder="assets/${mediaType}/[id]/before.${extension}">
                    </div>
                    <div class="form-group">
                        <label>After Path</label>
                        <input type="text" id="modalAfter" value="${data.after || ''}" placeholder="assets/${mediaType}/[id]/after.${extension}">
                    </div>
                    <div class="form-group">
                        <label>Label (optional)</label>
                        <input type="text" id="modalLabel" value="${data.label || ''}" placeholder="e.g., Color Grading">
                    </div>
                    <div class="form-group">
                        <label>Before Label</label>
                        <input type="text" id="modalLabelBefore" value="${data.labelBefore || 'Before'}" placeholder="Before">
                    </div>
                    <div class="form-group">
                        <label>After Label</label>
                        <input type="text" id="modalLabelAfter" value="${data.labelAfter || 'After'}" placeholder="After">
                    </div>
                `;
                break;
        }

        modalBody.innerHTML = formHTML;

        // Show modal
        modal.style.display = 'flex';

        // Save handler
        const saveHandler = () => {
            this.saveMediaSettings(block, type);
            modal.style.display = 'none';
        };

        // Attach event listeners
        modal.querySelector('.modal-save').onclick = saveHandler;
        modal.querySelector('.modal-cancel').onclick = () => modal.style.display = 'none';
        modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
    }

    saveMediaSettings(block, type) {
        const index = parseInt(block.dataset.index);
        const data = {};

        // Collect data based on type
        switch (type) {
            case 'video':
                data.type = 'video';
                data.src = document.getElementById('modalVideoSrc').value;
                data.poster = document.getElementById('modalVideoPoster').value;
                data.caption = document.getElementById('modalVideoCaption').value;
                break;

            case 'image':
                data.type = 'image';
                data.src = document.getElementById('modalImageSrc').value;
                data.caption = document.getElementById('modalImageCaption').value;
                data.alt = document.getElementById('modalImageAlt').value;
                break;

            case 'before-after-video':
            case 'before-after-image':
                data.type = type;
                data.before = document.getElementById('modalBefore').value;
                data.after = document.getElementById('modalAfter').value;
                data.label = document.getElementById('modalLabel').value;
                data.labelBefore = document.getElementById('modalLabelBefore').value || 'Before';
                data.labelAfter = document.getElementById('modalLabelAfter').value || 'After';
                break;
        }

        // Update block data
        this.processMediaBlocks[index].data = data;

        // Update block preview
        block.querySelector('.block-preview').innerHTML = this.getBlockPreview(type, data);

        this.hasChanges = true;
    }

    setupHeroSection() {
        // Hero type toggle
        document.querySelectorAll('input[name="heroType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleHeroConfig(e.target.value);
                this.hasChanges = true;
            });
        });
    }

    toggleHeroConfig(type) {
        document.getElementById('heroVideoConfig').style.display = type === 'video' ? 'block' : 'none';
        document.getElementById('heroImageConfig').style.display = type === 'image' ? 'block' : 'none';
    }

    setupProcessSection() {
        // Add media button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addMediaBtn') {
                this.showMediaTypeSelector();
            }
        });
    }

    showMediaTypeSelector() {
        // For simplicity, prompt for type
        // In production, this would be a nice modal
        const types = ['video', 'image', 'before-after-video', 'before-after-image'];
        const type = prompt('Select media type:\n1. Video\n2. Image\n3. Before/After Video\n4. Before/After Image\n\nEnter number (1-4):');

        if (type && types[parseInt(type) - 1]) {
            this.addMediaBlock(types[parseInt(type) - 1]);
        }
    }

    setupDragAndDrop() {
        // Make media type cards draggable
        document.querySelectorAll('.media-type-card').forEach(card => {
            card.draggable = true;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('mediaType', card.dataset.type);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            // Also make them clickable
            card.addEventListener('click', () => {
                if (this.currentProject) {
                    this.addMediaBlock(card.dataset.type);
                }
            });
        });

        // Make process blocks container droppable
        const container = document.getElementById('processMediaBlocks');

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');

            const mediaType = e.dataTransfer.getData('mediaType');
            if (mediaType && this.currentProject) {
                this.addMediaBlock(mediaType);
            }
        });

        // Make blocks sortable
        if (typeof Sortable !== 'undefined') {
            Sortable.create(container, {
                animation: 150,
                handle: '.block-header',
                onEnd: () => {
                    this.reindexBlocks();
                    this.updateGridPreview();
                    this.hasChanges = true;
                }
            });
        }
    }

    updateGridPreview() {
        const preview = document.getElementById('gridPreview');
        const count = this.processMediaBlocks.length;

        if (count === 0) {
            preview.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">No media blocks</div>';
            return;
        }

        // Updated to use vertical layout - removed count-based class
        preview.className = 'grid-preview-container';
        preview.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.textContent = `Block ${i + 1}`;
            preview.appendChild(item);
        }
    }

    setupEventListeners() {
        // Search
        document.getElementById('searchProject')?.addEventListener('input', (e) => {
            this.filterProjects(e.target.value);
        });

        // Save button
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            this.saveConfiguration();
        });

        // Generate button
        document.getElementById('generateBtn')?.addEventListener('click', () => {
            this.generatePage();
        });

        // Preview button
        document.getElementById('previewBtn')?.addEventListener('click', () => {
            this.updatePreview();
        });

        // Hero inputs
        ['heroVideoSrc', 'heroVideoPoster', 'heroImageSrc', 'heroImageAlt'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => {
                this.hasChanges = true;
            });
        });
    }

    filterProjects(searchTerm) {
        const items = document.querySelectorAll('.project-grid-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const title = item.querySelector('.title').textContent.toLowerCase();
            const id = item.querySelector('.id').textContent.toLowerCase();
            const match = title.includes(term) || id.includes(term);
            item.style.display = match ? 'flex' : 'none';
        });
    }

    async saveConfiguration() {
        if (!this.currentProject) {
            this.showStatus('Please select a project first', 'error');
            return;
        }

        // Collect hero media configuration
        const heroType = document.querySelector('input[name="heroType"]:checked').value;
        const heroMedia = {
            type: heroType
        };

        if (heroType === 'video') {
            heroMedia.src = document.getElementById('heroVideoSrc').value;
            heroMedia.poster = document.getElementById('heroVideoPoster').value;
        } else {
            heroMedia.src = document.getElementById('heroImageSrc').value;
            heroMedia.alt = document.getElementById('heroImageAlt').value;
        }

        // Collect process media configuration
        const processMedia = this.processMediaBlocks.map(block => {
            const data = { ...block.data };
            // Clean up empty optional fields
            Object.keys(data).forEach(key => {
                if (!data[key]) delete data[key];
            });
            return data;
        });

        // Update project data
        this.currentProject.heroMedia = heroMedia;
        this.currentProject.processMedia = processMedia;

        // Save to file
        const saved = await Utils.saveProjectsData(this.projectsData);
        if (saved) {
            this.showStatus('Configuration saved successfully!');
            this.hasChanges = false;
        } else {
            this.showStatus('Failed to save configuration', 'error');
        }
    }

    async generatePage() {
        if (!this.currentProject) {
            this.showStatus('Please select a project first', 'error');
            return;
        }

        // Save first if there are changes
        if (this.hasChanges) {
            await this.saveConfiguration();
        }

        // Show status
        this.showStatus(`Generating page for Project-${this.currentProject.id}...`);

        // In a real implementation, this would call the Node.js generator
        // For now, we'll just show a message
        setTimeout(() => {
            this.showStatus(`Page generated! Run: node scripts/generate-project-pages-advanced.js ${this.currentProject.id}`);
        }, 1000);
    }

    updatePreview() {
        // This would generate a live preview
        // For now, just update the preview panel
        const container = document.getElementById('previewContainer');

        if (!this.currentProject) {
            container.innerHTML = `
                <div class="preview-placeholder">
                    <p>Select a project and configure media to see preview</p>
                </div>
            `;
            return;
        }

        // Simple preview representation
        container.innerHTML = `
            <div style="padding: 1rem;">
                <h3>${this.currentProject.fullTitle}</h3>
                <div style="margin: 1rem 0; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <p>Hero: ${document.querySelector('input[name="heroType"]:checked').value}</p>
                </div>
                <div style="margin: 1rem 0;">
                    <p>Process Media: ${this.processMediaBlocks.length} blocks</p>
                    ${this.processMediaBlocks.map((block, i) => `
                        <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">
                            Block ${i + 1}: ${block.type}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;

        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MediaConfigurator();
});