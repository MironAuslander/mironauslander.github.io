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
        this.originalData = Utils.deepClone(this.projectsData);

        // Setup containers
        this.setupContainers();

        // Setup event listeners
        this.setupEventListeners();

        // Render projects
        this.renderProjects();

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

        return cardEl;
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

    checkForChanges() {
        const hasChanges = JSON.stringify(this.projectsData) !== JSON.stringify(this.originalData);
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
        const hasChanges = JSON.stringify(this.projectsData) !== JSON.stringify(this.originalData);

        if (hasChanges) {
            Utils.showStatus('⚠️ Please save changes first!', 'warning');
            return;
        }

        await Utils.runUpdateScripts();
    }

    async reloadData() {
        const hasChanges = JSON.stringify(this.projectsData) !== JSON.stringify(this.originalData);

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
</style>
`;

// Inject additional styles
const styleEl = document.createElement('div');
styleEl.innerHTML = additionalStyles;
document.head.appendChild(styleEl);