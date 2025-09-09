// api/ultra-simple-fixed.js - Versión completamente funcional
export const config = { runtime: 'edge' };

// Base de datos ultra simple
let ultraDb = new Map();

// Función para sincronizar con redirect handler
async function syncWithRedirect(slug, url) {
  try {
    // Intentar acceder a la base de datos de redirección
    const redirectDb = global.redirectDb || new Map();
    redirectDb.set(slug, url);
    global.redirectDb = redirectDb;
    console.log('Synced with redirect DB:', slug, '->', url);
  } catch (error) {
    console.warn('Failed to sync with redirect DB:', error.message);
  }
}

export default async function handler(req) {
  console.log('Ultra simple fixed handler called with method:', req.method);
  console.log('Request URL:', req.url);
  
  const requestUrl = new URL(req.url);
  const pathParts = requestUrl.pathname.split('/').filter(part => part);
  console.log('Path parts:', pathParts);
  
  // Para PUT y DELETE, el slug está en la última parte de la URL
  const urlSlug = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;
  console.log('Extracted slug:', urlSlug);
  
  if (req.method === 'POST') {
    // Crear enlace
    try {
      const body = await req.json();
      console.log('Request body:', body);
      
      const { url, slug } = body;
      
      if (!url) {
        return new Response(JSON.stringify({ error: 'URL is required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      const finalSlug = slug || Math.random().toString(36).substring(2, 8);
      
      if (ultraDb.has(finalSlug)) {
        return new Response(JSON.stringify({ error: 'Slug already exists' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      const metadata = {
        slug: finalSlug,
        url: url,
        createdAt: new Date().toISOString(),
        clicks: 0
      };
      
      ultraDb.set(finalSlug, metadata);
      console.log('Saved to ultra DB fixed:', finalSlug, '->', url);
      
      // Sincronizar con el sistema de redirección
      await syncWithRedirect(finalSlug, url);
      
      return new Response(JSON.stringify({ 
        ok: true, 
        slug: finalSlug, 
        url: url,
        shortUrl: `${requestUrl.origin}/${finalSlug}`
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error in ultra simple fixed POST:', error);
      return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  if (req.method === 'GET') {
    // Obtener historial
    try {
      const history = Array.from(ultraDb.values());
      history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log('Ultra DB fixed history:', history.length, 'entries');
      
      return new Response(JSON.stringify({ 
        ok: true, 
        history: history 
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error in ultra simple fixed GET:', error);
      return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  if (req.method === 'PUT' && urlSlug) {
    // Actualizar enlace
    try {
      const body = await req.json();
      const { url: newUrl } = body;
      
      if (!newUrl) {
        return new Response(JSON.stringify({ error: 'URL is required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      if (!ultraDb.has(urlSlug)) {
        return new Response(JSON.stringify({ error: 'Link not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Actualizar en la base de datos
      const metadata = ultraDb.get(urlSlug);
      metadata.url = newUrl;
      ultraDb.set(urlSlug, metadata);
      
      // Sincronizar con el sistema de redirección
      await syncWithRedirect(urlSlug, newUrl);
      
      console.log('Updated link:', urlSlug, '->', newUrl);
      
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'Link updated successfully' 
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error in ultra simple fixed PUT:', error);
      return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  if (req.method === 'DELETE' && urlSlug) {
    // Eliminar enlace
    try {
      if (!ultraDb.has(urlSlug)) {
        return new Response(JSON.stringify({ error: 'Link not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Eliminar de la base de datos
      ultraDb.delete(urlSlug);
      
      // Eliminar del sistema de redirección
      try {
        const redirectDb = global.redirectDb || new Map();
        redirectDb.delete(urlSlug);
        global.redirectDb = redirectDb;
      } catch (error) {
        console.warn('Failed to remove from redirect system:', error.message);
      }
      
      console.log('Deleted link:', urlSlug);
      
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'Link deleted successfully' 
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error in ultra simple fixed DELETE:', error);
      return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json' }
  });
}
