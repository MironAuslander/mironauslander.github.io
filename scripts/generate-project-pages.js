const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const TEMPLATE_FILE = path.join(__dirname, '..', 'templates', 'project-page.html');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Category display mapping
const CATEGORY_DISPLAY = {
    'vfx': 'Visual Effects',
    'motion': 'Motion Graphics',
    'editing': 'Video Editing',
    'personal': 'Personal Project'
};

// Simple template engine
function renderTemplate(template, data) {
    let rendered = template;

    // Handle conditional blocks {{#if}} ... {{else}} ... {{/if}}
    rendered = rendered.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
        (match, condition, ifContent, elseContent = '') => {
            return data[condition] ? ifContent : elseContent;
    });

    // Handle each loops {{#each}} ... {{/each}}
    rendered = rendered.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
        const array = data[arrayName];
        if (!array || !Array.isArray(array)) return '';

        return array.map(item => {
            let itemContent = content;
            if (typeof item === 'object') {
                // Replace object properties
                Object.keys(item).forEach(key => {
                    const regex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g');
                    itemContent = itemContent.replace(regex, item[key] || '');
                });
            } else {
                // Replace simple values
                itemContent = itemContent.replace(/\{\{this\}\}/g, item);
            }
            return itemContent;
        }).join('');
    });

    // Handle simple variable replacements
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        const value = data[key];
        if (typeof value === 'string' || typeof value === 'number') {
            rendered = rendered.replace(regex, value);
        }
    });

    return rendered;
}

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

// Load template
function loadTemplate() {
    try {
        return fs.readFileSync(TEMPLATE_FILE, 'utf8');
    } catch (error) {
        console.error('❌ Error reading template:', error.message);
        process.exit(1);
    }
}

// Find related projects (same category, different ID)
function findRelatedProjects(currentProject, allProjects) {
    const related = allProjects
        .filter(p => p.id !== currentProject.id && p.category === currentProject.category && p.visible)
        .slice(0, 2); // Get first 2 related projects

    // If not enough in same category, add from other categories
    if (related.length < 2) {
        const others = allProjects
            .filter(p => p.id !== currentProject.id && !related.includes(p) && p.visible)
            .slice(0, 2 - related.length);
        related.push(...others);
    }

    return related;
}

// Generate a single project page
function generateProjectPage(project, template, allProjects) {
    // Prepare data for template
    const templateData = {
        ...project,
        metaDescription: project.description.substring(0, 150) + '...',
        hasVideo: !!project.mainVideo,
        hasBeforeAfter: project.beforeAfterMedia && project.beforeAfterMedia.length > 0,
        categoryDisplay: CATEGORY_DISPLAY[project.category] || project.category,
        relatedProjects: findRelatedProjects(project, allProjects)
    };

    // Render template
    return renderTemplate(template, templateData);
}

// Save project file
function saveProjectFile(projectId, content) {
    const filePath = path.join(PROJECTS_DIR, `Project-${projectId}.html`);

    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Error saving Project-${projectId}.html:`, error.message);
        return false;
    }
}

// Main function
function main(projectIds = null) {
    console.log('🚀 Starting project page generation...\n');

    // Load data and template
    const projectsData = loadProjectsData();
    const template = loadTemplate();

    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON`);
    console.log('✓ Loaded template file\n');

    // Determine which projects to generate
    let projectsToGenerate;
    if (projectIds) {
        // Generate specific projects
        projectsToGenerate = projectsData.projects.filter(p => projectIds.includes(p.id));
        console.log(`Generating ${projectsToGenerate.length} specific project(s): ${projectIds.join(', ')}\n`);
    } else {
        // Generate all projects
        projectsToGenerate = projectsData.projects;
        console.log(`Generating all ${projectsToGenerate.length} projects\n`);
    }

    let successCount = 0;
    let failCount = 0;

    // Generate each project
    projectsToGenerate.forEach(project => {
        console.log(`Generating Project-${project.id}.html...`);

        const content = generateProjectPage(project, template, projectsData.projects);
        const success = saveProjectFile(project.id, content);

        if (success) {
            console.log(`   ✓ Generated Project-${project.id}.html`);
            successCount++;
        } else {
            console.log(`   ❌ Failed to generate Project-${project.id}.html`);
            failCount++;
        }
    });

    console.log('\n📊 Summary:');
    console.log(`   ✓ Successfully generated: ${successCount} project pages`);
    if (failCount > 0) {
        console.log(`   ❌ Failed: ${failCount} project pages`);
    }

    if (successCount > 0) {
        console.log('\n✅ Project page generation complete!');
    } else {
        console.log('\n❌ No project pages were generated.');
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
    // Generate specific projects
    main(args);
} else {
    // Generate all projects
    main();
}

module.exports = { generateProjectPage, loadProjectsData, loadTemplate };