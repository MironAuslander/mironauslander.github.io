const fs = require('fs');
const path = require('path');

// Get all project HTML files
const projectsDir = path.join(__dirname, '..', 'projects');
const files = fs.readdirSync(projectsDir).filter(file => file.startsWith('Project-') && file.endsWith('.html'));

console.log(`Found ${files.length} project files to process\n`);

let processedCount = 0;
let errorCount = 0;

files.forEach(file => {
    const filePath = path.join(projectsDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;

        // Remove the entire style block (from opening <style> to closing </style>)
        // This regex captures the style tag and all its content including font-face declarations
        const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;

        // Check if style block exists
        const hasStyleBlock = styleRegex.test(content);

        if (hasStyleBlock) {
            // Reset regex lastIndex after test
            styleRegex.lastIndex = 0;

            // Remove the style block
            content = content.replace(styleRegex, '');

            // Clean up extra blank lines that might be left behind
            content = content.replace(/(\r?\n){3,}/g, '\n\n');

            // Write the updated content back
            fs.writeFileSync(filePath, content, 'utf8');

            const newLength = content.length;
            const removed = originalLength - newLength;

            console.log(`✓ ${file}: Removed ${removed} characters (style block)`);
            processedCount++;
        } else {
            console.log(`  ${file}: No inline styles found (already clean)`);
        }

    } catch (error) {
        console.error(`✗ ${file}: Error - ${error.message}`);
        errorCount++;
    }
});

console.log(`\n========================================`);
console.log(`Summary:`);
console.log(`  - Processed: ${processedCount} files`);
console.log(`  - Skipped: ${files.length - processedCount - errorCount} files (already clean)`);
console.log(`  - Errors: ${errorCount} files`);
console.log(`\nAll project pages now use the consolidated style.css`);
console.log(`CSS consolidation complete!`);