// Project Studio - Unified Management System

class ProjectStudio {
    constructor() {
        // Core state
        this.projectsData = { projects: [] };
        this.currentProject = null;
        this.hasChanges = false;
        this.currentView = 'organize'; // 'organize' or 'edit'
        this.currentTab = 'organize'; // 'organize', 'details', 'media', 'preview'

        // Multi-project editing support
        this.modifiedProjects = new Set(); // Track which projects have been edited

        // Project organization
        this.featuredProjects = [];
        this.visibleProjects = [];
        this.hiddenProjects = [];

        // Media configuration
        this.processMediaBlocks = [];

        // Available options (from editor.js)
        this.availableCategories = [
            { value: 'vfx', label: 'Visual Effects' },
            { value: 'motion', label: 'Motion Graphics' },
            { value: 'editing', label: 'Video Editing' },
            { value: 'personal', label: 'Personal Project' }
        ];

        this.availableRoles = [
            'Concept Development', 'Art Direction', 'Animation', '3D Modeling',
            'Compositing', 'Compositing Lead', 'Motion Graphics', 'Motion Design',
            'VFX Supervision', 'VFX Supervisor', 'VFX Lead', 'Color Grading',
            'Sound Design', 'Editing', 'Storyboarding', 'Character Animation',
            'Motion Tracking', 'Rendering', 'Lighting', 'Texturing',
            'Animation Director', 'Creative Direction', 'Broadcast Design',
            'Broadcast Design Lead', 'Post-Production Lead', 'Brand Design',
            'Title Design', 'Interactive Design', 'Cinematic Director',
            '3D Visualization', 'Content Creation', 'Visual Director',
            'Medical Visualization', 'Exhibition Design'
        ];

        this.availableTools = [
            'After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator',
            'Cinema 4D', 'Blender', 'Maya', 'Houdini', 'Nuke', 'DaVinci Resolve',
            'Mocha', 'Element 3D', 'Redshift', 'Octane', 'Arnold', 'V-Ray',
            'Substance Painter', 'ZBrush', 'Audition', 'Pro Tools'
        ];

        this.sortableInstances = [];
        this.init();
    }

    async init() {
        document.body.classList.add('loading');

        try {
            // Load projects data
            this.projectsData = await Utils.loadProjectsData();

            // Setup UI components
            this.setupSidebarViews();
            this.setupTabs();
            this.setupOrganizeView();
            this.setupEditView();
            this.setupMediaConfig();
            this.setupEventListeners();
            this.setupTagSelectors();

            // Load initial view
            this.loadProjectLists();
            this.updateAllCounts();

        } catch (error) {
            console.error('Error initializing studio:', error);
            this.showStatus('Failed to initialize studio', 'error');
        } finally {
            document.body.classList.remove('loading');
        }
    }

    // ==================== SIDEBAR MANAGEMENT ====================

