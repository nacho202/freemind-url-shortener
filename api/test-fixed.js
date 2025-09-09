// api/test-fixed.js - Prueba simple del sistema
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - Acortador de URLs</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test { margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🧪 Test del Acortador de URLs</h1>
    
    <div class="test">
        <h3>Test 1: Crear Enlace</h3>
        <button onclick="testCreate()">Crear Enlace de Prueba</button>
        <div id="createResult"></div>
    </div>
    
    <div class="test">
        <h3>Test 2: Obtener Historial</h3>
        <button onclick="testHistory()">Obtener Historial</button>
        <div id="historyResult"></div>
    </div>
    
    <div class="test">
        <h3>Test 3: Redirección</h3>
        <button onclick="testRedirect()">Probar Redirección</button>
        <div id="redirectResult"></div>
    </div>

    <script>
        async function testCreate() {
            const result = document.getElementById('createResult');
            result.innerHTML = 'Creando...';
            
            try {
                const response = await fetch('/api/ultra-simple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        url: 'https://google.com', 
                        slug: 'test-' + Date.now() 
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    result.innerHTML = \`<div class="success">✅ Éxito: \${data.shortUrl}</div>\`;
                } else {
                    result.innerHTML = \`<div class="error">❌ Error: \${data.error}</div>\`;
                }
            } catch (error) {
                result.innerHTML = \`<div class="error">❌ Error de conexión: \${error.message}</div>\`;
            }
        }
        
        async function testHistory() {
            const result = document.getElementById('historyResult');
            result.innerHTML = 'Cargando...';
            
            try {
                const response = await fetch('/api/ultra-simple');
                const data = await response.json();
                
                if (response.ok) {
                    result.innerHTML = \`<div class="success">✅ Historial: \${data.history.length} enlaces</div>\`;
                } else {
                    result.innerHTML = \`<div class="error">❌ Error: \${data.error}</div>\`;
                }
            } catch (error) {
                result.innerHTML = \`<div class="error">❌ Error de conexión: \${error.message}</div>\`;
            }
        }
        
        async function testRedirect() {
            const result = document.getElementById('redirectResult');
            result.innerHTML = 'Probando...';
            
            try {
                // Crear un enlace de prueba
                const createResponse = await fetch('/api/ultra-simple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        url: 'https://github.com', 
                        slug: 'redirect-test-' + Date.now() 
                    })
                });
                
                if (createResponse.ok) {
                    const createData = await createResponse.json();
                    const testSlug = createData.slug;
                    
                    // Probar redirección
                    const redirectResponse = await fetch(\`/\${testSlug}\`, { 
                        method: 'HEAD',
                        redirect: 'manual'
                    });
                    
                    if (redirectResponse.status === 308) {
                        result.innerHTML = \`<div class="success">✅ Redirección funciona: \${testSlug}</div>\`;
                    } else {
                        result.innerHTML = \`<div class="error">❌ Redirección falló: Status \${redirectResponse.status}</div>\`;
                    }
                } else {
                    result.innerHTML = \`<div class="error">❌ No se pudo crear enlace de prueba</div>\`;
                }
            } catch (error) {
                result.innerHTML = \`<div class="error">❌ Error: \${error.message}</div>\`;
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html' }
  });
}
