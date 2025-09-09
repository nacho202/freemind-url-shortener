// api/ultra-simple-v2.js - Versión ultra simplificada sin Vercel KV
export const config = { runtime: 'edge' };

// Base de datos ultra simple
let ultraDb = new Map();

export default async function handler(req) {
  console.log('Ultra simple v2 handler called with method:', req.method);
  
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
      console.log('Saved to ultra DB v2:', finalSlug, '->', url);
      
      return new Response(JSON.stringify({ 
        ok: true, 
        slug: finalSlug, 
        url: url,
        shortUrl: `${new URL(req.url).origin}/${finalSlug}`
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error in ultra simple v2 POST:', error);
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
      
      console.log('Ultra DB v2 history:', history.length, 'entries');
      
      return new Response(JSON.stringify({ 
        ok: true, 
        history: history 
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error in ultra simple v2 GET:', error);
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
