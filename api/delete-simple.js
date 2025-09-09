// api/delete-simple.js - Eliminar enlaces simplificado
export const config = { runtime: 'edge' };

// Base de datos simple
let simpleDb = new Map();

export default async function handler(req) {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];

  console.log('Delete simple handler called with slug:', slug);

  try {
    // Obtener datos de la API ultra-simple
    const ultraResponse = await fetch(`${new URL(req.url).origin}/api/ultra-simple`);
    if (!ultraResponse.ok) {
      return new Response(JSON.stringify({ error: 'Could not fetch links' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    const ultraData = await ultraResponse.json();
    const linkExists = ultraData.history.some(item => item.slug === slug);

    if (!linkExists) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Eliminar de Vercel KV
    try {
      const { kv } = await import('@vercel/kv');
      await kv.del(`link:${slug}`);
      await kv.del(`meta:${slug}`);
    } catch (error) {
      console.warn('Failed to delete from KV:', error.message);
    }

    console.log('Deleted link:', slug);

    return new Response(JSON.stringify({ 
      ok: true, 
      message: 'Link deleted successfully' 
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in delete simple handler:', error);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
