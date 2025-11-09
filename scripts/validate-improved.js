/**
 * Improved Project Validation Script
 * Provides actionable, grouped feedback with copy-paste fix commands
 *
 * Usage: node scripts/validate-improved.js [options]
 * Options:
 *   --fix      Attempt automatic fixes where possible
 *   --verbose  Show all details including passed checks
 *   --quiet    Only show summary, no individual project details
 */

const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = 'projects-data.json';
const PROJECTS_DIR = 'projects';
const ASSETS_DIR = '.';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m'
};

// Parse arguments
const args = process.argv.slice(2);
const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose'),
    quiet: args.includes('--quiet')
};

// Issue categories for grouping
const issueCategories = {
    MISSING_FILES: [],
    MISSING_MEDIA: [],
    MISSING_DATA: [],
    HTML_STRUCTURE: [],
    PERFORMANCE: [],
    SEO: [],
    ACCESSIBILITY: []
};

// Statistics
const stats = {
    totalProjects: 0,
    perfectProjects: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    mediaFilesChecked: 0,
    mediaFilesMissing: 0,
    fixesApplied: 0
};

// Load project data
let projectsData;
try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    projectsData = JSON.parse(rawData);
} catch (error) {
    console.error(`${colors.red}❌ Error reading ${DATA_FILE}:${colors.reset}`, error.message);
    process.exit(1);
}

// Helper functions
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function addIssue(category, severity, projectId, message, fix = null) {
    const issue = {
        severity,
        projectId,
        message,
        fix
    };

    if (!issueCategories[category]) {
        issueCategories[category] = [];
    }
    issueCategories[category].push(issue);

    // Update stats
    if (severity === 'error') stats.errors++;
    else if (severity === 'warning') stats.warnings++;
    else if (severity === 'info') stats.info++;
}

// Validation functions
function validateProjectData(project) {
    const projectId = project.id;

    // Check required fields
    const requiredFields = ['id', 'displayTitle', 'fullTitle', 'thumbnail'];
    requiredFields.forEach(field => {
        if (!project[field]) {
            addIssue('MISSING_DATA', 'error', projectId,
                `Missing required field: ${field}`,
                `Add "${field}" to project ${projectId} in projects-data.json`
            );
        }
    });

    // Check description (warning if missing)
    if (!project.description || project.description.trim() === '') {
        addIssue('MISSING_DATA', 'warning', projectId,
            'Missing description',
            `Add a description for better SEO and user experience`
        );
    }

    // Check categories
    if (!project.category || project.category.length === 0) {
        addIssue('MISSING_DATA', 'warning', projectId,
            'No categories assigned',
            `Add categories like ["vfx", "motion"] to improve filtering`
        );
    }
}

function validateMediaFiles(project) {
    const projectId = project.id;
    stats.mediaFilesChecked++;

    // Check thumbnail (required)
    if (project.thumbnail) {
        const thumbPath = path.join(ASSETS_DIR, project.thumbnail);
        if (!fileExists(thumbPath)) {
            stats.mediaFilesMissing++;
            addIssue('MISSING_MEDIA', 'error', projectId,
                `Missing thumbnail: ${project.thumbnail}`,
                `Add thumbnail image to: ${project.thumbnail}`
            );
        } else {
            // Check thumbnail size
            const stats = fs.statSync(thumbPath);
            if (stats.size > 200 * 1024) { // 200KB
                addIssue('PERFORMANCE', 'warning', projectId,
                    `Large thumbnail (${formatFileSize(stats.size)}): ${project.thumbnail}`,
                    `Optimize thumbnail to under 200KB for faster grid loading`
                );
            }
        }
    }

    // Check hero media
    if (project.heroMedia) {
        const heroPath = path.join(ASSETS_DIR, project.heroMedia.src);
        if (!fileExists(heroPath)) {
            stats.mediaFilesMissing++;
            addIssue('MISSING_MEDIA', 'error', projectId,
                `Missing hero ${project.heroMedia.type}: ${project.heroMedia.src}`,
                `Add file to: ${project.heroMedia.src}`
            );
        }

        // Check poster for videos
        if (project.heroMedia.type === 'video' && project.heroMedia.poster) {
            const posterPath = path.join(ASSETS_DIR, project.heroMedia.poster);
            if (!fileExists(posterPath)) {
                addIssue('MISSING_MEDIA', 'warning', projectId,
                    `Missing video poster: ${project.heroMedia.poster}`,
                    `Add poster image for faster initial load`
                );
            }
        }
    }

    // Check process media
    if (project.processMedia && project.processMedia.length > 0) {
        project.processMedia.forEach((item, index) => {
            if (item.type === 'before-after-video' || item.type === 'before-after-image') {
                // Check before media
                const beforePath = path.join(ASSETS_DIR, item.before);
                if (!fileExists(beforePath)) {
                    stats.mediaFilesMissing++;
                    addIssue('MISSING_MEDIA', 'error', projectId,
                        `Missing before ${item.type === 'before-after-video' ? 'video' : 'image'} #${index + 1}: ${item.before}`,
                        `Add file to: ${item.before}`
                    );
                }

                // Check after media
                const afterPath = path.join(ASSETS_DIR, item.after);
                if (!fileExists(afterPath)) {
                    stats.mediaFilesMissing++;
                    addIssue('MISSING_MEDIA', 'error', projectId,
                        `Missing after ${item.type === 'before-after-video' ? 'video' : 'image'} #${index + 1}: ${item.after}`,
                        `Add file to: ${item.after}`
                    );
                }
            } else if (item.src) {
                // Regular media
                const mediaPath = path.join(ASSETS_DIR, item.src);
                if (!fileExists(mediaPath)) {
                    stats.mediaFilesMissing++;
                    addIssue('MISSING_MEDIA', 'error', projectId,
                        `Missing ${item.type} #${index + 1}: ${item.src}`,
                        `Add file to: ${item.src}`
                    );
                }
            }
        });
    }
}

