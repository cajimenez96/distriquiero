# 📦 DistriQuiero — Plataforma de Comercio Mayorista y Panel Operativo

> Plataforma web integral para distribuidoras y mayoristas comerciales. Permite la visualización de catálogo con cotización dual (unidades sueltas y bultos cerrados de fábrica), emisión de pedidos estructurados con derivación fluida a WhatsApp Business, y un completo panel administrativo con control de acceso basado en roles (RBAC) y auditoría de eventos.

---

## 📑 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Stack Tecnológico y Arquitectura](#-stack-tecnológico-y-arquitectura)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación y Configuración](#-instalación-y-configuración)
6. [Poblado de Base de Datos (Seeding)](#-poblado-de-base-de-datos-seeding)
7. [Scripts Disponibles](#-scripts-disponibles)
8. [Credenciales Iniciales de Acceso](#-credenciales-iniciales-de-acceso)
9. [Endpoints de la API](#-endpoints-de-la-api)
10. [Buenas Prácticas de Negocio Implementadas](#-buenas-prácticas-de-negocio-implementadas)

---

## 🚀 Características Principales

### 🛒 Tienda Mayorista (Frontend Cliente)
- **Cotización Dual en Tiempo Real**: Visualización de precios por unidad sugerida y precio diferencial por bulto cerrado de fábrica con cálculo automático del porcentaje de ahorro comercial.
- **Banners Promocionales Dinámicos**: Integración con promociones y ofertas administradas desde la base de datos con redirección inteligente por categoría.
- **Buscador y Filtros Avanzados**: Búsqueda instantánea por SKU, título, marca o categoría, junto con ordenamiento por precio o mayor nivel de ahorro.
- **Carrito con Revalidación Automática**: Cotejo de precios y stock contra el catálogo vigente del servidor al iniciar sesión para evitar discrepancias por productos pausados o variaciones de lista.
- **Cierre de Pedidos por WhatsApp Business**: Formateo estructurado del pedido con número correlativo (`#DQ-XXXX`), detalle de bultos, subtotales y datos de entrega del cliente, evitando el bloqueo de ventanas emergentes en navegadores modernos.

### 🛡️ Panel de Operaciones y Administración (`#admin`)
- **Control de Acceso por Roles (RBAC)**:
  - `superadmin`: Acceso irrestricto, auditoría, catálogo, pedidos y creación de nuevos usuarios administradores.
  - `admin`: Operación diaria, actualización de catálogo, cambio de estados de pedidos y subida de imágenes.
- **Bandeja de Pedidos (`OrdersTable`)**: Monitoreo de pedidos en tiempo real, filtro por estado (`Solicitado`, `Contestado`, `Entregado`), modal de detalle con items desglosados y derivación directa al chat con el cliente.
- **Gestión de Catálogo (`ProductsManager` & `ProductDrawer`)**: Alta, edición y pausado de productos en catálogo con subida directa de imágenes optimizadas a ImageKit.
- **Regla de Consistencia Comercial**: Validación automática en frontend y backend (Zod) que impide fijar precios de bultos cerrados superiores al valor de las unidades individuales.
- **Registro de Auditoría (`AuditLogsView`)**: Registro inmutable de acciones críticas (`CREATE`, `UPDATE`, `PAUSE`, `STATUS_CHANGE`) con snapshots previos y posteriores (*before/after*).

---

## 🛠️ Stack Tecnológico y Arquitectura

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript | Arquitectura de componentes desacoplada y tipada. |
| **Estilos** | Tailwind CSS v4 | Diseño responsive orientado a comercio B2B y alta legibilidad. |
| **Iconografía** | Lucide React | Iconos vectoriales consistentes y accesibles. |
| **Bundler / Dev** | Vite + ESBuild | Entorno de desarrollo ultrarrápido integrado en modo middleware. |
| **Backend** | Express + Node.js / Bun | API REST modular con enrutamiento semántico y middleware de observabilidad. |
| **Persistencia** | MongoDB + Mongoose | Base de datos NoSQL documental con fallback automático en memoria si no hay conexión. |
| **Validaciones** | Zod | Esquemas de tipado y reglas de negocio estrictas en endpoints. |
| **Autenticación** | JWT (`jsonwebtoken`) + `bcryptjs` | Tokens de sesión firmados con caducidad y hashing seguro de contraseñas. |
| **Media / CDN** | Multer + ImageKit SDK | Almacenamiento optimizado de imágenes con sanitización y filtro MIME estricto. |

---

## 📁 Estructura del Proyecto

```text
distriquiero/
├── docs/
│   └── kanban.md                  # Tablero ágil con trazabilidad de Historias de Usuario (DoD y resoluciones)
├── server/
│   ├── lib/
│   │   ├── auth.ts                # Middleware y utilidades JWT / RBAC
│   │   ├── db-store.ts            # Capa de servicio de datos y consultas Mongoose
│   │   ├── fixtures/
│   │   │   └── mock-data.ts       # Fixtures y estado de fallback en memoria
│   │   ├── imagekit.ts            # Integración con ImageKit CDN
│   │   ├── mongodb.ts             # Cliente de conexión Mongoose
│   │   └── whatsapp.ts            # Formateador de plantillas para WhatsApp
│   ├── models/
│   │   └── index.ts               # Esquemas Mongoose (User, Product, Order, Counter, AuditLog, Banner)
│   ├── routes/
│   │   ├── adminAudit.ts          # Endpoints de registros de auditoría
│   │   ├── adminProducts.ts       # Endpoints protegidos para ABM de productos
│   │   ├── adminUpload.ts         # Endpoint de subida de imágenes con validación MIME
│   │   ├── adminUsers.ts          # Gestión de operadores (Superadmin)
│   │   ├── auth.ts                # Login, verificación y sesiones
│   │   ├── catalog.ts             # Endpoints públicos de catálogo y banners
│   │   └── orders.ts              # Creación pública y actualización operativa de pedidos
│   └── scripts/
│       └── seed.ts                # Inicializador idempotente de la base de datos
├── src/
│   ├── components/
│   │   ├── admin/                 # Panel operativo (Dashboard, OrdersTable, ProductDrawer, etc.)
│   │   ├── cart/                  # Drawer de compras y modal de confirmación
│   │   ├── catalog/               # Catálogo mayorista, tarjetas de producto y buscador
│   │   └── ui/                    # Componentes atómicos (Badge, Button, Switch, Toast)
│   ├── context/
│   │   ├── AuthContext.tsx        # Contexto global de sesión administrativa
│   │   └── CartContext.tsx        # Estado de carrito con sincronización local y de precios
│   ├── types/
│   │   └── index.ts               # Tipos e interfaces globales compartidas
│   ├── App.tsx                    # Enrutador principal con soporte de hash routing (#admin)
│   ├── index.css                  # Estilos globales de Tailwind CSS
│   └── main.tsx                   # Punto de entrada de la aplicación React
├── package.json                   # Dependencias y scripts de ejecución
├── server.ts                      # Servidor unificado Express + Vite Middleware
└── tsconfig.json                  # Configuración del compilador TypeScript
```

---

## 📋 Requisitos Previos

- **Runtime**: [Bun](https://bun.sh/) (recomendado v1.1+) o [Node.js](https://nodejs.org/) (v18+).
- **Base de Datos**: Instancia local de [MongoDB](https://www.mongodb.com/) o clúster en [MongoDB Atlas](https://www.mongodb.com/atlas). *(Opcional: Si no se especifica URI, la aplicación funcionará utilizando el almacén en memoria de fallback).*

---

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/cajimenez96/distriquiero.git
   cd distriquiero
   ```

2. **Instalar dependencias:**
   ```bash
   bun install
   # o con npm:
   # npm install
   ```

3. **Configurar las variables de entorno:**
   Crear un archivo `.env` en la raíz del proyecto tomando como referencia [.env.example](.env.example):
   ```env
   # Base de datos
   MONGODB_URI="mongodb+srv://<usuario>:<password>@cluster.mongodb.net/distriquiero?retryWrites=true&w=majority"

   # Seguridad JWT
   NEXTAUTH_SECRET="tu-clave-secreta-de-al-menos-32-caracteres"

   # Datos de contacto comercial
   COMPANY_WHATSAPP_PHONE="5491145982210"

   # CDN ImageKit (Opcional para subida en producción)
   IMAGEKIT_PUBLIC_KEY=""
   IMAGEKIT_PRIVATE_KEY=""
   IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/tu_endpoint"
   ```

---

## 🗄️ Poblado de Base de Datos (Seeding)

Para inicializar la base de datos con usuarios administradores, catálogo de productos con identificadores nativos `ObjectId`, contador correlativo (`#DQ-1082`), pedidos de prueba y banners promocionales, ejecutá:

```bash
bun run seed
```

El script es completamente **idempotente**: limpia y regenera las colecciones dejando el entorno listo para operar.

---

## 💻 Scripts Disponibles

En el archivo `package.json` disponés de los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `bun run dev` | Inicia el servidor unificado en desarrollo con `tsx watch server.ts` (hot-reload en backend y Vite HMR en frontend). |
| `bun run seed` | Ejecuta el script de inicialización y carga de datos en MongoDB. |
| `bun run build` | Compila el bundle de producción de Vite (`dist/assets/`) y empaqueta el servidor Node (`dist/server.cjs`). |
| `bun run start` | Inicia el servidor en modo producción a partir del artefacto generado en `dist/server.cjs`. |
| `bun run lint` | Valida el tipado estático del proyecto completo (`tsc --noEmit`). |
| `bun run clean` | Comando multiplataforma portable que elimina de forma segura la carpeta de compilación `dist/`. |

---

## 🔑 Credenciales Iniciales de Acceso

Luego de ejecutar el seeder (`bun run seed`), podés ingresar al panel administrativo navegando a la URL con hash: `http://localhost:3000/#admin` o presionando el candado en la esquina superior del catálogo:

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin@distriquiero.com` | `admin123` | Control total: Catálogo, Pedidos, Auditoría y Creación de Operadores. |
| **Admin** | `operador@distriquiero.com` | `admin123` | Gestión operativa: Catálogo, Pausa de ítems y Estados de Pedidos. |

---

## 📡 Endpoints de la API

### Catálogo Público
- `GET /api/catalog`: Obtiene la lista de productos activos (con soporte para parámetros `search`, `category` y `sort`).
- `GET /api/catalog/:id`: Obtiene el detalle de un producto por ID o slug.
- `GET /api/catalog/banners`: Obtiene los banners promocionales activos.

### Pedidos
- `POST /api/orders`: Endpoint público para registrar un nuevo pedido generado desde el carrito. Retorna el objeto del pedido y la URL de derivación a WhatsApp con el texto preformateado.
- `GET /api/orders`: *(Requiere Token)* Lista todos los pedidos para la bandeja administrativa.
- `PATCH /api/orders/:id/status`: *(Requiere Token)* Actualiza el estado de un pedido (`Solicitado` -> `Contestado`) y asienta el evento en auditoría.

### Administración de Catálogo & Archivos
- `GET /api/admin/products`: Lista todos los productos (activos y pausados).
- `POST /api/admin/products`: Crea un nuevo producto validando la regla de ahorro mayorista con Zod.
- `PUT /api/admin/products/:id`: Modifica datos de un producto.
- `PATCH /api/admin/products/:id/pause`: Alterna el estado activo/pausado de un ítem.
- `POST /api/admin/upload`: Subida de imágenes a ImageKit con filtro estricto de tipos MIME (`jpeg`, `png`, `webp`, `gif`).

### Auditoría & Usuarios
- `GET /api/admin/audit-logs`: *(Requiere Token)* Lista histórica de cambios del sistema con snapshots comparativos.
- `GET /api/admin/users`: *(Exclusivo Superadmin)* Lista todos los operadores del sistema.
- `POST /api/admin/users`: *(Exclusivo Superadmin)* Da de alta a un nuevo administrador con contraseña hasheada.

---

## 💡 Buenas Prácticas de Negocio Implementadas

1. **Defensa contra Bloqueo de Popups**: Las órdenes hacia WhatsApp se confirman mediante interacción directa y sincrónica de usuario, con alternativa de copiado manual al portapapeles.
2. **Consistencia de Precios en Memoria Local**: Si un administrador actualiza precios o pausa un producto, los clientes que tengan carritos viejos en `localStorage` reciben una revalidación automática y advertencias visuales antes del envío.
3. **Observabilidad en Terminal**: Cada petición hacia la API se registra con timestamp y método HTTP en la consola del servidor (`[HH:MM:SS] METHOD /api/...`).
4. **Resiliencia de Conexión**: La capa de servicio conmuta transparentemente a datos en memoria si el clúster de base de datos experimenta latencia o falta de conectividad inicial.
