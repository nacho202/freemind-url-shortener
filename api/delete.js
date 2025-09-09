// api/delete.js
import { kv } from '@vercel/kv';

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
    // Verificar que el enlace existe
    const exists = await kv.get(`link:${slug}`);
    if (!exists) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Eliminar enlace y metadatos
    await kv.del(`link:${slug}`);
    await kv.del(`meta:${slug}`);

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
