// api/redirect.js
export const config = { runtime: 'edge' };
import { kv } from '@vercel/kv';

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  // Evitar colisiones con estáticos/raíz
  if (!slug || slug === '/' || slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  const dest = await kv.get(`link:${slug}`);
  if (typeof dest === 'string' && dest.startsWith('http')) {
    return Response.redirect(dest, 308);
  }

  return new Response('Not found', { status: 404 });
}
