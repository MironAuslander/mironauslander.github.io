/**
 * Unified Project Page Generator
 * Generates project pages from projects-data.json using
 * templates/project-page-advanced.html
 *
 * Usage:
 * - Generate all projects: node scripts/generate-project-unified.js
 * - Generate specific projects: node scripts/generate-project-unified.js 1798 1238
 */

const fs = require('fs');
const path = require('path');
const {
    servedImage: preferWebP,
    getCoverPath,
    missingCoverMessage,
    hasBeforeAfter: hasBeforeAfterMedia
} = require('./lib/media-rules');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const ADVANCED_TEMPLATE = path.join(__dirname, '..', 'templates', 'project-page-advanced.html');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');
const SITE_URL = 'https://mironauslander.com';

// Category display mapping
const CATEGORY_DISPLAY = {
    'ai': 'AI',
    'vfx': 'Visual Effects',
    'motion': 'Motion Graphics',
    'editing': 'Video Editing',
    'personal': 'Personal Project'
};

// Category accent mapping for V2 hero overlay
const CATEGORY_ACCENT = {
    'ai': 'AI',
    'vfx': 'VFX BREAKDOWN',
    'motion': 'MOTION GRAPHICS',
    'editing': 'VIDEO EDITING',
    'personal': 'PERSONAL PROJECT'
};

// Escape a value for use inside an HTML attribute
function escapeAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Media type generators (from advanced generator)
const MediaGenerators = {
    generateHeroCover(project) {
        const coverPath = preferWebP(getCoverPath(project));
        if (!coverPath) return '';

        // Optional per-project crop: { desktop: "center 30%", mobile: "40% center" }
        const pos = project.coverPosition || {};
        const styles = [];
        if (pos.desktop) styles.push(`--cover-pos: ${pos.desktop}`);
        if (pos.mobile) styles.push(`--cover-pos-mobile: ${pos.mobile}`);
        const styleAttr = styles.length ? ` style="${escapeAttr(styles.join('; '))}"` : '';

        return `<img class="hero-cover" src="../${coverPath}" alt="" fetchpriority="high"${styleAttr}>`;
    },

    generateHeroMedia(heroData) {
        if (!heroData) return '';

        if (heroData.type === 'video') {
            // Video poster (served as WebP), separate from the hero cover
            const posterAttr = heroData.poster ? ` poster="../${preferWebP(heroData.poster)}"` : '';
            return `<video controls loop disablePictureInPicture controlsList="nodownload"${posterAttr}>
                <source src="../${heroData.src}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
        } else if (heroData.type === 'image') {
            // Full, uncropped image in the player slot (the cover above is cropped)
            return `<img src="../${preferWebP(heroData.src)}" alt="${escapeAttr(heroData.alt || '')}" loading="lazy">`;
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
        // Use WebP poster if available
        const posterAttr = item.poster ? `poster="../${preferWebP(item.poster)}"` : '';
        return `
                        <div class="media-item">
                            ${item.label ? `<div class="media-label">${item.label}</div>` : ''}
                            <video controls loop disablePictureInPicture controlsList="nodownload" ${posterAttr}>
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

// Generate a single project page (pass the template to avoid re-reading it per project)
function generateProjectPage(project, allProjects, template = loadTemplate(ADVANCED_TEMPLATE)) {
    // Prepare template data
    const templateData = {
        ...project,
        metaDescription: project.description ?
            project.description.substring(0, 150) + '...' :
            `${project.fullTitle} - ${CATEGORY_DISPLAY[project.category] || project.category} project by Miron Auslander`,
        hasBeforeAfter: hasBeforeAfterMedia(project),
        // Handle both single category (string) and multiple categories (array)
        categoryDisplay: Array.isArray(project.category)
            ? project.category.map(cat => CATEGORY_DISPLAY[cat] || cat).join(' & ')
            : (CATEGORY_DISPLAY[project.category] || project.category),
        relatedProjects: findRelatedProjects(project, allProjects),

        // Conditional field helpers for hiding empty sections
        hasDescription: project.description && project.description.trim() !== '',
        hasRole: Array.isArray(project.role) && project.role.length > 0,
        hasTools: Array.isArray(project.tools) && project.tools.length > 0
    };

    // Media data
    templateData.heroMediaContent = MediaGenerators.generateHeroMedia(project.heroMedia);
    templateData.hasProcessMedia = project.processMedia && project.processMedia.length > 0;
    templateData.processMediaCount = project.processMedia ? project.processMedia.length : 0;

    if (project.processMedia && project.processMedia.length > 0) {
        templateData.processMediaContent = project.processMedia
            .map((item, index) => MediaGenerators.generateProcessMediaItem(item, index))
            .join('\n');
    }

    // V2 Hero data
    const categories = Array.isArray(project.category)
        ? project.category
        : [project.category];
    const primaryCategory = categories[0];

    templateData.heroCoverContent = MediaGenerators.generateHeroCover(project);
    templateData.heroTitleUpper = project.displayTitle.toUpperCase();
    templateData.heroAccent = CATEGORY_ACCENT[primaryCategory] || primaryCategory.toUpperCase();
    templateData.hasHeroMedia = !!(project.heroMedia && project.heroMedia.src);

    // Cover preload + social share (og:image uses the JPG twin for crawler compatibility)
    const coverPath = getCoverPath(project);
    templateData.hasCover = !!coverPath;
    templateData.coverWebP = preferWebP(coverPath);
    templateData.coverOgUrl = coverPath ? `${SITE_URL}/${coverPath}` : '';
    templateData.pageUrl = `${SITE_URL}/projects/Project-${project.id}.html`;
    templateData.ogTitle = escapeAttr(`${project.fullTitle} - Miron Auslander Portfolio`);
    templateData.ogDescription = escapeAttr(templateData.metaDescription);

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

    const template = loadTemplate(ADVANCED_TEMPLATE);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Generate each project
    projectsToGenerate.forEach(project => {
        try {
            console.log(`📝 Generating Project-${project.id}.html (${project.displayTitle})`);

            const html = generateProjectPage(project, projectsData.projects, template);

            if (saveProjectFile(project.id, html)) {
                console.log(`   ✓ Successfully generated Project-${project.id}.html`);
                if (!project.cover) {
                    console.log(`   ⚠️  ${missingCoverMessage(project)}`);
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

module.exports = {
    ADVANCED_TEMPLATE,
    loadTemplate,
    generateProjectPage,
    saveProjectFile
};

// Process command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    main(args.length > 0 ? args : null);
}