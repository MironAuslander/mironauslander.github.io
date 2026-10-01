/**
 * Shared media rules for the generator and validators.
 * tools/js/utils.js mirrors getServedImage / getCoverFallback for the browser tools -
 * keep both in sync when a rule changes.
 */

// Fields removed in favour of cover / heroMedia / processMedia
const LEGACY_FIELDS = ['videoPoster', 'heroImage', 'mainVideo', 'beforeAfterMedia'];

const JPG_RE = /\.jpg$/i;

// Path the site serves for an image: .jpg paths in JSON are served as their .webp twin
function servedImage(imagePath) {
    return imagePath ? imagePath.replace(JPG_RE, '.webp') : imagePath;
}

// Files that must exist for an image: the path itself and, for .jpg, its served .webp twin
function imageTwins(imagePath) {
    return JPG_RE.test(imagePath) ? [imagePath, servedImage(imagePath)] : [imagePath];
}

// Image used as cover when no cover is set: the hero image, or the hero video poster
function getCoverFallback(project) {
    const hero = project.heroMedia;
    if (!hero) return '';
    return (hero.type === 'image' ? hero.src : hero.poster) || '';
}

// Cover image path: dedicated cover, else the fallback above
function getCoverPath(project) {
    return project.cover || getCoverFallback(project);
}

// Warning text for a project without a cover, naming what the page falls back to
function missingCoverMessage(project) {
    if (!getCoverFallback(project)) {
        return 'No cover set and no hero image or video poster to fall back on - page has no hero cover';
    }
    const source = project.heroMedia.type === 'image' ? 'hero image' : 'video poster';
    return `No cover set - page uses the ${source} as cover`;
}

function isBeforeAfter(item) {
    return item.type === 'before-after-video' || item.type === 'before-after-image';
}

function hasBeforeAfter(project) {
    return !!(project.processMedia && project.processMedia.some(isBeforeAfter));
}

module.exports = {
    LEGACY_FIELDS,
    servedImage,
    imageTwins,
    getCoverFallback,
    getCoverPath,
    missingCoverMessage,
    isBeforeAfter,
    hasBeforeAfter
};
