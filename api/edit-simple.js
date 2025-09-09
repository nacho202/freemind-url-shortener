// api/edit-simple.js - Editar enlaces simplificado
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts[pathParts.length - 1];

  console.log('Edit simple handler called with slug:', slug);

  try {
    const body = await req.json();
    const { url: newUrl } = body;
    
    if (!newUrl) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

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

    // Actualizar en Vercel KV
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`link:${slug}`, newUrl);
      
      // Actualizar metadata
      const linkData = ultraData.history.find(item => item.slug === slug);
      if (linkData) {
        linkData.url = newUrl;
        await kv.set(`meta:${slug}`, JSON.stringify(linkData));
      }
    } catch (error) {
      console.warn('Failed to update KV:', error.message);
    }

    console.log('Updated link:', slug, '->', newUrl);

    return new Response(JSON.stringify({ 
      ok: true, 
      message: 'Link updated successfully' 
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in edit simple handler:', error);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
