# 🚀 Guía Completa de Despliegue

Esta aplicación está lista para desplegarse en **Vercel**, **Netlify**, **Render**, o cualquier plataforma que soporte aplicaciones Vite/React.

---

## 📋 Requisitos Previos

1. **Cuenta de GitHub** (para todos los métodos)
2. **Variables de entorno de Supabase** (revisa el archivo `.env.example`)
3. **Código en GitHub** (repositorio público o privado)

---

## 🌐 Opción 1: Despliegue en Vercel (Recomendado)

### Paso 1: Prepara tu Repositorio de GitHub

```bash
# Si aún no has inicializado git
git init

# Agrega todos los archivos (el .gitignore excluirá lo necesario)
git add .

# Haz tu primer commit
git commit -m "Initial commit"

# Crea el repositorio en GitHub y conecta
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### Paso 2: Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login con GitHub
2. Click en **"Add New Project"**
3. Selecciona tu repositorio
4. Vercel detectará automáticamente la configuración de Vite

### Paso 3: Configura Variables de Entorno

**IMPORTANTE:** Antes de hacer deploy, agrega estas variables en la sección "Environment Variables":

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Tu clave anónima de Supabase |

💡 **Obtén estos valores de:** [Supabase Dashboard](https://app.supabase.com) → Tu proyecto → Settings → API

✅ **Marca todas las opciones:** Production, Preview, Development

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera 1-2 minutos
3. ¡Tu app estará en línea! 🎉

**Tu URL será:** `https://tu-proyecto.vercel.app`

---

## 🟣 Opción 2: Despliegue en Netlify

### Método A: Interfaz Web

1. Ve a [netlify.com](https://netlify.com) y haz login
2. Click en **"Add new site"** → **"Import an existing project"**
3. Conecta con GitHub y selecciona tu repositorio
4. Configuración automática detectada:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

5. **Variables de entorno:**
   - Ve a **Site settings → Environment variables**
   - Agrega:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

6. Click en **"Deploy site"**

### Método B: Netlify CLI

```bash
# Instala Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (desde la raíz del proyecto)
netlify deploy --prod
```

---

## 🔵 Opción 3: Despliegue en Render

1. Ve a [render.com](https://render.com)
2. Click en **"New Static Site"**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

5. **Variables de entorno:**
   - Agrega en la sección "Environment"
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

6. Click en **"Create Static Site"**

---

## ☁️ Opción 4: Otros Hosts (GitHub Pages, Firebase, etc.)

Esta app es una SPA (Single Page Application) estándar. Funciona en cualquier servicio que soporte archivos estáticos.

### Build Local

```bash
# Instala dependencias
npm install

# Crea el build de producción
npm run build

# Los archivos estarán en la carpeta /dist
```

### Configuración de Variables de Entorno

Para otros hosts, necesitas crear un archivo `.env.production` antes de hacer build:

```bash
# .env.production
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_ANON_KEY=tu_key_aqui
```

Luego ejecuta el build y sube la carpeta `dist` a tu host.

---

## 🔧 Configuración para Despliegue en Bolt.new

Si estás usando esta app directamente en Bolt.new:

1. **Las variables de entorno ya están configuradas** en el archivo `.env`
2. La app funcionará automáticamente
3. Para compartir con otros, usa una de las opciones de despliegue anteriores

---

## ✅ Verificación Post-Despliegue

Después de desplegar, verifica que:

1. ✅ La app carga correctamente
2. ✅ Puedes hacer login con: `admin@fmf.mx` / `admin123`
3. ✅ La conexión a Supabase funciona
4. ✅ Puedes crear y ver evaluaciones
5. ✅ La PWA es instalable (aparece el banner de instalación)

---

## 🔄 Actualizaciones Automáticas

Una vez desplegado con GitHub:

1. Haz cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push
   ```
3. **El host desplegará automáticamente** la nueva versión

---

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Causa:** Las variables de entorno no están configuradas en tu host.

**Solución:**
1. Ve a la configuración de tu proyecto en el host
2. Busca "Environment Variables" o "Settings"
3. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Redespliega el proyecto

### La página muestra "404" al recargar

**Causa:** Falta configuración de SPA routing.

**Solución:**
- **Vercel:** Ya está configurado en `vercel.json`
- **Netlify:** Ya está configurado en `netlify.toml`
- **Otros:** Configura rewrites para que todas las rutas apunten a `index.html`

### La PWA no se instala

**Causa:** HTTPS no está habilitado o hay error en el Service Worker.

**Solución:**
- Verifica que tu sitio use HTTPS (todos los hosts modernos lo tienen por defecto)
- Revisa la consola del navegador para errores
- Limpia caché y recarga la página

---

## 📱 Características PWA Incluidas

Tu aplicación incluye:

✅ **Instalable:** Los usuarios pueden instalarla como app nativa
✅ **Funciona Offline:** Service Worker con caché inteligente
✅ **Iconos optimizados:** Para todas las plataformas (iOS, Android)
✅ **Manifest configurado:** Colores, nombre, descripción
✅ **Actualización automática:** El Service Worker se actualiza solo

---

## 🔐 Seguridad

### Variables de Entorno

- ✅ El archivo `.env` está en `.gitignore` (no se sube a GitHub)
- ✅ Usa `.env.example` como plantilla
- ✅ Las claves públicas (ANON_KEY) son seguras para el cliente

### Notas Importantes

- La `VITE_SUPABASE_ANON_KEY` es segura para exponerse en el cliente
- Row Level Security (RLS) protege tus datos en Supabase
- Nunca expongas la `SERVICE_ROLE_KEY` (no la necesitas en el cliente)

---

## 📞 Soporte y Recursos

- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)

---

## 🎯 URL de Login Inicial

Después de desplegar, comparte la URL con tu equipo:

**Credenciales de Administrador:**
- Email: `admin@fmf.mx`
- Password: `admin123`

Los evaluadores pueden registrarse directamente desde la aplicación.

---

¿Problemas? Revisa la sección de **Solución de Problemas** o consulta la documentación de tu host preferido.
