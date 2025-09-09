// api/stats.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'GET') {
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

  try {
    // Verificar que el enlace existe
    const exists = await kv.get(`link:${slug}`);
    if (!exists) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Obtener metadatos
    const metadata = await kv.get(`meta:${slug}`);
    if (!metadata) {
      return new Response(JSON.stringify({ error: 'Metadata not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    const meta = JSON.parse(metadata);

    return new Response(JSON.stringify({
      ok: true,
      slug: meta.slug,
      originalUrl: meta.originalUrl,
      totalClicks: meta.clicks || 0,
      createdAt: meta.createdAt
    }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
