// api/redirect.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const dest = await kv.get(`link:${slug}`);
    if (typeof dest === 'string' && dest.startsWith('http')) {
      return Response.redirect(dest, 308);
    }
  } catch (error) {
    console.error('Error getting from KV:', error);
  }

  return new Response('Not found', { status: 404 });
}
