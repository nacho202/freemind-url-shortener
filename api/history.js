// api/history.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Obtener todas las claves de metadatos
    const keys = await kv.keys('meta:*');
    const history = [];

    for (const key of keys) {
      try {
        const metadata = await kv.get(key);
        if (metadata) {
          const meta = JSON.parse(metadata);
          history.push(meta);
        }
      } catch (error) {
        console.error(`Error getting metadata for ${key}:`, error);
      }
    }

    // Ordenar por fecha de creación (más recientes primero)
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return new Response(JSON.stringify({ ok: true, history }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting history:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
