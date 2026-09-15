/**
 * Downscale and re-encode an image in the browser before it's uploaded.
 *
 * Why this exists: featured images were going into Storage at their original
 * camera/export size — several were 1.7MB to 3MB. That caused two real
 * problems:
 *
 *   1. WhatsApp (and to a lesser extent Telegram) will not fetch a link
 *      preview image that large. It doesn't error, it just shows no image —
 *      which is why shared articles appeared without their featured picture
 *      even though the og:image tag was perfectly correct.
 *
 *   2. A 3MB hero image is usually the Largest Contentful Paint element, so
 *      it directly slows down every article page.
 *
 * 1600px wide at quality 0.82 keeps a featured image sharp on a retina screen
 * while landing comfortably under the preview limits.
 */

const MAX_WIDTH = 1600;
const QUALITY = 0.82;
// Below this there's nothing worth recompressing — re-encoding a small image
// can even make it larger.
const SKIP_UNDER_BYTES = 400 * 1024;

export async function compressImage(file, { maxWidth = MAX_WIDTH, quality = QUALITY } = {}) {
  // Not an image, or already small enough — hand it back untouched.
  if (!(file instanceof Blob)) return file;
  if (!file.type?.startsWith('image/')) return file;
  // GIFs can be animated; canvas would flatten them to a single frame.
  if (file.type === 'image/gif') return file;
  if (file.size <= SKIP_UNDER_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);

    // Already narrow enough AND reasonably sized — leave it alone.
    if (scale === 1 && file.size <= SKIP_UNDER_BYTES * 2) {
      bitmap.close?.();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    // JPEG rather than WebP on purpose: some link-preview scrapers still
    // don't handle WebP, and a preview that renders everywhere matters more
    // here than the extra few KB WebP would save.
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );

    // If compression somehow made it bigger, keep the original.
    if (!blob || blob.size >= file.size) return file;

    // Preserve a sensible filename so Storage entries stay readable.
    return new File([blob], (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    // Never block an upload because compression failed — worst case the
    // original goes up, exactly as before.
    console.warn('Image compression failed, uploading original:', err);
    return file;
  }
}
