/**
 * Euphoria Paintings - Cloudflare Worker
 * Handles secure image uploads to R2 bucket
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: Upload image
      if (path === '/upload' && request.method === 'POST') {
        return await handleUpload(request, env);
      }

      // Route: Delete image
      if (path === '/delete' && request.method === 'DELETE') {
        return await handleDelete(request, env);
      }

      // Route: List images
      if (path === '/list' && request.method === 'GET') {
        return await handleList(env);
      }

      // Route: Get single image info
      if (path.startsWith('/image/') && request.method === 'GET') {
        const filename = path.replace('/image/', '');
        return await handleGetImage(filename, env);
      }

      // Route: Health check
      if (path === '/health') {
        return jsonResponse({ status: 'ok', bucket: 'euphoria-paintings' });
      }

      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

/**
 * Handle image upload to R2
 */
async function handleUpload(request, env) {
  const formData = await request.formData();
  const file = formData.get('file');
  const folder = formData.get('folder') || 'artworks';

  if (!file) {
    return jsonResponse({ error: 'No file provided' }, 400);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return jsonResponse({ error: 'Invalid file type. Allowed: jpg, png, webp, gif' }, 400);
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return jsonResponse({ error: 'File too large. Max size: 10MB' }, 400);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop().toLowerCase();
  const filename = `${folder}/${timestamp}-${randomStr}.${extension}`;

  // Upload to R2
  await env.BUCKET.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Construct public URL (using R2 public bucket URL)
  const publicUrl = env.R2_PUBLIC_URL 
    ? `${env.R2_PUBLIC_URL}/${filename}`
    : `https://pub-${env.R2_PUBLIC_HASH}.r2.dev/${filename}`;

  return jsonResponse({
    success: true,
    filename,
    url: publicUrl,
    size: file.size,
    type: file.type,
  });
}

/**
 * Handle image deletion from R2
 */
async function handleDelete(request, env) {
  const { filename } = await request.json();

  if (!filename) {
    return jsonResponse({ error: 'No filename provided' }, 400);
  }

  // Check if file exists
  const object = await env.BUCKET.get(filename);
  if (!object) {
    return jsonResponse({ error: 'File not found' }, 404);
  }

  await env.BUCKET.delete(filename);

  return jsonResponse({ success: true, deleted: filename });
}

/**
 * List all images in the bucket
 */
async function handleList(env) {
  const listed = await env.BUCKET.list({ prefix: 'artworks/' });

  const images = listed.objects.map(obj => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
    url: env.R2_PUBLIC_URL 
      ? `${env.R2_PUBLIC_URL}/${obj.key}`
      : `https://pub-${env.R2_PUBLIC_HASH}.r2.dev/${obj.key}`,
  }));

  return jsonResponse({ images, count: images.length });
}

/**
 * Get single image info
 */
async function handleGetImage(filename, env) {
  const object = await env.BUCKET.get(filename);
  
  if (!object) {
    return jsonResponse({ error: 'Image not found' }, 404);
  }

  return jsonResponse({
    key: filename,
    size: object.size,
    uploaded: object.uploaded,
    httpMetadata: object.httpMetadata,
    customMetadata: object.customMetadata,
    url: env.R2_PUBLIC_URL 
      ? `${env.R2_PUBLIC_URL}/${filename}`
      : `https://pub-${env.R2_PUBLIC_HASH}.r2.dev/${filename}`,
  });
}

/**
 * Helper: JSON response with CORS
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
