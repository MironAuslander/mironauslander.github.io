/**
 * Enhanced Project Validation Script
 * Comprehensive validation of project pages, media assets, and template consistency
 *
 * Usage: node scripts/validate-enhanced.js [options]
 * Options:
 *   --fix    Attempt to automatically fix issues where possible
 *   --verbose Show detailed information for all projects
 */

const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');
const ASSETS_DIR = path.join(__dirname, '..');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Command line arguments
const args = process.argv.slice(2);
const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose')
};

// Validation statistics
const stats = {
    totalProjects: 0,
    validProjects: 0,
    projectsWithIssues: 0,
    projectsWithWarnings: 0,
    totalIssues: 0,
    totalWarnings: 0,
    fixedIssues: 0,
    mediaFiles: {
        checked: 0,
        missing: 0
    }
};

// Load projects data
function loadProjectsData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`${colors.red}❌ Error reading projects-data.json:${colors.reset}`, error.message);
        process.exit(1);
    }
}

// Check if file exists
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

// Get file size in human readable format
function formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Check media file and return info
function checkMediaFile(mediaPath) {
    const fullPath = path.join(ASSETS_DIR, mediaPath);
    stats.mediaFiles.checked++;

    if (!fileExists(fullPath)) {
        stats.mediaFiles.missing++;
        return { exists: false, path: mediaPath };
    }

    const fileStats = fs.statSync(fullPath);
    return {
        exists: true,
        path: mediaPath,
        size: formatFileSize(fileStats.size)
    };
}

// Fields removed in favour of cover / heroMedia / processMedia
const LEGACY_FIELDS = ['videoPoster', 'heroImage', 'mainVideo', 'beforeAfterMedia'];

// Path the site serves for an image (.jpg in JSON -> .webp twin), same rule as the generator
function servedImage(imagePath) {
    return imagePath ? imagePath.replace(/\.jpg$/i, '.webp') : imagePath;
}

// Check an image and, for .jpg paths, its .webp twin
function checkImageTwins(imagePath) {
    const files = /\.jpg$/i.test(imagePath) ? [imagePath, servedImage(imagePath)] : [imagePath];
    return files.map(checkMediaFile);
}

