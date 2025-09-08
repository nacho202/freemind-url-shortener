// Configuración de ejemplo para Freemind Union URL Shortener
// Copia este archivo como config.js y modifica los valores según tu entorno

module.exports = {
    // Entorno de ejecución
    NODE_ENV: process.env.NODE_ENV || 'production',
    
    // Puerto del servidor
    PORT: process.env.PORT || 3000,
    
    // Configuración de la base de datos
    DB_PATH: 'urls.db',
    
    // Configuración del dominio
    DOMAIN: process.env.DOMAIN || 'https://tudominio.com',
    
    // Configuración de CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    
    // Configuración de logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
