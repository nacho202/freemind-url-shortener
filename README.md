# 🔗 Freemind Union - Acortador de URLs

Un acortador de URLs moderno y elegante desarrollado para Freemind Union, usando Vercel Edge Functions y Vercel KV.

## ✨ Características

- 🎨 **Diseño emocional** con colores de Freemind Union
- 🔗 **Acortar URLs** largas de forma rápida
- 🏷️ **Slugs personalizados** para URLs memorables
- ⚡ **Edge Functions** para máximo rendimiento
- 🗄️ **Vercel KV** para almacenamiento persistente
- ⏰ **TTL opcional** para URLs temporales
- 📱 **Diseño responsivo** para móviles y desktop
- 🔒 **Autenticación opcional** con token de administración

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue automático (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/freemindunion/url-shortener)

### Opción 2: Despliegue manual

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/freemindunion/url-shortener.git
   cd freemind-url-shortener
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta localmente**
   ```bash
   npm start
   ```

4. **Despliega en Vercel**
   - Conecta tu repositorio con Vercel
   - Configura las variables de entorno
   - Despliega automáticamente

## 📁 Estructura del Proyecto

```
freemind-url-shortener/
├── server.js              # Servidor Express
├── package.json           # Dependencias y scripts
├── vercel.json           # Configuración de Vercel
├── .gitignore            # Archivos a ignorar
├── README.md             # Este archivo
├── TUTORIAL_VERCEL.md    # Tutorial detallado
└── public/               # Archivos estáticos
    ├── index.html        # Página principal
    ├── script.js         # JavaScript del cliente
    └── styles.css        # Estilos CSS
```

## 🛠️ Tecnologías Utilizadas

- **Backend**: Vercel Edge Functions
- **Base de datos**: Vercel KV
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Despliegue**: Vercel
- **Runtime**: Edge Runtime (máximo rendimiento)

## 🎨 Diseño

El diseño está inspirado en la filosofía de Freemind Union:
- **Colores emocionales**: Rosa coral (#ff6b6b) y turquesa (#4ecdc4)
- **Gradientes suaves** que transmiten calidez
- **Tipografía clara** y legible
- **Animaciones sutiles** para mejor UX

## 📖 Uso

### Crear un enlace corto
1. Ingresa un slug personalizado (ej: "mi-enlace")
2. Ingresa la URL de destino
3. Opcionalmente, agrega un TTL en segundos
4. Haz clic en "Crear"
5. Copia la URL corta generada

### Acceder a un enlace
- Simplemente visita `https://tudominio.com/slug` y serás redirigido automáticamente

### Configuración de Vercel KV
1. En Vercel, ve a tu proyecto
2. Ve a "Storage" → "Create Database" → "KV"
3. Las credenciales se configuran automáticamente

## 🔧 Configuración

### Variables de entorno
- `KV_REST_API_URL`: Se configura automáticamente en Vercel
- `KV_REST_API_TOKEN`: Se configura automáticamente en Vercel
- `ADMIN_TOKEN`: Token opcional para autenticación (opcional)

### Base de datos
- Usa Vercel KV para almacenamiento persistente
- Los enlaces se almacenan con la clave `link:slug`
- Soporte para TTL (Time To Live) opcional

## 📝 API Endpoints

- `POST /api/links` - Crear enlace corto
- `GET /api/redirect?slug=xxx` - Redirigir a URL original
- `GET /:slug` - Redirigir a URL original (ruta directa)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🌟 Sobre Freemind Union

Freemind Union es una plataforma dedicada a la educación emocional, ayudando a los pequeños a crecer en emociones y ser felices a través de:

- 📚 **Cursos online** de inteligencia emocional
- 🛍️ **Materiales educativos** imprimibles
- 🎮 **Actividades lúdicas** para el aprendizaje
- 🧘 **Técnicas de mindfulness** para niños

**Visita**: [freemindunion.info](https://freemindunion.info)

---

**Desarrollado con ❤️ para Freemind Union**
*"Ayuda a tus pequeños a crecer en emociones y ser felices"*