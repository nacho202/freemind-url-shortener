// api/redirect.js
import { getDestinationUrl, incrementClicks } from './database.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const dest = await getDestinationUrl(slug);
    if (typeof dest === 'string' && dest.startsWith('http')) {
      // Incrementar contador de clicks
      await incrementClicks(slug);
      
      return Response.redirect(dest, 308);
    }
  } catch (error) {
    console.error('Error getting destination URL:', error);
  }

  return new Response('Not found', { status: 404 });
}
