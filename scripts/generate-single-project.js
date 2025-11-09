/**
 * Quick single project generator
 * Usage: node scripts/generate-single-project.js [PROJECT_ID]
 *
 * Faster alternative to generate-project-unified.js for single project updates
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

// Paths
const DATA_FILE = 'projects-data.json';
const TEMPLATE_DIR = 'templates';
const PROJECTS_DIR = 'projects';

// Check if project ID was provided
if (process.argv.length !== 3) {
    console.error(`${colors.red}❌ Error: Project ID required${colors.reset}`);
    console.log(`
Usage: ${colors.cyan}node scripts/generate-single-project.js [PROJECT_ID]${colors.reset}

Examples:
  ${colors.green}node scripts/generate-single-project.js 1238${colors.reset}
  ${colors.green}node scripts/generate-single-project.js 1798${colors.reset}
`);
    process.exit(1);
}

const projectId = process.argv[2];

// Load project data
let projectsData;
try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    projectsData = JSON.parse(rawData);
} catch (error) {
    console.error(`${colors.red}❌ Error reading ${DATA_FILE}:${colors.reset}`, error.message);
    process.exit(1);
}

// Find the specific project
const project = projectsData.projects.find(p => p.id === projectId);

if (!project) {
    console.error(`${colors.red}❌ Project ${projectId} not found in ${DATA_FILE}${colors.reset}`);
    console.log(`\nAvailable project IDs:`);
    projectsData.projects.forEach(p => {
        console.log(`  ${colors.cyan}${p.id}${colors.reset} - ${p.displayTitle}`);
    });
    process.exit(1);
}

// Quick template renderer (simplified version)
function renderTemplate(template, data) {
    let rendered = template;

    // Replace variables {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return data[variable] || '';
    });

    // Handle conditionals {{#if condition}}...{{/if}}
    rendered = rendered.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
        (match, condition, ifContent, elseContent = '') => {
            return data[condition] ? ifContent : elseContent;
        }
    );

    // Handle arrays {{#each items}}...{{/each}}
    rendered = rendered.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
        (match, arrayName, itemTemplate) => {
            const array = data[arrayName];
            if (!Array.isArray(array)) return '';

            return array.map(item => {
                return itemTemplate.replace(/\{\{this\}\}/g, item);
            }).join('');
        }
    );

    return rendered;
}

// Generate media HTML
function generateMediaHTML(project) {
    let html = '';

    if (!project.processMedia || project.processMedia.length === 0) {
        return '';
    }

    html += '<div class="process-media-grid" style="display: flex; flex-direction: column; gap: 1.5rem;">\n';

    project.processMedia.forEach(item => {
        html += '<div class="media-item">\n';

        if (item.label) {
            html += `    <div class="media-label">${item.label}</div>\n`;
        }

        switch(item.type) {
            case 'video':
                html += `    <video controls loop disablePictureInPicture controlsList="nodownload" loading="lazy">\n`;
                html += `        <source src="../${item.src}" type="video/mp4">\n`;
                html += `    </video>\n`;
                break;

            case 'image':
                html += `    <img src="../${item.src}" alt="${item.alt || item.caption || ''}" loading="lazy">\n`;
                break;

            case 'before-after-video':
            case 'before-after-image':
                const isVideo = item.type === 'before-after-video';
                html += `    <div class="before-after-container">\n`;
                if (isVideo) {
                    html += `        <video class="before-media" loop muted playsinline>\n`;
                    html += `            <source src="../${item.before}" type="video/mp4">\n`;
                    html += `        </video>\n`;
                    html += `        <video class="after-media" loop muted playsinline>\n`;
                    html += `            <source src="../${item.after}" type="video/mp4">\n`;
                    html += `        </video>\n`;
                } else {
                    html += `        <img class="before-media" src="../${item.before}" alt="Before">\n`;
                    html += `        <img class="after-media" src="../${item.after}" alt="After">\n`;
                }
                html += `        <div class="slider-container">\n`;
                html += `            <div class="slider-line"></div>\n`;
                html += `            <div class="slider-handle">\n`;
                html += `                <svg width="30" height="30" viewBox="0 0 30 30">\n`;
                html += `                    <circle cx="15" cy="15" r="14" fill="white" stroke="#333" stroke-width="2"/>\n`;
                html += `                    <path d="M10 15 L8 13 L8 17 Z" fill="#333"/>\n`;
                html += `                    <path d="M20 15 L22 13 L22 17 Z" fill="#333"/>\n`;
                html += `                </svg>\n`;
                html += `            </div>\n`;
                html += `        </div>\n`;
                html += `        <div class="labels">\n`;
                html += `            <span class="label-before">${item.labelBefore || 'Before'}</span>\n`;
                html += `            <span class="label-after">${item.labelAfter || 'After'}</span>\n`;
                html += `        </div>\n`;
                html += `    </div>\n`;
                break;
        }

        if (item.caption) {
            html += `    <div class="media-caption">${item.caption}</div>\n`;
        }

        html += '</div>\n';
    });

    html += '</div>';
    return html;
}

// Prepare template data
const categories = {
    vfx: "VFX",
    motion: "Motion Graphics",
    editing: "Editing",
    "3d": "3D Animation",
    color: "Color Grading",
    design: "Design",
    commercial: "Commercial",
    television: "Television"
};

const templateData = {
    ...project,
    categoryTags: project.category ? project.category.map(cat => categories[cat] || cat).join(', ') : '',
    hasDescription: !!project.description,
    hasRole: project.role && project.role.length > 0,
    hasTools: project.tools && project.tools.length > 0,
    hasBeforeAfter: project.processMedia && project.processMedia.some(item =>
        item.type === 'before-after-video' || item.type === 'before-after-image'
    ),
    metaDescription: project.description || `${project.fullTitle} - VFX and motion graphics project by Miron Auslander`,
    processMediaHTML: generateMediaHTML(project)
};

// Determine which template to use
const templateFile = 'project-page-advanced.html';
const templatePath = path.join(TEMPLATE_DIR, templateFile);

// Load and render template
let template;
try {
    template = fs.readFileSync(templatePath, 'utf8');
} catch (error) {
    console.error(`${colors.red}❌ Error reading template:${colors.reset}`, error.message);
    process.exit(1);
}

const html = renderTemplate(template, templateData);

// Write the file
const outputPath = path.join(PROJECTS_DIR, `Project-${projectId}.html`);
try {
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`${colors.green}✅ Successfully generated ${outputPath}${colors.reset}`);
    console.log(`   Project: ${colors.cyan}${project.fullTitle}${colors.reset}`);

    // Quick size check
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   File size: ${sizeKB} KB`);

} catch (error) {
    console.error(`${colors.red}❌ Error writing file:${colors.reset}`, error.message);
    process.exit(1);
}

console.log(`\n${colors.yellow}💡 Test your changes:${colors.reset}`);
console.log(`   1. Start local server: ${colors.cyan}python -m http.server 8000${colors.reset}`);
console.log(`   2. Open: ${colors.cyan}http://localhost:8000/projects/Project-${projectId}.html${colors.reset}`);