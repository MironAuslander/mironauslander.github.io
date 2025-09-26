const fs = require('fs');
const path = require('path');

// Directory containing project files
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Function to add markers to a project file
function addMarkersToProject(filename) {
    const filepath = path.join(PROJECTS_DIR, filename);

    try {
        let content = fs.readFileSync(filepath, 'utf8');

        // Check if markers already exist
        if (content.includes('<!-- PROJECT_INFO_START -->')) {
            console.log(`   ⚠️  ${filename} already has markers - skipping`);
            return false;
        }

        // Pattern to find project-info-grid section
        const infoPattern = /(\s*)<div class="project-info-grid">/;
        const infoEndPattern = /(\s*)<\/div>\s*\n(\s*)<!-- Additional project images -->/;

        // Add PROJECT_INFO markers
        if (infoPattern.test(content)) {
            // Add start marker
            content = content.replace(
                infoPattern,
                '$1<!-- PROJECT_INFO_START -->\n$1<div class="project-info-grid">'
            );

            // Find the closing div before "Additional project images" comment
            // We need to find the specific pattern of closing the project-info section
            const lines = content.split('\n');
            let infoDepth = 0;
            let foundInfoStart = false;
            let infoEndIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('<!-- PROJECT_INFO_START -->')) {
                    foundInfoStart = true;
                    continue;
                }

                if (foundInfoStart) {
                    if (lines[i].includes('<div')) {
                        infoDepth++;
                    }
                    if (lines[i].includes('</div>')) {
                        infoDepth--;
                        if (infoDepth === 0) {
                            // This is the closing div for project-info-grid
                            infoEndIndex = i;
                            break;
                        }
                    }
                }
            }

            if (infoEndIndex !== -1) {
                lines[infoEndIndex] = lines[infoEndIndex] + '\n                <!-- PROJECT_INFO_END -->';
                content = lines.join('\n');
            }
        }

        // Pattern to find before-after section
        const beforeAfterPattern = /(\s*)<!-- Additional project images -->/;
        const galleryEndPattern = /(\s*)<\/div>\s*\n(\s*)<\/div>\s*\n(\s*)<\/section>/;

        // Add BEFORE_AFTER_SECTION markers
        if (beforeAfterPattern.test(content)) {
            // Add start marker
            content = content.replace(
                beforeAfterPattern,
                '$1<!-- BEFORE_AFTER_SECTION_START -->\n$1<!-- Additional project images -->'
            );

            // Find the end of the gallery section
            const lines = content.split('\n');
            let foundGalleryStart = false;
            let galleryDepth = 0;
            let galleryEndIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('<!-- BEFORE_AFTER_SECTION_START -->')) {
                    foundGalleryStart = true;
                    continue;
                }

                if (foundGalleryStart) {
                    if (lines[i].includes('<div class="project-gallery">')) {
                        galleryDepth = 1;
                        continue;
                    }

                    if (galleryDepth > 0) {
                        if (lines[i].includes('<div')) {
                            galleryDepth++;
                        }
                        if (lines[i].includes('</div>')) {
                            galleryDepth--;
                            if (galleryDepth === 0) {
                                // This is the closing div for project-gallery
                                galleryEndIndex = i;
                                break;
                            }
                        }
                    }
                }
            }

            if (galleryEndIndex !== -1) {
                lines[galleryEndIndex] = lines[galleryEndIndex] + '\n                <!-- BEFORE_AFTER_SECTION_END -->';
                content = lines.join('\n');
            }
        }

        // Write the updated content back
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`   ✓ Added markers to ${filename}`);
        return true;

    } catch (error) {
        console.error(`   ❌ Error processing ${filename}:`, error.message);
        return false;
    }
}

// Main function
function main() {
    console.log('🚀 Adding markers to project HTML files...\n');

    // Get all project HTML files
    const projectFiles = fs.readdirSync(PROJECTS_DIR)
        .filter(file => file.startsWith('Project-') && file.endsWith('.html'));

    console.log(`Found ${projectFiles.length} project files\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each file
    projectFiles.forEach(file => {
        const result = addMarkersToProject(file);
        if (result === true) {
            successCount++;
        } else if (result === false) {
            skipCount++;
        } else {
            errorCount++;
        }
    });

    console.log('\n📊 Summary:');
    console.log(`   ✓ Added markers to: ${successCount} files`);
    console.log(`   ⚠️  Skipped (already have markers): ${skipCount} files`);
    if (errorCount > 0) {
        console.log(`   ❌ Errors: ${errorCount} files`);
    }

    console.log('\n✅ Marker addition complete!');
}

// Run the script
main();