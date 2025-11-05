# FMF - Sistema de Evaluación (PWA)

## Aplicación Portátil Offline

Esta aplicación está configurada como una **Progressive Web App (PWA)** que funciona sin conexión y puede instalarse en dispositivos móviles y de escritorio sin necesidad de instalaciones adicionales.

## Características PWA

### ✅ Instalable
- **Móviles (Android/iOS)**: Abre en el navegador y selecciona "Agregar a pantalla de inicio" o "Instalar app"
- **Escritorio (Windows/Mac/Linux)**: Abre en Chrome, Edge o Brave y haz clic en el ícono de instalación en la barra de direcciones

### ✅ Funciona Sin Conexión
- Todos los archivos estáticos se almacenan en caché
- Las evaluaciones se pueden crear sin conexión
- Los datos se sincronizan automáticamente cuando hay conexión
- Indicador visual del estado de conexión en la barra superior

### ✅ Sincronización Automática
- Las acciones realizadas sin conexión se guardan localmente
- Se sincronizan automáticamente al recuperar la conexión
- Contador de acciones pendientes visible en la interfaz
- Botón manual de sincronización disponible

## Cómo Usar la Aplicación

### 1. Acceso Web
Simplemente abre la aplicación en tu navegador:
```
https://tu-dominio.com
```

### 2. Instalación en Móvil

**Android (Chrome/Edge):**
1. Abre la aplicación en el navegador
2. Toca el menú (3 puntos) → "Agregar a pantalla de inicio"
3. Confirma la instalación
4. El ícono de FMF aparecerá en tu pantalla de inicio

**iOS (Safari):**
1. Abre la aplicación en Safari
2. Toca el botón de compartir
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma
5. El ícono de FMF aparecerá en tu pantalla de inicio

### 3. Instalación en Escritorio

**Chrome/Edge/Brave:**
1. Abre la aplicación
2. Busca el ícono de instalación (+) en la barra de direcciones
3. Haz clic en "Instalar"
4. La aplicación se abrirá en su propia ventana

**O alternativamente:**
1. Menú del navegador → "Instalar FMF - Sistema de Evaluación"

## Uso Sin Conexión

### Evaluaciones Sin Internet
1. Abre la aplicación (funciona aunque no haya conexión)
2. Crea evaluaciones normalmente
3. Los datos se guardan localmente
4. Verás un indicador "Sin conexión" en la barra superior
5. También verás un contador de acciones pendientes

### Sincronización
1. Cuando recuperes la conexión, verás el indicador cambiar a "En línea"
2. Haz clic en el botón de sincronización o espera la sincronización automática
3. Todas las evaluaciones pendientes se enviarán a la base de datos

## Ventajas de la PWA

- ✅ **No requiere tiendas de aplicaciones**: Instala directamente desde el navegador
- ✅ **Actualizaciones automáticas**: La app se actualiza sola
- ✅ **Menos espacio**: Ocupa menos que una app nativa
- ✅ **Multiplataforma**: Funciona en cualquier dispositivo
- ✅ **Siempre accesible**: Funciona con o sin conexión
- ✅ **Portable**: Lleva tu trabajo a cualquier lugar

## Requisitos

### Navegadores Compatibles
- **Móvil**: Chrome (Android), Safari (iOS 11.3+)
- **Escritorio**: Chrome, Edge, Brave, Opera

### Conexión
- **Primera vez**: Requiere conexión para cargar la aplicación
- **Uso posterior**: Puede funcionar completamente sin conexión
- **Sincronización**: Requiere conexión para enviar datos al servidor

## Solución de Problemas

### La app no se instala
- Asegúrate de usar un navegador compatible
- Verifica que el sitio use HTTPS (requerido para PWA)
- Intenta recargar la página

### Las evaluaciones no se sincronizan
- Verifica que tengas conexión a internet
- Haz clic en el botón de sincronización manual
- Revisa el contador de acciones pendientes

### Desinstalar la aplicación
**Móvil:**
- Mantén presionado el ícono → "Eliminar" o "Desinstalar"

**Escritorio:**
- Menú de la app → "Desinstalar FMF - Sistema de Evaluación"
- O desde Configuración del navegador → Aplicaciones instaladas

## Soporte

Para más información o reportar problemas, contacta al equipo técnico de la FMF.
