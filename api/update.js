// api/update.js
import { updateUrl, updateSlug } from './database.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'PUT') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const slug = url.pathname.split('/').pop();

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const { url: newUrl, newSlug } = body;
  if (!newUrl) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Validar URL
  try {
    new URL(newUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    let result;
    
    if (newSlug && newSlug !== slug) {
      // Actualizar tanto URL como slug
      result = await updateSlug(slug, newSlug, newUrl);
    } else {
      // Solo actualizar URL
      const success = await updateUrl(slug, newUrl);
      result = { success, metadata: null };
    }

    if (result.success) {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'Link updated successfully',
        newSlug: newSlug || slug
      }), {
        headers: { 'content-type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: result.error || 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error updating link:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
