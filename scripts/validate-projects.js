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
    cyan: '\x1b[36m'
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

// Fields removed in favour of cover / heroMedia / processMedia
const LEGACY_FIELDS = ['videoPoster', 'heroImage', 'mainVideo', 'beforeAfterMedia'];

// Check if file exists
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

// Images stored as .jpg are served as their .webp twin, so both must exist
function missingImageFiles(imagePath) {
    const files = /.jpg$/i.test(imagePath)
        ? [imagePath, imagePath.replace(/.jpg$/i, '.webp')]
        : [imagePath];
    return files.filter(file => !fileExists(path.join(ASSETS_DIR, file)));
}

// Validate a single project
function validateProject(project) {
    const issues = [];
    const warnings = [];

    const processMedia = project.processMedia || [];
    const hasBeforeAfter = processMedia.some(item =>
        item.type === 'before-after-video' || item.type === 'before-after-image');

    // Check project HTML file exists
    const projectFile = path.join(PROJECTS_DIR, `Project-${project.id}.html`);
    if (!fileExists(projectFile)) {
        issues.push(`Missing HTML file: Project-${project.id}.html`);
    } else {
        // Check if HTML file has required scripts
        const htmlContent = fs.readFileSync(projectFile, 'utf8');

        if (!htmlContent.includes('before-after.js') && hasBeforeAfter) {
            issues.push(`Missing before-after.js script in Project-${project.id}.html (has before/after media)`);
        }

        if (!htmlContent.includes('main.js')) {
            issues.push(`Missing main.js script in Project-${project.id}.html`);
        }

        // Check for template markers
        if (!htmlContent.includes('PROJECT_INFO_START') || !htmlContent.includes('PROJECT_INFO_END')) {
            warnings.push(`Missing PROJECT_INFO markers in Project-${project.id}.html`);
        }

        if (processMedia.length > 0) {
            if (!htmlContent.includes('PROCESS_MEDIA_START') || !htmlContent.includes('PROCESS_MEDIA_END')) {
                warnings.push(`Missing PROCESS_MEDIA markers in Project-${project.id}.html`);
            }
        }
    }

    // Legacy fields replaced by cover / heroMedia / processMedia
    LEGACY_FIELDS.forEach(field => {
        if (project[field] !== undefined) {
            warnings.push(`Legacy field "${field}" is no longer used - remove it from projects-data.json`);
        }
    });

    // Check thumbnail
    if (!project.thumbnail) {
        issues.push('Missing thumbnail field');
    } else {
        missingImageFiles(project.thumbnail).forEach(file => issues.push(`Missing thumbnail: ${file}`));
    }

    // Check cover (falls back to video poster when missing)
    if (!project.cover) {
        warnings.push('No cover set - page uses the video poster as cover');
    } else {
        missingImageFiles(project.cover).forEach(file => issues.push(`Missing cover: ${file}`));
    }

    // Check hero media
    if (project.heroMedia) {
        const hero = project.heroMedia;
        if (!hero.src) {
            issues.push(`Hero ${hero.type} has no src`);
        } else if (hero.type === 'image') {
            // Image heroes are served as their .webp twin
            missingImageFiles(hero.src).forEach(file => issues.push(`Missing hero image: ${file}`));
        } else if (!fileExists(path.join(ASSETS_DIR, hero.src))) {
            issues.push(`Missing hero ${hero.type}: ${hero.src}`);
        }
        if (hero.type === 'video') {
            if (!hero.poster) {
                warnings.push('Hero video has no poster');
            } else {
                missingImageFiles(hero.poster).forEach(file => warnings.push(`Missing video poster: ${file}`));
            }
        }
    }

    // Check process media files
    processMedia.forEach((item, index) => {
        ['src', 'before', 'after'].forEach(key => {
            if (item[key] && !fileExists(path.join(ASSETS_DIR, item[key]))) {
                issues.push(`Missing process media [${index}] ${key}: ${item[key]}`);
            }
        });
    });

    // Validate data fields
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
    if (!project.role || project.role.length === 0) {
        warnings.push('Missing or empty role array');
    }
    if (!project.tools || project.tools.length === 0) {
        warnings.push('Missing or empty tools array');
    }

    return { issues, warnings };
}

// Main validation function
function main() {
    console.log(`${colors.cyan}🔍 Starting project validation...${colors.reset}\n`);

    // Load data
    const projectsData = loadProjectsData();
    console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON\n`);

    let totalIssues = 0;
    let totalWarnings = 0;
    let problemProjects = [];

    // Validate each project
    projectsData.projects.forEach(project => {
        const { issues, warnings } = validateProject(project);

        if (issues.length > 0 || warnings.length > 0) {
            console.log(`${colors.yellow}📁 Project ${project.id}: ${project.displayTitle}${colors.reset}`);

            if (issues.length > 0) {
                problemProjects.push(project.id);
                issues.forEach(issue => {
                    console.log(`   ${colors.red}❌ ${issue}${colors.reset}`);
                    totalIssues++;
                });
            }

            if (warnings.length > 0) {
                warnings.forEach(warning => {
                    console.log(`   ${colors.yellow}⚠️  ${warning}${colors.reset}`);
                    totalWarnings++;
                });
            }

            console.log('');
        }
    });

    // Summary
    console.log(`${colors.cyan}📊 Validation Summary:${colors.reset}`);

    if (totalIssues === 0 && totalWarnings === 0) {
        console.log(`   ${colors.green}✅ All projects validated successfully!${colors.reset}`);
    } else {
        if (totalIssues > 0) {
            console.log(`   ${colors.red}❌ Issues found: ${totalIssues}${colors.reset}`);
            console.log(`   ${colors.red}   Projects with issues: ${problemProjects.join(', ')}${colors.reset}`);
        }
        if (totalWarnings > 0) {
            console.log(`   ${colors.yellow}⚠️  Warnings: ${totalWarnings}${colors.reset}`);
        }

        console.log(`\n${colors.cyan}💡 Suggestions:${colors.reset}`);
        if (totalIssues > 0) {
            console.log(`   1. Run: ${colors.green}node scripts/generate-project-unified.js${colors.reset} to regenerate all project pages`);
            console.log(`   2. Check that all media files are in the correct directories`);
        }
        if (totalWarnings > 0) {
            console.log(`   3. Consider adding missing optional fields to improve project information`);
        }
    }

    // Exit with error code if critical issues found
    if (totalIssues > 0) {
        process.exit(1);
    }
}

// Run validation
main();