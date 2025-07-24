# Originaria

Este documento proporciona orientación en cuando al código en este repositorio.

## Resumen del Proyecto

ORIGINARIA es una plataforma de marketplace para productos orgánicos y naturales de Perú, conectando productores locales con consumidores conscientes. La plataforma promueve el comercio justo, la sostenibilidad y el desarrollo económico de las comunidades peruanas.

## Arquitectura

Este es un sitio web estático HTML/CSS/JavaScript con la siguiente estructura:

- **Frontend**: JavaScript vanilla con HTML/CSS
- **Assets**: Archivos estáticos (CSS, JS, imágenes, fuentes)
- **Interfaces multiusuario**: Marketplace público, panel de vendedores, panel administrativo
- **Diseño responsivo**: Enfoque mobile-first

### Directorios Principales

- `public/` - Páginas públicas (landing, marketplace, detalles de productos)
- `vendor/` - Panel de vendedores e interfaces de gestión
- `admin/` - Panel administrativo para gestión de la plataforma
- `assets/` - Assets estáticos (CSS, JS, imágenes, fuentes)
- `components/` - Componentes HTML reutilizables
- `config/` - Archivos de configuración (actualmente vacío)

## Desarrollo

### Sin Proceso de Build
Este proyecto utiliza HTML/CSS/JavaScript vanilla sin pipeline de construcción. Los cambios se realizan directamente en los archivos fuente.

### Organización de Archivos

#### Arquitectura CSS
- `main.css` - Estilos globales y variables CSS
- `public.css` - Estilos para páginas públicas
- `vendor.css` - Estilos del panel de vendedores
- `admin.css` - Estilos del panel administrativo

#### Arquitectura JavaScript
- `main.js` - Utilidades principales, cliente API, notificaciones, validación
- `public.js` - Funcionalidad de páginas públicas
- `vendor.js` - Funcionalidad del panel de vendedores
- `admin.js` - Funcionalidad del panel administrativo
- `components.js` - Definiciones de componentes reutilizables

### Características Principales de JavaScript

El archivo main.js proporciona:
- **Objeto global ORIGINARIA** con configuración, caché, gestión de estado
- **Utils** - Formateo, validación, utilidades DOM
- **Cliente API** con autenticación y manejo de errores
- **Sistema de notificaciones** con notificaciones toast
- **Framework de validación** con validación de formularios
- **Wrapper de almacenamiento** para localStorage con expiración
- **Componentes** - Modales, diálogos de confirmación, overlays de carga

### Tipos de Usuario e Interfaces

1. **Usuarios Públicos**: Navegar productos, ver detalles, registrarse/iniciar sesión
2. **Vendedores**: Gestión de productos, seguimiento de ventas, analíticas
3. **Administradores**: Gestión de plataforma, moderación de usuarios, configuraciones del sistema

### Localización
- Idioma principal: Español (Perú)
- Moneda: PEN (Sol Peruano)
- Fecha/hora: Zona horaria de Perú
- Validación telefónica: Formato peruano (+51)

## Convenciones de Archivos

- Archivos HTML usan estructura semántica con consideraciones de accesibilidad
- CSS usa convenciones de nomenclatura tipo BEM
- JavaScript sigue estándares ES6+
- Todos los archivos incluyen comentarios de encabezado con propósito e información del autor
- Contenido placeholder para imágenes y logos en todo el sitio

## Notas Importantes

- No hay package.json ni herramientas de build - este es un sitio web estático
- Los archivos de configuración en `/config/` están actualmente vacíos
- Las imágenes son divs placeholder con texto descriptivo
- Todos los valores monetarios deben usar moneda PEN
- Los formularios incluyen validación del lado del cliente con el framework de Validación
- Los endpoints de API tienen prefijo `/api` (backend no incluido en este repo)

## Páginas Implementadas

