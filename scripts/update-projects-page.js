const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const PROJECTS_FILE = path.join(__dirname, '..', 'projects.html');

// Read the projects data
function loadProjectsData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading projects-data.json:', error.message);
        process.exit(1);
    }
}

// Generate HTML for all projects
function generateProjectsHTML(projects) {
    // Filter visible projects and sort by order
    const visibleProjects = projects
        .filter(p => p.visible)
        .sort((a, b) => a.projectsPageOrder - b.projectsPageOrder);

    if (visibleProjects.length === 0) {
        console.warn('⚠️  No visible projects found');
        return '';
    }

    console.log(`✓ Found ${visibleProjects.length} visible projects`);

    // Generate HTML for each project
    const projectCards = visibleProjects.map(project => {
        // Determine display title (use fullTitle or displayTitle)
        const displayName = project.displayTitle || project.fullTitle;

        // Handle both string and array categories
        let categoryData = '';
        if (project.category) {
            categoryData = Array.isArray(project.category)
                ? project.category.join(',')
                : project.category;
        }

        return `                    <a href="projects/Project-${project.id}.html" class="project-card" data-category="${categoryData}" aria-label="View ${displayName}">
                        <img src="${project.thumbnail}" alt="${displayName}" loading="lazy">
                        <span>${displayName}</span>
                    </a>`;
    });

    // Add comments for organization
    const featuredComment = '\n                    <!-- Existing Projects -->\n';
    const newProjectsComment = '\n\n                    <!-- New Projects -->\n';

    // Split into featured and non-featured for visual organization
    const featuredProjects = projectCards.slice(0, 6);
    const otherProjects = projectCards.slice(6);

    // Combine with proper formatting
    let html = featuredComment;
    html += featuredProjects.join('\n\n');

    if (otherProjects.length > 0) {
        html += newProjectsComment;
        html += otherProjects.join('\n\n');
    }

    html += '\n                    ';

    return html;
}

// Update projects.html
function updateProjectsFile(htmlContent) {
    try {
        let projectsContent = fs.readFileSync(PROJECTS_FILE, 'utf8');

        // Find the markers
        const startMarker = '<!-- ALL_PROJECTS_START -->';
        const endMarker = '<!-- ALL_PROJECTS_END -->';

        const startIndex = projectsContent.indexOf(startMarker);
        const endIndex = projectsContent.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1) {
            console.error('❌ Could not find HTML markers in projects.html');
            console.log('   Make sure <!-- ALL_PROJECTS_START --> and <!-- ALL_PROJECTS_END --> exist');
            process.exit(1);
        }

        // Replace content between markers
        const newContent =
            projectsContent.substring(0, startIndex + startMarker.length) +
            htmlContent +
            projectsContent.substring(endIndex);

        // Write back to file
        fs.writeFileSync(PROJECTS_FILE, newContent, 'utf8');
        console.log('✓ Updated projects.html successfully');

    } catch (error) {
        console.error('❌ Error updating projects.html:', error.message);
        process.exit(1);
    }
}

// Validate categories
function validateCategories(projects) {
    const validCategories = ['ai', 'vfx', 'motion', 'editing', 'personal'];
    const invalidProjects = [];

    projects.forEach(p => {
        if (p.category) {
            // Handle both string and array formats
            const categories = Array.isArray(p.category) ? p.category : [p.category];
            const invalidCats = categories.filter(cat => !validCategories.includes(cat));

            if (invalidCats.length > 0) {
                invalidProjects.push({ id: p.id, invalid: invalidCats });
            }
        }
    });

    if (invalidProjects.length > 0) {
        console.warn('⚠️  Warning: Some projects have invalid categories:');
        invalidProjects.forEach(p => {
            console.warn(`   - Project ${p.id}: "${p.invalid.join(', ')}"`);
        });
        console.log('   Valid categories are: ai, vfx, motion, editing, personal');
    }
}

// Main function
function main() {
    console.log('🚀 Starting projects page update...\n');

    // Load data
    const projectsData = loadProjectsData();
    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON`);

    // Validate categories for filter functionality
    validateCategories(projectsData.projects);

    // Generate HTML
    const projectsHTML = generateProjectsHTML(projectsData.projects);

    if (!projectsHTML) {
        console.error('❌ No HTML generated');
        process.exit(1);
    }

    // Update projects.html
    updateProjectsFile(projectsHTML);

    console.log('\n✅ Projects page update complete!');
}

// Run the script
main();