// Widths next/image may ask for. Kept short so each photo has only a few
// resized copies, which keeps the CDN cache hit rate high.
// Used by next.config.mjs and by the /img resizer, so they always agree.
export const DEVICE_SIZES = [640, 828, 1080, 1200, 1600];
export const IMAGE_SIZES = [96, 160, 256, 384];
export const ALLOWED_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];

// Hosts whose images we resize. Anything else is shown as-is, so /img can't
// be used as an open proxy for arbitrary sites.
export const RESIZABLE_HOSTS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'i.ytimg.com',
  'img.youtube.com',
];
