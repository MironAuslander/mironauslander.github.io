/**
 * Quick update script - Only regenerates changed projects
 * Tracks modification time to determine which projects need updating
 *
 * Usage: node scripts/quick-update.js [--force]
 *
 * Options:
 *   --force    Regenerate all projects regardless of modification time
 *   --dry-run  Show what would be updated without making changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const forceUpdate = args.includes('--force');
const dryRun = args.includes('--dry-run');

// Paths
const DATA_FILE = 'projects-data.json';
const PROJECTS_DIR = 'projects';
const CACHE_FILE = '.project-update-cache.json';

// Load or initialize cache
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
    try {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (error) {
        console.log(`${colors.yellow}⚠️  Cache file corrupted, starting fresh${colors.reset}`);
        cache = {};
    }
}

// Get modification time of data file
const dataStats = fs.statSync(DATA_FILE);
const dataModTime = dataStats.mtime.getTime();

// Check if data file has changed since last update
const dataChanged = cache.lastDataModTime !== dataModTime;

if (dataChanged) {
    console.log(`${colors.cyan}📝 projects-data.json has been modified${colors.reset}`);
}

// Load project data
let projectsData;
try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    projectsData = JSON.parse(rawData);
} catch (error) {
    console.error(`${colors.red}❌ Error reading ${DATA_FILE}:${colors.reset}`, error.message);
    process.exit(1);
}

// Find projects that need updating
const projectsToUpdate = [];
const projectsChecked = [];

projectsData.projects.forEach(project => {
    const projectFile = path.join(PROJECTS_DIR, `Project-${project.id}.html`);
    const projectCacheKey = `project_${project.id}`;

    // Calculate a hash of project data for comparison
    const projectHash = JSON.stringify({
        ...project,
        // Exclude fields that don't affect HTML generation
        _lastModified: undefined
    });

    let needsUpdate = false;
    let reason = '';

    if (forceUpdate) {
        needsUpdate = true;
        reason = 'force update';
    } else if (!fs.existsSync(projectFile)) {
        needsUpdate = true;
        reason = 'file missing';
    } else if (dataChanged) {
        // Check if this specific project's data changed
        if (cache[projectCacheKey] !== projectHash) {
            needsUpdate = true;
            reason = 'data changed';
        }
    } else {
        // Check file modification time
        const fileStats = fs.statSync(projectFile);
        const fileModTime = fileStats.mtime.getTime();

        if (cache[projectCacheKey + '_time'] && cache[projectCacheKey + '_time'] > fileModTime) {
            needsUpdate = true;
            reason = 'file older than cache';
        }
    }

    if (needsUpdate) {
        projectsToUpdate.push({
            id: project.id,
            title: project.displayTitle,
            reason: reason,
            hash: projectHash
        });
    }

    projectsChecked.push({
        id: project.id,
        title: project.displayTitle,
        status: needsUpdate ? 'needs-update' : 'up-to-date'
    });
});

// Display summary
console.log(`\n${colors.magenta}📊 Project Status Summary:${colors.reset}`);
console.log(`   Total projects: ${projectsData.projects.length}`);
console.log(`   ${colors.green}✓ Up-to-date: ${projectsChecked.filter(p => p.status === 'up-to-date').length}${colors.reset}`);
console.log(`   ${colors.yellow}⟳ Need update: ${projectsToUpdate.length}${colors.reset}`);

if (projectsToUpdate.length === 0) {
    console.log(`\n${colors.green}✨ All projects are up-to-date!${colors.reset}`);
    process.exit(0);
}

// Show what will be updated
console.log(`\n${colors.cyan}Projects to update:${colors.reset}`);
projectsToUpdate.forEach(project => {
    console.log(`   ${colors.yellow}•${colors.reset} ${project.id} - ${project.title} (${project.reason})`);
});

if (dryRun) {
    console.log(`\n${colors.yellow}🔍 Dry run mode - no files will be modified${colors.reset}`);
    console.log(`Remove --dry-run flag to apply updates`);
    process.exit(0);
}

// Ask for confirmation if updating many projects
if (projectsToUpdate.length > 10 && !forceUpdate) {
    console.log(`\n${colors.yellow}⚠️  This will update ${projectsToUpdate.length} projects.${colors.reset}`);
    console.log(`Press Ctrl+C to cancel, or wait 3 seconds to continue...`);

    // Give user time to cancel
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    (async () => {
        await sleep(3000);
        updateProjects();
    })();
} else {
    updateProjects();
}

function updateProjects() {
    console.log(`\n${colors.cyan}🚀 Starting quick update...${colors.reset}`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Update each project
    projectsToUpdate.forEach((project, index) => {
        const progress = `[${index + 1}/${projectsToUpdate.length}]`;
        process.stdout.write(`${progress} Updating ${project.id}... `);

        try {
            // Run the single project generator
            execSync(`node scripts/generate-single-project.js ${project.id}`, {
                stdio: 'pipe' // Suppress output
            });

            // Update cache
            cache[`project_${project.id}`] = project.hash;
            cache[`project_${project.id}_time`] = Date.now();

            successCount++;
            console.log(`${colors.green}✓${colors.reset}`);
        } catch (error) {
            errorCount++;
            errors.push({ id: project.id, error: error.message });
            console.log(`${colors.red}✗${colors.reset}`);
        }
    });

    // Update cache with data file modification time
    cache.lastDataModTime = dataModTime;

    // Save cache
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
    } catch (error) {
        console.error(`${colors.yellow}⚠️  Warning: Could not save cache file${colors.reset}`);
    }

    // Display results
    console.log(`\n${colors.magenta}=====================================
📊 Quick Update Summary:${colors.reset}
   ${colors.green}✅ Success: ${successCount} projects${colors.reset}
   ${errorCount > 0 ? `${colors.red}❌ Errors: ${errorCount} projects${colors.reset}` : ''}
${colors.magenta}=====================================${colors.reset}`);

    if (errors.length > 0) {
        console.log(`\n${colors.red}Errors encountered:${colors.reset}`);
        errors.forEach(err => {
            console.log(`   ${colors.red}•${colors.reset} Project ${err.id}: ${err.error}`);
        });
    }

    if (successCount > 0) {
        console.log(`\n${colors.green}✨ Quick update completed!${colors.reset}`);
        console.log(`\n${colors.yellow}💡 Next steps:${colors.reset}`);
        console.log(`   1. Test locally: ${colors.cyan}python -m http.server 8000${colors.reset}`);
        console.log(`   2. Run validation: ${colors.cyan}node scripts/validate-projects.js${colors.reset}`);
        console.log(`   3. Commit changes: ${colors.cyan}git add . && git commit -m "Update projects"${colors.reset}`);
    }

    process.exit(errorCount > 0 ? 1 : 0);
}