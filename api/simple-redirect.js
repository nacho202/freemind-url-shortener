// api/simple-redirect.js - Redirección simplificada
export const config = { runtime: 'edge' };

// Base de datos simple para redirecciones
let simpleRedirectDb = new Map();

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  console.log('Simple redirect handler called with slug:', slug);

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // Intentar desde la base de datos local primero
    let dest = simpleRedirectDb.get(slug);
    
    if (!dest) {
      // Intentar desde la base de datos ultra-simple
      try {
        const ultraResponse = await fetch(`${new URL(req.url).origin}/api/ultra-simple`);
        if (ultraResponse.ok) {
          const ultraData = await ultraResponse.json();
          const linkData = ultraData.history.find(item => item.slug === slug);
          if (linkData) {
            dest = linkData.url;
            simpleRedirectDb.set(slug, dest); // Cachear
            console.log('Found in ultra-simple DB:', slug, '->', dest);
          }
        }
      } catch (error) {
        console.warn('Ultra-simple lookup failed:', error.message);
      }
    }
    
    if (!dest) {
      // Intentar desde Vercel KV como respaldo
      try {
        const { kv } = await import('@vercel/kv');
        dest = await kv.get(`link:${slug}`);
        if (dest) {
          simpleRedirectDb.set(slug, dest); // Cachear
        }
      } catch (kvError) {
        console.warn('KV redirect failed:', kvError.message);
      }
    }

    if (typeof dest === 'string' && dest.startsWith('http')) {
      console.log('Redirecting', slug, 'to', dest);
      return Response.redirect(dest, 308);
    }
  } catch (error) {
    console.error('Error in simple redirect handler:', error);
  }

  return new Response('Not found', { status: 404 });
}