function validateHTML(project) {
    const projectId = project.id;
    const htmlFile = path.join(PROJECTS_DIR, `Project-${projectId}.html`);

    if (!fileExists(htmlFile)) {
        addIssue('MISSING_FILES', 'error', projectId,
            `Missing HTML file: Project-${projectId}.html`,
            `Run: node scripts/generate-single-project.js ${projectId}`
        );
        return;
    }

    const htmlContent = fs.readFileSync(htmlFile, 'utf8');

    // Check for external CSS (not embedded styles)
    if (!htmlContent.includes('../assets/css/style.css')) {
        addIssue('HTML_STRUCTURE', 'error', projectId,
            'Missing external stylesheet link',
            `Regenerate with: node scripts/generate-single-project.js ${projectId}`
        );
    }

    // Check for main.js (no longer in template, but checking for completeness)
    // Removed as main.js is loaded in the body

    // Check for before-after.js if needed
    const hasBeforeAfter = project.processMedia && project.processMedia.some(item =>
        item.type === 'before-after-video' || item.type === 'before-after-image'
    );

    if (hasBeforeAfter && !htmlContent.includes('before-after.js')) {
        addIssue('HTML_STRUCTURE', 'warning', projectId,
            'Missing before-after.js script for interactive comparisons',
            `Regenerate with: node scripts/generate-single-project.js ${projectId}`
        );
    }

    // Check file size
    const fileStats = fs.statSync(htmlFile);
    if (fileStats.size > 100 * 1024) { // 100KB
        addIssue('PERFORMANCE', 'info', projectId,
            `Large HTML file: ${formatFileSize(fileStats.size)}`,
            `Consider optimizing content or splitting into sections`
        );
    }

    // SEO checks
    if (!htmlContent.includes('meta name="description"')) {
        addIssue('SEO', 'warning', projectId,
            'Missing meta description',
            `Add description to project data and regenerate`
        );
    }

    // Accessibility checks
    const imgCount = (htmlContent.match(/<img/g) || []).length;
    const altCount = (htmlContent.match(/alt="/g) || []).length;
    if (imgCount > altCount) {
        addIssue('ACCESSIBILITY', 'warning', projectId,
            `${imgCount - altCount} images missing alt attributes`,
            `Add alt text to all images for accessibility`
        );
    }
}

// Main validation
console.log(`${colors.cyan}🔍 Improved Project Validation${colors.reset}\n`);

// Validate each project
projectsData.projects.forEach((project, index) => {
    stats.totalProjects++;

    if (!options.quiet) {
        process.stdout.write(`\r${colors.gray}Checking ${index + 1}/${projectsData.projects.length}...${colors.reset}`);
    }

    validateProjectData(project);
    validateMediaFiles(project);
    validateHTML(project);
});

// Clear the progress line
if (!options.quiet) {
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
}

// Calculate perfect projects
projectsData.projects.forEach(project => {
    const hasIssues = Object.values(issueCategories).some(category =>
        category.some(issue => issue.projectId === project.id && issue.severity === 'error')
    );
    if (!hasIssues) {
        stats.perfectProjects++;
    }
});

// Display results
if (!options.quiet) {
    console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    // Group issues by category
    const categoryOrder = [
        { key: 'MISSING_FILES', label: '📁 Missing Files', color: colors.brightRed },
        { key: 'MISSING_MEDIA', label: '🖼️  Missing Media', color: colors.red },
        { key: 'MISSING_DATA', label: '📝 Missing Data', color: colors.yellow },
        { key: 'HTML_STRUCTURE', label: '🏗️  HTML Structure', color: colors.cyan },
        { key: 'PERFORMANCE', label: '⚡ Performance', color: colors.blue },
        { key: 'SEO', label: '🔍 SEO', color: colors.magenta },
        { key: 'ACCESSIBILITY', label: '♿ Accessibility', color: colors.green }
    ];

    let hasAnyIssues = false;

    categoryOrder.forEach(({ key, label, color }) => {
        const issues = issueCategories[key];
        if (issues.length > 0) {
            hasAnyIssues = true;
            console.log(`${color}${label}${colors.reset}`);
            console.log(colors.gray + '─'.repeat(50) + colors.reset);

            // Group by project
            const byProject = {};
            issues.forEach(issue => {
                if (!byProject[issue.projectId]) {
                    byProject[issue.projectId] = [];
                }
                byProject[issue.projectId].push(issue);
            });

            Object.entries(byProject).forEach(([projectId, projectIssues]) => {
                const project = projectsData.projects.find(p => p.id === projectId);
                console.log(`\n  ${colors.cyan}Project ${projectId}${colors.reset} - ${project.displayTitle}`);

                projectIssues.forEach(issue => {
                    const icon = issue.severity === 'error' ? '❌' :
                                issue.severity === 'warning' ? '⚠️ ' :
                                '💡';

                    const severityColor = issue.severity === 'error' ? colors.red :
                                         issue.severity === 'warning' ? colors.yellow :
                                         colors.gray;

                    console.log(`    ${icon} ${severityColor}${issue.message}${colors.reset}`);
                    if (issue.fix && options.verbose) {
                        console.log(`       ${colors.green}→ Fix: ${issue.fix}${colors.reset}`);
                    }
                });
            });

            console.log('');
        }
    });

    if (!hasAnyIssues) {
        console.log(`${colors.green}✨ All projects are perfectly configured!${colors.reset}\n`);
    }
}

// Summary
console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.cyan}📊 Validation Summary${colors.reset}\n`);

console.log(`  Projects checked: ${stats.totalProjects}`);
console.log(`  ${colors.green}✅ Perfect projects: ${stats.perfectProjects}/${stats.totalProjects}${colors.reset}`);

if (stats.errors > 0) {
    console.log(`  ${colors.red}❌ Errors: ${stats.errors}${colors.reset}`);
}
if (stats.warnings > 0) {
    console.log(`  ${colors.yellow}⚠️  Warnings: ${stats.warnings}${colors.reset}`);
}
if (stats.info > 0) {
    console.log(`  ${colors.blue}💡 Info: ${stats.info}${colors.reset}`);
}

console.log(`\n  Media files checked: ${stats.mediaFilesChecked}`);
if (stats.mediaFilesMissing > 0) {
    console.log(`  ${colors.red}Missing media files: ${stats.mediaFilesMissing}${colors.reset}`);
}

// Actionable fixes
if (stats.errors > 0 || stats.warnings > 0) {
    console.log(`\n${colors.cyan}🔧 Quick Fixes${colors.reset}`);
    console.log(colors.gray + '─'.repeat(50) + colors.reset);

    // Count projects needing regeneration
    const projectsNeedingRegen = new Set();
    issueCategories.MISSING_FILES.forEach(issue => {
        if (issue.severity === 'error') {
            projectsNeedingRegen.add(issue.projectId);
        }
    });
    issueCategories.HTML_STRUCTURE.forEach(issue => {
        projectsNeedingRegen.add(issue.projectId);
    });

    if (projectsNeedingRegen.size > 0) {
        console.log(`\n  ${colors.yellow}1. Regenerate affected project pages:${colors.reset}`);
        if (projectsNeedingRegen.size === 1) {
            const projectId = Array.from(projectsNeedingRegen)[0];
            console.log(`     ${colors.green}node scripts/generate-single-project.js ${projectId}${colors.reset}`);
        } else if (projectsNeedingRegen.size < 5) {
            projectsNeedingRegen.forEach(projectId => {
                console.log(`     ${colors.green}node scripts/generate-single-project.js ${projectId}${colors.reset}`);
            });
        } else {
            console.log(`     ${colors.green}node scripts/generate-project-unified.js${colors.reset}`);
            console.log(`     (Regenerates all ${projectsNeedingRegen.size} projects)`);
        }
    }

    if (stats.mediaFilesMissing > 0) {
        console.log(`\n  ${colors.yellow}2. Add missing media files:${colors.reset}`);
        console.log(`     Check the detailed report above for file paths`);
        console.log(`     Media should be in: assets/images/projects/[ID]/ or assets/videos/[ID]/`);
    }

    const missingDescriptions = issueCategories.MISSING_DATA.filter(i =>
        i.message.includes('description')
    ).length;

    if (missingDescriptions > 0) {
        console.log(`\n  ${colors.yellow}3. Add descriptions to ${missingDescriptions} projects:${colors.reset}`);
        console.log(`     Edit projects-data.json to add descriptions`);
        console.log(`     Then regenerate with: ${colors.green}node scripts/quick-update.js${colors.reset}`);
    }

    if (!options.verbose) {
        console.log(`\n  ${colors.gray}Run with --verbose flag for detailed fix commands${colors.reset}`);
    }
}

console.log(`\n${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Exit with error code if there are errors
process.exit(stats.errors > 0 ? 1 : 0);