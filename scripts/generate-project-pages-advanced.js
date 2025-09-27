const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const TEMPLATE_FILE = path.join(__dirname, '..', 'templates', 'project-page-advanced.html');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Category display mapping
const CATEGORY_DISPLAY = {
    'vfx': 'Visual Effects',
    'motion': 'Motion Graphics',
    'editing': 'Video Editing',
    'personal': 'Personal Project'
};

// Media type generators
const MediaGenerators = {
    // Generate hero media based on type
    generateHeroMedia(heroData) {
        if (!heroData) return '';

        if (heroData.type === 'video') {
            return `
                    <video controls loop disablePictureInPicture controlsList="nodownload" poster="../${heroData.poster || ''}">
                        <source src="../${heroData.src}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
        } else if (heroData.type === 'image') {
            return `
                    <img src="../${heroData.src}" alt="${heroData.alt || ''}" loading="lazy">`;
        }
        return '';
    },

    // Generate process media item based on type
    generateProcessMediaItem(item, index) {
        switch (item.type) {
            case 'video':
                return this.generateVideo(item);
            case 'image':
                return this.generateImage(item);
            case 'before-after-video':
                return this.generateBeforeAfterVideo(item);
            case 'before-after-image':
                return this.generateBeforeAfterImage(item);
            default:
                return '';
        }
    },

    generateVideo(item) {
        return `
                        <div class="media-item">
                            ${item.label ? `<div class="media-label">${item.label}</div>` : ''}
                            <video controls loop disablePictureInPicture controlsList="nodownload" ${item.poster ? `poster="../${item.poster}"` : ''}>
                                <source src="../${item.src}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            ${item.caption ? `<div class="media-caption">${item.caption}</div>` : ''}
                        </div>`;
    },

    generateImage(item) {
        return `
                        <div class="media-item">
                            ${item.label ? `<div class="media-label">${item.label}</div>` : ''}
                            <img src="../${item.src}" alt="${item.alt || item.caption || ''}" loading="lazy">
                            ${item.caption ? `<div class="media-caption">${item.caption}</div>` : ''}
                        </div>`;
    },

    generateBeforeAfterVideo(item) {
        return `
                        <div class="media-item before-after-wrapper">
                            ${item.label ? `<div class="media-label">${item.label}</div>` : ''}
                            <div class="before-after-container"
                                 data-before="../${item.before}"
                                 data-after="../${item.after}"
                                 data-type="video"
                                 data-label-before="${item.labelBefore || 'Before'}"
                                 data-label-after="${item.labelAfter || 'After'}">
                            </div>
                            <div class="slider-tip">
                                <span class="tip-icon">💡</span>
                                <span class="tip-text">Hover or drag the slider to compare before and after</span>
                            </div>
                            ${item.caption ? `<div class="media-caption">${item.caption}</div>` : ''}
                        </div>`;
    },

    generateBeforeAfterImage(item) {
        return `
                        <div class="media-item before-after-wrapper">
                            ${item.label ? `<div class="media-label">${item.label}</div>` : ''}
                            <div class="before-after-container"
                                 data-before="../${item.before}"
                                 data-after="../${item.after}"
                                 data-type="image"
                                 data-label-before="${item.labelBefore || 'Before'}"
                                 data-label-after="${item.labelAfter || 'After'}">
                            </div>
                            <div class="slider-tip">
                                <span class="tip-icon">💡</span>
                                <span class="tip-text">Hover or drag the slider to compare before and after</span>
                            </div>
                            ${item.caption ? `<div class="media-caption">${item.caption}</div>` : ''}
                        </div>`;
    }
};

// Convert old format to new format
function convertToAdvancedFormat(project) {
    const converted = { ...project };

    // Convert hero media
    if (!converted.heroMedia) {
        if (project.mainVideo) {
            converted.heroMedia = {
                type: 'video',
                src: project.mainVideo,
                poster: project.videoPoster || null
            };
        } else if (project.heroImage) {
            converted.heroMedia = {
                type: 'image',
                src: project.heroImage,
                alt: project.fullTitle
            };
        }
    }

    // Convert process media
    if (!converted.processMedia && project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
        converted.processMedia = project.beforeAfterMedia.map((item, index) => {
            if (item.type === 'video') {
                return {
                    type: 'before-after-video',
                    before: item.before,
                    after: item.after,
                    label: item.label || `Comparison ${index + 1}`
                };
            } else {
                return {
                    type: 'before-after-image',
                    before: item.before,
                    after: item.after,
                    label: item.label || `Comparison ${index + 1}`
                };
            }
        });
    }

    return converted;
}

// Simple template engine (enhanced version)
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

// Find related projects
function findRelatedProjects(currentProject, allProjects) {
    const related = allProjects
        .filter(p => p.id !== currentProject.id && p.category === currentProject.category && p.visible)
        .slice(0, 2);

    if (related.length < 2) {
        const others = allProjects
            .filter(p => p.id !== currentProject.id && !related.includes(p) && p.visible)
            .slice(0, 2 - related.length);
        related.push(...others);
    }

    return related;
}

// Check if project has before-after media
function hasBeforeAfterMedia(processMedia) {
    if (!processMedia) return false;
    return processMedia.some(item =>
        item.type === 'before-after-video' ||
        item.type === 'before-after-image'
    );
}

// Generate a single project page
function generateProjectPage(project, template, allProjects) {
    // Convert to advanced format if needed
    const advancedProject = convertToAdvancedFormat(project);

    // Generate hero media content
    const heroMediaContent = MediaGenerators.generateHeroMedia(advancedProject.heroMedia);

    // Generate process media content
    let processMediaContent = '';
    if (advancedProject.processMedia && advancedProject.processMedia.length > 0) {
        processMediaContent = advancedProject.processMedia
            .map((item, index) => MediaGenerators.generateProcessMediaItem(item, index))
            .join('\n');
    }

    // Prepare data for template
    const templateData = {
        ...advancedProject,
        metaDescription: advancedProject.description.substring(0, 150) + '...',
        heroMediaContent,
        processMediaContent,
        hasProcessMedia: advancedProject.processMedia && advancedProject.processMedia.length > 0,
        processMediaCount: advancedProject.processMedia ? advancedProject.processMedia.length : 0,
        hasBeforeAfter: hasBeforeAfterMedia(advancedProject.processMedia),
        categoryDisplay: CATEGORY_DISPLAY[advancedProject.category] || advancedProject.category,
        relatedProjects: findRelatedProjects(advancedProject, allProjects)
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
    console.log('🚀 Starting advanced project page generation...\n');

    // Load data and template
    const projectsData = loadProjectsData();
    const template = loadTemplate();

    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON`);
    console.log('✓ Loaded advanced template file\n');

    // Determine which projects to generate
    let projectsToGenerate;
    if (projectIds) {
        projectsToGenerate = projectsData.projects.filter(p => projectIds.includes(p.id));
        console.log(`Generating ${projectsToGenerate.length} specific project(s): ${projectIds.join(', ')}\n`);
    } else {
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
        console.log('\n✅ Advanced project page generation complete!');
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