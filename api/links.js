// api/links.js
import { saveUrl, getDestinationUrl } from './database.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body = {};
  try { 
    body = await req.json(); 
  } catch { 
    return new Response('Bad JSON', { status: 400 }); 
  }

  const { slug, url, ttl } = body || {};
  if (!url) return new Response('Missing url', { status: 400 });

  // Generar slug automáticamente si no se proporciona
  let finalSlug = slug;
  if (!finalSlug) {
    finalSlug = Math.random().toString(36).substring(2, 8);
  }

  // Validar URL
  try {
    new URL(url);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  // Validar slug
  if (!/^[a-zA-Z0-9-_]+$/.test(finalSlug)) {
    return new Response('Invalid slug format', { status: 400 });
  }

  try {
    // Verificar si el slug ya existe
    const existingUrl = await getDestinationUrl(finalSlug);
    if (existingUrl) return new Response('Slug already exists', { status: 409 });

    // Guardar el enlace
    const metadata = await saveUrl(finalSlug, url, ttl);

    return new Response(JSON.stringify({ ok: true, slug: finalSlug, url }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving URL:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