### Interfaz Pública
- **index.html** - Página de inicio con sección hero, productos destacados, vendedores destacados
- **marketplace.html** - Catálogo completo de productos con filtrado, búsqueda y funcionalidad de carrito
- **product-detail.html** - Vista detallada del producto con galería, reseñas, información del vendedor y opciones de compra
- **login.html** - Página de autenticación con selección de tipo de usuario (cliente/vendedor)
- **register.html** - Registro con formularios diferenciados para clientes y vendedores
- **about.html** - Información de la empresa, misión, equipo y métricas de impacto
- **contact.html** - Formularios de contacto, información de ubicación y canales de soporte

### Interfaz de Vendedores
- **vendor/dashboard.html** - Panel principal con métricas, gráficos, notificaciones y acciones rápidas
- **vendor/products/list.html** - Gestión de productos con filtrado, acciones masivas y actualizaciones de estado
- **vendor/products/add.html** - Formulario de creación de productos multi-paso con validación y calculadora de precios
- **vendor/onboarding/welcome.html** - Proceso de onboarding de 5 pasos para nuevos vendedores

### Interfaz Administrativa
- **admin/dashboard.html** - Panel administrativo con métricas de la plataforma, gestión de usuarios y controles del sistema

### Componentes
- **components/sidebar-vendor.html** - Sidebar reutilizable de vendedores con navegación y estadísticas rápidas

### Hojas de Estilo
- **assets/css/main.css** - Estilos globales, variables CSS y clases de utilidad
- **assets/css/public.css** - Estilos de páginas públicas
- **assets/css/vendor.css** - Estilos comprensivos del panel de vendedores
- **assets/css/admin.css** - Estilos específicos del panel administrativo

## Estado del Proyecto

✅ **Implementación Completa**: Toda la funcionalidad principal ha sido implementada incluyendo:
- Marketplace público con características completas de e-commerce
- Panel de vendedores con gestión de productos y analíticas
- Panel administrativo para gestión de la plataforma
- Autenticación de usuarios y registro
- Diseño responsivo para todos los dispositivos
- Validación de formularios e interacciones de usuario
- Carrito de compras y navegación de productos
- Proceso de onboarding de vendedores

## Características Principales Implementadas

### Funcionalidad E-commerce
- Navegación de productos con categorías y filtros
- Carrito de compras con gestión de cantidad
- Páginas de detalle de productos con galerías de imágenes
- Sistema de lista de deseos/favoritos
- Búsqueda avanzada y filtrado

### Herramientas de Vendedores
- Panel completo con métricas de ventas
- Gestión de productos (agregar, editar, listar)
- Seguimiento de inventario
- Proceso de onboarding multi-paso
- Gestión de perfil de vendedor

### Características Administrativas
- Panel de resumen de la plataforma
- Gestión de usuarios y vendedores
- Seguimiento de pedidos y analíticas
- Herramientas de configuración del sistema

### Experiencia de Usuario
- Diseño responsivo mobile-first
- Animaciones y transiciones suaves
- Validación de formularios con retroalimentación en tiempo real
- Notificaciones toast y modales
- Consideraciones de accesibilidad

## Implementación Técnica

### Simulación de Datos
Como este es un prototipo frontend, todos los datos están simulados con contenido realista:
- Catálogo de productos con productos orgánicos peruanos auténticos
- Perfiles de vendedores (especialmente el negocio de café de Roberto Gomez)
- Métricas de ventas y analíticas
- Interacciones de usuario y retroalimentación

### Arquitectura JavaScript
- JavaScript vanilla con características ES6+
- Arquitectura basada en componentes
- Delegación de eventos para rendimiento
- Almacenamiento local para persistencia de datos
- Organización de código modular

### Sistema de Diseño CSS
- Propiedades personalizadas CSS para temas
- Espaciado y tipografía consistentes
- Layouts de grid responsivos
- Estilos basados en componentes
- Librería de animaciones y transiciones

## Pruebas

No hay framework de testing automatizado configurado. Las pruebas deben hacerse manualmente en navegadores.

## Autenticación

Utiliza tokens JWT almacenados en localStorage con la clave `auth_token`. El cliente API incluye automáticamente este token en las solicitudes.
