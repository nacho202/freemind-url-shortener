// api/index.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const html = `
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
                <!-- Sección de Acortar URL -->
                <div class="shorten-container">
                    <h2><i class="fas fa-magic"></i> Crear Enlace Corto</h2>
                    <form id="shortenForm">
                        <div class="form-group">
                            <label for="originalUrl">URL Original</label>
                            <input type="url" id="originalUrl" placeholder="https://ejemplo.com/url-muy-larga" required>
                        </div>
                        <div class="form-group">
                            <label for="customSlug">Slug Personalizado (opcional)</label>
                            <input type="text" id="customSlug" placeholder="mi-enlace-personalizado" pattern="[a-zA-Z0-9-_]+">
                            <small>Si no especificas, se generará automáticamente</small>
                        </div>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-magic"></i> Crear Enlace Corto
                        </button>
                    </form>
                    <div id="result" class="result-container"></div>
                </div>

                <!-- Sección de Historial -->
                <div class="history-container">
                    <h2><i class="fas fa-history"></i> Historial de Enlaces</h2>
                    <button id="refreshHistory" class="btn-secondary">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <div id="historyList" class="history-list"></div>
                </div>
            </main>

            <footer>
                <p>&copy; 2025 Freemind Union - Acortador de URLs</p>
            </footer>
        </div>

        <script>
            // Variables globales
            let history = [];

            // Elementos del DOM
            const shortenForm = document.getElementById('shortenForm');
            const resultDiv = document.getElementById('result');
            const historyList = document.getElementById('historyList');
            const refreshBtn = document.getElementById('refreshHistory');

            // Event Listeners
            shortenForm.addEventListener('submit', handleShorten);
            refreshBtn.addEventListener('click', loadHistory);

            // Cargar historial al inicio
            loadHistory();

            // Función para crear enlace corto
            async function handleShorten(e) {
                e.preventDefault();
                
                const originalUrl = document.getElementById('originalUrl').value.trim();
                const customSlug = document.getElementById('customSlug').value.trim();
                
                if (!originalUrl) {
                    showResult('Por favor, ingresa una URL válida', 'error');
                    return;
                }

                showResult('Creando enlace...', 'loading');

                try {
                    const response = await fetch('/api/links', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            url: originalUrl,
                            slug: customSlug || undefined
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        showResult(\`✅ Enlace creado: \${location.origin}/\${data.slug}\`, 'success');
                        shortenForm.reset();
                        loadHistory(); // Recargar historial
                    } else {
                        showResult(\`❌ Error: \${data.error || 'Error desconocido'}\`, 'error');
                    }
                } catch (error) {
                    showResult(\`❌ Error de conexión: \${error.message}\`, 'error');
                }
            }

            // Función para mostrar resultado
            function showResult(message, type) {
                resultDiv.innerHTML = \`<div class="result \${type}">\${message}</div>\`;
                resultDiv.style.display = 'block';
                
                if (type === 'success') {
                    setTimeout(() => {
                        resultDiv.style.display = 'none';
                    }, 5000);
                }
            }

            // Función para cargar historial
            async function loadHistory() {
                try {
                    const response = await fetch('/api/history');
                    const data = await response.json();
                    
                    if (response.ok) {
                        history = data.history || [];
                        displayHistory(history);
                    } else {
                        historyList.innerHTML = '<p class="error">Error al cargar el historial</p>';
                    }
                } catch (error) {
                    historyList.innerHTML = '<p class="error">Error de conexión al cargar historial</p>';
                }
            }

            // Función para mostrar historial
            function displayHistory(historyData) {
                if (historyData.length === 0) {
                    historyList.innerHTML = '<p class="no-data">No hay enlaces creados aún</p>';
                    return;
                }

                const historyHTML = historyData.map(item => \`
                    <div class="history-item">
                        <div class="history-info">
                            <div class="history-url">
                                <strong>\${item.slug}</strong>
                                <span class="history-original">\${item.originalUrl}</span>
                            </div>
                            <div class="history-stats">
                                <span class="clicks"><i class="fas fa-mouse-pointer"></i> \${item.clicks || 0} clicks</span>
                                <span class="created"><i class="fas fa-calendar"></i> \${formatDate(item.createdAt)}</span>
                            </div>
                        </div>
                        <div class="history-actions">
                            <button onclick="editUrl('\${item.slug}')" class="btn-action edit">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button onclick="viewStats('\${item.slug}')" class="btn-action stats">
                                <i class="fas fa-chart-bar"></i> Stats
                            </button>
                            <button onclick="deleteUrl('\${item.slug}')" class="btn-action delete">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                \`).join('');

                historyList.innerHTML = historyHTML;
            }

            // Función para formatear fecha
            function formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            // Función para editar URL
            async function editUrl(slug) {
                const newUrl = prompt('Ingresa la nueva URL:');
                if (!newUrl) return;

                try {
                    const response = await fetch(\`/api/edit/\${slug}\`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: newUrl })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        showResult('✅ URL actualizada correctamente', 'success');
                        loadHistory();
                    } else {
                        showResult(\`❌ Error: \${data.error}\`, 'error');
                    }
                } catch (error) {
                    showResult(\`❌ Error de conexión: \${error.message}\`, 'error');
                }
            }

            // Función para ver estadísticas
            async function viewStats(slug) {
                try {
                    const response = await fetch(\`/api/stats/\${slug}\`);
                    const data = await response.json();

                    if (response.ok) {
                        const statsHTML = \`
                            <div class="stats-modal">
                                <div class="stats-content">
                                    <h3>Estadísticas de \${slug}</h3>
                                    <div class="stats-info">
                                        <p><strong>URL Original:</strong> \${data.originalUrl}</p>
                                        <p><strong>Total de Clicks:</strong> \${data.totalClicks}</p>
                                        <p><strong>Creado:</strong> \${formatDate(data.createdAt)}</p>
                                    </div>
                                    <button onclick="closeStats()" class="btn-primary">Cerrar</button>
                                </div>
                            </div>
                        \`;
                        document.body.insertAdjacentHTML('beforeend', statsHTML);
                    } else {
                        showResult(\`❌ Error: \${data.error}\`, 'error');
                    }
                } catch (error) {
                    showResult(\`❌ Error de conexión: \${error.message}\`, 'error');
                }
            }

            // Función para cerrar estadísticas
            function closeStats() {
                const modal = document.querySelector('.stats-modal');
                if (modal) modal.remove();
            }

            // Función para eliminar URL
            async function deleteUrl(slug) {
                if (!confirm('¿Estás seguro de que quieres eliminar este enlace?')) {
                    return;
                }

                try {
                    const response = await fetch(\`/api/delete/\${slug}\`, {
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
        </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'content-type': 'text/html',
      'cache-control': 'public, max-age=3600'
    }
  });
}
