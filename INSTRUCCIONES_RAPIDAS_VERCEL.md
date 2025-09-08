# ⚡ Instrucciones Rápidas - Vercel

## 🚀 Pasos para subir a Vercel (10 minutos)

### 1. Crear repositorio en GitHub
```bash
# En tu carpeta del proyecto
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/freemind-url-shortener.git
git push -u origin main
```

### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. "Sign Up" con GitHub
3. "New Project" → Importa tu repositorio
4. Deploy (configuración automática)

### 3. Configurar dominio
1. En Vercel: Settings → Domains
2. Agrega: `short.freemindunion.info`
3. En Hostinger DNS: CNAME `short` → `cname.vercel-dns.com`

## 📁 Archivos listos para Vercel

```
✅ server.js (modificado para Vercel)
✅ package.json (actualizado)
✅ vercel.json (configuración)
✅ .gitignore (archivos a ignorar)
✅ README.md (documentación)
✅ TUTORIAL_VERCEL.md (tutorial completo)
✅ public/ (todos los archivos)
```

## 🎯 Resultado

- **URL Vercel**: `https://freemind-url-shortener-abc123.vercel.app`
- **Tu dominio**: `https://short.freemindunion.info`
- **Despliegue automático** desde GitHub
- **SSL automático** y CDN global

## 🔄 Actualizaciones futuras

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
# Vercel despliega automáticamente en 1-2 minutos
```

---

**¡Listo para producción! 🎉**
