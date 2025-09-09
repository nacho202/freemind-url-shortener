// api/database.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

// Simulamos una base de datos en memoria (en producción usarías una DB real)
let urlDatabase = new Map();

// Función para inicializar la base de datos desde Vercel KV
async function initializeDatabase() {
  try {
    const keys = await kv.keys('meta:*');
    for (const key of keys) {
      const metadata = await kv.get(key);
      if (metadata) {
        const meta = JSON.parse(metadata);
        urlDatabase.set(meta.slug, meta);
      }
    }
    console.log(`Initialized database with ${urlDatabase.size} entries`);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Función para guardar un enlace
export async function saveUrl(slug, originalUrl, ttl = null) {
  const metadata = {
    slug,
    originalUrl,
    createdAt: new Date().toISOString(),
    clicks: 0,
    ttl
  };

  // Guardar en memoria
  urlDatabase.set(slug, metadata);

  // Guardar en Vercel KV para redirecciones rápidas
  try {
    const opts = ttl ? { ex: Number(ttl) } : undefined;
    await kv.set(`link:${slug}`, originalUrl, opts);
    await kv.set(`meta:${slug}`, JSON.stringify(metadata), opts);
  } catch (error) {
    console.error('Error saving to KV:', error);
  }

  return metadata;
}

// Función para obtener un enlace
export async function getUrl(slug) {
  // Primero intentar desde memoria
  let metadata = urlDatabase.get(slug);
  
  if (!metadata) {
    // Si no está en memoria, intentar desde KV
    try {
      const kvData = await kv.get(`meta:${slug}`);
      if (kvData) {
        metadata = JSON.parse(kvData);
        urlDatabase.set(slug, metadata); // Guardar en memoria
      }
    } catch (error) {
      console.error('Error getting from KV:', error);
    }
  }

  return metadata;
}

// Función para obtener la URL de destino
export async function getDestinationUrl(slug) {
  // Primero intentar desde KV (más rápido)
  try {
    const dest = await kv.get(`link:${slug}`);
    if (dest) return dest;
  } catch (error) {
    console.error('Error getting destination from KV:', error);
  }

  // Si no está en KV, intentar desde memoria
  const metadata = urlDatabase.get(slug);
  return metadata ? metadata.originalUrl : null;
}

// Función para incrementar clicks
export async function incrementClicks(slug) {
  let metadata = urlDatabase.get(slug);
  
  if (metadata) {
    metadata.clicks = (metadata.clicks || 0) + 1;
    urlDatabase.set(slug, metadata);
    
    // Actualizar en KV también
    try {
      await kv.set(`meta:${slug}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error updating clicks in KV:', error);
    }
  }
}

// Función para obtener historial
export async function getHistory() {
  // Si la base de datos está vacía, inicializar desde KV
  if (urlDatabase.size === 0) {
    await initializeDatabase();
  }

  const history = Array.from(urlDatabase.values());
  history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return history;
}

// Función para actualizar URL
export async function updateUrl(slug, newUrl) {
  let metadata = urlDatabase.get(slug);
  
  if (metadata) {
    metadata.originalUrl = newUrl;
    urlDatabase.set(slug, metadata);
    
    // Actualizar en KV también
    try {
      await kv.set(`link:${slug}`, newUrl);
      await kv.set(`meta:${slug}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error updating in KV:', error);
    }
    
    return true;
  }
  
  return false;
}

// Función para eliminar URL
export async function deleteUrl(slug) {
  const exists = urlDatabase.has(slug);
  
  if (exists) {
    urlDatabase.delete(slug);
    
    // Eliminar de KV también
    try {
      await kv.del(`link:${slug}`);
      await kv.del(`meta:${slug}`);
    } catch (error) {
      console.error('Error deleting from KV:', error);
    }
    
    return true;
  }
  
  return false;
}

// Inicializar la base de datos al cargar el módulo
initializeDatabase();
