// Shared utilities for project management tools

const Utils = {
    // Load projects data from JSON file
    async loadProjectsData() {
        try {
            const response = await fetch('../projects-data.json');
            if (!response.ok) throw new Error('Failed to load projects data');
            return await response.json();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showStatus('Failed to load projects data', 'error');
            return { projects: [] };
        }
    },

    // Save projects data to JSON file (using Node.js scripts)
    async saveProjectsData(data) {
        try {
            // Convert data to JSON string
            const jsonString = JSON.stringify(data, null, 2);

            // Create a blob and download link (for backup)
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

            // Trigger download as backup
            const a = document.createElement('a');
            a.href = url;
            a.download = `projects-data-backup-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Show instructions for manual update
            this.showUpdateInstructions(jsonString);

            return true;
        } catch (error) {
            console.error('Error saving projects:', error);
            this.showStatus('Failed to save projects data', 'error');
            return false;
        }
    },

    // Show update instructions modal
    showUpdateInstructions(jsonString) {
        const modal = document.createElement('div');
        modal.className = 'update-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>📋 Update Instructions</h2>
                <p>Your changes have been saved to a backup file. To apply to the site:</p>
                <ol>
                    <li>Replace the contents of <code>projects-data.json</code> with the downloaded backup</li>
                    <li>Run the update scripts from the project root:</li>
                </ol>
                <pre>node scripts/run-all-updates.js</pre>
                <p>Or copy this JSON and paste into projects-data.json:</p>
                <textarea readonly onclick="this.select()">${jsonString.substring(0, 500)}...</textarea>
                <button onclick="this.remove()" class="btn btn-primary">Got it!</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Run update scripts
    async runUpdateScripts() {
        try {
            // In a real implementation, this would trigger the Node.js scripts
            // For now, show instructions
            const modal = document.createElement('div');
            modal.className = 'update-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>🚀 Apply Changes to Site</h2>
                    <p>To apply your changes to the live site, run this command in your terminal:</p>
                    <pre>node scripts/run-all-updates.js</pre>
                    <p>This will update:</p>
                    <ul>
                        <li>✓ Featured projects on homepage</li>
                        <li>✓ Projects listing page</li>
                        <li>✓ Individual project pages</li>
                    </ul>
                    <button onclick="this.remove()" class="btn btn-success">OK, I'll run it!</button>
                </div>
            `;
            document.body.appendChild(modal);
            return true;
        } catch (error) {
            console.error('Error running update scripts:', error);
            this.showStatus('Failed to run update scripts', 'error');
            return false;
        }
    },

    // Show status message
    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status-message ${type} show`;

        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    },

    // Get project thumbnail URL
    getProjectThumbnail(project) {
        // Try to get thumbnail from various sources
        if (project.thumbnail) {
            return `../${project.thumbnail}`;
        }
        if (project.videoPoster) {
            return `../${project.videoPoster}`;
        }
        // Default thumbnail path based on ID
        return `../assets/images/projects/${project.id}/${project.id}.webp`;
    },

    // Get category display name
    getCategoryDisplay(category) {
        const categories = {
            'vfx': 'Visual Effects',
            'motion': 'Motion Graphics',
            'editing': 'Video Editing',
            'personal': 'Personal Project'
        };
        return categories[category] || category;
    },

    // Sort projects by featured order
    sortProjectsByOrder(projects) {
        return projects.sort((a, b) => {
            // Featured projects first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then by featured order
            if (a.featured && b.featured) {
                return (a.featuredOrder || 999) - (b.featuredOrder || 999);
            }

            // Then by display order
            return (a.displayOrder || 999) - (b.displayOrder || 999);
        });
    },

    // Validate project data
    validateProjectData(project) {
        const required = ['id', 'displayTitle', 'fullTitle', 'description', 'category'];
        const missing = required.filter(field => !project[field]);

        if (missing.length > 0) {
            console.warn(`Project ${project.id} missing fields:`, missing);
            return false;
        }

        return true;
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Add modal styles
const modalStyles = `
<style>
.update-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-content h2 {
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.modal-content p, .modal-content li {
    color: var(--text-secondary);
    line-height: 1.6;
}

.modal-content pre, .modal-content code {
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: 4px;
    color: var(--accent-color);
    font-family: 'Courier New', monospace;
    overflow-x: auto;
}

.modal-content textarea {
    width: 100%;
    height: 150px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1rem;
    color: var(--text-primary);
    font-family: 'Courier New', monospace;
    resize: vertical;
    margin: 1rem 0;
}

.modal-content button {
    margin-top: 1rem;
}
</style>
`;

// Inject modal styles
if (!document.getElementById('modalStyles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'modalStyles';
    styleEl.innerHTML = modalStyles;
    document.head.appendChild(styleEl);
}

// Export for use in other scripts
window.Utils = Utils;