    setupSidebarViews() {
        // Sidebar view tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                this.switchSidebarView(view);
            });
        });

        // Search functionality
        document.getElementById('searchOrganize')?.addEventListener('input', (e) => {
            this.filterProjectCards(e.target.value);
        });

        document.getElementById('searchEdit')?.addEventListener('input', (e) => {
            this.filterEditList(e.target.value);
        });
    }

    switchSidebarView(view) {
        this.currentView = view;

        // Update tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.sidebar-view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}-view`);
        });

        // Load appropriate content
        if (view === 'edit') {
            this.loadEditList();
        }
    }

    // ==================== TAB MANAGEMENT ====================

    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });

        // Load content if needed
        if (tabName === 'preview' && this.currentProject) {
            this.updatePreview();
        }
    }

    // ==================== ORGANIZE VIEW ====================

    setupOrganizeView() {
        // Setup sortable containers
        this.setupSortableContainers();
    }

    setupSortableContainers() {
        if (typeof Sortable === 'undefined') return;

        // Clear existing instances
        this.sortableInstances.forEach(instance => instance.destroy());
        this.sortableInstances = [];

        // Featured projects container
        const featuredContainer = document.getElementById('featuredProjects');
        if (featuredContainer) {
            this.sortableInstances.push(
                Sortable.create(featuredContainer, {
                    group: 'projects',
                    animation: 150,
                    handle: '.card-handle',
                    onEnd: (evt) => this.handleProjectDrop(evt, 'featured')
                })
            );
        }

        // All projects container
        const allContainer = document.getElementById('allProjects');
        if (allContainer) {
            this.sortableInstances.push(
                Sortable.create(allContainer, {
                    group: 'projects',
                    animation: 150,
                    handle: '.card-handle',
                    onEnd: (evt) => this.handleProjectDrop(evt, 'visible')
                })
            );
        }

        // Hidden projects container
        const hiddenContainer = document.getElementById('hiddenProjects');
        if (hiddenContainer) {
            this.sortableInstances.push(
                Sortable.create(hiddenContainer, {
                    group: 'projects',
                    animation: 150,
                    handle: '.card-handle',
                    onEnd: (evt) => this.handleProjectDrop(evt, 'hidden')
                })
            );
        }
    }

    handleProjectDrop(evt, section) {
        const projectId = evt.item.dataset.id;
        const project = this.projectsData.projects.find(p => p.id === projectId);
        if (!project) return;

        // Update project status based on section
        if (section === 'featured') {
            project.featured = true;
            project.visible = true;
            project.hidden = false;

            // Update featured order
            const featuredCards = document.getElementById('featuredProjects').querySelectorAll('.project-card');
            featuredCards.forEach((card, index) => {
                const p = this.projectsData.projects.find(pr => pr.id === card.dataset.id);
                if (p) p.featuredOrder = index + 1;
            });

            // Check limit
            if (featuredCards.length > 6) {
                // Move excess to visible
                const excess = Array.from(featuredCards).slice(6);
                excess.forEach(card => {
                    document.getElementById('allProjects').appendChild(card);
                    const p = this.projectsData.projects.find(pr => pr.id === card.dataset.id);
                    if (p) {
                        p.featured = false;
                        p.featuredOrder = null;
                    }
                });
            }
        } else if (section === 'visible') {
            project.featured = false;
            project.visible = true;
            project.hidden = false;
            project.featuredOrder = null;

            // Update display order
            const visibleCards = document.getElementById('allProjects').querySelectorAll('.project-card');
            visibleCards.forEach((card, index) => {
                const p = this.projectsData.projects.find(pr => pr.id === card.dataset.id);
                if (p) p.displayOrder = index + 1;
            });
        } else if (section === 'hidden') {
            project.featured = false;
            project.visible = false;
            project.hidden = true;
            project.featuredOrder = null;
        }

        this.hasChanges = true;
        this.updateChangeIndicator();
        this.updateAllCounts();
    }

    loadProjectLists() {
        // Clear containers
        document.getElementById('featuredProjects').innerHTML = '';
        document.getElementById('allProjects').innerHTML = '';
        document.getElementById('hiddenProjects').innerHTML = '';

        // Sort and categorize projects
        this.featuredProjects = this.projectsData.projects.filter(p => p.featured)
            .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999));

        this.visibleProjects = this.projectsData.projects.filter(p => !p.hidden && !p.featured)
            .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

        this.hiddenProjects = this.projectsData.projects.filter(p => p.hidden);

        // Render cards
        this.featuredProjects.forEach(p => this.renderProjectCard(p, 'featuredProjects'));
        this.visibleProjects.forEach(p => this.renderProjectCard(p, 'allProjects'));
        this.hiddenProjects.forEach(p => this.renderProjectCard(p, 'hiddenProjects'));
    }

    renderProjectCard(project, containerId) {
        const template = document.getElementById('projectCardTemplate');
        const card = template.content.cloneNode(true);

        card.querySelector('.project-card').dataset.id = project.id;
        card.querySelector('.card-thumbnail img').src = Utils.getProjectThumbnail(project);
        card.querySelector('.card-thumbnail img').alt = project.displayTitle;
        card.querySelector('.card-title').textContent = project.displayTitle;
        card.querySelector('.card-id').textContent = `ID: ${project.id}`;
        card.querySelector('.card-category').textContent = this.getCategoryDisplay(project.category);

        document.getElementById(containerId).appendChild(card);
    }

    filterProjectCards(query) {
        const lowerQuery = query.toLowerCase();
        document.querySelectorAll('.project-card').forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const id = card.dataset.id;
            const visible = title.includes(lowerQuery) || id.includes(lowerQuery);
            card.style.display = visible ? 'flex' : 'none';
        });
    }

    // ==================== EDIT VIEW ====================

    setupEditView() {
        this.setupCharCounters();
        this.setupCustomTagInputs();
    }

    loadEditList() {
        const container = document.getElementById('editProjectList');
        container.innerHTML = '';

        this.projectsData.projects.forEach(project => {
            const template = document.getElementById('projectItemTemplate');
            const item = template.content.cloneNode(true);

            item.querySelector('.project-item').dataset.id = project.id;
            item.querySelector('.item-thumbnail img').src = Utils.getProjectThumbnail(project);
            item.querySelector('.item-title').textContent = project.displayTitle;
            item.querySelector('.item-id').textContent = `ID: ${project.id}`;
            item.querySelector('.item-category').textContent = this.getCategoryDisplay(project.category);

            const statusBadge = item.querySelector('.status-badge');
            if (project.featured) {
                statusBadge.textContent = '⭐ Featured';
                statusBadge.style.background = 'rgba(255, 215, 0, 0.2)';
                statusBadge.style.color = 'gold';
            } else if (!project.visible) {
                statusBadge.textContent = '👁️ Hidden';
                statusBadge.style.background = 'rgba(100, 100, 100, 0.2)';
                statusBadge.style.color = 'var(--text-secondary)';
            } else {
                statusBadge.textContent = '✓ Visible';
            }

            item.querySelector('.project-item').addEventListener('click', () => {
                this.selectProjectForEdit(project.id);
            });

            container.appendChild(item);
        });
    }

    filterEditList(query) {
        const lowerQuery = query.toLowerCase();
        document.querySelectorAll('.project-item').forEach(item => {
            const title = item.querySelector('.item-title').textContent.toLowerCase();
            const id = item.dataset.id;
            const visible = title.includes(lowerQuery) || id.includes(lowerQuery);
            item.style.display = visible ? 'flex' : 'none';
        });
    }

    hasDataChanged(original, updated) {
        // Helper function to compare data objects
        for (const key in updated) {
            let origVal = original[key];
            let newVal = updated[key];

            // Skip undefined values
            if (newVal === undefined) continue;

            // Special handling for category field - normalize to array for comparison
            if (key === 'category') {
                // Ensure both values are arrays for comparison
                origVal = Array.isArray(origVal) ? origVal : [origVal];
                newVal = Array.isArray(newVal) ? newVal : [newVal];

                // Compare as sorted arrays
                if (origVal.length !== newVal.length) return true;
                const sortedOrig = [...origVal].sort();
                const sortedNew = [...newVal].sort();
                if (JSON.stringify(sortedOrig) !== JSON.stringify(sortedNew)) {
                    return true;
                }
            }
            // Handle arrays
            else if (Array.isArray(origVal) && Array.isArray(newVal)) {
                if (origVal.length !== newVal.length) return true;
                // Sort and compare for arrays (order doesn't matter for categories, roles, tools)
                const sortedOrig = [...origVal].sort();
                const sortedNew = [...newVal].sort();
                if (JSON.stringify(sortedOrig) !== JSON.stringify(sortedNew)) {
                    return true;
                }
            }
            // Handle objects (like heroMedia)
            else if (origVal && newVal && typeof origVal === 'object' && typeof newVal === 'object' && !Array.isArray(origVal)) {
                if (JSON.stringify(origVal) !== JSON.stringify(newVal)) {
                    return true;
                }
            }
            // Handle primitives
            else if (origVal !== newVal) {
                // Special case: year comparison (string vs number)
                if (key === 'year' && parseInt(origVal) === parseInt(newVal)) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }

    savePendingProjectChanges() {
        // Save current project's changes to memory before switching
        if (!this.currentProject) return;

        // Only save if we're in details or media tab (editing mode)
        if (this.currentTab !== 'details' && this.currentTab !== 'media') return;

        try {
            // Get current form data
            const formData = this.getFormData();
            const mediaConfig = this.getMediaConfiguration();

            // Find the project in the main data array
            const projectIndex = this.projectsData.projects.findIndex(p => p.id === this.currentProject.id);
            if (projectIndex !== -1) {
                const originalProject = this.projectsData.projects[projectIndex];

                // Check if anything actually changed
                const hasFormChanges = this.hasDataChanged(originalProject, formData);
                const hasMediaChanges = this.hasDataChanged(originalProject, mediaConfig);

                if (hasFormChanges || hasMediaChanges) {
                    // Only update and mark as modified if there are actual changes
                    Object.assign(this.projectsData.projects[projectIndex], formData, mediaConfig);

                    // Track that this project has been modified
                    this.modifiedProjects.add(this.currentProject.id);
                    this.hasChanges = true;

                    // Update visual indicator
                    this.updateProjectModifiedIndicator(this.currentProject.id, true);
                }
            }
        } catch (error) {
            console.error('Error saving pending changes:', error);
        }
    }

    selectProjectForEdit(projectId) {
        // Auto-save current project before switching
        this.savePendingProjectChanges();
        // Update selected state
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === projectId);
        });

        // Load project
        this.currentProject = this.projectsData.projects.find(p => p.id === projectId);
        if (!this.currentProject) return;

        // Load project details
        this.loadProjectDetails();
        this.loadMediaConfiguration();

        // Switch to details tab
        this.switchTab('details');

        // Update header
        document.getElementById('currentProjectName').textContent = this.currentProject.displayTitle;
        document.getElementById('currentProjectId').textContent = this.currentProject.id;
    }

    loadProjectDetails() {
        const project = this.currentProject;
        if (!project) return;

        // Load basic fields
        document.getElementById('displayTitle').value = project.displayTitle || '';
        document.getElementById('fullTitle').value = project.fullTitle || '';
        document.getElementById('description').value = project.description || '';
        document.getElementById('year').value = project.year || new Date().getFullYear();
        document.getElementById('client').value = project.client || '';
        document.getElementById('duration').value = project.duration || '';

        // Load categories (multi-select)
        const categories = Array.isArray(project.category) ? project.category : [project.category];
        document.querySelectorAll('#categoryList .tag').forEach(tag => {
            tag.classList.toggle('selected', categories.includes(tag.dataset.value));
        });

        // Load roles - first ensure all project roles exist as tags
        if (project.role && project.role.length > 0) {
            const roleContainer = document.getElementById('roleList');
            project.role.forEach(role => {
                // Check if tag already exists
                if (!Array.from(roleContainer.querySelectorAll('.tag')).some(tag => tag.dataset.value === role)) {
                    // Create new tag for this role
                    const newTag = document.createElement('span');
                    newTag.className = 'tag';
                    newTag.dataset.value = role;
                    newTag.textContent = role;
                    newTag.addEventListener('click', () => {
                        newTag.classList.toggle('selected');
                        this.hasChanges = true;
                        this.updateChangeIndicator();
                    });
                    roleContainer.appendChild(newTag);
                }
            });

            // Now select the appropriate tags
            document.querySelectorAll('#roleList .tag').forEach(tag => {
                tag.classList.toggle('selected', project.role.includes(tag.dataset.value));
            });
        } else {
            // No roles, deselect all
            document.querySelectorAll('#roleList .tag').forEach(tag => {
                tag.classList.remove('selected');
            });
        }

        // Load tools - first ensure all project tools exist as tags
        if (project.tools && project.tools.length > 0) {
            const toolsContainer = document.getElementById('toolsList');
            project.tools.forEach(tool => {
                // Check if tag already exists
                if (!Array.from(toolsContainer.querySelectorAll('.tag')).some(tag => tag.dataset.value === tool)) {
                    // Create new tag for this tool
                    const newTag = document.createElement('span');
                    newTag.className = 'tag';
                    newTag.dataset.value = tool;
                    newTag.textContent = tool;
                    newTag.addEventListener('click', () => {
                        newTag.classList.toggle('selected');
                        this.hasChanges = true;
                        this.updateChangeIndicator();
                    });
                    toolsContainer.appendChild(newTag);
                }
            });

            // Now select the appropriate tags
            document.querySelectorAll('#toolsList .tag').forEach(tag => {
                tag.classList.toggle('selected', project.tools.includes(tag.dataset.value));
            });
        } else {
            // No tools, deselect all
            document.querySelectorAll('#toolsList .tag').forEach(tag => {
                tag.classList.remove('selected');
            });
        }

        // Update character counters
        this.updateAllCharCounters();
    }

    setupCharCounters() {
        ['displayTitle', 'fullTitle', 'description'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const counter = field.parentElement?.querySelector('.char-count');
            if (!counter) return;

            field.addEventListener('input', () => {
                counter.textContent = `${field.value.length}/${field.maxLength}`;
                counter.style.color = field.value.length > field.maxLength * 0.9
                    ? 'var(--warning-color)'
                    : 'var(--text-secondary)';
                this.hasChanges = true;
                this.updateChangeIndicator();
            });
        });
    }

    updateAllCharCounters() {
        ['displayTitle', 'fullTitle', 'description'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const counter = field.parentElement?.querySelector('.char-count');
            if (!counter) return;

            counter.textContent = `${field.value.length}/${field.maxLength}`;
        });
    }

    setupTagSelectors() {
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
        }

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
        }

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
        }
    }

    toggleTag(tag, type) {
        tag.classList.toggle('selected');
        this.hasChanges = true;
        this.updateChangeIndicator();
    }

    setupCustomTagInputs() {
        // Role custom input
        const roleInput = document.getElementById('roleInput');
        if (roleInput) {
            roleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.addCustomTag(e.target.value.trim(), 'role');
                    e.target.value = '';
                }
            });
        }

        // Tools custom input
        const toolsInput = document.getElementById('toolsInput');
        if (toolsInput) {
            toolsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.addCustomTag(e.target.value.trim(), 'tool');
                    e.target.value = '';
                }
            });
        }
    }

    addCustomTag(value, type) {
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
        this.updateChangeIndicator();
    }

    // ==================== MEDIA CONFIGURATION ====================

    setupMediaConfig() {
        // Hero type selector
        document.querySelectorAll('input[name="heroType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isVideo = e.target.value === 'video';
                document.getElementById('heroVideoConfig').style.display = isVideo ? 'block' : 'none';
                document.getElementById('heroImageConfig').style.display = isVideo ? 'none' : 'block';
                this.hasChanges = true;
                this.updateChangeIndicator();
            });
        });

        // Media type cards
        this.setupMediaTypeCards();
        this.setupProcessMediaBlocks();
    }

    setupMediaTypeCards() {
        document.querySelectorAll('.media-type-card').forEach(card => {
            // Make draggable
            card.draggable = true;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('mediaType', card.dataset.type);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            // Click to add
            card.addEventListener('click', () => {
                if (this.currentProject) {
                    this.addMediaBlock(card.dataset.type);
                }
            });
        });
    }

    setupProcessMediaBlocks() {
        const container = document.getElementById('processMediaBlocks');
        if (!container) return;

        // Drag over
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        // Drop
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            const mediaType = e.dataTransfer.getData('mediaType');
            if (mediaType && this.currentProject) {
                this.addMediaBlock(mediaType);
            }
        });

        // Make sortable
        if (typeof Sortable !== 'undefined') {
            Sortable.create(container, {
                animation: 150,
                handle: '.block-header',
                onEnd: () => {
                    this.reindexMediaBlocks();
                    this.updateGridPreview();
                    this.hasChanges = true;
                    this.updateChangeIndicator();
                }
            });
        }
    }

    loadMediaConfiguration() {
        const project = this.currentProject;
        if (!project) return;

        // Load hero configuration
        let heroType = 'video';
        let heroSrc = '';
        let heroPoster = '';
        let heroAlt = '';

        if (project.heroMedia) {
            heroType = project.heroMedia.type;
            heroSrc = project.heroMedia.src || '';
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

        // Set hero type
        document.querySelector(`input[name="heroType"][value="${heroType}"]`).checked = true;
        document.getElementById('heroVideoConfig').style.display = heroType === 'video' ? 'block' : 'none';
        document.getElementById('heroImageConfig').style.display = heroType === 'image' ? 'block' : 'none';

        // Set hero fields
        if (heroType === 'video') {
            document.getElementById('heroVideoSrc').value = heroSrc;
            document.getElementById('heroVideoPoster').value = heroPoster;
        } else {
            document.getElementById('heroImageSrc').value = heroSrc;
            document.getElementById('heroImageAlt').value = heroAlt;
        }

        // Load process media
        this.loadProcessMedia();
    }

    loadProcessMedia() {
        const project = this.currentProject;
        const container = document.getElementById('processMediaBlocks');

        // Clear existing
        container.innerHTML = '';
        this.processMediaBlocks = [];

        // Load media items
        let mediaItems = [];
        if (project.processMedia?.length > 0) {
            mediaItems = project.processMedia;
        } else if (project.beforeAfterMedia?.length > 0) {
            // Convert old format
            mediaItems = project.beforeAfterMedia.map((item, index) => ({
                type: item.type === 'video' ? 'before-after-video' : 'before-after-image',
                before: item.before,
                after: item.after,
                label: item.label || `Comparison ${index + 1}`,
                labelBefore: item.labelBefore || 'Before',
                labelAfter: item.labelAfter || 'After'
            }));
        }

        if (mediaItems.length > 0) {
            mediaItems.forEach(item => {
                this.addMediaBlock(item.type, item);
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Drag media types here or click to add</p>
                    <button id="addMediaBtn" class="btn btn-secondary">+ Add Media Block</button>
                </div>
            `;
        }

        this.updateGridPreview();
    }

    addMediaBlock(type, data = {}) {
        const container = document.getElementById('processMediaBlocks');

        // Remove empty state
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // Check limit
        if (this.processMediaBlocks.length >= 6) {
            this.showStatus('Maximum 6 media blocks allowed', 'error');
            return;
        }

        // Ensure type is in data
        const dataWithType = { type, ...data };

        const block = this.createMediaBlock(type, dataWithType);
        container.appendChild(block);

        this.processMediaBlocks.push({ type, data: dataWithType, element: block });
        this.updateGridPreview();
        this.hasChanges = true;
        this.updateChangeIndicator();
    }

    createMediaBlock(type, data) {
        const block = document.createElement('div');
        block.className = 'media-block';
        block.dataset.type = type;

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
                <span class="block-title">${titles[type]}</span>
                <div class="block-actions">
                    <button class="block-btn edit-btn">✏️ Edit</button>
                    <button class="block-btn remove-btn">🗑️ Remove</button>
                </div>
            </div>
            <div class="block-content" style="display: none;">
                ${this.getMediaBlockForm(type, data)}
            </div>
            <div class="block-preview">
                ${this.getBlockPreview(type, data)}
            </div>
        `;

        // Event listeners
        block.querySelector('.edit-btn').addEventListener('click', () => {
            const content = block.querySelector('.block-content');
            const preview = block.querySelector('.block-preview');
            const isEditing = content.style.display === 'none';

            content.style.display = isEditing ? 'block' : 'none';
            preview.style.display = isEditing ? 'none' : 'block';
        });

        block.querySelector('.remove-btn').addEventListener('click', () => {
            this.removeMediaBlock(block);
        });

        // Update on input change
        block.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateMediaBlockData(block);
            });
        });

        return block;
    }

    getMediaBlockForm(type, data) {
        switch (type) {
            case 'video':
                return `
                    <div class="form-group">
                        <label>Video Source</label>
                        <input type="text" class="media-src" value="${data.src || ''}" placeholder="assets/videos/[id]/video.mp4">
                    </div>
                    <div class="form-group">
                        <label>Poster Image</label>
                        <input type="text" class="media-poster" value="${data.poster || ''}" placeholder="Optional poster image">
                    </div>
                    <div class="form-group">
                        <label>Caption</label>
                        <input type="text" class="media-caption" value="${data.caption || ''}" placeholder="Optional caption">
                    </div>
                `;

            case 'image':
                return `
                    <div class="form-group">
                        <label>Image Source</label>
                        <input type="text" class="media-src" value="${data.src || ''}" placeholder="assets/images/[id]/image.jpg">
                    </div>
                    <div class="form-group">
                        <label>Alt Text</label>
                        <input type="text" class="media-alt" value="${data.alt || ''}" placeholder="Image description">
                    </div>
                    <div class="form-group">
                        <label>Caption</label>
                        <input type="text" class="media-caption" value="${data.caption || ''}" placeholder="Optional caption">
                    </div>
                `;

            case 'before-after-video':
            case 'before-after-image':
                const mediaType = type.includes('video') ? 'video' : 'image';
                return `
                    <div class="form-group">
                        <label>Before ${mediaType}</label>
                        <input type="text" class="media-before" value="${data.before || ''}" placeholder="Path to before ${mediaType}">
                    </div>
                    <div class="form-group">
                        <label>After ${mediaType}</label>
                        <input type="text" class="media-after" value="${data.after || ''}" placeholder="Path to after ${mediaType}">
                    </div>
                    <div class="form-group">
                        <label>Label</label>
                        <input type="text" class="media-label" value="${data.label || ''}" placeholder="e.g., VFX Breakdown">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Before Label</label>
                            <input type="text" class="media-label-before" value="${data.labelBefore || 'Before'}" placeholder="Before">
                        </div>
                        <div class="form-group">
                            <label>After Label</label>
                            <input type="text" class="media-label-after" value="${data.labelAfter || 'After'}" placeholder="After">
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    getBlockPreview(type, data) {
        switch (type) {
            case 'video':
                return `Video: ${data.src || 'Not configured'}`;
            case 'image':
                return `Image: ${data.src || 'Not configured'}`;
            case 'before-after-video':
            case 'before-after-image':
                return `${data.label || 'Comparison'}: ${data.before ? '✓' : '✗'} Before, ${data.after ? '✓' : '✗'} After`;
            default:
                return 'Not configured';
        }
    }

    updateMediaBlockData(block) {
        const index = Array.from(block.parentElement.children).indexOf(block);
        const type = block.dataset.type;
        const data = { type }; // Always include type field

        // Collect form data
        block.querySelectorAll('input').forEach(input => {
            // Convert class name to proper camelCase key
            // media-label → label
            // media-label-before → labelBefore
            // media-label-after → labelAfter
            const className = input.className.replace('media-', '');
            let key = className;

            // Convert hyphenated to camelCase
            if (className.includes('-')) {
                const parts = className.split('-');
                key = parts[0] + parts.slice(1).map(p =>
                    p.charAt(0).toUpperCase() + p.slice(1)
                ).join('');
            }

            if (input.value) data[key] = input.value;
        });

        // Update block data
        this.processMediaBlocks[index] = { type, data, element: block };

        // Update preview
        block.querySelector('.block-preview').innerHTML = this.getBlockPreview(type, data);

        this.hasChanges = true;
        this.updateChangeIndicator();
    }

    removeMediaBlock(block) {
        const index = Array.from(block.parentElement.children).indexOf(block);

        this.processMediaBlocks.splice(index, 1);
        block.remove();

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

        this.updateGridPreview();
        this.hasChanges = true;
        this.updateChangeIndicator();
    }

    reindexMediaBlocks() {
        const container = document.getElementById('processMediaBlocks');
        const blocks = Array.from(container.querySelectorAll('.media-block'));

        this.processMediaBlocks = blocks.map(block => {
            const index = this.processMediaBlocks.findIndex(b => b.element === block);
            return this.processMediaBlocks[index];
        });
    }

    updateGridPreview() {
        const preview = document.getElementById('gridPreview');
        const count = this.processMediaBlocks.length;

        if (count === 0) {
            preview.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">No media blocks</div>';
            return;
        }

        preview.className = 'grid-preview-container';
        preview.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.textContent = `Block ${i + 1}`;
            preview.appendChild(item);
        }
    }

    // ==================== PREVIEW ====================

    updatePreview() {
        if (!this.currentProject) return;

        const iframe = document.getElementById('previewFrame');
        iframe.src = `../projects/Project-${this.currentProject.id}.html`;
    }

    // ==================== EVENT LISTENERS ====================

    setupEventListeners() {
        // Save button
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            this.saveAllChanges();
        });

        // Generate button
        document.getElementById('generateBtn')?.addEventListener('click', () => {
            this.generateAndApply();
        });

        // Reload button
        document.getElementById('reloadBtn')?.addEventListener('click', () => {
            if (this.hasChanges) {
                if (!confirm('You have unsaved changes. Reload anyway?')) return;
            }
            location.reload();
        });

        // Preview device buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preview-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const container = document.getElementById('previewContainer');
                container.className = `preview-container ${btn.dataset.device}`;
            });
        });

        // Form inputs change tracking
        document.querySelectorAll('#projectForm input, #projectForm textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.hasChanges = true;
                this.updateChangeIndicator();
            });
        });

        // Hero config inputs
        ['heroVideoSrc', 'heroVideoPoster', 'heroImageSrc', 'heroImageAlt'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => {
                this.hasChanges = true;
                this.updateChangeIndicator();
            });
        });
    }

    // ==================== DATA MANAGEMENT ====================

    getFormData() {
        // Get categories
        const categories = Array.from(document.querySelectorAll('#categoryList .tag.selected'))
            .map(tag => tag.dataset.value);

        // Get roles
        const roles = Array.from(document.querySelectorAll('#roleList .tag.selected'))
            .map(tag => tag.dataset.value);

        // Get tools
        const tools = Array.from(document.querySelectorAll('#toolsList .tag.selected'))
            .map(tag => tag.dataset.value);

        return {
            displayTitle: document.getElementById('displayTitle').value,
            fullTitle: document.getElementById('fullTitle').value,
            description: document.getElementById('description').value,
            category: categories,
            year: parseInt(document.getElementById('year').value),
            client: document.getElementById('client').value,
            duration: document.getElementById('duration').value,
            role: roles,
            tools: tools
        };
    }

    getMediaConfiguration() {
        // Get hero configuration
        const heroType = document.querySelector('input[name="heroType"]:checked').value;
        const heroMedia = { type: heroType };

        if (heroType === 'video') {
            heroMedia.src = document.getElementById('heroVideoSrc').value;
            heroMedia.poster = document.getElementById('heroVideoPoster').value;
        } else {
            heroMedia.src = document.getElementById('heroImageSrc').value;
            heroMedia.alt = document.getElementById('heroImageAlt').value;
        }

        // Get process media
        const processMedia = this.processMediaBlocks.map(block => {
            const data = { ...block.data };

            // Ensure type field is always present
            if (!data.type) {
                data.type = block.type;
            }

            // Clean empty fields (except type)
            Object.keys(data).forEach(key => {
                if (key !== 'type' && !data[key]) delete data[key];
            });
            return data;
        });

        return { heroMedia, processMedia };
    }

    async saveAllChanges() {
        // Update organization data (always runs)
        this.updateProjectOrganization();

        // Save any pending changes from currently editing project
        this.savePendingProjectChanges();

        // Save to file (includes all organization + all edited projects)
        const saved = await Utils.saveProjectsData(this.projectsData);

        if (saved) {
            // Get count before clearing
            const modifiedCount = this.modifiedProjects.size;

            // Clear all change tracking
            this.hasChanges = false;
            this.modifiedProjects.clear();
            this.updateChangeIndicator();

            // Clear all modified indicators in UI
            document.querySelectorAll('.project-item').forEach(item => {
                this.updateProjectModifiedIndicator(item.dataset.id, false);
            });

            // Show success message with count
            const message = modifiedCount > 0
                ? `✅ All changes saved! (${modifiedCount} project${modifiedCount !== 1 ? 's' : ''} edited) Download started.`
                : '✅ All changes saved! Download started.';

            this.showStatus(message, 'success');
        } else {
            this.showStatus('Failed to save changes', 'error');
        }
    }

    updateProjectOrganization() {
        // Already handled by handleProjectDrop, but ensure consistency
        this.projectsData.projects.forEach(project => {
            // Reset all projects
            project.featuredOrder = null;
            project.displayOrder = null;
        });

        // Update featured projects
        const featuredCards = document.getElementById('featuredProjects').querySelectorAll('.project-card');
        featuredCards.forEach((card, index) => {
            const project = this.projectsData.projects.find(p => p.id === card.dataset.id);
            if (project) {
                project.featured = true;
                project.featuredOrder = index + 1;
                project.visible = true;
            }
        });

        // Update visible projects
        const visibleCards = document.getElementById('allProjects').querySelectorAll('.project-card');
        visibleCards.forEach((card, index) => {
            const project = this.projectsData.projects.find(p => p.id === card.dataset.id);
            if (project) {
                project.visible = true;
                project.displayOrder = index + 1;
            }
        });

        // Update hidden projects
        const hiddenCards = document.getElementById('hiddenProjects').querySelectorAll('.project-card');
        hiddenCards.forEach(card => {
            const project = this.projectsData.projects.find(p => p.id === card.dataset.id);
            if (project) {
                project.visible = false;
                project.featured = false;
            }
        });
    }

    async generateAndApply() {
        // Save first if there are changes
        if (this.hasChanges) {
            await this.saveAllChanges();
        }

        // Show instructions
        const modal = document.createElement('div');
        modal.className = 'update-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🚀 Generate & Apply to Site</h2>
                <p>To apply all changes to the live site:</p>
                <ol>
                    <li>Replace <code>projects-data.json</code> with the downloaded backup</li>
                    <li>Run this command in your terminal:</li>
                </ol>
                <pre>node scripts/run-all-updates.js</pre>
                <p>This will:</p>
                <ul>
                    <li>✓ Update featured projects on homepage</li>
                    <li>✓ Update projects page order</li>
                    <li>✓ Regenerate all project pages with new data</li>
                    <li>✓ Apply media configurations</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-success">Got it!</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // ==================== UI HELPERS ====================

    updateAllCounts() {
        // Sidebar counts
        document.getElementById('featuredCount').textContent =
            document.getElementById('featuredProjects').querySelectorAll('.project-card').length;

        document.getElementById('visibleCount').textContent =
            document.getElementById('allProjects').querySelectorAll('.project-card').length;

        document.getElementById('hiddenCount').textContent =
            document.getElementById('hiddenProjects').querySelectorAll('.project-card').length;

        // Stats panel
        const featuredCount = document.getElementById('featuredProjects').querySelectorAll('.project-card').length;

        document.getElementById('totalProjects').textContent = this.projectsData.projects.length;
        document.getElementById('featuredStat').textContent = `${featuredCount}/6`;
        document.getElementById('visibleStat').textContent =
            this.projectsData.projects.filter(p => !p.hidden && !p.featured).length;
        document.getElementById('hiddenStat').textContent =
            this.projectsData.projects.filter(p => p.hidden).length;
    }

    updateChangeIndicator() {
        const indicator = document.getElementById('changeIndicator');
        if (this.hasChanges) {
            indicator.classList.add('has-changes');
            indicator.querySelector('.indicator-text').textContent = 'Unsaved changes';
        } else {
            indicator.classList.remove('has-changes');
            indicator.querySelector('.indicator-text').textContent = 'No changes';
        }
    }

    showStatus(message, type = 'success') {
        const statusEl = document.createElement('div');
        statusEl.className = `status-message ${type} show`;
        statusEl.textContent = message;
        document.body.appendChild(statusEl);

        setTimeout(() => {
            statusEl.classList.remove('show');
            setTimeout(() => statusEl.remove(), 300);
        }, 3000);
    }

    updateProjectModifiedIndicator(projectId, isModified) {
        // Find the project item in the edit list
        const projectItem = document.querySelector(`.project-item[data-id="${projectId}"]`);
        if (!projectItem) return;

        if (isModified) {
            projectItem.classList.add('modified');
            // Add badge if not exists
            if (!projectItem.querySelector('.modified-badge')) {
                const badge = document.createElement('span');
                badge.className = 'modified-badge';
                badge.textContent = '●';
                badge.title = 'Has unsaved changes';
                projectItem.appendChild(badge);
            }
        } else {
            projectItem.classList.remove('modified');
            // Remove badge
            const badge = projectItem.querySelector('.modified-badge');
            if (badge) badge.remove();
        }

        // Update the modified summary count
        this.updateModifiedSummary();
    }

    updateModifiedSummary() {
        const count = this.modifiedProjects.size;
        const summary = document.getElementById('modifiedSummary');
        const countEl = document.getElementById('modifiedCount');

        if (!summary || !countEl) return;

        if (count > 0) {
            countEl.textContent = count;
            summary.style.display = 'block';
        } else {
            summary.style.display = 'none';
        }
    }

    getCategoryDisplay(category) {
        if (Array.isArray(category)) {
            return category.map(c => this.availableCategories.find(cat => cat.value === c)?.label || c).join(', ');
        }
        return this.availableCategories.find(c => c.value === category)?.label || category;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ProjectStudio();
});