# 📋 Tablero Kanban y Backlog de Historias de Usuario (HU) - DistriQuiero

Documento de gestión ágil de producto y arquitectura de software. Registra las funcionalidades auditadas, incidentes resueltos y los tickets de trabajo estructurados bajo formato de Historias de Usuario con sus respectivos criterios de aceptación.

---

## 🟢 Resueltos (Done)

- [x] **[HU-000A] Corrección del Parser de Lockfile en Bun**
  - **Tipo**: Bug Infraestructura / Build
  - **Solución**: Se regeneró `bun.lock` compatible con Bun 1.3+ y se removió la duplicación de `vite` en `devDependencies` de `package.json`.

- [x] **[HU-000B] Seeding e Inicialización de Base de Datos Real en MongoDB**
  - **Tipo**: Infraestructura / Persistencia
  - **Solución**: Creación de `server/scripts/seed.ts` y script `bun run seed` que inicializa usuarios (`superadmin` y `admin`), catálogo con `ObjectId` nativos, pedidos correlativos `#DQ-1082` y logs de auditoría iniciales.

- [x] **[HU-000C] Unificación del Modal de Autenticación y Routing Hash para Dashboard**
  - **Tipo**: Bug Frontend / Navegación
  - **Solución**: Eliminación de instancia duplicada de `AdminLoginModal` en `CatalogView.tsx`, unificación en `App.tsx` y soporte de hash routing (`#admin`) persistente ante recargas (F5).

