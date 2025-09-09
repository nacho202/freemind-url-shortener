// api/edit.js
import { kv } from '@vercel/kv';

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

  const { url: newUrl } = body;
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
    // Verificar que el enlace existe
    const exists = await kv.get(`link:${slug}`);
    if (!exists) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Actualizar la URL
    await kv.set(`link:${slug}`, newUrl);

    // Actualizar metadatos
    const metadata = await kv.get(`meta:${slug}`);
    if (metadata) {
      const meta = JSON.parse(metadata);
      meta.originalUrl = newUrl;
      await kv.set(`meta:${slug}`, JSON.stringify(meta));
    }

    return new Response(JSON.stringify({ ok: true, message: 'URL updated successfully' }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating URL:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
