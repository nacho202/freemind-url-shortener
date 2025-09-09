// api/simple-links.js - Versión simplificada para testing
export const config = { runtime: 'edge' };

// Base de datos simple en memoria
let simpleDb = new Map();

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  let body = {};
  try { 
    body = await req.json(); 
  } catch { 
    return new Response(JSON.stringify({ error: 'Bad JSON' }), { 
      status: 400,
      headers: { 'content-type': 'application/json' }
    }); 
  }

  const { slug, url, ttl } = body || {};
  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing url' }), { 
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Generar slug automáticamente si no se proporciona
  let finalSlug = slug;
  if (!finalSlug) {
    finalSlug = Math.random().toString(36).substring(2, 8);
  }

  // Validar URL
  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), { 
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Validar slug
  if (!/^[a-zA-Z0-9-_]+$/.test(finalSlug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug format' }), { 
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Verificar si el slug ya existe
  if (simpleDb.has(finalSlug)) {
    return new Response(JSON.stringify({ error: 'Slug already exists' }), { 
      status: 409,
      headers: { 'content-type': 'application/json' }
    });
  }

  // Guardar el enlace
  const metadata = {
    slug: finalSlug,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0,
    ttl
  };

  simpleDb.set(finalSlug, metadata);
  console.log(`Simple DB: Saved ${finalSlug} -> ${url}`);

  return new Response(JSON.stringify({ ok: true, slug: finalSlug, url }), {
    headers: { 'content-type': 'application/json' }
  });
}
