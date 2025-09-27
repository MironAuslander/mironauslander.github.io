const fs = require('fs');
const path = require('path');

// File paths
const DATA_FILE = path.join(__dirname, '..', 'projects-data.json');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Convert single project to advanced format
function convertProject(project) {
    const converted = { ...project };

    // Skip if already in advanced format
    if (converted.heroMedia && converted.processMedia !== undefined) {
        console.log(`   ℹ️  Project ${project.id} already in advanced format`);
        return converted;
    }

    // Convert hero media
    if (!converted.heroMedia) {
        if (project.mainVideo) {
            converted.heroMedia = {
                type: 'video',
                src: project.mainVideo,
                poster: project.videoPoster || null
            };
            console.log(`   ✓ Converted hero video for Project ${project.id}`);
        } else if (project.heroImage) {
            converted.heroMedia = {
                type: 'image',
                src: project.heroImage,
                alt: project.fullTitle
            };
            console.log(`   ✓ Converted hero image for Project ${project.id}`);
        } else {
            // Default to image if no media specified
            converted.heroMedia = {
                type: 'image',
                src: `assets/images/projects/${project.id}/${project.id}.webp`,
                alt: project.fullTitle
            };
            console.log(`   ⚠️  No hero media found for Project ${project.id}, using default image path`);
        }
    }

    // Convert process media from beforeAfterMedia
    if (!converted.processMedia) {
        if (project.beforeAfterMedia && project.beforeAfterMedia.length > 0) {
            converted.processMedia = project.beforeAfterMedia.map((item, index) => {
                const mediaType = item.type === 'video' ? 'before-after-video' : 'before-after-image';
                return {
                    type: mediaType,
                    before: item.before,
                    after: item.after,
                    label: item.label || `Comparison ${index + 1}`,
                    labelBefore: 'Before',
                    labelAfter: 'After'
                };
            });
            console.log(`   ✓ Converted ${converted.processMedia.length} before/after items for Project ${project.id}`);
        } else {
            // No process media
            converted.processMedia = [];
            console.log(`   ℹ️  No process media for Project ${project.id}`);
        }
    }

    // Clean up old fields (optional - comment out to keep backward compatibility)
    // delete converted.mainVideo;
    // delete converted.videoPoster;
    // delete converted.heroImage;
    // delete converted.beforeAfterMedia;

    return converted;
}

// Example: Add custom process media for specific projects
function addCustomProcessMedia(project) {
    // Example: Add specific media configuration for project 1238
    if (project.id === '1238') {
        project.processMedia = [
            {
                type: 'before-after-video',
                before: 'assets/videos/1238/1238-before-1.mp4',
                after: 'assets/videos/1238/1238-after-1.mp4',
                label: 'UI Animation Compositing',
                labelBefore: 'Raw Footage',
                labelAfter: 'Final VFX'
            },
            // Can add more media items here
        ];
        console.log(`   🎨 Added custom process media for Project ${project.id}`);
    }

    // Example: Mixed media for project 1798
    if (project.id === '1798') {
        project.processMedia = [
            {
                type: 'before-after-video',
                before: 'assets/videos/1798/1798-before-1.mp4',
                after: 'assets/videos/1798/1798-after-1.mp4',
                label: 'Screen Replacement'
            },
            {
                type: 'video',
                src: 'assets/videos/1798/1798-breakdown.mp4',
                poster: 'assets/images/projects/1798/1798-breakdown-poster.jpg',
                caption: 'VFX Breakdown'
            },
            {
                type: 'before-after-video',
                before: 'assets/videos/1798/1798-before-2.mp4',
                after: 'assets/videos/1798/1798-after-2.mp4',
                label: 'Color Grading'
            }
        ];
        console.log(`   🎨 Added mixed media example for Project ${project.id}`);
    }

    return project;
}

// Main migration function
function migrate() {
    console.log('🚀 Starting migration to advanced format...\n');

    // Load current data
    let projectsData;
    try {
        const dataContent = fs.readFileSync(DATA_FILE, 'utf8');
        projectsData = JSON.parse(dataContent);
        console.log(`✓ Loaded ${projectsData.projects.length} projects from JSON\n`);
    } catch (error) {
        console.error('❌ Error reading projects-data.json:', error.message);
        process.exit(1);
    }

    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupFile = path.join(BACKUP_DIR, `projects-data.backup.${timestamp}.json`);

    try {
        fs.writeFileSync(backupFile, JSON.stringify(projectsData, null, 2));
        console.log(`✓ Created backup: ${path.basename(backupFile)}\n`);
    } catch (error) {
        console.error('❌ Error creating backup:', error.message);
        process.exit(1);
    }

    // Convert each project
    console.log('Converting projects to advanced format:\n');
    projectsData.projects = projectsData.projects.map(project => {
        let converted = convertProject(project);
        // Optionally add custom media configurations
        converted = addCustomProcessMedia(converted);
        return converted;
    });

    // Update metadata
    projectsData.metadata = projectsData.metadata || {};
    projectsData.metadata.version = '3.0';
    projectsData.metadata.lastMigration = new Date().toISOString();
    projectsData.metadata.format = 'advanced';

    // Save updated data
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(projectsData, null, 2));
        console.log('\n✅ Migration complete! projects-data.json has been updated.');
        console.log(`   Backup saved to: ${path.basename(backupFile)}`);
    } catch (error) {
        console.error('❌ Error saving migrated data:', error.message);

        // Attempt to restore from backup
        console.log('Attempting to restore from backup...');
        try {
            const backupContent = fs.readFileSync(backupFile, 'utf8');
            fs.writeFileSync(DATA_FILE, backupContent);
            console.log('✓ Restored from backup');
        } catch (restoreError) {
            console.error('❌ Failed to restore from backup:', restoreError.message);
        }

        process.exit(1);
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Run: node scripts/generate-project-pages-advanced.js');
    console.log('   2. Test the generated pages in your browser');
    console.log('   3. Use the visual editor to customize media layouts');
}

// Run migration
migrate();