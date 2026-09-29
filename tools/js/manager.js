// Project Manager - Drag and Drop Logic

class ProjectManager {
    constructor() {
        this.projectsData = { projects: [] };
        this.originalData = null;
        this.sortableInstances = [];
        this.init();
    }

    async init() {
        document.body.classList.add('loading');

        // Load projects data
        this.projectsData = await Utils.loadProjectsData();

        // Setup containers
        this.setupContainers();

        // Setup event listeners
        this.setupEventListeners();

        // Render projects
        this.renderProjects();

        // Baseline after render: renderProjects() sorts the projects array in place
        this.originalData = Utils.deepClone(this.projectsData);

        document.body.classList.remove('loading');
    }

    setupContainers() {
        // Setup sortable containers
        const containers = ['featuredProjects', 'allProjects', 'hiddenProjects'];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;

            const sortable = Sortable.create(container, {
                group: 'projects',
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                handle: '.card-handle',
                onEnd: (evt) => this.handleDragEnd(evt, containerId)
            });

            this.sortableInstances.push(sortable);
        });
    }

    setupEventListeners() {
        // Save button
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveChanges());

        // Apply button
        document.getElementById('applyBtn')?.addEventListener('click', () => this.applyToSite());

        // Reload button
        document.getElementById('reloadBtn')?.addEventListener('click', () => this.reloadData());
    }

    renderProjects() {
        const featuredContainer = document.getElementById('featuredProjects');
        const allContainer = document.getElementById('allProjects');
        const hiddenContainer = document.getElementById('hiddenProjects');

        // Clear containers
        featuredContainer.innerHTML = '';
        allContainer.innerHTML = '';
        hiddenContainer.innerHTML = '';

        // Sort projects
        const sortedProjects = Utils.sortProjectsByOrder(this.projectsData.projects);

        // Separate projects by status
        const featured = [];
        const visible = [];
        const hidden = [];

        sortedProjects.forEach(project => {
            if (project.hidden) {
                hidden.push(project);
            } else if (project.featured) {
                featured.push(project);
            } else {
                visible.push(project);
            }
        });

        // Render to containers
        featured.forEach((project, index) => {
            const card = this.createProjectCard(project, index + 1);
            featuredContainer.appendChild(card);
        });

        visible.forEach((project, index) => {
            const card = this.createProjectCard(project, featured.length + index + 1);
            allContainer.appendChild(card);
        });

        hidden.forEach((project, index) => {
            const card = this.createProjectCard(project, 0);
            hiddenContainer.appendChild(card);
        });

        // Update counts
        this.updateCounts();
    }

    createProjectCard(project, order) {
        const template = document.getElementById('projectCardTemplate');
        const card = template.content.cloneNode(true);

        // Set card data
        const cardEl = card.querySelector('.project-card');
        cardEl.dataset.id = project.id;

        // Thumbnail
        const img = card.querySelector('.card-thumbnail img');
        img.src = Utils.getProjectThumbnail(project);
        img.alt = project.displayTitle;

        // ID badge
        card.querySelector('.card-id').textContent = project.id;

        // Title and meta
        card.querySelector('.card-title').textContent = project.displayTitle;
        card.querySelector('.card-category').textContent = Utils.getCategoryDisplay(project.category);
        card.querySelector('.card-year').textContent = project.year;

        // Badges
        if (project.featured) {
            card.querySelector('.badge-featured').style.display = 'block';
        }
        if (order > 0 && !project.hidden) {
            card.querySelector('.badge-order').textContent = `#${order}`;
        }

        this.setupAssetControls(cardEl, project);

        return cardEl;
    }

    // ==================== IMAGE ASSETS ====================

    setupAssetControls(cardEl, project) {
        const panel = cardEl.querySelector('.card-assets-panel');
        const images = Utils.getProjectImages(project);
        const hasVideoHero = project.heroMedia && project.heroMedia.type === 'video';

        cardEl.querySelector('.asset-toggle').addEventListener('click', () => {
            panel.hidden = !panel.hidden;
        });

        panel.querySelectorAll('input[data-field]').forEach(input => {
            const field = input.dataset.field;
            input.value = images[field];

            // Video poster only applies to video heroes
            if (field === 'poster' && !hasVideoHero) {
                input.disabled = true;
                input.placeholder = 'No video hero - edit hero type in Project Studio';
            }

            input.addEventListener('input', Utils.debounce(() => {
                this.setImageField(project, field, input.value.trim());
                if (field === 'thumbnail') {
                    cardEl.querySelector('.card-thumbnail img').src = Utils.getProjectThumbnail(project);
                }
                this.updateAssetBadges(cardEl, project);
                this.checkForChanges();
            }, 400));
        });

        this.updateAssetBadges(cardEl, project);
    }

    setImageField(project, field, value) {
        if (field === 'poster') {
            if (!project.heroMedia) return;
            if (value) project.heroMedia.poster = value;
            else delete project.heroMedia.poster;
            return;
        }
        if (value) project[field] = value;
        else delete project[field];
    }

    // Probe each served image and mark its badge ✓ (loads), ✗ (missing) or – (not set)
    async updateAssetBadges(cardEl, project) {
        const images = Utils.getProjectImages(project);
        const badges = cardEl.querySelectorAll('.asset-badge');

        await Promise.all(Array.from(badges).map(async badge => {
            const asset = badge.dataset.asset;
            const path = images[asset];
            badge.classList.remove('ok', 'missing', 'unset', 'fallback');

            if (!path) {
                // No cover: page falls back to the video poster
                const isFallback = asset === 'cover' && images.poster;
                badge.classList.add(isFallback ? 'fallback' : 'unset');
                badge.title = isFallback ? 'Cover not set - uses video poster' : `${badge.textContent} not set`;
                return;
            }

            const url = Utils.getServedImage(path);
            const ok = await Utils.probeImage(url);
            badge.classList.add(ok ? 'ok' : 'missing');
            badge.title = `${ok ? '✓' : '✗ Missing:'} ${url.replace('../', '')}`;
        }));
    }

    handleDragEnd(evt, containerId) {
        const projectId = evt.item.dataset.id;
        const project = this.projectsData.projects.find(p => p.id === projectId);

        if (!project) return;

        // Update project status based on container
        if (containerId === 'featuredProjects') {
            project.featured = true;
            project.hidden = false;
            project.visible = true;

            // Update featured order
            const featuredCards = document.getElementById('featuredProjects').querySelectorAll('.project-card');
            featuredCards.forEach((card, index) => {
                const cardProject = this.projectsData.projects.find(p => p.id === card.dataset.id);
                if (cardProject) {
                    cardProject.featuredOrder = index + 1;
                }
            });

            // Check featured limit
            if (featuredCards.length > 6) {
                Utils.showStatus('⚠️ Maximum 6 featured projects allowed', 'warning');
                // Move excess to all projects
                const excessCard = featuredCards[featuredCards.length - 1];
                document.getElementById('allProjects').appendChild(excessCard);
                const excessProject = this.projectsData.projects.find(p => p.id === excessCard.dataset.id);
                if (excessProject) {
                    excessProject.featured = false;
                    excessProject.featuredOrder = null;
                }
            }

        } else if (containerId === 'allProjects') {
            project.featured = false;
            project.hidden = false;
            project.visible = true;
            project.featuredOrder = null;

            // Update display order
            const allCards = document.getElementById('allProjects').querySelectorAll('.project-card');
            allCards.forEach((card, index) => {
                const cardProject = this.projectsData.projects.find(p => p.id === card.dataset.id);
                if (cardProject) {
                    cardProject.displayOrder = index + 1;
                }
            });

        } else if (containerId === 'hiddenProjects') {
            project.featured = false;
            project.hidden = true;
            project.visible = false;
            project.featuredOrder = null;
        }

        // Update UI
        this.updateCounts();
        this.updateBadges();

        // Check if changes were made
        this.checkForChanges();
    }

    updateCounts() {
        const featured = this.projectsData.projects.filter(p => p.featured).length;
        const all = this.projectsData.projects.filter(p => !p.hidden && !p.featured).length;
        const hidden = this.projectsData.projects.filter(p => p.hidden).length;

        document.getElementById('featuredCount').textContent = featured;
        document.getElementById('allCount').textContent = all;
        document.getElementById('hiddenCount').textContent = hidden;
    }

    updateBadges() {
        // Update order badges on all cards
        let order = 1;

        // Featured projects
        document.querySelectorAll('#featuredProjects .project-card').forEach(card => {
            card.querySelector('.badge-featured').style.display = 'block';
            card.querySelector('.badge-order').textContent = `#${order++}`;
        });

        // All projects
        document.querySelectorAll('#allProjects .project-card').forEach(card => {
            card.querySelector('.badge-featured').style.display = 'none';
            card.querySelector('.badge-order').textContent = `#${order++}`;
        });

        // Hidden projects
        document.querySelectorAll('#hiddenProjects .project-card').forEach(card => {
            card.querySelector('.badge-featured').style.display = 'none';
            card.querySelector('.badge-order').textContent = '';
        });
    }

    // Compare with sorted object keys, so removing and re-adding a field is not a change
    hasUnsavedChanges() {
        const stable = value => JSON.stringify(value, (key, val) =>
            val && typeof val === 'object' && !Array.isArray(val)
                ? Object.keys(val).sort().reduce((out, k) => { out[k] = val[k]; return out; }, {})
                : val);
        return stable(this.projectsData) !== stable(this.originalData);
    }

    checkForChanges() {
        const hasChanges = this.hasUnsavedChanges();
        const saveBtn = document.getElementById('saveBtn');

        if (hasChanges) {
            saveBtn.classList.add('btn-warning');
            saveBtn.textContent = '💾 Save Changes (*)';
        } else {
            saveBtn.classList.remove('btn-warning');
            saveBtn.textContent = '💾 Save Changes';
        }
    }

    async saveChanges() {
        const success = await Utils.saveProjectsData(this.projectsData);

        if (success) {
            this.originalData = Utils.deepClone(this.projectsData);
            this.checkForChanges();
            Utils.showStatus('✅ Changes saved! Download started.', 'success');
        } else {
            Utils.showStatus('❌ Failed to save changes', 'error');
        }
    }

    async applyToSite() {
        const hasChanges = this.hasUnsavedChanges();

        if (hasChanges) {
            Utils.showStatus('⚠️ Please save changes first!', 'warning');
            return;
        }

        await Utils.runUpdateScripts();
    }

    async reloadData() {
        const hasChanges = this.hasUnsavedChanges();

        if (hasChanges) {
            const confirm = window.confirm('You have unsaved changes. Are you sure you want to reload?');
            if (!confirm) return;
        }

        // Re-initialize
        await this.init();
        Utils.showStatus('🔄 Data reloaded successfully', 'success');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectManager();
});

