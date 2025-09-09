// api/stats.js
import { getUrl } from './database.js';

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
    const metadata = await getUrl(slug);
    
    if (!metadata) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      slug: metadata.slug,
      originalUrl: metadata.originalUrl,
      totalClicks: metadata.clicks || 0,
      createdAt: metadata.createdAt
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
