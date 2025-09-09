// api/links.js
export const config = { runtime: 'edge' };
import { kv } from '@vercel/kv';

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
  try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const { slug, url, ttl } = body || {};
  if (!slug || !url) return new Response('Missing slug or url', { status: 400 });

  const exists = await kv.get(`link:${slug}`);
  if (exists) return new Response('Slug already exists', { status: 409 });

  const opts = ttl ? { ex: Number(ttl) } : undefined; // expiración opcional en segundos
  await kv.set(`link:${slug}`, url, opts);

  return new Response(JSON.stringify({ ok: true, slug, url }), {
    headers: { 'content-type': 'application/json' }
  });
}