// Add additional button styles
const additionalStyles = `
<style>
.btn-warning {
    background: linear-gradient(135deg, var(--warning-color) 0%, #ff6f00 100%) !important;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.projects-container:empty::after {
    content: 'Drag projects here';
    display: block;
    text-align: center;
    color: var(--text-secondary);
    padding: 3rem;
    opacity: 0.5;
}

.featured-container:empty::after {
    content: '⭐ Drag up to 6 projects here to feature on homepage';
}

.all-container:empty::after {
    content: '📁 Drag projects here to show on projects page';
}

.hidden-container:empty::after {
    content: '👁️ Drag projects here to hide from public view';
}

/* Image asset badges + edit panel */
.project-card {
    flex-wrap: wrap;
}

.card-assets {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.5rem;
}

.asset-badge {
    font-size: 0.7rem;
    padding: 0.1rem 0.45rem;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    cursor: default;
}

.asset-badge.ok::before { content: '✓ '; }
.asset-badge.missing::before { content: '✗ '; }
.asset-badge.unset::before { content: '– '; }
.asset-badge.fallback::before { content: '↪ '; }

.asset-badge.ok {
    border-color: var(--success-color);
    color: var(--success-color);
}

.asset-badge.missing {
    border-color: var(--error-color);
    color: var(--error-color);
}

.asset-badge.fallback {
    border-color: var(--warning-color);
    color: var(--warning-color);
}

.asset-toggle {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
}

.card-assets-panel {
    flex-basis: 100%;
    display: grid;
    gap: 0.5rem;
    cursor: default;
}

.card-assets-panel[hidden] {
    display: none;
}

.card-assets-panel label {
    display: grid;
    gap: 0.2rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.card-assets-panel input {
    width: 100%;
    padding: 0.4rem 0.5rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 0.8rem;
}

.card-assets-panel input:disabled {
    opacity: 0.5;
}
</style>
`;

// Inject additional styles
const styleEl = document.createElement('div');
styleEl.innerHTML = additionalStyles;
document.head.appendChild(styleEl);