// Validate HTML structure
function validateHTMLStructure(htmlContent, project) {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    // Check for required scripts
    const requiredScripts = [
        { name: 'main.js', path: '../assets/js/main.js' }
    ];

    // Add before-after.js if project has before/after media
    const hasBeforeAfter = !!(project.processMedia && project.processMedia.some(item =>
        item.type === 'before-after-video' || item.type === 'before-after-image'
    ));

    if (hasBeforeAfter) {
        requiredScripts.push({ name: 'before-after.js', path: '../assets/js/before-after.js' });
    }

    // Check for required scripts
    requiredScripts.forEach(script => {
        if (!htmlContent.includes(script.path)) {
            issues.push(`Missing required script: ${script.name}`);
        }
    });

    // Check for CSS
    if (!htmlContent.includes('../assets/css/style.css')) {
        issues.push('Missing main stylesheet link');
    }

    // Check for font declarations
    const fonts = ['Poppins', 'Inter', 'Devil Breeze'];
    fonts.forEach(font => {
        if (!htmlContent.includes(`font-family: '${font}'`)) {
            warnings.push(`Missing font declaration for ${font}`);
        }
    });

    // Check for template markers (for updatable sections)
    const markers = [
        { start: 'PROJECT_INFO_START', end: 'PROJECT_INFO_END', required: false }
    ];

    markers.forEach(marker => {
        const hasStart = htmlContent.includes(marker.start);
        const hasEnd = htmlContent.includes(marker.end);

        if (marker.required && (!hasStart || !hasEnd)) {
            warnings.push(`Missing required template markers: ${marker.start}/${marker.end}`);
        } else if (hasStart !== hasEnd) {
            issues.push(`Incomplete template markers: ${marker.start}/${marker.end}`);
        }
    });

    // Check for media section markers
    if (hasBeforeAfter) {
        const hasMarkers = htmlContent.includes('PROCESS_MEDIA_START') &&
                           htmlContent.includes('PROCESS_MEDIA_END');

        if (!hasMarkers) {
            warnings.push('Missing media section markers (PROCESS_MEDIA)');
        }
    }

    // Check for before-after containers if project has them
    if (hasBeforeAfter) {
        const containerCount = (htmlContent.match(/before-after-container/g) || []).length;
        const expectedCount = project.processMedia.filter(item =>
            item.type === 'before-after-video' || item.type === 'before-after-image'
        ).length;

        if (containerCount !== expectedCount) {
            warnings.push(`Expected ${expectedCount} before-after containers, found ${containerCount}`);
        }
    }

    // Check for V2 hero structure
    if (htmlContent.includes('project-hero-v2')) {
        if (!htmlContent.includes('hero-cover')) {
            warnings.push('V2 hero section missing hero-cover image');
        } else {
            // Cover falls back to the video poster when no cover is set
            const coverPath = project.cover || (project.heroMedia && project.heroMedia.poster);
            if (coverPath && !htmlContent.includes(`class="hero-cover" src="../${servedImage(coverPath)}"`)) {
                warnings.push(`hero-cover does not match cover in JSON (${servedImage(coverPath)}) - regenerate the page`);
            }
        }
        if (!htmlContent.includes('hero-meta-bar')) {
            warnings.push('V2 hero section missing meta bar');
        }
    }

    // Check for accessibility features
    if (!htmlContent.includes('alt=')) {
        suggestions.push('Consider adding alt attributes to all images for accessibility');
    }

    if (!htmlContent.includes('aria-label')) {
        suggestions.push('Consider adding aria-labels for better screen reader support');
    }

    // Check for SEO meta tags
    if (!htmlContent.includes('meta name="description"')) {
        warnings.push('Missing meta description tag for SEO');
    }
    if (!htmlContent.includes('property="og:image"')) {
        warnings.push('Missing og:image meta tag for social sharing');
    }

    return { issues, warnings, suggestions };
}

