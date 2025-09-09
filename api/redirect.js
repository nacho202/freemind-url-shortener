// api/redirect.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || u.pathname.slice(1);

  // Si es la raíz, servir index.html
  if (!slug || slug === '/') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Freemind Union - Acortador de URLs</title>
          <link rel="stylesheet" href="/styles.css">
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      </head>
      <body>
          <div class="container">
              <header>
                  <h1><i class="fas fa-link"></i> Acortador de URLs</h1>
                  <p>Acorta tus URLs largas de forma rápida y sencilla</p>
              </header>
              <main>
                  <div class="shorten-container">
                      <form id="form">
                          <div class="form-group">
                              <label for="slug">Slug personalizado</label>
                              <input id="slug" placeholder="mi-slug-personalizado" required />
                          </div>
                          <div class="form-group">
                              <label for="url">URL de destino</label>
                              <input id="url" placeholder="https://destino..." required />
                          </div>
                          <div class="form-group">
                              <label for="ttl">TTL en segundos (opcional)</label>
                              <input id="ttl" placeholder="3600" />
                          </div>
                          <button type="submit" class="btn-primary">
                              <i class="fas fa-magic"></i>
                              Crear
                          </button>
                      </form>
                      <pre id="out"></pre>
                  </div>
              </main>
              <footer>
                  <p>&copy; 2025 Freemind Union - Acortador de URLs</p>
              </footer>
          </div>
          <script>
              const out = document.getElementById('out');
              document.getElementById('form').addEventListener('submit', async (e) => {
                  e.preventDefault();
                  const slug = document.getElementById('slug').value.trim();
                  const url  = document.getElementById('url').value.trim();
                  const ttl  = document.getElementById('ttl').value.trim();
                  out.textContent = 'Creando...';
                  const res = await fetch('/api/links', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ slug, url, ttl: ttl ? Number(ttl) : undefined })
                  });
                  const text = await res.text();
                  try {
                      const json = JSON.parse(text);
                      out.textContent = json.ok ? \`✅ \${location.origin}/\${slug}\` : text;
                  } catch {
                      out.textContent = res.ok ? \`✅ \${location.origin}/\${slug}\` : \`⚠️ \${res.status}: \${text}\`;
                  }
              });
          </script>
      </body>
      </html>
    `, {
      headers: { 'content-type': 'text/html' }
    });
  }

  // Si es un archivo estático, devolver 404
  if (slug.includes('.')) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const dest = await kv.get(`link:${slug}`);
    if (typeof dest === 'string' && dest.startsWith('http')) {
      return Response.redirect(dest, 308);
    }
  } catch (error) {
    console.error('Error getting from KV:', error);
  }

  return new Response('Not found', { status: 404 });
}
