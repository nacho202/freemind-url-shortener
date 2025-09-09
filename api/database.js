// api/database.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

// Base de datos en memoria global
let urlDatabase = new Map();

// Función para obtener la instancia global de la base de datos
function getDatabase() {
  if (!global.urlDatabase) {
    global.urlDatabase = new Map();
  }
  return global.urlDatabase;
}

// Función para inicializar la base de datos desde Vercel KV
async function initializeDatabase() {
  try {
    const db = getDatabase();
    const keys = await kv.keys('meta:*');
    console.log('Found KV keys:', keys);
    
    for (const key of keys) {
      const metadata = await kv.get(key);
      if (metadata) {
        const meta = JSON.parse(metadata);
        db.set(meta.slug, meta);
        console.log(`Loaded from KV: ${meta.slug} -> ${meta.originalUrl}`);
      }
    }
    console.log(`Initialized database with ${db.size} entries`);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Función para guardar un enlace
export async function saveUrl(slug, originalUrl, ttl = null) {
  try {
    const db = getDatabase();
    const metadata = {
      slug,
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
      ttl
    };

    // Guardar en memoria
    db.set(slug, metadata);
    console.log(`Saved to memory: ${slug} -> ${originalUrl}`);

    // Intentar guardar en Vercel KV (opcional)
    try {
      const opts = ttl ? { ex: Number(ttl) } : undefined;
      await kv.set(`link:${slug}`, originalUrl, opts);
      await kv.set(`meta:${slug}`, JSON.stringify(metadata), opts);
      console.log(`Saved to KV: ${slug} -> ${originalUrl}`);
    } catch (kvError) {
      console.warn('KV save failed, continuing with memory only:', kvError.message);
    }

    return metadata;
  } catch (error) {
    console.error('Error in saveUrl:', error);
    throw error;
  }
}

// Función para obtener un enlace
export async function getUrl(slug) {
  const db = getDatabase();
  // Primero intentar desde memoria
  let metadata = db.get(slug);
  
  if (!metadata) {
    // Si no está en memoria, intentar desde KV
    try {
      const kvData = await kv.get(`meta:${slug}`);
      if (kvData) {
        metadata = JSON.parse(kvData);
        db.set(slug, metadata); // Guardar en memoria
      }
    } catch (error) {
      console.error('Error getting from KV:', error);
    }
  }

  return metadata;
}

// Función para obtener la URL de destino
export async function getDestinationUrl(slug) {
  try {
    // Primero intentar desde memoria
    const db = getDatabase();
    const metadata = db.get(slug);
    if (metadata) {
      return metadata.originalUrl;
    }

    // Si no está en memoria, intentar desde KV
    try {
      const dest = await kv.get(`link:${slug}`);
      if (dest) {
        // Cargar metadata también para cachear
        const kvMetadata = await kv.get(`meta:${slug}`);
        if (kvMetadata) {
          const meta = JSON.parse(kvMetadata);
          db.set(slug, meta);
        }
        return dest;
      }
    } catch (kvError) {
      console.warn('KV get failed:', kvError.message);
    }

    return null;
  } catch (error) {
    console.error('Error getting destination URL:', error);
    return null;
  }
}

// Función para incrementar clicks
export async function incrementClicks(slug) {
  const db = getDatabase();
  let metadata = db.get(slug);
  
  if (metadata) {
    metadata.clicks = (metadata.clicks || 0) + 1;
    db.set(slug, metadata);
    
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
  try {
    const db = getDatabase();
    
    // Si la base de datos está vacía, intentar inicializar desde KV
    if (db.size === 0) {
      try {
        await initializeDatabase();
      } catch (error) {
        console.warn('Failed to initialize from KV, using memory only:', error.message);
      }
    }

    const history = Array.from(db.values());
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(`Returning history with ${history.length} entries`);
    return history;
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

// Función para actualizar URL
export async function updateUrl(slug, newUrl) {
  const db = getDatabase();
  let metadata = db.get(slug);
  
  if (metadata) {
    metadata.originalUrl = newUrl;
    db.set(slug, metadata);
    
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

// Función para actualizar slug
export async function updateSlug(oldSlug, newSlug, newUrl) {
  const db = getDatabase();
  let metadata = db.get(oldSlug);
  
  if (metadata) {
    // Verificar que el nuevo slug no existe
    if (db.has(newSlug)) {
      return { success: false, error: 'New slug already exists' };
    }
    
    // Actualizar metadatos
    metadata.slug = newSlug;
    metadata.originalUrl = newUrl;
    
    // Eliminar el slug viejo
    db.delete(oldSlug);
    db.set(newSlug, metadata);
    
    // Actualizar en KV también
    try {
      // Eliminar datos viejos
      await kv.del(`link:${oldSlug}`);
      await kv.del(`meta:${oldSlug}`);
      
      // Crear datos nuevos
      await kv.set(`link:${newSlug}`, newUrl);
      await kv.set(`meta:${newSlug}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error updating slug in KV:', error);
    }
    
    return { success: true, metadata };
  }
  
  return { success: false, error: 'Original slug not found' };
}

// Función para eliminar URL
export async function deleteUrl(slug) {
  const db = getDatabase();
  const exists = db.has(slug);
  
  if (exists) {
    db.delete(slug);
    
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