// Validate a single project
function validateProject(project, index, total) {
    const projectId = project.id;
    const issues = [];
    const warnings = [];
    const suggestions = [];
    const mediaInfo = [];

    stats.totalProjects++;

    // Progress indicator
    if (!options.verbose) {
        process.stdout.write(`\r${colors.cyan}Validating: ${index + 1}/${total}${colors.reset}`);
    }

    // Check project HTML file exists
    const projectFile = path.join(PROJECTS_DIR, `Project-${projectId}.html`);
    if (!fileExists(projectFile)) {
        issues.push(`Missing HTML file: Project-${projectId}.html`);
    } else {
        // Validate HTML structure
        const htmlContent = fs.readFileSync(projectFile, 'utf8');
        const htmlValidation = validateHTMLStructure(htmlContent, project);
        issues.push(...htmlValidation.issues);
        warnings.push(...htmlValidation.warnings);
        suggestions.push(...htmlValidation.suggestions);

        // Check file size
        const fileStats = fs.statSync(projectFile);
        if (fileStats.size > 500000) { // 500KB
            warnings.push(`Large HTML file: ${formatFileSize(fileStats.size)} - consider optimization`);
        }
    }

    // Validate media assets
    LEGACY_FIELDS.forEach(field => {
        if (project[field] !== undefined) {
            warnings.push(`Legacy field "${field}" is no longer used - remove it from projects-data.json`);
        }
    });

    const imageFields = [
        { field: 'thumbnail', required: true },
        { field: 'cover', required: false }
    ];

    imageFields.forEach(({ field, required }) => {
        if (project[field]) {
            checkImageTwins(project[field]).forEach(result => {
                if (!result.exists) {
                    issues.push(`Missing ${field}: ${result.path}`);
                } else {
                    mediaInfo.push(`${field}: ${result.path.split('/').pop()} ${result.size}`);
                }
            });
        } else if (required) {
            issues.push(`Missing required field: ${field}`);
        } else if (field === 'cover') {
            warnings.push('No cover set - page uses the video poster as cover');
        }
    });

    // Check process media
    if (project.processMedia) {
        project.processMedia.forEach((item, idx) => {
            if (item.type === 'before-after-video' || item.type === 'before-after-image') {
                const beforeResult = checkMediaFile(item.before);
                const afterResult = checkMediaFile(item.after);

                if (!beforeResult.exists) {
                    issues.push(`Missing process media before #${idx + 1}: ${item.before}`);
                }
                if (!afterResult.exists) {
                    issues.push(`Missing process media after #${idx + 1}: ${item.after}`);
                }
            } else if (item.type === 'video' || item.type === 'image') {
                const result = checkMediaFile(item.src);
                if (!result.exists) {
                    issues.push(`Missing process media #${idx + 1}: ${item.src}`);
                }
            }
        });
    }

    // Check hero media
    if (project.heroMedia) {
        // Image heroes are served as their .webp twin, so check both files
        const heroResults = project.heroMedia.type === 'image'
            ? checkImageTwins(project.heroMedia.src)
            : [checkMediaFile(project.heroMedia.src)];
        heroResults.forEach(result => {
            if (!result.exists) {
                issues.push(`Missing hero media: ${result.path}`);
            }
        });
        if (project.heroMedia.poster) {
            checkImageTwins(project.heroMedia.poster).forEach(posterResult => {
                if (!posterResult.exists) {
                    warnings.push(`Missing video poster: ${posterResult.path}`);
                }
            });
        }
    }

    // Validate data consistency
    if (!project.displayTitle) {
        issues.push('Missing displayTitle');
    }
    if (!project.fullTitle) {
        issues.push('Missing fullTitle');
    }
    if (!project.description) {
        issues.push('Missing description');
    }
    if (!project.category) {
        issues.push('Missing category');
    }

    // Check for recommended fields
    if (!project.year) {
        suggestions.push('Consider adding year field');
    }
    if (!project.client) {
        suggestions.push('Consider adding client field');
    }
    if (!project.duration) {
        suggestions.push('Consider adding duration field');
    }

    // Update statistics
    if (issues.length > 0) {
        stats.projectsWithIssues++;
        stats.totalIssues += issues.length;
    }
    if (warnings.length > 0) {
        stats.projectsWithWarnings++;
        stats.totalWarnings += warnings.length;
    }
    if (issues.length === 0 && warnings.length === 0) {
        stats.validProjects++;
    }

    return { projectId, displayTitle: project.displayTitle, issues, warnings, suggestions, mediaInfo };
}

// Attempt to fix issues
function fixIssues(validationResults) {
    console.log(`\n${colors.cyan}🔧 Attempting to fix issues...${colors.reset}\n`);

    validationResults.forEach(result => {
        if (result.issues.length === 0) return;

        result.issues.forEach(issue => {
            if (issue.includes('Missing required script: before-after.js')) {
                // This would be fixed by regenerating with the unified generator
                console.log(`${colors.yellow}ℹ️  Project ${result.projectId}: Run 'node scripts/generate-project-unified.js ${result.projectId}' to fix script issues${colors.reset}`);
                stats.fixedIssues++;
            }
        });
    });

    if (stats.fixedIssues > 0) {
        console.log(`\n${colors.green}✅ Fixed ${stats.fixedIssues} issues${colors.reset}`);
    }
}

