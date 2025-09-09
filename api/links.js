// api/links.js
import { saveUrl, getDestinationUrl } from './database.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
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

  const { slug, url, ttl } = body || {};
  if (!url) return new Response(JSON.stringify({ error: 'Missing url' }), { 
    status: 400,
    headers: { 'content-type': 'application/json' }
  });

  // Generar slug automáticamente si no se proporciona
  let finalSlug = slug;
  if (!finalSlug) {
    finalSlug = Math.random().toString(36).substring(2, 8);
  }

  // Validar URL
  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), { 
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Validar slug
  if (!/^[a-zA-Z0-9_-]+$/.test(finalSlug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug format' }), { 
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    // Verificar si el slug ya existe
    const existingUrl = await getDestinationUrl(finalSlug);
    if (existingUrl) return new Response(JSON.stringify({ error: 'Slug already exists' }), { 
      status: 409,
      headers: { 'content-type': 'application/json' }
    });

    // Guardar el enlace
    const metadata = await saveUrl(finalSlug, url, ttl);

    return new Response(JSON.stringify({ ok: true, slug: finalSlug, url }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving URL:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
