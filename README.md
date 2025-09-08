# 🔗 Freemind Union - Acortador de URLs

Un acortador de URLs moderno y elegante desarrollado para Freemind Union, con diseño emocional y funcionalidades completas.

## ✨ Características

- 🎨 **Diseño emocional** con colores de Freemind Union
- 🔗 **Acortar URLs** largas de forma rápida
- 🏷️ **Códigos personalizados** para URLs memorables
- 📊 **Estadísticas básicas** de clicks
- ✏️ **Editar URLs** y códigos existentes
- 🗑️ **Eliminar URLs** del historial
- 📱 **Diseño responsivo** para móviles y desktop
- 📋 **Historial completo** de URLs creadas

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

- **Backend**: Node.js + Express
- **Base de datos**: SQLite
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Despliegue**: Vercel
- **ID único**: nanoid

## 🎨 Diseño

El diseño está inspirado en la filosofía de Freemind Union:
- **Colores emocionales**: Rosa coral (#ff6b6b) y turquesa (#4ecdc4)
- **Gradientes suaves** que transmiten calidez
- **Tipografía clara** y legible
- **Animaciones sutiles** para mejor UX

## 📖 Uso

### Acortar una URL
1. Ingresa la URL larga en el campo
2. Opcionalmente, agrega un código personalizado
3. Haz clic en "Acortar URL"
4. Copia la URL corta generada

### Ver estadísticas
1. Ve a la pestaña "Historial"
2. Haz clic en "Ver Stats" en cualquier URL
3. Ve las estadísticas básicas

### Editar o eliminar
1. En el historial, usa los botones correspondientes
2. Edita la URL original o el código
3. Elimina URLs que ya no necesites

## 🔧 Configuración

### Variables de entorno
- `NODE_ENV`: Entorno de ejecución (production/development)
- `PORT`: Puerto del servidor (por defecto: 3000)

### Base de datos
- Se crea automáticamente `urls.db` en la primera ejecución
- Contiene tabla `urls` con información de URLs acortadas

## 📝 API Endpoints

- `POST /api/shorten` - Acortar URL
- `GET /api/stats/:code` - Estadísticas básicas
- `GET /api/detailed-stats/:code` - Estadísticas detalladas
- `GET /api/history` - Historial de URLs
- `PUT /api/edit-url/:code` - Editar URL original
- `PUT /api/edit-code/:code` - Editar código corto
- `DELETE /api/delete/:code` - Eliminar URL
- `GET /:code` - Redirigir a URL original

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