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

// Check if file exists
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

// Validate a single project
function validateProject(project) {
    const issues = [];
    const warnings = [];

    // Check project HTML file exists
    const projectFile = path.join(PROJECTS_DIR, `Project-${project.id}.html`);
    if (!fileExists(projectFile)) {
        issues.push(`Missing HTML file: Project-${project.id}.html`);
    } else {
        // Check if HTML file has required scripts
        const htmlContent = fs.readFileSync(projectFile, 'utf8');

        if (!htmlContent.includes('before-after.js') && project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
            issues.push(`Missing before-after.js script in Project-${project.id}.html (has before/after media)`);
        }

        if (!htmlContent.includes('main.js')) {
            issues.push(`Missing main.js script in Project-${project.id}.html`);
        }

        // Check for template markers
        if (!htmlContent.includes('PROJECT_INFO_START') || !htmlContent.includes('PROJECT_INFO_END')) {
            warnings.push(`Missing PROJECT_INFO markers in Project-${project.id}.html`);
        }

        if (project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
            if (!htmlContent.includes('BEFORE_AFTER_SECTION_START') || !htmlContent.includes('BEFORE_AFTER_SECTION_END')) {
                warnings.push(`Missing BEFORE_AFTER_SECTION markers in Project-${project.id}.html`);
            }
        }
    }

    // Check thumbnail
    if (project.thumbnail) {
        const thumbnailPath = path.join(ASSETS_DIR, project.thumbnail);
        if (!fileExists(thumbnailPath)) {
            issues.push(`Missing thumbnail: ${project.thumbnail}`);
        }
    }

    // Check hero image
    if (project.heroImage) {
        const heroPath = path.join(ASSETS_DIR, project.heroImage);
        if (!fileExists(heroPath)) {
            warnings.push(`Missing hero image: ${project.heroImage}`);
        }
    }

    // Check main video
    if (project.mainVideo) {
        const videoPath = path.join(ASSETS_DIR, project.mainVideo);
        if (!fileExists(videoPath)) {
            issues.push(`Missing main video: ${project.mainVideo}`);
        }
    }

    // Check video poster
    if (project.videoPoster) {
        const posterPath = path.join(ASSETS_DIR, project.videoPoster);
        if (!fileExists(posterPath)) {
            warnings.push(`Missing video poster: ${project.videoPoster}`);
        }
    }

    // Check before/after media
    if (project.beforeAfterMedia) {
        project.beforeAfterMedia.forEach((media, index) => {
            const beforePath = path.join(ASSETS_DIR, media.before);
            const afterPath = path.join(ASSETS_DIR, media.after);

            if (!fileExists(beforePath)) {
                issues.push(`Missing before media [${index}]: ${media.before}`);
            }
            if (!fileExists(afterPath)) {
                issues.push(`Missing after media [${index}]: ${media.after}`);
            }
        });
    }

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
            console.log(`   1. Run: ${colors.green}node scripts/generate-project-pages.js${colors.reset} to regenerate all project pages`);
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