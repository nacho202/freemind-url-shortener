// api/simple-redirect-v2.js - Redirección simplificada v2
export const config = { runtime: 'edge' };

// Base de datos simple para redirecciones (debe ser la misma que ultra-simple-v2)
let simpleRedirectDb = new Map();

// Función para obtener datos de ultra-simple-fixed
async function getUltraSimpleData(origin) {
  try {
    const response = await fetch(`${origin}/api/ultra-simple-fixed`);
    if (response.ok) {
      const data = await response.json();
      return data.history || [];
    }
  } catch (error) {
    console.warn('Failed to fetch from ultra-simple-fixed:', error.message);
  }
  return [];
}

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  console.log('Simple redirect v2 handler called with slug:', slug);

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // Buscar en la base de datos local primero
    let dest = simpleRedirectDb.get(slug);
    
    if (!dest) {
      // Si no está en cache, buscar en ultra-simple-v2
      const history = await getUltraSimpleData(new URL(req.url).origin);
      const linkData = history.find(item => item.slug === slug);
      
      if (linkData) {
        dest = linkData.url;
        simpleRedirectDb.set(slug, dest); // Cachear para futuras consultas
        console.log('Found in ultra-simple-fixed DB:', slug, '->', dest);
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
