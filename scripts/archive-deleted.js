/**
 * Archive Deleted Projects - moves pages and media of deleted projects to archive/
 *
 * A project is "deleted" when its ID is no longer in projects-data.json "projects"
 * (Project Studio moves it to "deletedProjects" on save). Its page and media folders
 * are then orphans. This script finds them and, with --yes, moves them to:
 *
 *   archive/[ID]/Project-[ID].html
 *   archive/[ID]/images/      (from assets/images/projects/[ID]/)
 *   archive/[ID]/videos/      (from assets/videos/[ID]/)
 *   archive/[ID]/project.json (the deletedProjects entry, for restoring by hand)
 *
 * archive/ is git-ignored. Archived entries are removed from "deletedProjects".
 *
 * Usage:
 *   node scripts/archive-deleted.js         List orphans (dry run, nothing is moved)
 *   node scripts/archive-deleted.js --yes   Move them to archive/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'projects-data.json');
const PAGES_DIR = path.join(ROOT, 'projects');
const IMAGES_DIR = path.join(ROOT, 'assets', 'images', 'projects');
const VIDEOS_DIR = path.join(ROOT, 'assets', 'videos');
const ARCHIVE_DIR = path.join(ROOT, 'archive');

const ID_PATTERN = /^\d{4}$/;
const PAGE_PATTERN = /^Project-(\d{4})\.html$/;

function loadData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Names in a directory, or [] if it doesn't exist
function listDir(dir) {
    return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

/**
 * Orphans: IDs with a page, media folder or deletedProjects entry but no live project.
 * Returns [{ id, page, images, videos, entry }] (absolute paths, or null when absent)
 * and the IDs in deletedProjects that are live again (skipped).
 */
function findOrphans(data = loadData()) {
    const liveIds = new Set((data.projects || []).map(p => String(p.id)));
    const entries = new Map((data.deletedProjects || []).map(p => [String(p.id), p]));
    const candidates = new Set(entries.keys());

    listDir(PAGES_DIR).forEach(name => {
        const match = name.match(PAGE_PATTERN);
        if (match) candidates.add(match[1]);
    });
    [IMAGES_DIR, VIDEOS_DIR].forEach(dir => {
        listDir(dir).filter(name => ID_PATTERN.test(name)).forEach(id => candidates.add(id));
    });

    const existing = file => (fs.existsSync(file) ? file : null);
    const orphans = [...candidates]
        .filter(id => !liveIds.has(id))
        .sort()
        .map(id => ({
            id,
            page: existing(path.join(PAGES_DIR, `Project-${id}.html`)),
            images: existing(path.join(IMAGES_DIR, id)),
            videos: existing(path.join(VIDEOS_DIR, id)),
            entry: entries.get(id) || null
        }));

    const liveAgain = [...entries.keys()].filter(id => liveIds.has(id));
    return { orphans, liveAgain };
}

// Move a file or folder; falls back to copy + delete across drives
function move(src, dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    try {
        fs.renameSync(src, dest);
    } catch (error) {
        if (error.code !== 'EXDEV') throw error;
        fs.cpSync(src, dest, { recursive: true });
        fs.rmSync(src, { recursive: true, force: true });
    }
}

// archive/[ID], or archive/[ID]-<timestamp> if that ID was archived before
function archiveTarget(id) {
    const dir = path.join(ARCHIVE_DIR, id);
    if (!fs.existsSync(dir)) return dir;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(ARCHIVE_DIR, `${id}-${stamp}`);
}

function archiveOrphan(orphan) {
    const target = archiveTarget(orphan.id);
    fs.mkdirSync(target, { recursive: true });

    if (orphan.entry) {
        fs.writeFileSync(path.join(target, 'project.json'), JSON.stringify(orphan.entry, null, 2) + '\n');
    }
    if (orphan.page) move(orphan.page, path.join(target, path.basename(orphan.page)));
    if (orphan.images) move(orphan.images, path.join(target, 'images'));
    if (orphan.videos) move(orphan.videos, path.join(target, 'videos'));

    return target;
}

function describe(orphan) {
    const rel = file => path.relative(ROOT, file).replace(/\\/g, '/');
    const title = orphan.entry ? ` "${orphan.entry.displayTitle}"` : ' (no deletedProjects entry)';
    const parts = [
        orphan.page && rel(orphan.page),
        orphan.images && `${rel(orphan.images)}/`,
        orphan.videos && `${rel(orphan.videos)}/`
    ].filter(Boolean);
    return `  ${orphan.id}${title}\n` +
        (parts.length ? parts.map(p => `      ${p}`).join('\n') : '      (no files left, entry only)');
}

function main() {
    const apply = process.argv.includes('--yes');
    const data = loadData();
    const { orphans, liveAgain } = findOrphans(data);

    liveAgain.forEach(id => {
        console.log(`⚠️  ${id} is in deletedProjects but is also a live project - skipped. Remove it from deletedProjects by hand.`);
    });

    if (!orphans.length) {
        console.log('✅ No deleted projects to archive.');
        return;
    }

    console.log(`Deleted projects with files left behind (${orphans.length}):\n`);
    orphans.forEach(o => console.log(describe(o)));

    if (!apply) {
        console.log('\nDry run - nothing was moved. To archive them, run:');
        console.log('  node scripts/archive-deleted.js --yes');
        return;
    }

    console.log('');
    const archivedIds = new Set();
    orphans.forEach(orphan => {
        try {
            const target = archiveOrphan(orphan);
            archivedIds.add(orphan.id);
            console.log(`📦 ${orphan.id} → ${path.relative(ROOT, target).replace(/\\/g, '/')}/`);
        } catch (error) {
            console.error(`❌ ${orphan.id}: ${error.message}`);
        }
    });

    // Drop archived entries from deletedProjects (and the key itself once empty)
    if (data.deletedProjects) {
        data.deletedProjects = data.deletedProjects.filter(p => !archivedIds.has(String(p.id)));
        if (!data.deletedProjects.length) delete data.deletedProjects;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
    }

    console.log(`\n✅ Archived ${archivedIds.size} of ${orphans.length}. archive/ is git-ignored; commit the removals when ready.`);
    if (archivedIds.size < orphans.length) process.exitCode = 1;
}

module.exports = { findOrphans };

if (require.main === module) {
    main();
}
