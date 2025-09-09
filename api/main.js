// api/main.js - API principal simplificada y funcional
export const config = { runtime: 'edge' };

// Base de datos persistente con Upstash Redis
let db = new Map(); // Cache en memoria para mejor rendimiento

// Funciones para Upstash Redis
async function saveToRedis(slug, data) {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(`link:${slug}`, JSON.stringify(data));
    console.log('Saved to Redis:', slug);
  } catch (error) {
    console.warn('Redis save failed:', error.message);
  }
}

async function getFromRedis(slug) {
  try {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get(`link:${slug}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Redis get failed:', error.message);
    return null;
  }
}

async function deleteFromRedis(slug) {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.del(`link:${slug}`);
    console.log('Deleted from Redis:', slug);
  } catch (error) {
    console.warn('Redis delete failed:', error.message);
  }
}

async function getAllFromRedis() {
  try {
    const { kv } = await import('@vercel/kv');
    const keys = await kv.keys('link:*');
    const links = [];
    
    for (const key of keys) {
      const data = await kv.get(key);
      if (data) {
        links.push(JSON.parse(data));
      }
    }
    
    return links;
  } catch (error) {
    console.warn('Redis get all failed:', error.message);
    return [];
  }
}

export default async function handler(req) {
  console.log('Main handler called:', req.method, req.url);
  
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(part => part);
  
  // Si es una petición a la raíz, mostrar la página principal
  if (url.pathname === '/' || url.pathname === '') {
    return new Response(getMainPage(), {
      headers: { 'content-type': 'text/html' }
    });
  }
  
  // Si es una petición a /api/main, manejar la API
  if (pathParts[0] === 'api' && pathParts[1] === 'main') {
    return handleAPI(req);
  }
  
  // Si no, es una redirección
  const slug = pathParts[0];
  if (slug && !slug.includes('.')) {
    return handleRedirect(slug);
  }
  
  return new Response('Not found', { status: 404 });
}

async function handleAPI(req) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(part => part);
  const slug = pathParts[2]; // Para /api/main/slug
  
  console.log('API call:', req.method, 'slug:', slug);
  
  if (req.method === 'POST') {
    // Crear enlace
    try {
      const body = await req.json();
      const { url: targetUrl, slug: customSlug } = body;
      
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'URL is required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      const finalSlug = customSlug || Math.random().toString(36).substring(2, 8);
      
      // Verificar si existe en Redis
      const existingLink = await getFromRedis(finalSlug);
      if (existingLink) {
        return new Response(JSON.stringify({ error: 'Slug already exists' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      const linkData = {
        slug: finalSlug,
        url: targetUrl,
        createdAt: new Date().toISOString(),
        clicks: 0
      };
      
      // Guardar en memoria y en Redis
      db.set(finalSlug, linkData);
      await saveToRedis(finalSlug, linkData);
      console.log('Created link:', finalSlug, '->', targetUrl);
      
      return new Response(JSON.stringify({
        ok: true,
        slug: finalSlug,
        url: targetUrl,
        shortUrl: `${url.origin}/${finalSlug}`
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error creating link:', error);
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  if (req.method === 'GET') {
    // Obtener historial
    try {
      // Obtener desde Redis (persistente)
      const history = await getAllFromRedis();
      history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return new Response(JSON.stringify({
        ok: true,
        history: history
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error getting history:', error);
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  if (req.method === 'PUT' && slug) {
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
      
      // Obtener desde Redis
      const linkData = await getFromRedis(slug);
      if (!linkData) {
        return new Response(JSON.stringify({ error: 'Link not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Actualizar datos
      linkData.url = newUrl;
      db.set(slug, linkData);
      await saveToRedis(slug, linkData);
      
      console.log('Updated link:', slug, '->', newUrl);
      
      return new Response(JSON.stringify({
        ok: true,
        message: 'Link updated successfully'
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error updating link:', error);
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  if (req.method === 'DELETE' && slug) {
    // Eliminar enlace
    try {
      // Verificar si existe en Redis
      const linkData = await getFromRedis(slug);
      if (!linkData) {
        return new Response(JSON.stringify({ error: 'Link not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Eliminar de memoria y Redis
      db.delete(slug);
      await deleteFromRedis(slug);
      console.log('Deleted link:', slug);
      
      return new Response(JSON.stringify({
        ok: true,
        message: 'Link deleted successfully'
      }), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error deleting link:', error);
      return new Response(JSON.stringify({ error: 'Server error' }), {
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

async function handleRedirect(slug) {
  console.log('Redirect request for slug:', slug);
  
  // Buscar en memoria primero (más rápido)
  let linkData = db.get(slug);
  
  // Si no está en memoria, buscar en Redis
  if (!linkData) {
    linkData = await getFromRedis(slug);
    if (linkData) {
      // Cargar en memoria para futuras consultas
      db.set(slug, linkData);
    }
  }
  
  if (linkData) {
    // Incrementar clicks
    linkData.clicks = (linkData.clicks || 0) + 1;
    db.set(slug, linkData);
    await saveToRedis(slug, linkData);
    
    console.log('Redirecting', slug, 'to', linkData.url);
    return Response.redirect(linkData.url, 302);
  }
  
  console.log('Slug not found:', slug);
  return new Response('Not found', { status: 404 });
}

function getMainPage() {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acortador de URLs</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; font-size: 2.5rem; margin-bottom: 10px; }
        .header p { color: #666; font-size: 1.1rem; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        input { 
            width: 100%; padding: 15px; border: 2px solid #e1e5e9; 
            border-radius: 10px; font-size: 16px; transition: border-color 0.3s ease;
        }
        input:focus { outline: none; border-color: #667eea; }
        .btn-primary {
            width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 15px; border: none; border-radius: 10px;
            font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.2s ease;
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .result { margin-top: 20px; padding: 15px; border-radius: 10px; display: none; }
        .result.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .result.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .result.loading { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .history-container { margin-top: 30px; padding-top: 30px; border-top: 2px solid #e1e5e9; }
        .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .history-header h2 { color: #333; font-size: 1.5rem; }
        .btn-secondary { background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
        .btn-secondary:hover { background: #5a6268; }
        .history-item { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; margin-bottom: 15px; }
        .history-url { font-weight: 600; color: #333; margin-bottom: 5px; }
        .history-original { color: #666; font-size: 14px; margin-bottom: 10px; word-break: break-all; }
        .history-actions { display: flex; gap: 10px; margin-top: 10px; }
        .btn-edit, .btn-delete { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .btn-edit { background: #007bff; color: white; }
        .btn-edit:hover { background: #0056b3; }
        .btn-delete { background: #dc3545; color: white; }
        .btn-delete:hover { background: #c82333; }
        .no-data { text-align: center; color: #666; font-style: italic; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔗 Acortador de URLs</h1>
            <p>Convierte tus enlaces largos en URLs cortas y fáciles de compartir</p>
        </div>

        <form id="urlForm">
            <div class="form-group">
                <label for="originalUrl">URL Original</label>
                <input type="url" id="originalUrl" placeholder="https://ejemplo.com/url-muy-larga" required>
            </div>
            <div class="form-group">
                <label for="customSlug">Slug Personalizado (opcional)</label>
                <input type="text" id="customSlug" placeholder="mi-enlace-personalizado">
            </div>
            <button type="submit" class="btn-primary">Crear Enlace Corto</button>
        </form>

        <div id="result" class="result"></div>

        <div class="history-container">
            <div class="history-header">
                <h2>📋 Historial de Enlaces</h2>
                <button id="refreshHistory" class="btn-secondary">Actualizar</button>
            </div>
            <div id="historyList" class="no-data">Cargando historial...</div>
        </div>
    </div>

    <script>
        function showResult(message, type) {
            const result = document.getElementById('result');
            result.innerHTML = message;
            result.className = 'result ' + type;
            result.style.display = 'block';
            
            if (type === 'error') {
                setTimeout(() => {
                    result.style.display = 'none';
                }, 5000);
            }
        }

        document.getElementById('urlForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const originalUrl = document.getElementById('originalUrl').value.trim();
            const customSlug = document.getElementById('customSlug').value.trim();
            
            if (!originalUrl) {
                showResult('Por favor, ingresa una URL válida', 'error');
                return;
            }

            showResult('Creando enlace...', 'loading');

            try {
                const response = await fetch('/api/main', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: originalUrl, slug: customSlug })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showResult(\`
                        ✅ Enlace creado exitosamente!<br>
                        <strong>URL Corta:</strong> <a href="\${data.shortUrl}" target="_blank">\${data.shortUrl}</a><br>
                        <strong>URL Original:</strong> \${data.url}
                    \`, 'success');
                    loadHistory();
                } else {
                    showResult(\`❌ Error: \${data.error}\`, 'error');
                }
            } catch (error) {
                showResult(\`❌ Error de conexión: \${error.message}\`, 'error');
            }
        });

        async function loadHistory() {
            const historyList = document.getElementById('historyList');
            
            try {
                const response = await fetch('/api/main');
                const data = await response.json();
                
                if (response.ok) {
                    if (data.history.length === 0) {
                        historyList.innerHTML = '<div class="no-data">No hay enlaces creados aún</div>';
                    } else {
                        historyList.innerHTML = data.history.map(item => \`
                            <div class="history-item">
                                <div class="history-url">
                                    <a href="\${window.location.origin}/\${item.slug}" target="_blank">
                                        \${window.location.origin}/\${item.slug}
                                    </a>
                                </div>
                                <div class="history-original">\${item.url}</div>
                                <div class="history-actions">
                                    <button onclick="editLink('\${item.slug}', '\${item.url}')" class="btn-edit">Editar</button>
                                    <button onclick="deleteLink('\${item.slug}')" class="btn-delete">Eliminar</button>
                                </div>
                            </div>
                        \`).join('');
                    }
                } else {
                    historyList.innerHTML = \`<div class="result error">Error: \${data.error}</div>\`;
                }
            } catch (error) {
                historyList.innerHTML = \`<div class="result error">Error de conexión: \${error.message}</div>\`;
            }
        }

        document.getElementById('refreshHistory').addEventListener('click', loadHistory);

        async function editLink(slug, currentUrl) {
            const newUrl = prompt('Ingresa la nueva URL de destino:', currentUrl);
            if (!newUrl || newUrl === currentUrl) return;

            try {
                const response = await fetch(\`/api/main/\${slug}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: newUrl })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showResult('✅ Enlace actualizado correctamente', 'success');
                    loadHistory();
                } else {
                    showResult(\`❌ Error: \${data.error}\`, 'error');
                }
            } catch (error) {
                showResult(\`❌ Error de conexión: \${error.message}\`, 'error');
            }
        }

        async function deleteLink(slug) {
            if (!confirm('¿Estás seguro de que quieres eliminar este enlace?')) return;

            try {
                const response = await fetch(\`/api/main/\${slug}\`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showResult('✅ Enlace eliminado correctamente', 'success');
                    loadHistory();
                } else {
                    showResult(\`❌ Error: \${data.error}\`, 'error');
                }
            } catch (error) {
                showResult(\`❌ Error de conexión: \${error.message}\`, 'error');
            }
        }

        loadHistory();
    </script>
</body>
</html>`;
}
