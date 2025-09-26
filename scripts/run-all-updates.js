/**
 * Run All Updates - Single JavaScript file to run all portfolio updates
 * Usage: node scripts/run-all-updates.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n=====================================');
console.log('    Portfolio Update System');
console.log('=====================================\n');

// Helper function to run a script
function runScript(scriptName, description) {
    console.log(`${description}...`);
    try {
        const scriptPath = path.join(__dirname, scriptName);
        const output = execSync(`node "${scriptPath}"`, { encoding: 'utf-8' });
        console.log(output);
        return true;
    } catch (error) {
        console.error(`❌ ERROR: Failed to ${description.toLowerCase()}`);
        console.error(error.message);
        return false;
    }
}

// Run all update scripts in sequence
let allSuccess = true;

// Update featured projects
if (!runScript('update-featured.js', 'Updating featured projects on homepage')) {
    allSuccess = false;
}

// Update projects page
if (allSuccess && !runScript('update-projects-page.js', 'Updating projects page')) {
    allSuccess = false;
}

// Update individual project pages
if (allSuccess && !runScript('update-project-pages.js', 'Updating individual project pages')) {
    allSuccess = false;
}

// Final status
console.log('\n=====================================');
if (allSuccess) {
    console.log('    ✅ All updates completed!');
    console.log('=====================================\n');
    console.log('Your site has been updated with the latest project data.\n');
} else {
    console.log('    ❌ Some updates failed!');
    console.log('=====================================\n');
    console.log('Please check the errors above and try again.\n');
    process.exit(1);
}