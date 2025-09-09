// api/redirect.js
export const config = { runtime: 'edge' };

// Base de datos simple para redirecciones
let redirectDb = new Map();

// Función para obtener la base de datos global
function getRedirectDb() {
  if (!global.redirectDb) {
    global.redirectDb = new Map();
  }
  return global.redirectDb;
}

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  console.log('Redirect handler called with slug:', slug);

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // Intentar desde la base de datos global primero
    const globalDb = getRedirectDb();
    let dest = globalDb.get(slug);
    
    if (!dest) {
      // Intentar desde la base de datos local
      dest = redirectDb.get(slug);
    }
    
    if (!dest) {
      // Intentar desde Vercel KV como respaldo
      try {
        const { kv } = await import('@vercel/kv');
        dest = await kv.get(`link:${slug}`);
        if (dest) {
          globalDb.set(slug, dest); // Cachear en global
          redirectDb.set(slug, dest); // Cachear en local
        }
      } catch (kvError) {
        console.warn('KV redirect failed:', kvError.message);
      }
    }

    if (typeof dest === 'string' && dest.startsWith('http')) {
      console.log('Redirecting', slug, 'to', dest);
      
      // Incrementar contador de clicks si es posible
      try {
        const { incrementClicks } = await import('./database.js');
        await incrementClicks(slug);
      } catch (error) {
        console.warn('Failed to increment clicks:', error.message);
      }

      return Response.redirect(dest, 308);
    }
  } catch (error) {
    console.error('Error in redirect handler:', error);
  }

  return new Response('Not found', { status: 404 });
}
