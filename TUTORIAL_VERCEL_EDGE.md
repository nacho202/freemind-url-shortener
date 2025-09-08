# 🚀 Tutorial: Acortador de URLs con Vercel Edge Functions + Upstash Redis

## 📋 Requisitos Previos

- ✅ Cuenta de Vercel (gratuita)
- ✅ Cuenta de GitHub (gratuita)
- ✅ Cuenta de Upstash (gratuita)
- ✅ Git instalado en tu computadora

## 🎯 Paso 1: Configurar Upstash Redis

### 1.1 Crear cuenta en Upstash
1. Ve a [upstash.com](https://upstash.com)
2. Haz clic en "Sign Up" (gratuito)
3. Conecta con GitHub o crea cuenta con email

### 1.2 Crear base de datos Redis
1. En el dashboard de Upstash, haz clic en "Create Database"
2. Nombre: `freemind-url-shortener`
3. Región: Elige la más cercana a tus usuarios
4. Haz clic en "Create"

### 1.3 Obtener credenciales
1. Ve a tu base de datos creada
2. Haz clic en "Details"
3. Copia:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

## 🌐 Paso 2: Preparar el Proyecto

### 2.1 Verificar archivos
Asegúrate de tener esta estructura:
```
📁 Proyecto/
├── api/
│   ├── links.js ✅
│   └── redirect.js ✅
├── public/
│   ├── index.html ✅
│   └── styles.css ✅
├── package.json ✅
├── vercel.json ✅
├── .gitignore ✅
└── env.example ✅
```

### 2.2 Inicializar Git
```bash
git init
git add .
git commit -m "Initial commit - Edge Functions + Redis"
```

## ⚡ Paso 3: Subir a GitHub

### 3.1 Crear repositorio
1. Ve a [github.com](https://github.com)
2. "New repository"
3. Nombre: `freemind-url-shortener`
4. **Público** (necesario para Vercel gratuito)
5. **NO** marques "Add README"
6. "Create repository"

### 3.2 Subir código
```bash
git remote add origin https://github.com/TU_USUARIO/freemind-url-shortener.git
git branch -M main
git push -u origin main
```

## 🚀 Paso 4: Desplegar en Vercel

### 4.1 Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. "Sign Up" con GitHub
3. "New Project"
4. Selecciona tu repositorio
5. "Import"

### 4.2 Configurar variables de entorno
En la sección "Environment Variables", agrega:
- `UPSTASH_REDIS_REST_URL` = `tu_url_de_upstash`
- `UPSTASH_REDIS_REST_TOKEN` = `tu_token_de_upstash`
- `ADMIN_TOKEN` = `tu_token_secreto` (opcional)

### 4.3 Desplegar
1. Haz clic en "Deploy"
2. Espera 1-2 minutos
3. ¡Listo! Tu acortador está funcionando

## 🔧 Paso 5: Configurar Dominio Personalizado

### 5.1 En Vercel
1. Ve a tu proyecto en Vercel
2. "Settings" → "Domains"
3. Agrega: `short.freemindunion.info`
4. "Add"

### 5.2 En Hostinger (DNS)
1. Panel de control de Hostinger
2. "DNS Zone Editor"
3. Agrega CNAME:
   - **Name**: `short`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `3600`

### 5.3 Verificar
- Espera 5-10 minutos
- Ve a `https://short.freemindunion.info`
- ¡Debería funcionar!

## 🎯 Paso 6: Probar la Aplicación

### 6.1 Crear un enlace
1. Ve a tu dominio
2. Ingresa un slug: `test`
3. Ingresa una URL: `https://google.com`
4. Haz clic en "Crear"
5. Deberías ver: `✅ https://tudominio.com/test`

### 6.2 Probar redirección
1. Ve a `https://tudominio.com/test`
2. Deberías ser redirigido a Google

## 🔄 Paso 7: Actualizaciones Futuras

### 7.1 Hacer cambios
```bash
# Edita los archivos
git add .
git commit -m "Descripción del cambio"
git push origin main
```

### 7.2 Despliegue automático
- Vercel detecta cambios automáticamente
- Despliega en 1-2 minutos
- Sin configuración adicional

## 🛠️ Configuraciones Avanzadas

### 7.1 Token de administración
Si quieres proteger la creación de enlaces:
1. En Vercel, agrega variable: `ADMIN_TOKEN = tu_token_secreto`
2. En el HTML, descomenta la línea de Authorization
3. Cambia `TU_ADMIN_TOKEN` por tu token real

### 7.2 TTL (Time To Live)
- Los enlaces pueden tener expiración automática
- Ingresa segundos en el campo TTL
- Ejemplo: `3600` = 1 hora

### 7.3 Monitoreo
- Ve a "Functions" en Vercel para ver logs
- Upstash tiene métricas de uso
- Monitorea el rendimiento

## 🚨 Solución de Problemas

### Problema: Error 500 al crear enlace
**Solución:**
1. Verifica las variables de entorno en Vercel
2. Revisa los logs en Vercel Functions
3. Asegúrate de que Upstash esté funcionando

### Problema: Redirección no funciona
**Solución:**
1. Verifica que el slug existe en Redis
2. Revisa los logs de la función redirect
3. Asegúrate de que la URL empiece con `http`

### Problema: Dominio no funciona
**Solución:**
1. Verifica DNS en Hostinger
2. Espera hasta 24 horas para propagación
3. Usa `nslookup` para verificar

## 📊 Ventajas de Edge Functions + Redis

### ✅ Edge Functions
- **Máximo rendimiento** (ejecuta cerca del usuario)
- **Escalado automático** (sin límites)
- **Sin servidor** que mantener
- **Cold start mínimo**

### ✅ Upstash Redis
- **Persistencia real** (no se pierden datos)
- **TTL automático** para enlaces temporales
- **Métricas de uso** incluidas
- **Backup automático**

## 🎯 Checklist Final

- [ ] ✅ Cuenta Upstash creada
- [ ] ✅ Base de datos Redis creada
- [ ] ✅ Credenciales copiadas
- [ ] ✅ Repositorio GitHub creado
- [ ] ✅ Código subido a GitHub
- [ ] ✅ Proyecto importado en Vercel
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Despliegue exitoso
- [ ] ✅ Dominio personalizado configurado
- [ ] ✅ DNS configurado en Hostinger
- [ ] ✅ Aplicación funcionando correctamente
- [ ] ✅ Enlace de prueba creado
- [ ] ✅ Redirección funcionando

## 🎉 ¡Listo!

Tu acortador de URLs está ahora:
- ✅ **Desplegado en Vercel Edge Functions** (máximo rendimiento)
- ✅ **Con Upstash Redis** (persistencia real)
- ✅ **Con tu dominio personalizado**
- ✅ **Con SSL automático** y CDN global
- ✅ **Con despliegue automático** desde GitHub
- ✅ **Listo para producción** y uso real

### 🔗 URLs importantes:
- **Aplicación**: `https://short.freemindunion.info`
- **Dashboard Vercel**: `https://vercel.com/dashboard`
- **Dashboard Upstash**: `https://console.upstash.com`
- **Repositorio GitHub**: `https://github.com/TU_USUARIO/freemind-url-shortener`

---

**Desarrollado con ❤️ para Freemind Union**
*"Ayuda a tus pequeños a crecer en emociones y ser felices"*
