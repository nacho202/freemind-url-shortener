// api/test-page.js - Página de prueba simple
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Acortador</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .result { margin-top: 20px; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .history { margin-top: 30px; }
        .history-item { padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🧪 Test Acortador de URLs</h1>
    
    <form id="testForm">
        <div class="form-group">
            <label for="url">URL Original:</label>
            <input type="url" id="url" placeholder="https://ejemplo.com" required>
        </div>
        <div class="form-group">
            <label for="slug">Slug (opcional):</label>
            <input type="text" id="slug" placeholder="mi-enlace">
        </div>
        <button type="submit">Crear Enlace</button>
    </form>
    
    <div id="result"></div>
    
    <div class="history">
        <h3>Historial</h3>
        <button onclick="loadHistory()">Actualizar Historial</button>
        <div id="historyList"></div>
    </div>

    <script>
        document.getElementById('testForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const url = document.getElementById('url').value;
            const slug = document.getElementById('slug').value;
            
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<div class="result">Creando enlace...</div>';
            
            try {
                const response = await fetch('/api/ultra-simple', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url, slug })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <div class="result success">
                            ✅ Enlace creado exitosamente!<br>
                            <strong>URL Corta:</strong> <a href="\${data.shortUrl}" target="_blank">\${data.shortUrl}</a><br>
                            <strong>URL Original:</strong> \${data.url}
                        </div>
                    \`;
                    loadHistory();
                } else {
                    resultDiv.innerHTML = \`<div class="result error">❌ Error: \${data.error}</div>\`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`<div class="result error">❌ Error de conexión: \${error.message}</div>\`;
            }
        });
        
        async function loadHistory() {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = 'Cargando historial...';
            
            try {
                const response = await fetch('/api/ultra-simple');
                const data = await response.json();
                
                if (response.ok) {
                    if (data.history.length === 0) {
                        historyList.innerHTML = '<p>No hay enlaces creados aún.</p>';
                    } else {
                        historyList.innerHTML = data.history.map(item => \`
                            <div class="history-item">
                                <strong>Slug:</strong> \${item.slug}<br>
                                <strong>URL:</strong> \${item.url}<br>
                                <strong>Clicks:</strong> \${item.clicks}<br>
                                <strong>Creado:</strong> \${new Date(item.createdAt).toLocaleString()}
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
        
        // Cargar historial al inicio
        loadHistory();
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html',
    },
  });
}
