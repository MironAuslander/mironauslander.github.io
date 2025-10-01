/**
 * Unified Project Page Generator
 * Intelligently generates project pages using the appropriate template
 * based on media complexity and project requirements
 *
 * Usage:
 * - Generate all projects: node scripts/generate-project-unified.js
 * - Generate specific projects: node scripts/generate-project-unified.js 1798 1238
 */

const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const BASIC_TEMPLATE = path.join(__dirname, '..', 'templates', 'project-page.html');
const ADVANCED_TEMPLATE = path.join(__dirname, '..', 'templates', 'project-page-advanced.html');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Category display mapping
const CATEGORY_DISPLAY = {
    'vfx': 'Visual Effects',
    'motion': 'Motion Graphics',
    'editing': 'Video Editing',
    'personal': 'Personal Project'
};

// Media type generators (from advanced generator)
const MediaGenerators = {
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

// Template engine
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
                Object.keys(item).forEach(key => {
                    const regex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g');
                    itemContent = itemContent.replace(regex, item[key] || '');
                });
            } else {
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

// Convert old format to advanced format if needed
function convertToAdvancedFormat(project) {
    const converted = { ...project };

    // Convert hero media if not already in advanced format
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

    // Convert process media if not already in advanced format
    if (!converted.processMedia && project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
        converted.processMedia = project.beforeAfterMedia.map((item, index) => {
            if (item.type === 'video') {
                return {
                    type: 'before-after-video',
                    before: item.before,
                    after: item.after,
                    label: item.label || `Comparison ${index + 1}`,
                    labelBefore: item.labelBefore || 'Before',
                    labelAfter: item.labelAfter || 'After'
                };
            } else {
                return {
                    type: 'before-after-image',
                    before: item.before,
                    after: item.after,
                    label: item.label || `Comparison ${index + 1}`,
                    labelBefore: item.labelBefore || 'Before',
                    labelAfter: item.labelAfter || 'After'
                };
            }
        });
    }

    return converted;
}

// Determine if project needs advanced template
function needsAdvancedTemplate(project) {
    // Use advanced template if:
    // 1. Project has processMedia field (new format)
    // 2. Project has complex media configurations
    return !!(project.processMedia || project.heroMedia);
}

// Check if project has before-after media
function hasBeforeAfterMedia(project) {
    // Check old format
    if (project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
        return true;
    }

    // Check new format
    if (project.processMedia) {
        return project.processMedia.some(item =>
            item.type === 'before-after-video' ||
            item.type === 'before-after-image'
        );
    }

    return false;
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
function loadTemplate(templatePath) {
    try {
        return fs.readFileSync(templatePath, 'utf8');
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

// Generate a single project page
function generateProjectPage(project, allProjects) {
    const useAdvanced = needsAdvancedTemplate(project);
    const templatePath = useAdvanced ? ADVANCED_TEMPLATE : BASIC_TEMPLATE;
    const template = loadTemplate(templatePath);

    // Convert to advanced format if using advanced template
    const processedProject = useAdvanced ? convertToAdvancedFormat(project) : project;

    // Prepare template data
    const templateData = {
        ...processedProject,
        metaDescription: processedProject.description.substring(0, 150) + '...',
        hasVideo: !!processedProject.mainVideo,
        hasBeforeAfter: hasBeforeAfterMedia(processedProject),
        categoryDisplay: CATEGORY_DISPLAY[processedProject.category] || processedProject.category,
        relatedProjects: findRelatedProjects(processedProject, allProjects)
    };

    // Add advanced template-specific data
    if (useAdvanced) {
        templateData.heroMediaContent = MediaGenerators.generateHeroMedia(processedProject.heroMedia);
        templateData.hasProcessMedia = processedProject.processMedia && processedProject.processMedia.length > 0;
        templateData.processMediaCount = processedProject.processMedia ? processedProject.processMedia.length : 0;

        if (processedProject.processMedia && processedProject.processMedia.length > 0) {
            templateData.processMediaContent = processedProject.processMedia
                .map((item, index) => MediaGenerators.generateProcessMediaItem(item, index))
                .join('\n');
        }
    }

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
    console.log('🚀 Starting unified project page generation...\n');

    // Load data
    const projectsData = loadProjectsData();
    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON\n`);

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
    let errorCount = 0;
    const errors = [];

    // Generate each project
    projectsToGenerate.forEach(project => {
        try {
            const useAdvanced = needsAdvancedTemplate(project);
            const templateType = useAdvanced ? 'advanced' : 'basic';

            console.log(`📝 Generating Project-${project.id}.html (${project.displayTitle}) [${templateType} template]`);

            const html = generateProjectPage(project, projectsData.projects);

            if (saveProjectFile(project.id, html)) {
                console.log(`   ✓ Successfully generated Project-${project.id}.html`);

                // Show warnings if applicable
                if (hasBeforeAfterMedia(project) && !useAdvanced) {
                    console.log(`   ⚠️  Project has before/after media - consider using advanced template`);
                }

                successCount++;
            } else {
                errorCount++;
                errors.push(project.id);
            }
        } catch (error) {
            console.error(`   ❌ Error generating Project-${project.id}.html:`, error.message);
            errorCount++;
            errors.push(project.id);
        }
    });

    // Summary
    console.log('\n=====================================');
    console.log('📊 Generation Summary:');
    console.log(`   ✅ Success: ${successCount} projects`);
    if (errorCount > 0) {
        console.log(`   ❌ Failed: ${errorCount} projects`);
        console.log(`   Failed IDs: ${errors.join(', ')}`);
    }
    console.log('=====================================\n');

    if (errorCount === 0) {
        console.log('✨ All project pages generated successfully!\n');
        console.log('💡 Next steps:');
        console.log('   1. Run validation: node scripts/validate-projects.js');
        console.log('   2. Test locally: python -m http.server 8000');
        console.log('   3. Commit changes: git add . && git commit -m "Update project pages"');
    } else {
        console.error('\n⚠️  Some projects failed to generate. Check the errors above.');
        process.exit(1);
    }
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
    main(args);
} else {
    main();
}