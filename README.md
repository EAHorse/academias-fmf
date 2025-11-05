# 🏆 Sistema de Evaluación FMF - Academias de Fútbol

Sistema completo de evaluación para academias afiliadas a la Federación Mexicana de Fútbol, con soporte offline, generación de reportes PDF y capacidad de instalación como PWA.

## ✨ Características Principales

- 📊 **Sistema de Evaluación Completo** basado en KPIs oficiales de la FMF
- 👥 **Gestión de Usuarios** con roles de Administrador y Evaluador
- 📱 **PWA Instalable** - Funciona como app nativa en móviles
- 🔄 **Modo Offline** - Evalúa sin conexión y sincroniza después
- 📄 **Generación de PDF** - Reportes profesionales automáticos
- 🎨 **Interfaz Moderna** - Diseño UI/UX profesional con colores amigables
- 📈 **Progreso en Tiempo Real** - Header sticky con visualización del avance
- 🔐 **Seguridad** - Row Level Security (RLS) en Supabase

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Clona el repositorio
git clone <tu-repositorio>
cd <nombre-proyecto>

# Instala dependencias
npm install

# Copia y configura las variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Inicia el servidor de desarrollo
npm run dev
```

### Build para Producción

```bash
npm run build
```

## 🌐 Despliegue

Este proyecto está listo para desplegarse en múltiples plataformas. Consulta la [Guía de Despliegue](DEPLOY_INSTRUCTIONS.md) para instrucciones detalladas.

### Opciones de Hosting:
- ✅ **Vercel** (Recomendado)
- ✅ **Netlify**
- ✅ **Render**
- ✅ **Cualquier host de archivos estáticos**

### Variables de Entorno Requeridas:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 📱 Capacidades PWA

- **Instalable**: Los usuarios pueden instalar la app en sus dispositivos
- **Offline First**: Funciona sin conexión a internet
- **Sincronización Automática**: Los datos se sincronizan cuando hay conexión
- **Actualizaciones Automáticas**: Service Worker gestiona las actualizaciones

## 👥 Credenciales Iniciales

**Administrador:**
- Email: `admin@fmf.mx`
- Password: `admin123`

Los evaluadores pueden registrarse directamente desde la aplicación.

## 🗄️ Base de Datos

Este proyecto usa **Supabase** como backend:
- PostgreSQL con Row Level Security (RLS)
- Autenticación integrada
- API REST automática
- Realtime subscriptions

### Estructura Principal:

- **academies** - Información de academias
- **evaluators** - Datos de evaluadores
- **kpi_categories** - Categorías de evaluación
- **kpis** - Indicadores de desempeño
- **evaluations** - Evaluaciones realizadas
- **evaluation_scores** - Puntuaciones por KPI

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **PWA**: vite-plugin-pwa + Workbox
- **PDF**: jsPDF + jspdf-autotable
- **Icons**: Lucide React

## 📂 Estructura del Proyecto

```
├── src/
│   ├── components/          # Componentes React
│   │   ├── AdminDashboard.tsx
│   │   ├── EvaluationForm.tsx
│   │   ├── EvaluationReport.tsx
│   │   └── ...
│   ├── contexts/            # Context API
│   │   └── AuthContext.tsx
│   ├── lib/                 # Configuración
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── utils/               # Utilidades
│   │   ├── pdfGenerator.ts
│   │   ├── offlineSync.ts
│   │   └── certificationCalculator.ts
│   └── main.tsx
├── supabase/
│   └── migrations/          # Migraciones de BD
├── public/                  # Assets estáticos
├── .env.example             # Template de variables
├── vercel.json              # Config Vercel
├── netlify.toml             # Config Netlify
└── vite.config.ts           # Config Vite + PWA
```

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Variables de entorno seguras (`.env` en `.gitignore`)
- ✅ Autenticación JWT con Supabase
- ✅ Políticas de acceso restrictivas por defecto
- ✅ ANON_KEY segura para exposición pública

## 📖 Documentación Adicional

- [Guía de Despliegue](DEPLOY_INSTRUCTIONS.md) - Instrucciones detalladas de despliegue
- [Protocolo de Evaluación](PROTOCOL_COMPLIANCE.md) - Cumplimiento del protocolo FMF
- [PWA Features](README_PWA.md) - Características de Progressive Web App

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Linter ESLint
npm run typecheck  # Verificación de tipos TypeScript
```

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

Asegúrate de que las variables de entorno estén configuradas:
1. Localmente: archivo `.env` en la raíz
2. En producción: configuradas en tu plataforma de hosting

### La PWA no se actualiza

1. Abre DevTools
2. Application → Service Workers
3. Click en "Unregister"
4. Recarga la página

## 📄 Licencia

Este proyecto es propiedad de la Federación Mexicana de Fútbol.

## 📧 Contacto

Para soporte o consultas sobre el sistema de evaluación FMF.

---

Hecho con ⚽ para la Federación Mexicana de Fútbol
