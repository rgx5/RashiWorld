// Client-side image compression, run before any upload to Supabase Storage.
// Downscales to a sane max dimension and re-encodes as WebP at a high
// quality setting - this alone typically cuts file size by 60-85% with no
// visible quality loss, before the file even reaches storage. Next.js then
// re-optimizes further per-device on retrieval (see next.config.mjs).
const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.85;

/**
 * Compress an image File/Blob in the browser via canvas re-encoding.
 * Falls back to the original file if compression fails or isn't supported
 * (e.g. non-image input, SSR, or a browser that can't encode webp).
 */
export async function compressImage(
  file,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {}
) {
  if (typeof window === 'undefined' || !file || !file.type.startsWith('image/')) {
    return file;
  }
  // Re-encoding an already-vector or animated format can make things worse
  // or break animation - leave SVG/GIF untouched.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    );

    if (!blob) return file; // browser couldn't encode webp - keep original

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp' });
  } catch (err) {
    console.warn('Image compression skipped, uploading original:', err.message);
    return file;
  }
}

/** Compress a list of files, preserving order. */
export async function compressImages(files, options) {
  return Promise.all(Array.from(files).map((f) => compressImage(f, options)));
}