- [x] **[HU-001] Sincronización y Consistencia de Endpoints en Bandeja de Pedidos**
  - **Tipo**: Bugfix (API & Frontend)
  - **Prioridad**: Crítica
  - **Historia de Usuario**:
    - **Como** Operador / Administrador del sistema,
    - **Quiero** que la tabla de pedidos se comunique con las rutas correctas del servidor,
    - **Para** poder visualizar todos los pedidos entrantes y actualizar su estado operativo sin recibir errores 404.
  - **Criterios de Aceptación**:
    - [x] Al acceder a la pestaña "Bandeja de Pedidos", la tabla consulta la ruta correcta enviando el token `Bearer`.
    - [x] Se listan las órdenes cargadas en MongoDB con sus respectivos números `#DQ-XXXX`, montos y clientes.
    - [x] Al hacer clic en el botón de cambiar estado, el cliente envía la petición `PATCH` a la URL unificada correspondiente.
    - [x] El estado del pedido se actualiza visualmente en la tabla y en la base de datos sin disparar error "No se pudo cambiar el estado".
    - [x] La acción de cambio de estado queda asentada en la colección de auditoría (`AuditLogModel`).
  - **Resolución**:
    - *Diagnóstico*: `OrdersTable.tsx` invocaba `GET /api/orders` y `PATCH /api/orders/${id}/status`, pero el backend solo escuchaba `/admin/list` y `/admin/:id/status`. Al no coincidir la ruta, caía por defecto en el middleware de Vite SPA retornando HTML (`index.html`) con status 200 y provocando `SyntaxError: Failed to parse JSON`.
    - *Solución*: Se actualizaron las rutas en `server/routes/orders.ts` para aceptar tanto `/` como `/admin/list` en GET, y tanto `/:id/status` como `/admin/:id/status` en PATCH. Adicionalmente, en `server.ts` se configuró un middleware 404 JSON explícito para `/api/*` que previene cualquier fallback indeseado a HTML.
    - *Archivos Editados*:
      - [server/routes/orders.ts](file:///c:/Users/Carlos/Documents/distriquiero/server/routes/orders.ts)
      - [server.ts](file:///c:/Users/Carlos/Documents/distriquiero/server.ts)

- [x] **[HU-002] Recuperación y Gestión Completa de Productos en Panel de Administración**
  - **Tipo**: Bugfix (Frontend & API)
  - **Prioridad**: Crítica
  - **Historia de Usuario**:
    - **Como** Administrador del catálogo,
    - **Quiero** que el panel administrativo de productos consulte el endpoint oficial `/api/admin/products`,
    - **Para** poder ver y gestionar tanto productos activos como pausados, sin que desaparezcan al pausarlos.
  - **Criterios de Aceptación**:
    - [x] `ProductsManager.tsx` consulta `GET /api/admin/products` enviando la cabecera `Authorization: Bearer <token>`.
    - [x] La lista de productos en el panel administrativo muestra todos los productos existentes, distinguiendo claramente cuáles están activos y cuáles están pausados.
    - [x] Al alternar el switch de pausa (`PATCH /api/admin/products/:id/pause`), el producto actualiza su estado y permanece visible en la tabla con su indicador visual actualizado.
    - [x] El catálogo público (`CatalogView.tsx`) continúa mostrando únicamente los productos con `isPaused === false`.
  - **Resolución**:
    - *Diagnóstico*: `ProductsManager.tsx` llamaba a la ruta pública `/api/catalog?includePaused=true` sin autenticación. Dicho endpoint descarta el parámetro y filtra estrictamente `{ isPaused: false }`, haciendo que cualquier producto pausado desaparezca del sistema para el administrador.
    - *Solución*: Se actualizó `ProductsManager.tsx` para consumir el endpoint administrativo protegido `GET /api/admin/products` enviando el token de sesión. Además, se actualizó el script `dev` en `package.json` para ejecutar `tsx watch server.ts`, asegurando el reinicio automático del servidor ante cambios de backend.
    - *Archivos Editados*:
      - [src/components/admin/ProductsManager.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/components/admin/ProductsManager.tsx)
      - [package.json](file:///c:/Users/Carlos/Documents/distriquiero/package.json)

- [x] **[HU-003] Apertura y Derivación Segura de Pedidos a WhatsApp sin Bloqueo de Navegador**
  - **Tipo**: Bugfix / Mejora UX
  - **Prioridad**: Alta
  - **Historia de Usuario**:
    - **Como** Comprador mayorista,
    - **Quiero** que al confirmar mi pedido el enlace a WhatsApp se abra de manera fluida y confiable,
    - **Para** enviar el mensaje preformateado a la distribuidora sin que el navegador bloquee la ventana por ser emergente.
  - **Criterios de Aceptación**:
    - [x] La redirección o apertura de WhatsApp cuenta con un botón explícito y destacado de "Abrir WhatsApp para confirmar pedido" accesible al usuario.
    - [x] Se eliminó la llamada asíncrona a `window.open` dentro de timers automáticos en background para evitar el bloqueo del navegador.
    - [x] Se provee una acción secundaria destacada de "Copiar texto del pedido" con feedback visual al portapapeles.
  - **Resolución**:
    - *Diagnóstico*: `OrderConfirmationModal.tsx` ejecutaba `window.open(orderData.whatsappUrl, '_blank')` dentro de un `setInterval` de 5 segundos. Las políticas de seguridad de navegadores modernos bloquean cualquier apertura emergente que no derive directamente de un evento sincrónico de usuario (`click`).
    - *Solución*: Se eliminó la invocación a `window.open` en background, transformando el llamado a la acción en un botón nativo prioritario con `target="_blank"` y `rel="noopener noreferrer"`. Además, se implementó un botón secundario para copiar el texto estructurado del pedido al portapapeles con confirmación visual.
    - *Archivos Editados*:
      - [src/components/cart/OrderConfirmationModal.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/components/cart/OrderConfirmationModal.tsx)

- [x] **[HU-004] Sincronización y Revalidación de Precios Vigentes en el Carrito Local**
  - **Tipo**: Consistencia de Datos / Bugfix
  - **Prioridad**: Alta
  - **Historia de Usuario**:
    - **Como** Comprador mayorista,
    - **Quiero** que los precios en mi carrito se sincronicen con los precios actuales del catálogo,
    - **Para** no ver precios desactualizados si un administrador modificó los valores mientras mi carrito seguía guardado en el navegador.
  - **Criterios de Aceptación**:
    - [x] Al iniciar la aplicación, el carrito revalida los ítems almacenados contra el catálogo vigente del servidor.
    - [x] Si hubo cambios de precios unitarios, por bulto o de unidades mínimas, los totales en pantalla se recalculan automáticamente.
    - [x] Si un producto del carrito fue pausado o quedó sin stock, se muestra una advertencia visual ("Pausado / Sin Stock") y se bloquea el envío de la orden hasta que sea removido.
  - **Resolución**:
    - *Diagnóstico*: `CartContext.tsx` congelaba en `localStorage` la entidad `product` con sus precios pasados. Si el administrador ajustaba precios o pausaba un producto, el cliente seguía viendo montos viejos en el drawer hasta enviar el pedido.
    - *Solución*: Se agregó un efecto de revalidación en `CartContext.tsx` que coteja los ítems del carrito contra `/api/catalog` en el inicio y sincroniza precios/unidades. En `CartDrawer.tsx` se añadió un badge de advertencia para ítems pausados y una validación de bloqueo con mensaje explicativo en `handleSubmitOrder`.
    - *Archivos Editados*:
      - [src/context/CartContext.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/context/CartContext.tsx)
      - [src/components/cart/CartDrawer.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/components/cart/CartDrawer.tsx)

---

## 🔴 Backlog de Historias de Usuario (To Do)

---

### 🚨 Prioridad Crítica (Funcionalidades operativas rotas)

*No hay tickets pendientes en este nivel.*

---

### ⚠️ Prioridad Alta (Experiencia de usuario, transacciones y consistencia)

*No hay tickets pendientes en este nivel.*

---

### 🟡 Prioridad Media (Rendimiento, arquitectura y validaciones)

---

- [x] **[HU-005] Memoización del Contexto de Notificaciones Toast y Estabilización de Dependencias**
  - **Tipo**: Rendimiento / Refactor
  - **Prioridad**: Media
  - **Historia de Usuario**:
    - **Como** Desarrollador de la aplicación,
    - **Quiero** que el proveedor de notificaciones `ToastProvider` entregue un valor de contexto memoizado con `useMemo`,
    - **Para** evitar re-renders innecesarios en todo el árbol de componentes y prevenir bucles infinitos en efectos que dependen de `error` o `success`.
  - **Criterios de Aceptación**:
    - [x] Las funciones `toast`, `success`, `error`, `info` y el objeto contenedor en `ToastProvider` deben estar encapsulados con `useCallback` y `useMemo`.
    - [x] Agregar o cerrar un Toast no debe desencadenar re-renders en componentes que solo consumen el emisor de alertas y no han cambiado sus props.
  - **Resolución**:
    - *Diagnóstico*: En `Toast.tsx`, el objeto del `ToastContext.Provider` se recreaba en cada render al instanciar un objeto literal inline `{ toast, success, error, info }`. Esto alteraba la identidad referencial del contexto y forzaba re-renderizados en cascada y disparos espurios de `useEffect` en vistas que escuchaban los métodos de alerta.
    - *Solución*: Se memoizó el objeto de contexto mediante `useMemo(() => ({ toast, success, error, info }), [toast, success, error, info])`, garantizando estabilidad referencial absoluta.
    - *Archivos Editados*:
      - [src/components/ui/Toast.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/components/ui/Toast.tsx)

- [x] **[HU-006] Consumo Dinámico y Reordenamiento de Rutas de Banners Promocionales**
  - **Tipo**: Deuda Técnica / Feature
  - **Prioridad**: Media
  - **Historia de Usuario**:
    - **Como** Administrador y Cliente de DistriQuiero,
    - **Quiero** que los banners promocionales provengan de la base de datos y que las rutas del catálogo estén ordenadas correctamente,
    - **Para** visualizar promociones dinámicas sin colisiones de enrutamiento con parámetros de productos.
  - **Criterios de Aceptación**:
    - [x] Se reorganizaron las rutas en `server/routes/catalog.ts` para que `/banners` y `/banners/list` se registren antes del parámetro dinámico `/:id`.
    - [x] `CatalogView.tsx` consume `/api/catalog/banners` en paralelo con el catálogo y renderiza tarjetas interactivas de promociones destacadas en la tienda mayorista.
    - [x] Al cliquear un banner promocional activo, la vista filtra automáticamente el catálogo según la categoría objetivo (`targetCategory`) o la sección de ofertas.
  - **Resolución**:
    - *Diagnóstico*: En `server/routes/catalog.ts`, la ruta `/:id` estaba declarada antes de `/banners/list`, lo que generaba ambigüedad en Express. Además, `CatalogView.tsx` no consumía `BannerModel` ni su API, dejando los banners de la base de datos huérfanos.
    - *Solución*: Se reordenaron las rutas en `server/routes/catalog.ts` registrando `['/banners', '/banners/list']` antes de `/:id`. Se actualizó `CatalogView.tsx` para cargar los banners en paralelo y renderizar tarjetas interactivas con redirección inteligente por categoría.
    - *Archivos Editados*:
      - [server/routes/catalog.ts](file:///c:/Users/Carlos/Documents/distriquiero/server/routes/catalog.ts)
      - [src/components/catalog/CatalogView.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/components/catalog/CatalogView.tsx)

- [x] **[HU-007] Validación Estricta de Tipos MIME y Sanitización en Carga de Imágenes**
  - **Tipo**: Seguridad
  - **Prioridad**: Media
  - **Historia de Usuario**:
    - **Como** Oficial de seguridad y Administrador del sistema,
    - **Quiero** que el servicio de subida de imágenes restrinja estrictamente los tipos MIME aceptados,
    - **Para** evitar la inyección o almacenamiento de archivos no gráficos o potencialmente maliciosos en ImageKit / Buffer.
  - **Criterios de Aceptación**:
    - [x] Configurar `fileFilter` en Multer para admitir únicamente imágenes válidas (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
    - [x] Rechazar cualquier archivo con tipo MIME diferente devolviendo código de error HTTP 400 descriptivo.
    - [x] En la recepción de base64, validar que el prefijo coincida estrictamente con `data:image/(jpeg|png|webp|gif);base64,`.
  - **Resolución**:
    - *Diagnóstico*: `server/routes/adminUpload.ts` aceptaba cualquier archivo de hasta 5MB en memoria sin `fileFilter` y procesaba payloads en base64 sin validar la cabecera de tipo MIME, lo que permitía subir archivos arbitrarios.
    - *Solución*: Se incorporó `fileFilter` en Multer validando contra una lista blanca (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) con middleware de captura que retorna HTTP 400 descriptivo. Asimismo, para payloads base64 se añadió validación regex estricta de cabecera y extracción de extensión correcta.
    - *Archivos Editados*:
      - [server/routes/adminUpload.ts](file:///c:/Users/Carlos/Documents/distriquiero/server/routes/adminUpload.ts)

- [x] **[HU-008] Validación de Consistencia Comercial Mayorista vs Minorista en Zod**
  - **Tipo**: Regla de Negocio
  - **Prioridad**: Media
  - **Historia de Usuario**:
    - **Como** Administrador comercial,
    - **Quiero** que el sistema impida guardar un producto cuyo precio por bulto sea superior a comprar las unidades sueltas,
    - **Para** prevenir errores de tipeo que rompan la propuesta de valor mayorista.
  - **Criterios de Aceptación**:
    - [x] El esquema Zod incluye un refinamiento (`.refine()`) que verifica que `priceBulk <= priceUnit * unitsPerBulk`.
    - [x] Si un operador ingresa un precio de bulto incongruente, el backend retorna 400 indicando la inconsistencia comercial.
    - [x] El formulario en `ProductDrawer.tsx` previene el guardado y muestra un indicador visual en tiempo real (alerta roja de incongruencia o badge verde de ahorro mayorista).
  - **Resolución**:
    - *Diagnóstico*: En `server/routes/adminProducts.ts`, `ProductSchema` únicamente verificaba que los precios fueran positivos (`.min(0)`), permitiendo fijar precios de bultos cerrados más costosos que las unidades individuales sueltas.
    - *Solución*: Se crearon esquemas desacoplados `BaseProductSchema`, `ProductSchema` y `ProductUpdateSchema` con validación `.refine()` en backend. En el frontend (`ProductDrawer.tsx`), se añadieron validaciones pre-envío y un indicador bento dinámico que alerta ante incongruencias y muestra el porcentaje de descuento exacto por bulto.
    - *Archivos Editados*:
      - [server/routes/adminProducts.ts](file:///c:/Users/Carlos/Documents/distriquiero/server/routes/adminProducts.ts)
      - [src/components/admin/ProductDrawer.tsx](file:///c:/Users/Carlos/Documents/distriquiero/src/components/admin/ProductDrawer.tsx)

- [x] **[HU-009] Desacople de Datos Mock Masivos en Memoria**
  - **Tipo**: Limpieza de Código / Refactor
  - **Prioridad**: Baja
  - **Historia de Usuario**:
    - **Como** Desarrollador del backend,
    - **Quiero** desacoplar los más de 350 renglones de datos mock de `server/lib/db-store.ts`,
    - **Para** que el servicio de datos sea legible, mantenible y enfocado en la interacción con Mongoose.
  - **Criterios de Aceptación**:
    - [x] Se extrajeron los datos de fallback a `server/lib/fixtures/mock-data.ts`.
    - [x] `server/lib/db-store.ts` redujo significativamente su longitud (de 893 a 516 líneas) centrándose exclusivamente en la capa de persistencia y consultas.
  - **Resolución**:
    - *Diagnóstico*: `server/lib/db-store.ts` contenía arrays hardcodeados masivos de productos, pedidos, usuarios y logs mezclados con las firmas de métodos de base de datos.
    - *Solución*: Se extrajo todo el estado en memoria y la función de inicialización a un módulo independiente en `server/lib/fixtures/mock-data.ts`, manteniendo compatibilidad con la capa de fallback sin ensuciar la lógica del servicio.
    - *Archivos Editados*:
      - [server/lib/fixtures/mock-data.ts](file:///c:/Users/Carlos/Documents/distriquiero/server/lib/fixtures/mock-data.ts)
      - [server/lib/db-store.ts](file:///c:/Users/Carlos/Documents/distriquiero/server/lib/db-store.ts)

- [x] **[HU-010] Script `clean` Multiplataforma en `package.json`**
  - **Tipo**: DevOps / Mantenimiento
  - **Prioridad**: Baja
  - **Historia de Usuario**:
    - **Como** Desarrollador que utiliza Windows, Mac o Linux,
    - **Quiero** que el comando `bun run clean` funcione de manera nativa sin fallar por sintaxis Unix,
    - **Para** poder limpiar los artefactos de compilación (`dist/`) de forma portable.
  - **Criterios de Aceptación**:
    - [x] Se reemplazó `rm -rf` por un comando nativo portable de Node/Bun (`node -e "const fs = require('fs'); ['dist', 'server.js'].forEach(p => fs.existsSync(p) && fs.rmSync(p, { recursive: true, force: true }))"`).
    - [x] Se ejecutó `bun run clean` en entorno Windows verificando salida 0 y limpieza efectiva de la carpeta `dist`.
  - **Resolución**:
    - *Diagnóstico*: El script `"clean": "rm -rf dist server.js"` en `package.json` dependía de binarios Unix inexistentes por defecto en la consola de comandos de Windows (CMD/PowerShell).
    - *Solución*: Se reescribió el comando utilizando la API sincrónica `fs.rmSync` de Node/Bun invocada mediante flag `-e`, funcionando de manera idéntica y sin dependencias externas en Windows, Linux y macOS.
    - *Archivos Editados*:
      - [package.json](file:///c:/Users/Carlos/Documents/distriquiero/package.json)

---

## 🔴 Backlog de Historias de Usuario (To Do)

*¡Felicitaciones! Todos los tickets auditados del backlog (Críticos, Altos, Medios y de Mantenimiento) han sido resueltos y verificados.*
