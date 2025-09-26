const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

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

// Generate project info HTML
function generateProjectInfoHTML(project) {
    // Generate role list
    const roleItems = project.role.map(item => `                            <li>${item}</li>`).join('\n');

    // Generate tools tags
    const toolTags = project.tools.map(tool =>
        `                            <span class="tech-tag" style="display: inline-block; background: linear-gradient(145deg, rgba(255, 107, 107, 0.15) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.9) 70%, rgba(0, 0, 0, 0.95) 100%); color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 500; font-size: 0.95rem; border: 2px solid rgba(255, 107, 107, 0.4); backdrop-filter: blur(10px); position: relative;">${tool}</span>`
    ).join('\n');

    // Map category to display name
    const categoryDisplay = {
        'vfx': 'Visual Effects',
        'motion': 'Motion Graphics',
        'editing': 'Video Editing',
        'personal': 'Personal Project'
    };

    return `                <div class="project-info-grid">
                    <div class="project-description">
                        <h2>Project Overview</h2>
                        <p>${project.description}</p>

                        <h3>My Role</h3>
                        <ul>
${roleItems}
                        </ul>

                        <h3>Tools Used</h3>
                        <div class="tech-tags" style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem;">
${toolTags}
                        </div>
                    </div>

                    <div class="project-meta" style="background-color: #dddddd;">
                        <div class="meta-item">
                            <strong>Client:</strong> ${project.client}
                        </div>
                        <div class="meta-item">
                            <strong>Duration:</strong> ${project.duration}
                        </div>
                        <div class="meta-item">
                            <strong>Year:</strong> ${project.year}
                        </div>
                        <div class="meta-item">
                            <strong>Category:</strong> ${categoryDisplay[project.category] || project.category}
                        </div>
                    </div>
                </div>`;
}

// Generate before/after section HTML
function generateBeforeAfterHTML(project) {
    if (!project.beforeAfterMedia || project.beforeAfterMedia.length === 0) {
        // No before/after content
        return '';
    }

    // Generate before/after containers
    const containers = [];
    project.beforeAfterMedia.forEach(media => {
        const beforePath = `../${media.before}`;
        const afterPath = `../${media.after}`;
        const label = media.label || '';

        containers.push(`                        <div class="before-after-container"
                             data-before="${beforePath}"
                             data-after="${afterPath}"
                             data-type="${media.type}"
                             data-label-before="Before"
                             data-label-after="After">
                        </div>
                        <div class="slider-tip">
                            <span class="tip-icon">💡</span>
                            <span class="tip-text">Hover or drag the slider to compare before and after</span>
                        </div>`);
    });

    return `                <!-- Additional project images -->
                <div class="project-gallery">
                    <h3>Process & Variations</h3>
                    <div class="gallery-grid" style="display: flex; flex-direction: column; gap: 1.5rem;">
${containers.join('\n')}
                    </div>
                </div>`;
}

// Update a single project file
function updateProjectFile(project) {
    const projectFile = path.join(PROJECTS_DIR, `Project-${project.id}.html`);

    try {
        // Check if file exists
        if (!fs.existsSync(projectFile)) {
            console.warn(`⚠️  Project file not found: Project-${project.id}.html`);
            return false;
        }

        let content = fs.readFileSync(projectFile, 'utf8');

        // Update the <title> tag in head
        const titlePattern = /<title>.*?<\/title>/;
        if (titlePattern.test(content)) {
            content = content.replace(titlePattern, `<title>${project.fullTitle} - Miron Auslander Portfolio</title>`);
        }

        // Update the <h1> tag in project hero
        const h1Pattern = /<h1[^>]*>.*?<\/h1>/;
        if (h1Pattern.test(content)) {
            content = content.replace(h1Pattern, `<h1 style="margin-bottom: 3rem;">${project.fullTitle}</h1>`);
        }

        // Update meta description
        const metaPattern = /<meta name="description" content="[^"]*">/;
        if (metaPattern.test(content)) {
            const shortDescription = project.description.substring(0, 150) + '...';
            content = content.replace(metaPattern, `<meta name="description" content="${shortDescription}">`);
        }

        // Check if markers exist
        const hasInfoMarkers = content.includes('<!-- PROJECT_INFO_START -->') &&
                               content.includes('<!-- PROJECT_INFO_END -->');
        const hasMediaMarkers = content.includes('<!-- BEFORE_AFTER_SECTION_START -->') &&
                                content.includes('<!-- BEFORE_AFTER_SECTION_END -->');

        if (!hasInfoMarkers && !hasMediaMarkers) {
            // Still update the file if we changed title/h1/meta
            fs.writeFileSync(projectFile, content, 'utf8');
            console.log(`   ✓ Updated Project-${project.id}.html (titles only)`);
            return true;
        }

        let updated = false;

        // Update project info if markers exist
        if (hasInfoMarkers) {
            const infoHTML = generateProjectInfoHTML(project);
            const startMarker = '<!-- PROJECT_INFO_START -->';
            const endMarker = '<!-- PROJECT_INFO_END -->';

            const startIndex = content.indexOf(startMarker);
            const endIndex = content.indexOf(endMarker);

            if (startIndex !== -1 && endIndex !== -1) {
                content = content.substring(0, startIndex + startMarker.length) +
                         '\n' + infoHTML + '\n                ' +
                         content.substring(endIndex);
                updated = true;
            }
        }

        // Update before/after section if markers exist
        if (hasMediaMarkers) {
            const mediaHTML = generateBeforeAfterHTML(project);
            const startMarker = '<!-- BEFORE_AFTER_SECTION_START -->';
            const endMarker = '<!-- BEFORE_AFTER_SECTION_END -->';

            const startIndex = content.indexOf(startMarker);
            const endIndex = content.indexOf(endMarker);

            if (startIndex !== -1 && endIndex !== -1) {
                content = content.substring(0, startIndex + startMarker.length) +
                         '\n' + mediaHTML + '\n                ' +
                         content.substring(endIndex);
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(projectFile, content, 'utf8');
            console.log(`   ✓ Updated Project-${project.id}.html`);
            return true;
        }

        return false;

    } catch (error) {
        console.error(`   ❌ Error updating Project-${project.id}.html:`, error.message);
        return false;
    }
}

// Main function
function main() {
    console.log('🚀 Starting individual project pages update...\n');

    // Load data
    const projectsData = loadProjectsData();
    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON\n`);

    console.log('Updating project pages:');

    let updatedCount = 0;
    let skippedCount = 0;

    // Update each project
    projectsData.projects.forEach(project => {
        const result = updateProjectFile(project);
        if (result) {
            updatedCount++;
        } else {
            skippedCount++;
        }
    });

    console.log('\n📊 Summary:');
    console.log(`   ✓ Updated: ${updatedCount} project pages`);
    console.log(`   ⚠️  Skipped: ${skippedCount} project pages (no markers)`);

    if (updatedCount > 0) {
        console.log('\n✅ Project pages update complete!');
    } else {
        console.log('\n⚠️  No project pages were updated.');
        console.log('   Add markers to project HTML files first:');
        console.log('   <!-- PROJECT_INFO_START --> ... <!-- PROJECT_INFO_END -->');
        console.log('   <!-- BEFORE_AFTER_SECTION_START --> ... <!-- BEFORE_AFTER_SECTION_END -->');
    }
}

// Run the script
main();