/**
 * Storage Service - Handles image uploads via Cloudflare Worker
 * Images are stored in R2 bucket: euphoria-paintings
 */

// Worker URL - update this after deploying your worker
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

/**
 * Upload image to R2 via Cloudflare Worker
 */
export async function uploadImage(file, folder = 'artworks') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${WORKER_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      url: result.url,
      filename: result.filename,
      path: result.filename,
      error: null,
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      url: null,
      error: error.message,
    };
  }
}

/**
 * Delete image from R2 via Cloudflare Worker
 */
export async function deleteImage(filename) {
  try {
    const response = await fetch(`${WORKER_URL}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    return { success: true, error: null };

  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all images in the bucket
 */
export async function listImages() {
  try {
    const response = await fetch(`${WORKER_URL}/list`);

    if (!response.ok) {
      throw new Error('Failed to list images');
    }

    return await response.json();

  } catch (error) {
    console.error('List error:', error);
    return { images: [], count: 0 };
  }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(filename) {
  if (!filename) return null;
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  return publicUrl ? `${publicUrl}/${filename}` : null;
}
