// Project Editor - Form Logic

class ProjectEditor {
    constructor() {
        this.projectsData = { projects: [] };
        this.currentProject = null;
        this.hasChanges = false;
        this.availableCategories = [
            { value: 'vfx', label: 'Visual Effects' },
            { value: 'motion', label: 'Motion Graphics' },
            { value: 'editing', label: 'Video Editing' },
            { value: 'personal', label: 'Personal Project' }
        ];
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

        try {
            console.log('Starting editor initialization...');

            // Load projects data
            this.projectsData = await Utils.loadProjectsData();
            console.log('Projects data loaded:', this.projectsData.projects?.length, 'projects');

            // Setup UI
            this.setupProjectGrid();
            console.log('Project grid setup complete');

            this.setupForm();
            console.log('Form setup complete');

            this.setupEventListeners();
            console.log('Event listeners setup complete');

            this.setupTagSelectors();
            console.log('Tag selectors setup complete');

            console.log('Editor initialization complete');
        } catch (error) {
            console.error('Error during editor initialization:', error);
            Utils.showStatus('Failed to initialize editor: ' + error.message, 'error');
        } finally {
            // Always remove loading class
            document.body.classList.remove('loading');
        }
    }

    setupProjectGrid() {
        const grid = document.getElementById('projectGrid');
        if (!grid) {
            console.error('Project grid element not found');
            return;
        }

        grid.innerHTML = '';

        if (!this.projectsData?.projects) {
            console.error('Projects data not available');
            return;
        }

        this.projectsData.projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-grid-item';
            item.dataset.id = project.id;

            const thumbnail = Utils.getProjectThumbnail(project);
            const displayTitle = project.displayTitle || 'Untitled';
            const id = project.id || 'unknown';

            item.innerHTML = `
                <div class="thumbnail">
                    <img src="${thumbnail}" alt="${displayTitle}" onerror="this.style.display='none'">
                </div>
                <div class="info">
                    <div class="title">${displayTitle}</div>
                    <div class="id">ID: ${id}</div>
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
    }

    setupCharCounter(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.warn(`Field ${fieldId} not found for char counter`);
            return;
        }

        const label = field.parentElement?.querySelector('.char-count');
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

        // Removed media button handler - now handled by Media Configurator

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
        // Categories
        const categoryList = document.getElementById('categoryList');
        if (categoryList) {
            this.availableCategories.forEach(cat => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = cat.label;
                tag.dataset.value = cat.value;
                tag.addEventListener('click', () => this.toggleTag(tag, 'category'));
                categoryList.appendChild(tag);
            });
        } else {
            console.warn('categoryList element not found');
        }

        // Roles
        const roleList = document.getElementById('roleList');
        if (roleList) {
            this.availableRoles.forEach(role => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = role;
                tag.dataset.value = role;
                tag.addEventListener('click', () => this.toggleTag(tag, 'role'));
                roleList.appendChild(tag);
            });
        } else {
            console.warn('roleList element not found');
        }

        // Tools
        const toolsList = document.getElementById('toolsList');
        if (toolsList) {
            this.availableTools.forEach(tool => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = tool;
                tag.dataset.value = tool;
                tag.addEventListener('click', () => this.toggleTag(tag, 'tool'));
                toolsList.appendChild(tag);
            });
        } else {
            console.warn('toolsList element not found');
        }
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
        document.getElementById('year').value = project.year || new Date().getFullYear();
        document.getElementById('client').value = project.client || '';
        document.getElementById('duration').value = project.duration || '';

        // Status
        document.getElementById('visible').checked = project.visible !== false;

        // Load categories - handle both string and array formats
        let categories = [];
        if (project.category) {
            categories = Array.isArray(project.category) ? project.category : [project.category];
        }
        document.querySelectorAll('#categoryList .tag').forEach(tag => {
            const selected = categories.includes(tag.dataset.value);
            tag.classList.toggle('selected', selected);
        });

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

        // Media items now handled by Media Configurator

        // Update character counters
        this.setupCharCounter('displayTitle');
        this.setupCharCounter('fullTitle');
        this.setupCharCounter('description');
    }

    // Media handling functions removed - now handled by Media Configurator

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
        // Get selected categories
        const categories = Array.from(document.querySelectorAll('#categoryList .tag.selected'))
            .map(tag => tag.dataset.value);

        // Get selected roles
        const roles = Array.from(document.querySelectorAll('#roleList .tag.selected'))
            .map(tag => tag.dataset.value);

        // Get selected tools
        const tools = Array.from(document.querySelectorAll('#toolsList .tag.selected'))
            .map(tag => tag.dataset.value);

        return {
            displayTitle: document.getElementById('displayTitle').value,
            fullTitle: document.getElementById('fullTitle').value,
            description: document.getElementById('description').value,
            category: categories, // Now an array
            year: parseInt(document.getElementById('year').value),
            client: document.getElementById('client').value,
            duration: document.getElementById('duration').value,
            role: roles,
            tools: tools,
            visible: document.getElementById('visible').checked
            // Media configuration now handled by Media Configurator
            // Featured status now handled by Layout Manager
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