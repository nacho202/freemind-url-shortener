const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración para producción
if (NODE_ENV === 'production') {
    console.log('🚀 Modo producción activado');
} else {
    console.log('🔧 Modo desarrollo activado');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware de logging para producción
if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// Base de datos SQLite
const db = new sqlite3.Database('urls.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0
  )`, (err) => {
    if (err) {
      console.log('Error creando tabla urls:', err);
    } else {
      console.log('Tabla urls creada correctamente');
    }
  });
  
});

// Función para validar URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Función para validar código personalizado
function isValidCustomCode(code) {
  // Solo permite letras, números y guiones, entre 3 y 20 caracteres
  const regex = /^[a-zA-Z0-9-]{3,20}$/;
  return regex.test(code);
}

// Endpoint para acortar URL
app.post('/api/shorten', (req, res) => {
  const { url, customCode } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL es requerida' });
  }
  
  // Agregar protocolo si no existe
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = 'https://' + url;
  }
  
  if (!isValidUrl(fullUrl)) {
    return res.status(400).json({ error: 'URL inválida' });
  }
  
  // Validar código personalizado si se proporciona
  if (customCode) {
    if (!isValidCustomCode(customCode)) {
      return res.status(400).json({ error: 'Código personalizado inválido. Solo se permiten letras, números y guiones.' });
    }
    
    // Verificar si el código personalizado ya existe
    db.get(
      'SELECT short_code FROM urls WHERE short_code = ?',
      [customCode],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (row) {
          return res.status(400).json({ error: 'El código personalizado ya está en uso' });
        }
        
        // Insertar con código personalizado
        db.run(
          'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
          [fullUrl, customCode],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error interno del servidor' });
            }
            res.json({
              originalUrl: fullUrl,
              shortUrl: `${req.protocol}://${req.get('host')}/${customCode}`,
              shortCode: customCode
            });
          }
        );
      }
    );
  } else {
    // Generar código corto único automáticamente
    const shortCode = nanoid(8);
    
    // Insertar en la base de datos
    db.run(
      'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
      [fullUrl, shortCode],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            // Si el código ya existe, generar uno nuevo
            const newShortCode = nanoid(8);
            db.run(
              'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
              [fullUrl, newShortCode],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Error interno del servidor' });
                }
                res.json({
                  originalUrl: fullUrl,
                  shortUrl: `${req.protocol}://${req.get('host')}/${newShortCode}`,
                  shortCode: newShortCode
                });
              }
            );
          } else {
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
        } else {
          res.json({
            originalUrl: fullUrl,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            shortCode: shortCode
          });
        }
      }
    );
  }
});

// Endpoint para obtener estadísticas
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  db.get(
    'SELECT original_url, short_code, created_at, clicks FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'URL no encontrada' });
      }
      
      res.json({
        originalUrl: row.original_url,
        shortCode: row.short_code,
        createdAt: row.created_at,
        clicks: row.clicks,
        shortUrl: `${req.protocol}://${req.get('host')}/${row.short_code}`
      });
    }
  );
});

// Endpoint para obtener estadísticas detalladas
app.get('/api/detailed-stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  // Obtener información básica de la URL
  db.get(
    'SELECT original_url, short_code, created_at, clicks FROM urls WHERE short_code = ?',
    [shortCode],
    (err, urlRow) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!urlRow) {
        return res.status(404).json({ error: 'URL no encontrada' });
      }
      
      res.json({
        urlInfo: {
          originalUrl: urlRow.original_url,
          shortCode: urlRow.short_code,
          createdAt: urlRow.created_at,
          totalClicks: urlRow.clicks,
          shortUrl: `${req.protocol}://${req.get('host')}/${urlRow.short_code}`
        }
      });
    }
  );
});


// Endpoint para obtener historial de URLs
app.get('/api/history', (req, res) => {
  db.all(
    'SELECT original_url, short_code, created_at, clicks FROM urls ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      const history = rows.map(row => ({
        originalUrl: row.original_url,
        shortCode: row.short_code,
        createdAt: row.created_at,
        clicks: row.clicks,
        shortUrl: `${req.protocol}://${req.get('host')}/${row.short_code}`
      }));
      
      res.json(history);
    }
  );
});

// Endpoint para editar URL original
app.put('/api/edit-url/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const { newUrl } = req.body;
  
  if (!newUrl) {
    return res.status(400).json({ error: 'Nueva URL es requerida' });
  }
  
  // Agregar protocolo si no existe
  let fullUrl = newUrl;
  if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
    fullUrl = 'https://' + newUrl;
  }
  
  if (!isValidUrl(fullUrl)) {
    return res.status(400).json({ error: 'URL inválida' });
  }
  
  // Verificar que el código corto existe
  db.get(
    'SELECT short_code FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'URL no encontrada' });
      }
      
      // Actualizar la URL original
      db.run(
        'UPDATE urls SET original_url = ? WHERE short_code = ?',
        [fullUrl, shortCode],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          
          res.json({
            success: true,
            message: 'URL actualizada correctamente',
            originalUrl: fullUrl,
            shortCode: shortCode,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`
          });
        }
      );
    }
  );
});

// Endpoint para editar código personalizado
app.put('/api/edit-code/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const { newCode } = req.body;
  
  if (!newCode) {
    return res.status(400).json({ error: 'Nuevo código es requerido' });
  }
  
  if (!isValidCustomCode(newCode)) {
    return res.status(400).json({ error: 'Código personalizado inválido. Solo se permiten letras, números y guiones (3-20 caracteres).' });
  }
  
  // Verificar que el código actual existe
  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'URL no encontrada' });
      }
      
      // Verificar que el nuevo código no existe
      db.get(
        'SELECT short_code FROM urls WHERE short_code = ?',
        [newCode],
        (err, existingRow) => {
          if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          
          if (existingRow) {
            return res.status(400).json({ error: 'El código personalizado ya está en uso' });
          }
          
          // Actualizar el código corto
          db.run(
            'UPDATE urls SET short_code = ? WHERE short_code = ?',
            [newCode, shortCode],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
              }
              
              res.json({
                success: true,
                message: 'Código actualizado correctamente',
                originalUrl: row.original_url,
                shortCode: newCode,
                shortUrl: `${req.protocol}://${req.get('host')}/${newCode}`
              });
            }
          );
        }
      );
    }
  );
});

// Endpoint para eliminar URL
app.delete('/api/delete/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  // Verificar que la URL existe
  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'URL no encontrada' });
      }
      
      // Eliminar la URL
      db.run(
        'DELETE FROM urls WHERE short_code = ?',
        [shortCode],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          
          res.json({
            success: true,
            message: 'URL eliminada correctamente',
            shortCode: shortCode
          });
        }
      );
    }
  );
});

// Servir el archivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para redirigir URL corta (DEBE IR AL FINAL)
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'URL no encontrada' });
      }
      
      // Incrementar contador de clicks
      db.run(
        'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
        [shortCode]
      );
      
      res.redirect(row.original_url);
    }
  );
});

// Iniciar servidor solo si no está en Vercel
if (NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;

// Cerrar base de datos al terminar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Base de datos cerrada.');
    process.exit(0);
  });
});