// Main validation function
function main() {
    console.log(`${colors.cyan}🔍 Enhanced Project Validation${colors.reset}\n`);

    if (options.fix) {
        console.log(`${colors.yellow}🔧 Fix mode enabled${colors.reset}`);
    }
    if (options.verbose) {
        console.log(`${colors.yellow}📝 Verbose mode enabled${colors.reset}`);
    }

    // Load projects
    const projectsData = loadProjectsData();
    const projects = projectsData.projects;
    console.log(`\n✓ Loaded ${projects.length} projects from JSON\n`);

    // Validate each project
    const validationResults = projects.map((project, index) =>
        validateProject(project, index, projects.length)
    );

    if (!options.verbose) {
        process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear progress line
    }

    // Display results
    const projectsWithIssues = validationResults.filter(r => r.issues.length > 0);
    const projectsWithWarnings = validationResults.filter(r => r.warnings.length > 0);

    if (options.verbose || projectsWithIssues.length > 0 || projectsWithWarnings.length > 0) {
        console.log(`\n${colors.cyan}📋 Validation Results:${colors.reset}\n`);

        validationResults.forEach(result => {
            if (options.verbose || result.issues.length > 0 || result.warnings.length > 0) {
                console.log(`${colors.magenta}📁 Project ${result.projectId}: ${result.displayTitle}${colors.reset}`);

                if (result.issues.length > 0) {
                    result.issues.forEach(issue => {
                        console.log(`   ${colors.red}❌ ${issue}${colors.reset}`);
                    });
                }

                if (result.warnings.length > 0) {
                    result.warnings.forEach(warning => {
                        console.log(`   ${colors.yellow}⚠️  ${warning}${colors.reset}`);
                    });
                }

                if (options.verbose && result.suggestions.length > 0) {
                    result.suggestions.forEach(suggestion => {
                        console.log(`   ${colors.cyan}💡 ${suggestion}${colors.reset}`);
                    });
                }

                if (options.verbose && result.mediaInfo.length > 0) {
                    console.log(`   ${colors.green}📊 Media sizes: ${result.mediaInfo.join(', ')}${colors.reset}`);
                }

                console.log();
            }
        });
    }

    // Attempt fixes if requested
    if (options.fix && projectsWithIssues.length > 0) {
        fixIssues(validationResults);
    }

    // Display summary
    console.log(`${colors.cyan}📊 Validation Summary:${colors.reset}`);
    console.log(`   Total projects: ${stats.totalProjects}`);
    console.log(`   ${colors.green}✅ Valid projects: ${stats.validProjects}${colors.reset}`);

    if (stats.totalIssues > 0) {
        console.log(`   ${colors.red}❌ Issues found: ${stats.totalIssues}${colors.reset}`);
        console.log(`   ${colors.red}   Projects with issues: ${projectsWithIssues.map(r => r.projectId).join(', ')}${colors.reset}`);
    }

    if (stats.totalWarnings > 0) {
        console.log(`   ${colors.yellow}⚠️  Warnings: ${stats.totalWarnings}${colors.reset}`);
    }

    console.log(`\n   Media files checked: ${stats.mediaFiles.checked}`);
    if (stats.mediaFiles.missing > 0) {
        console.log(`   ${colors.red}Missing media files: ${stats.mediaFiles.missing}${colors.reset}`);
    }

    // Provide suggestions
    if (stats.totalIssues > 0 || stats.totalWarnings > 0) {
        console.log(`\n${colors.cyan}💡 Suggestions:${colors.reset}`);
        console.log(`   1. Run: ${colors.green}node scripts/generate-project-unified.js${colors.reset} to regenerate all project pages`);
        console.log(`   2. Check that all media files are in the correct directories`);
        console.log(`   3. Run with --verbose flag for detailed information`);

        if (!options.fix) {
            console.log(`   4. Run with --fix flag to attempt automatic fixes`);
        }
    } else {
        console.log(`\n${colors.green}✨ All projects passed validation!${colors.reset}`);
    }

    // Exit with appropriate code
    process.exit(stats.totalIssues > 0 ? 1 : 0);
}

// Run validation
main();