# 🚀 Tutorial Completo: Subir Acortador de URLs a Vercel

## 📋 Requisitos Previos

- ✅ Cuenta de Vercel (gratuita)
- ✅ Cuenta de GitHub (gratuita)
- ✅ Git instalado en tu computadora
- ✅ Archivos del proyecto listos

## 🎯 Paso 1: Preparar el Proyecto Localmente

### 1.1 Verificar archivos necesarios
Asegúrate de tener estos archivos en tu proyecto:
```
📁 Proyecto/
├── server.js ✅
├── package.json ✅
├── vercel.json ✅
├── .gitignore ✅
└── 📁 public/
    ├── index.html ✅
    ├── script.js ✅
    └── styles.css ✅
```

### 1.2 Inicializar Git (si no lo has hecho)
```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit - Freemind Union URL Shortener"
```

## 🌐 Paso 2: Crear Repositorio en GitHub

### 2.1 Crear nuevo repositorio
1. Ve a [github.com](https://github.com)
2. Haz clic en "New repository"
3. Nombre: `freemind-url-shortener`
4. Descripción: `Acortador de URLs para Freemind Union`
5. Marca como **Público** (necesario para Vercel gratuito)
6. **NO** marques "Add README" (ya tienes archivos)
7. Haz clic en "Create repository"

### 2.2 Subir código a GitHub
```bash
# Conecta tu repositorio local con GitHub
git remote add origin https://github.com/TU_USUARIO/freemind-url-shortener.git

# Sube el código
git branch -M main
git push -u origin main
```

## ⚡ Paso 3: Configurar Vercel

### 3.1 Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza Vercel para acceder a tu GitHub

### 3.2 Importar proyecto
1. En el dashboard de Vercel, haz clic en "New Project"
2. Selecciona tu repositorio `freemind-url-shortener`
3. Haz clic en "Import"

### 3.3 Configurar el proyecto
Vercel detectará automáticamente que es un proyecto Node.js. Verifica que:
- **Framework Preset**: Other
- **Root Directory**: `./` (raíz)
- **Build Command**: `npm run build` (o déjalo vacío)
- **Output Directory**: (déjalo vacío)
- **Install Command**: `npm install`

### 3.4 Variables de entorno
En la sección "Environment Variables", agrega:
- `NODE_ENV` = `production`

### 3.5 Desplegar
1. Haz clic en "Deploy"
2. Espera 2-3 minutos mientras Vercel:
   - Instala las dependencias
   - Construye el proyecto
   - Despliega la aplicación

## 🎉 Paso 4: Verificar el Despliegue

### 4.1 URL de Vercel
Después del despliegue, Vercel te dará una URL como:
`https://freemind-url-shortener-abc123.vercel.app`

### 4.2 Probar la aplicación
1. Abre la URL en tu navegador
2. Deberías ver el acortador de Freemind Union
3. Prueba acortar una URL
4. Verifica que todas las funciones trabajen

## 🔧 Paso 5: Configurar Dominio Personalizado

### 5.1 Agregar dominio en Vercel
1. En el dashboard de Vercel, ve a tu proyecto
2. Haz clic en "Settings" → "Domains"
3. Agrega tu dominio: `short.freemindunion.info`
4. Haz clic en "Add"

### 5.2 Configurar DNS en Hostinger
1. Ve al panel de control de Hostinger
2. Ve a "DNS Zone Editor"
3. Agrega un registro CNAME:
   - **Name**: `short`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `3600`

### 5.3 Verificar dominio
1. Espera 5-10 minutos para que se propague el DNS
2. Ve a `https://short.freemindunion.info`
3. Deberías ver tu acortador funcionando

## 🔄 Paso 6: Actualizaciones Futuras

### 6.1 Hacer cambios
```bash
# Haz tus cambios en el código
git add .
git commit -m "Descripción del cambio"
git push origin main
```

### 6.2 Despliegue automático
- Vercel detectará automáticamente los cambios
- Desplegará una nueva versión en 1-2 minutos
- Tu dominio personalizado se actualizará automáticamente

## 🛠️ Paso 7: Configuraciones Avanzadas

### 7.1 Variables de entorno adicionales
Si necesitas más configuración, agrega en Vercel:
- `PORT` = `3000`
- `DB_PATH` = `urls.db`

### 7.2 Configuración de base de datos
- Vercel usa un sistema de archivos efímero
- La base de datos se reinicia en cada despliegue
- Para persistencia, considera usar una base de datos externa

### 7.3 Monitoreo y logs
- Ve a "Functions" en tu proyecto de Vercel
- Puedes ver logs en tiempo real
- Monitorea el rendimiento y errores

## 🚨 Solución de Problemas

### Problema: Error de build
**Solución:**
1. Revisa los logs en Vercel
2. Verifica que `package.json` tenga las dependencias correctas
3. Asegúrate de que `vercel.json` esté configurado correctamente

### Problema: Dominio no funciona
**Solución:**
1. Verifica la configuración DNS en Hostinger
2. Espera hasta 24 horas para propagación completa
3. Usa herramientas como `nslookup` para verificar

### Problema: Base de datos se resetea
**Solución:**
- Esto es normal en Vercel
- Considera usar una base de datos externa como:
  - PlanetScale (MySQL)
  - Supabase (PostgreSQL)
  - MongoDB Atlas

### Problema: Error 500
**Solución:**
1. Revisa los logs en Vercel Functions
2. Verifica que todas las rutas estén correctas
3. Asegúrate de que el servidor se exporte correctamente

## 📊 Ventajas de Vercel vs Hostinger

### ✅ Vercel
- **Despliegue automático** desde GitHub
- **SSL automático** y gratuito
- **CDN global** para mejor rendimiento
- **Escalado automático**
- **Logs en tiempo real**
- **Rollback fácil** a versiones anteriores

### ❌ Hostinger
- Configuración manual más compleja
- Menos automatización
- Requiere más mantenimiento

## 🎯 Checklist Final

- [ ] ✅ Repositorio creado en GitHub
- [ ] ✅ Código subido a GitHub
- [ ] ✅ Proyecto importado en Vercel
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Despliegue exitoso
- [ ] ✅ Dominio personalizado configurado
- [ ] ✅ DNS configurado en Hostinger
- [ ] ✅ Aplicación funcionando correctamente

## 🎉 ¡Listo!

Tu acortador de URLs de Freemind Union está ahora:
- ✅ **Desplegado en Vercel** con alta disponibilidad
- ✅ **Conectado a tu dominio** `short.freemindunion.info`
- ✅ **Con SSL automático** y CDN global
- ✅ **Con despliegue automático** desde GitHub
- ✅ **Listo para producción** y uso real

### 🔗 URLs importantes:
- **Aplicación**: `https://short.freemindunion.info`
- **Dashboard Vercel**: `https://vercel.com/dashboard`
- **Repositorio GitHub**: `https://github.com/TU_USUARIO/freemind-url-shortener`

---

**Desarrollado con ❤️ para Freemind Union**
*"Ayuda a tus pequeños a crecer en emociones y ser felices"*
