// api/delete.js
import { deleteUrl } from './database.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'DELETE') {
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
    const success = await deleteUrl(slug);
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: true, message: 'Link deleted successfully' }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
