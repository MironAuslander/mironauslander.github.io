// Project Editor - Form Logic

class ProjectEditor {
    constructor() {
        this.projectsData = { projects: [] };
        this.currentProject = null;
        this.hasChanges = false;
        this.availableRoles = [
            'Concept Development', 'Art Direction', 'Animation', '3D Modeling',
            'Compositing', 'Motion Graphics', 'VFX Supervision', 'Color Grading',
            'Sound Design', 'Editing', 'Storyboarding', 'Character Animation',
            'Motion Tracking', 'Rendering', 'Lighting', 'Texturing'
        ];
        this.availableTools = [
            'After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator',
            'Cinema 4D', 'Blender', 'Maya', 'Houdini', 'Nuke', 'DaVinci Resolve',
            'Mocha', 'Element 3D', 'Redshift', 'Octane', 'Arnold', 'V-Ray',
            'Substance Painter', 'ZBrush', 'Audition', 'Pro Tools'
        ];
        this.init();
    }

    async init() {
        document.body.classList.add('loading');

        // Load projects data
        this.projectsData = await Utils.loadProjectsData();

        // Setup UI
        this.setupProjectGrid();
        this.setupForm();
        this.setupEventListeners();
        this.setupTagSelectors();

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

    setupForm() {
        // Character counters
        this.setupCharCounter('displayTitle');
        this.setupCharCounter('fullTitle');
        this.setupCharCounter('description');

        // Featured checkbox toggle
        const featuredCheckbox = document.getElementById('featured');
        featuredCheckbox.addEventListener('change', (e) => {
            document.getElementById('featuredOrderGroup').style.display =
                e.target.checked ? 'block' : 'none';
        });
    }

    setupCharCounter(fieldId) {
        const field = document.getElementById(fieldId);
        const label = field.parentElement.querySelector('.char-count');

        if (!label) return;

        const updateCounter = () => {
            label.textContent = `${field.value.length}/${field.maxLength}`;
            label.style.color = field.value.length > field.maxLength * 0.9
                ? 'var(--warning-color)'
                : 'var(--text-secondary)';
        };

        field.addEventListener('input', updateCounter);
        updateCounter();
    }

    setupEventListeners() {
        // Search
        document.getElementById('searchProject')?.addEventListener('input', (e) => {
            this.filterProjects(e.target.value);
        });

        // Save buttons
        document.getElementById('saveProjectBtn')?.addEventListener('click', () => {
            this.saveCurrentProject();
        });

        document.getElementById('saveAllBtn')?.addEventListener('click', () => {
            this.saveAllProjects();
        });

        // Preview button
        document.getElementById('previewBtn')?.addEventListener('click', () => {
            this.updatePreview();
        });

        // Preview device toggles
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preview-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const container = document.getElementById('previewContainer');
                container.className = `preview-container ${btn.dataset.device}`;
            });
        });

        // Add media button
        document.getElementById('addMediaBtn')?.addEventListener('click', () => {
            this.addMediaItem();
        });

        // Form change detection
        document.getElementById('projectForm')?.addEventListener('input', () => {
            this.hasChanges = true;
            this.updateSaveButton();
        });

        // Custom role/tool inputs
        document.getElementById('roleInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addCustomTag('role', e.target.value);
                e.target.value = '';
            }
        });

        document.getElementById('toolsInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addCustomTag('tool', e.target.value);
                e.target.value = '';
            }
        });
    }

    setupTagSelectors() {
        // Roles
        const roleList = document.getElementById('roleList');
        this.availableRoles.forEach(role => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = role;
            tag.dataset.value = role;
            tag.addEventListener('click', () => this.toggleTag(tag, 'role'));
            roleList.appendChild(tag);
        });

        // Tools
        const toolsList = document.getElementById('toolsList');
        this.availableTools.forEach(tool => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = tool;
            tag.dataset.value = tool;
            tag.addEventListener('click', () => this.toggleTag(tag, 'tool'));
            toolsList.appendChild(tag);
        });
    }

    filterProjects(query) {
        const items = document.querySelectorAll('.project-grid-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const title = item.querySelector('.title').textContent.toLowerCase();
            const id = item.dataset.id;

            if (title.includes(lowerQuery) || id.includes(lowerQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    selectProject(projectId) {
        // Check for unsaved changes
        if (this.hasChanges) {
            const confirm = window.confirm('You have unsaved changes. Continue without saving?');
            if (!confirm) return;
        }

        // Find project
        const project = this.projectsData.projects.find(p => p.id === projectId);
        if (!project) return;

        this.currentProject = project;
        this.hasChanges = false;

        // Update UI
        document.querySelectorAll('.project-grid-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === projectId);
        });

        document.getElementById('currentProject').textContent = project.displayTitle;

        // Load project data into form
        this.loadProjectData(project);

        // Update preview
        this.updatePreview();
    }

    loadProjectData(project) {
        // Basic fields
        document.getElementById('projectId').value = project.id || '';
        document.getElementById('displayTitle').value = project.displayTitle || '';
        document.getElementById('fullTitle').value = project.fullTitle || '';
        document.getElementById('description').value = project.description || '';
        document.getElementById('category').value = project.category || '';
        document.getElementById('year').value = project.year || new Date().getFullYear();
        document.getElementById('client').value = project.client || '';
        document.getElementById('duration').value = project.duration || '';

        // Media fields
        document.getElementById('mainVideo').value = project.mainVideo || '';
        document.getElementById('videoPoster').value = project.videoPoster || '';

        // Status
        document.getElementById('featured').checked = project.featured || false;
        document.getElementById('featuredOrder').value = project.featuredOrder || 1;
        document.getElementById('visible').checked = project.visible !== false;

        // Show/hide featured order
        document.getElementById('featuredOrderGroup').style.display =
            project.featured ? 'block' : 'none';

        // Load roles
        document.querySelectorAll('#roleList .tag').forEach(tag => {
            const selected = project.role && project.role.includes(tag.dataset.value);
            tag.classList.toggle('selected', selected);
        });

        // Load tools
        document.querySelectorAll('#toolsList .tag').forEach(tag => {
            const selected = project.tools && project.tools.includes(tag.dataset.value);
            tag.classList.toggle('selected', selected);
        });

        // Load media items
        this.loadMediaItems(project.beforeAfterMedia || []);

        // Update character counters
        this.setupCharCounter('displayTitle');
        this.setupCharCounter('fullTitle');
        this.setupCharCounter('description');
    }

    loadMediaItems(mediaArray) {
        const mediaList = document.getElementById('mediaList');
        mediaList.innerHTML = '';

        mediaArray.forEach((media, index) => {
            this.addMediaItem(media, index);
        });
    }

    addMediaItem(mediaData = null, index = null) {
        const template = document.getElementById('mediaItemTemplate');
        const item = template.content.cloneNode(true);

        const itemIndex = index !== null ? index :
            document.querySelectorAll('.media-item').length;

        const itemEl = item.querySelector('.media-item');
        itemEl.dataset.index = itemIndex;

        item.querySelector('.media-number').textContent = itemIndex + 1;

        if (mediaData) {
            item.querySelector('.media-type').value = mediaData.type || 'video';
            item.querySelector('.media-before').value = mediaData.before || '';
            item.querySelector('.media-after').value = mediaData.after || '';
        }

        item.querySelector('.remove-media').addEventListener('click', () => {
            itemEl.remove();
            this.renumberMediaItems();
        });

        document.getElementById('mediaList').appendChild(item);
    }

    renumberMediaItems() {
        document.querySelectorAll('.media-item').forEach((item, index) => {
            item.dataset.index = index;
            item.querySelector('.media-number').textContent = index + 1;
        });
    }

    toggleTag(tag, type) {
        tag.classList.toggle('selected');
        this.hasChanges = true;
        this.updateSaveButton();
    }

    addCustomTag(type, value) {
        if (!value.trim()) return;

        const container = type === 'role' ? 'roleList' : 'toolsList';
        const existing = document.querySelector(`#${container} [data-value="${value}"]`);

        if (!existing) {
            const tag = document.createElement('span');
            tag.className = 'tag selected';
            tag.textContent = value;
            tag.dataset.value = value;
            tag.addEventListener('click', () => this.toggleTag(tag, type));
            document.getElementById(container).appendChild(tag);
        } else {
            existing.classList.add('selected');
        }

        this.hasChanges = true;
        this.updateSaveButton();
    }

    updateSaveButton() {
        const btn = document.getElementById('saveProjectBtn');
        if (this.hasChanges) {
            btn.classList.add('btn-warning');
            btn.textContent = '💾 Save Project (*)';
        } else {
            btn.classList.remove('btn-warning');
            btn.textContent = '💾 Save Project';
        }
    }

    saveCurrentProject() {
        if (!this.currentProject) {
            Utils.showStatus('No project selected', 'error');
            return;
        }

        // Get form data
        const formData = this.getFormData();

        // Update project in data
        const projectIndex = this.projectsData.projects.findIndex(
            p => p.id === this.currentProject.id
        );

        if (projectIndex !== -1) {
            this.projectsData.projects[projectIndex] = {
                ...this.projectsData.projects[projectIndex],
                ...formData
            };

            this.hasChanges = false;
            this.updateSaveButton();
            Utils.showStatus(`✅ Project ${this.currentProject.id} saved!`, 'success');

            // Update preview
            this.updatePreview();

            // Update grid item
            const gridItem = document.querySelector(`.project-grid-item[data-id="${this.currentProject.id}"]`);
            if (gridItem) {
                gridItem.querySelector('.title').textContent = formData.displayTitle;
            }
        }
    }

    getFormData() {
        // Get selected roles
        const roles = Array.from(document.querySelectorAll('#roleList .tag.selected'))
            .map(tag => tag.dataset.value);

        // Get selected tools
        const tools = Array.from(document.querySelectorAll('#toolsList .tag.selected'))
            .map(tag => tag.dataset.value);

        // Get media items
        const mediaItems = Array.from(document.querySelectorAll('.media-item')).map(item => ({
            type: item.querySelector('.media-type').value,
            before: item.querySelector('.media-before').value,
            after: item.querySelector('.media-after').value
        })).filter(m => m.before && m.after);

        return {
            displayTitle: document.getElementById('displayTitle').value,
            fullTitle: document.getElementById('fullTitle').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            year: parseInt(document.getElementById('year').value),
            client: document.getElementById('client').value,
            duration: document.getElementById('duration').value,
            role: roles,
            tools: tools,
            mainVideo: document.getElementById('mainVideo').value,
            videoPoster: document.getElementById('videoPoster').value,
            beforeAfterMedia: mediaItems,
            featured: document.getElementById('featured').checked,
            featuredOrder: document.getElementById('featured').checked ?
                parseInt(document.getElementById('featuredOrder').value) : null,
            visible: document.getElementById('visible').checked
        };
    }

    async saveAllProjects() {
        // Save current project first
        if (this.hasChanges && this.currentProject) {
            this.saveCurrentProject();
        }

        // Save all data
        const success = await Utils.saveProjectsData(this.projectsData);

        if (success) {
            Utils.showStatus('✅ All projects saved! Download started.', 'success');

            // Run update scripts
            setTimeout(() => {
                Utils.runUpdateScripts();
            }, 1000);
        }
    }

    updatePreview() {
        if (!this.currentProject) return;

        const iframe = document.getElementById('previewFrame');
        const projectUrl = `../projects/Project-${this.currentProject.id}.html`;

        // Set iframe source
        iframe.src = projectUrl;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectEditor();
});