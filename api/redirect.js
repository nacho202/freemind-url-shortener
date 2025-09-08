// api/redirect.js
export const config = { runtime: 'edge' };

import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  // evitar chocar con estáticos/raíz
  if (!slug || slug === '/' || slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  const dest = await redis.get(`link:${slug}`);
  if (typeof dest === 'string' && dest.startsWith('http')) {
    return Response.redirect(dest, 308);
  }

  return new Response('Not found', { status: 404 });
}
