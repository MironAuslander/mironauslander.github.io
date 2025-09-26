const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const INDEX_FILE = path.join(__dirname, '..', 'index.html');

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

// Generate HTML for featured projects
function generateFeaturedHTML(projects) {
    // Filter and sort featured projects
    const featuredProjects = projects
        .filter(p => p.featured && p.visible)
        .sort((a, b) => a.featuredOrder - b.featuredOrder)
        .slice(0, 6); // Only take first 6

    if (featuredProjects.length === 0) {
        console.warn('⚠️  No featured projects found');
        return '';
    }

    console.log(`✓ Found ${featuredProjects.length} featured projects`);

    // Generate HTML for each featured project
    const projectCards = featuredProjects.map(project => {
        return `                    <a href="projects/Project-${project.id}.html" class="project-card" aria-label="View ${project.fullTitle} project details">
                        <img src="${project.thumbnail}" alt="${project.fullTitle}" />
                        <span>${project.displayTitle}</span>
                    </a>`;
    }).join('\n');

    return `                <div class="projects-grid">
${projectCards}
                </div>`;
}

// Update index.html
function updateIndexFile(htmlContent) {
    try {
        let indexContent = fs.readFileSync(INDEX_FILE, 'utf8');

        // Find the markers
        const startMarker = '<!-- FEATURED_PROJECTS_START -->';
        const endMarker = '<!-- FEATURED_PROJECTS_END -->';

        const startIndex = indexContent.indexOf(startMarker);
        const endIndex = indexContent.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1) {
            console.error('❌ Could not find HTML markers in index.html');
            console.log('   Make sure <!-- FEATURED_PROJECTS_START --> and <!-- FEATURED_PROJECTS_END --> exist');
            process.exit(1);
        }

        // Replace content between markers
        const newContent =
            indexContent.substring(0, startIndex + startMarker.length) +
            '\n' + htmlContent + '\n                ' +
            indexContent.substring(endIndex);

        // Write back to file
        fs.writeFileSync(INDEX_FILE, newContent, 'utf8');
        console.log('✓ Updated index.html successfully');

    } catch (error) {
        console.error('❌ Error updating index.html:', error.message);
        process.exit(1);
    }
}

// Main function
function main() {
    console.log('🚀 Starting featured projects update...\n');

    // Load data
    const projectsData = loadProjectsData();
    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON`);

    // Generate HTML
    const featuredHTML = generateFeaturedHTML(projectsData.projects);

    if (!featuredHTML) {
        console.error('❌ No HTML generated');
        process.exit(1);
    }

    // Update index.html
    updateIndexFile(featuredHTML);

    console.log('\n✅ Featured projects update complete!');
}

// Run the script
main();