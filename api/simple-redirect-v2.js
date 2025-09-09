// api/simple-redirect-v2.js - Redirección simplificada v2
export const config = { runtime: 'edge' };

// Base de datos simple para redirecciones (debe ser la misma que ultra-simple-v2)
let simpleRedirectDb = new Map();

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  console.log('Simple redirect v2 handler called with slug:', slug);

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // Buscar en la base de datos local
    let dest = simpleRedirectDb.get(slug);
    
    if (!dest) {
      // Intentar desde la base de datos ultra-simple-v2
      try {
        const ultraResponse = await fetch(`${new URL(req.url).origin}/api/ultra-simple-v2`);
        if (ultraResponse.ok) {
          const ultraData = await ultraResponse.json();
          const linkData = ultraData.history.find(item => item.slug === slug);
          if (linkData) {
            dest = linkData.url;
            simpleRedirectDb.set(slug, dest); // Cachear
            console.log('Found in ultra-simple-v2 DB:', slug, '->', dest);
          }
        }
      } catch (error) {
        console.warn('Ultra-simple-v2 lookup failed:', error.message);
      }
    }

    if (typeof dest === 'string' && dest.startsWith('http')) {
      console.log('Redirecting', slug, 'to', dest);
      return Response.redirect(dest, 308);
    }
  } catch (error) {
    console.error('Error in simple redirect v2 handler:', error);
  }

  return new Response('Not found', { status: 404 });
}
