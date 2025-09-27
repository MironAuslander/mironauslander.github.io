const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Load projects data
function loadProjectsData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading projects-data.json:', error.message);
        process.exit(1);
    }
}

// Get related projects for a given project
function getRelatedProjects(currentProject, allProjects) {
    // Filter out the current project and hidden projects
    const availableProjects = allProjects.filter(p =>
        p.id !== currentProject.id && p.visible !== false
    );

    // Get projects from the same category first
    let categoryProjects = [];
    if (currentProject.category) {
        const categories = Array.isArray(currentProject.category)
            ? currentProject.category
            : [currentProject.category];

        categoryProjects = availableProjects.filter(p => {
            const pCategories = Array.isArray(p.category)
                ? p.category
                : [p.category];
            return categories.some(cat => pCategories.includes(cat));
        });
    }

    // If we have category matches, use them; otherwise use all available
    const pool = categoryProjects.length > 0 ? categoryProjects : availableProjects;

    // Randomly select 2 projects
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
}

// Generate Related Projects HTML
function generateRelatedProjectsHTML(relatedProjects) {
    const projectCards = relatedProjects.map(project => {
        const displayName = project.displayTitle || project.fullTitle || `Project ${project.id}`;
        // Ensure thumbnail path starts with ../
        let thumbnail = project.thumbnail || `assets/images/projects/${project.id}/${project.id}-thumb.webp`;
        if (!thumbnail.startsWith('../')) {
            thumbnail = '../' + thumbnail;
        }

        return `                    <a href="Project-${project.id}.html" class="project-card" style="max-width: 250px;">
                        <img src="${thumbnail}" alt="${displayName}">
                        <h3>${displayName}</h3>
                    </a>`;
    });

    return `        <!-- Related Projects -->
        <section class="related-projects">
            <div class="container">
                <h2>Related Projects</h2>
                <div class="projects-grid" style="max-width: 600px; margin: 0 auto;">
${projectCards.join('\n')}
                </div>
            </div>
        </section>`;
}

// Update a project file
function updateProjectFile(projectFile, relatedProjectsHTML) {
    try {
        const filePath = path.join(PROJECTS_DIR, projectFile);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${projectFile}`);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Find the Related Projects section
        const sectionStart = content.indexOf('<!-- Related Projects -->');
        const sectionEnd = content.indexOf('</section>', sectionStart);

        if (sectionStart === -1 || sectionEnd === -1) {
            console.warn(`⚠️  No Related Projects section found in ${projectFile}`);
            return false;
        }

        // Replace the entire Related Projects section
        const endPosition = sectionEnd + '</section>'.length;
        const newContent =
            content.substring(0, sectionStart) +
            relatedProjectsHTML +
            content.substring(endPosition);

        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Error updating ${projectFile}:`, error.message);
        return false;
    }
}

// Main function
function main() {
    console.log('🚀 Starting Related Projects update...\n');

    // Load data
    const projectsData = loadProjectsData();
    const projects = projectsData.projects || [];

    console.log(`✓ Loaded ${projects.length} projects from JSON`);

    let updated = 0;
    let failed = 0;

    // Update each project file
    projects.forEach(project => {
        const projectFile = `Project-${project.id}.html`;

        // Get related projects
        const relatedProjects = getRelatedProjects(project, projects);

        if (relatedProjects.length === 0) {
            console.warn(`⚠️  No related projects found for ${projectFile}`);
            failed++;
            return;
        }

        // Generate HTML
        const relatedHTML = generateRelatedProjectsHTML(relatedProjects);

        // Update the file
        if (updateProjectFile(projectFile, relatedHTML)) {
            console.log(`✓ Updated ${projectFile} with ${relatedProjects.map(p => p.displayTitle).join(', ')}`);
            updated++;
        } else {
            failed++;
        }
    });

    console.log(`\n✅ Related Projects update complete!`);
    console.log(`   Updated: ${updated} files`);
    if (failed > 0) {
        console.log(`   Failed: ${failed} files`);
    }
}

// Run the script
main();