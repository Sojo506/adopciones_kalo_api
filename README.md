# API de Adopciones Kalo

Backend principal de la plataforma Adopciones Kalo. Este repositorio expone una API REST construida con Express sobre Oracle Database y concentra la logica de autenticacion, adopciones, seguimientos, campanas, donaciones, tienda solidaria, facturacion, reportes PDF y subida de imagenes.

## Que resuelve este repo

La API es la capa que conecta el frontend con la base de datos y con los servicios externos del proyecto:

- Oracle Database con wallet y objetos SQL/PLSQL.
- JWT de acceso y refresh token persistido en cookie httpOnly.
- OTP por correo para verificacion de email, recuperacion de password y cambios sensibles de perfil.
- PayPal para donaciones y checkout de tienda.
- Cloudinary para imagenes de perritos, campanas, productos, evidencias y detalles de eventos.
- PDFKit para facturas y reportes administrativos.
- Nodemailer para envio de codigos y facturas.
- Oracle Scheduler para tareas operativas sobre seguimientos vencidos.

## Stack tecnico

- Node.js LTS
- Express 5
- OracleDB (`oracledb`)
- JWT (`jsonwebtoken`)
- Bcrypt
- Nodemailer
- Cloudinary + Multer
- PDFKit

## Como esta organizado

La estructura sigue un flujo bastante clasico pero con una fuerte dependencia en Oracle:

- `server.js`: carga `.env`, inicializa el pool de Oracle y levanta el servidor con apagado ordenado.
- `src/app.js`: configura CORS, `helmet`, `morgan`, parseo JSON, monta `/api` y centraliza errores.
- `src/routes/`: agrupa los dominios HTTP por modulo (`auth`, `dogs`, `campaigns`, `store-checkout`, `reports`, etc.).
- `src/controllers/`: valida request/response y traduce errores de negocio a respuestas HTTP.
- `src/services/`: vive la logica real del sistema, reglas de negocio, coordinacion entre repositorios y cache en memoria.
- `src/repositories/`: habla con Oracle, en muchos casos llamando funciones y procedures del package `KALO.FIDE_KALO_PKG`.
- `src/config/`: configuracion de Oracle, JWT, correo, PayPal y Cloudinary.
- `src/middlewares/`: autenticacion JWT, permisos admin y uploads.
- `src/pdf/`: generacion de facturas y reportes administrativos.
- `src/resources/`: artefactos SQL del esquema, package, funciones, vistas, indices, triggers e inserts.
- `scripts/`: utilidades de bootstrap para semilla de datos y creacion de cuenta admin.

## Arquitectura de extremo a extremo

En runtime, una peticion tipica sigue este camino:

1. El frontend consume un endpoint en `/api/...`.
2. `src/app.js` aplica CORS para `http://localhost:5173`, seguridad HTTP y logging.
3. La ruta correspondiente entra por `src/routes/index.js`.
4. El controller valida parametros con `express-validator`.
5. El service aplica reglas de negocio, cache, integraciones externas y coordinacion de entidades.
6. El repository ejecuta la operacion en Oracle.
7. La respuesta vuelve al cliente en formato JSON uniforme con `ok`, `message`, `data` y, cuando aplica, `count`.

Dos decisiones tecnicas importantes del proyecto:

- La API usa `MemoryCache` por servicio para evitar recomputar consultas frecuentes y para deduplicar cargas concurrentes dentro del proceso Node.
- La autenticacion no depende solo del JWT: cada access token queda amarrado a una sesion real persistida en `refresh tokens`, lo que permite revocacion, forced logout y control de sesiones activas.

## Prerrequisitos

Antes de intentar levantar el backend, necesitas:

- Node.js LTS y `npm`
- Acceso a una instancia Oracle con wallet
- Variables SMTP validas para envio de correos
- Credenciales de Cloudinary
- Credenciales de PayPal
- Una base con los objetos SQL del proyecto ya creados si vas a correr `db:seed`

## Instalacion paso a paso

### 1. Instalar dependencias

```bash
cd api
npm install
```

### 2. Preparar el archivo `.env`

Crea `api/.env` con valores propios. No copies secretos reales al repositorio. Un ejemplo seguro:

```env
PORT=3000
NODE_ENV=development

DB_USER=...
DB_PASSWORD=...
DB_CONNECT_STRING=...
WALLET_DIR=./wallet
DB_WALLET_PASSWORD=...
DB_OBJECT_SCHEMA=KALO

JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me_too

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=no-reply@example.com
MAIL_FROM_NAME=Adopciones Kalo

PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
PAYPAL_CURRENCY=USD
PAYPAL_CURRENCY_ID=1

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Colocar el wallet Oracle

El codigo espera el wallet en la ruta definida por `WALLET_DIR`. Este repo ya incluye el directorio `api/wallet/`, pero debes llenarlo con tus archivos reales de conexion. Sin eso, `initializePool()` fallara al arrancar.

### 4. Preparar la base de datos

Si estas creando una base nueva, primero debes aplicar manualmente los SQL de `src/resources/` en Oracle. El orden exacto puede variar segun dependencias de tu schema, pero este repo asume que al menos ya existen los objetos base antes de correr el seed. En la carpeta vas a encontrar:

- `schema.sql`
- `functions.sql`
- `procedures.sql`
- `package.sql`
- `package_body.sql`
- `jobs.sql`
- `views.sql`
- `indexes.sql`
- `triggers.sql`
- `stock_minimo_migration.sql` para agregar `STOCK_MINIMO` y backfillear inventarios existentes

Despues de que la estructura exista, puedes cargar datos base con:

```bash
npm run db:seed
```

Notas importantes del seed:

- El script usa `src/resources/inserts.sql`.
- El script aborta si detecta datos en tablas base como usuarios, tipos de usuario o paises.
- El seed no crea el esquema; solo inserta datos.

### 5. Crear una cuenta admin inicial si hace falta

Si ya existe un usuario admin pero aun no tiene cuenta de acceso, puedes bootstrapearla:

```bash
npm run db:bootstrap-admin
```

Variables opcionales para este paso:

- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`

Si no las defines, el script genera un username a partir del nombre del admin y usa `Admin#2026` como password por defecto.

### 6. Levantar el servidor

```bash
npm start
```

Por defecto expone:

- API base: `http://localhost:3000/api`
- Health minima: `http://localhost:3000/`

### 7. Verificar integracion con el frontend

El CORS de desarrollo esta fijado actualmente a `http://localhost:5173` en `src/app.js`. Si levantas el frontend en otro host o puerto, debes ajustar ese archivo.

## Scripts disponibles

| Script | Que hace |
| --- | --- |
| `npm start` | Levanta el servidor con `nodemon server.js`. |
| `npm run db:seed` | Ejecuta los inserts base desde `src/resources/inserts.sql`. |
| `npm run db:bootstrap-admin` | Crea una cuenta admin inicial si existe el usuario admin pero no su cuenta. |

Observacion: `npm test` no esta implementado; el `package.json` actual solo devuelve error placeholder.

## Variables de entorno por dominio

### Servidor

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP del backend. |
| `NODE_ENV` | Afecta cookies seguras y comportamiento de entorno. |

### Oracle y pool

| Variable | Uso |
| --- | --- |
| `DB_USER` | Usuario Oracle. |
| `DB_PASSWORD` | Password Oracle. |
| `DB_CONNECT_STRING` | Connect string de Oracle. |
| `WALLET_DIR` | Ruta del wallet. |
| `DB_WALLET_PASSWORD` | Password del wallet. |
| `DB_OBJECT_SCHEMA` | Schema esperado por helpers de repositorio. |
| `DB_POOL_MIN` | Minimo de conexiones del pool. |
| `DB_POOL_MAX` | Maximo de conexiones del pool. |
| `DB_POOL_INCREMENT` | Incremento del pool. |
| `DB_POOL_TIMEOUT` | Tiempo antes de liberar conexiones ociosas. |
| `DB_QUEUE_TIMEOUT` | Tiempo maximo esperando una conexion. |
| `DB_STMT_CACHE_SIZE` | Cache de statements Oracle. |
| `ORACLE_FETCH_BATCH_SIZE` | Tamano de fetch para cursores. |

### Autenticacion, JWT y cookies

| Variable | Uso |
| --- | --- |
| `JWT_ACCESS_SECRET` | Firma del access token. |
| `JWT_REFRESH_SECRET` | Firma del refresh token. |
| `REFRESH_TOKEN_COOKIE_NAME` | Nombre de la cookie de refresh. |
| `REFRESH_TOKEN_COOKIE_PATH` | Path de la cookie; por defecto apunta a `/api/auth`. |
| `REFRESH_TOKEN_COOKIE_SAMESITE` | Politica `SameSite` del refresh token. |
| `REFRESH_TOKEN_COOKIE_SECURE` | Fuerza cookie segura. |
| `AUTH_EVENT_HEARTBEAT_MS` | Heartbeat del stream SSE de eventos de sesion. |
| `PASSWORD_RECOVERY_OTP_TTL_MINUTES` | Vigencia del OTP de recuperacion. |
| `PROFILE_SECURITY_OTP_TTL_MINUTES` | Vigencia del OTP para cambio de correo/password desde perfil. |

### Correo SMTP

| Variable | Uso |
| --- | --- |
| `MAIL_HOST` | Host SMTP. |
| `MAIL_PORT` | Puerto SMTP. |
| `MAIL_USER` | Usuario SMTP. |
| `MAIL_PASS` | Password SMTP. |
| `MAIL_FROM` | Correo remitente. |
| `MAIL_FROM_NAME` | Nombre mostrado en los correos. |

### PayPal y pagos

| Variable | Uso |
| --- | --- |
| `PAYPAL_ENV` | `sandbox` o `production`; cambia la base URL de PayPal. |
| `PAYPAL_CLIENT_ID` | Credencial publica/servidor para autenticar contra PayPal. |
| `PAYPAL_SECRET` | Secret de PayPal. |
| `PAYPAL_CURRENCY` | Moneda del flujo de donaciones; por defecto `USD`. |
| `PAYPAL_CURRENCY_ID` | Moneda interna para facturas generadas tras pagos PayPal. |
| `CRC_USD_RATE` | Tipo de cambio usado por tienda para convertir CRC a USD antes de crear la orden PayPal. |
| `STORE_TAX_RATE` | Tasa usada al desglosar el IVA en facturas de tienda. |

### Cloudinary y uploads

| Variable | Uso |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` o `CLOUD_NAME` | Cloud name de Cloudinary. |
| `CLOUDINARY_API_KEY` o `CLOUD_API_KEY` | API key. |
| `CLOUDINARY_API_SECRET` o `CLOUD_API_SECRET` | API secret. |
| `CLOUDINARY_CAMPAIGN_IMAGES_FOLDER` | Folder para imagenes de campanas. |
| `CLOUDINARY_DOG_IMAGES_FOLDER` | Folder para imagenes de perritos. |
| `CLOUDINARY_PRODUCT_IMAGES_FOLDER` | Folder para imagenes de productos. |
| `CLOUDINARY_EVENT_DETAIL_FOLDER` | Folder para comprobantes o detalle de evento. |
| `CLOUDINARY_EVIDENCE_IMAGES_FOLDER` | Folder para evidencias de seguimiento. |
| `PRODUCT_IMAGE_MAX_SIZE_BYTES` | Limite general de imagenes de producto. |
| `DOG_IMAGE_MAX_SIZE_BYTES` | Limite para imagenes de perritos. |
| `CAMPAIGN_IMAGE_MAX_SIZE_BYTES` | Limite para imagenes de campanas. |
| `EVENT_DETAIL_IMAGE_MAX_SIZE_BYTES` | Limite para detalle de eventos. |
| `EVIDENCE_IMAGE_MAX_SIZE_BYTES` | Limite para evidencias. |

### Bootstrap y operacion inicial

| Variable | Uso |
| --- | --- |
| `BOOTSTRAP_ADMIN_USERNAME` | Username del admin inicial. |
| `BOOTSTRAP_ADMIN_PASSWORD` | Password del admin inicial. |

### Reportes y cache

| Variable | Uso |
| --- | --- |
| `ADMIN_REPORT_CACHE_TTL_MS` | TTL del resumen y reportes administrativos. |
| `*_CACHE_TTL_MS` | Muchos servicios exponen su propio TTL de cache en memoria, por ejemplo `USER_CACHE_TTL_MS`, `DOG_CACHE_TTL_MS`, `PRODUCT_CACHE_TTL_MS`, `REQUEST_CACHE_TTL_MS`, `DONATION_CACHE_TTL_MS`, `EVIDENCE_CACHE_TTL_MS`, `FOLLOW_UP_CACHE_TTL_MS`, `SALE_CACHE_TTL_MS`, `INVOICE_CACHE_TTL_MS`, etc. |

## Rutas clave por dominio

No es una lista exhaustiva del esquema completo, pero si del flujo real de negocio.

### Autenticacion y perfil

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification-email`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password/request`
- `POST /api/auth/forgot-password/confirm`
- `GET /api/auth/me`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/profile/email/request-change`
- `POST /api/auth/profile/email/confirm-change`
- `POST /api/auth/profile/password/request-change`
- `POST /api/auth/profile/password/confirm-change`
- `GET /api/auth/events`

### Adopciones, perritos y seguimiento

- `GET /api/dogs`
- `GET /api/dogs/:idPerrito`
- `GET /api/adoption-requests/bootstrap`
- `GET /api/adoption-requests/check?idPerrito=...`
- `POST /api/adoption-requests`
- `GET /api/auth/profile/follow-ups`
- `GET /api/evidences/follow-up/:idSeguimiento`
- `POST /api/evidences`
- `PUT /api/evidences/:idEvidencia`
- `DELETE /api/evidences/:idEvidencia`

### Campanas y donaciones

- `GET /api/campaigns`
- `POST /api/paypal-checkout/orders`
- `POST /api/paypal-checkout/capture`
- `POST /api/donations/public`

### Tienda, ventas y facturacion

- `GET /api/catalogs/store`
- `GET /api/catalogs/products/:idProducto`
  - devuelve el detalle publico del producto, mantiene `imageUrl` y agrega `imagenes` con las imagenes activas de `FIDE_PRODUCTO_IMAGEN_TB`
- `POST /api/store-checkout/orders`
- `POST /api/store-checkout/capture`

### Reportes administrativos

- `GET /api/reports/summary`
- `GET /api/reports/:reportType/pdf`

## Flujos completos del backend

### 1. Registro, verificacion, login, refresh y logout

1. El cliente envia `POST /api/auth/register` con identificacion, usuario, password, correo, telefono y direccion.
2. `userService.signUp()` valida unicidad de usuario, email, telefono y usuario real.
3. Se valida la combinacion pais/provincia/canton/distrito contra Oracle.
4. Se crea la direccion.
5. Se crea el usuario con tipo `Cliente`.
6. Se crea la cuenta en estado pendiente.
7. Se crea el correo en estado pendiente.
8. Se crea el telefono en estado activo.
9. Se genera un OTP de verificacion y se envia por email.
10. `POST /api/auth/verify-email` marca el OTP como usado, activa el correo y activa la cuenta.
11. `POST /api/auth/login` acepta username o email, valida password y crea:
    - access token JWT de 15 minutos
    - refresh token JWT de 7 dias
    - registro persistido de refresh token en BD con `jti`, IP y user-agent
12. El access token viaja en el body; el refresh token se guarda en cookie httpOnly.
13. `POST /api/auth/refresh` rota el refresh token: revoca el anterior y emite uno nuevo.
14. `POST /api/auth/logout` revoca el refresh token actual.

Detalles operativos importantes:

- El middleware `authenticateToken` no solo verifica la firma JWT; tambien comprueba que la sesion siga viva en la tabla de refresh tokens.
- Si una cuenta se inactiva o se elimina, el sistema puede forzar logout de sesiones abiertas.
- El endpoint `GET /api/auth/events` usa Server-Sent Events para notificar forced logout al frontend.

Complemento: el archivo [README_AUTH.md](./README_AUTH.md) resume los endpoints de autenticacion y sirve como referencia adicional.

### 2. Recuperacion de password y cambios sensibles del perfil

Recuperacion de password:

1. `POST /api/auth/forgot-password/request` recibe usuario o correo.
2. Si la cuenta es recuperable, se genera un OTP temporal y se envia por email.
3. `POST /api/auth/forgot-password/confirm` valida OTP y evita reutilizar la misma password.
4. La password nueva se guarda hasheada.
5. Se revocan todas las sesiones activas de la cuenta.

Cambio de correo desde perfil:

1. El usuario autenticado solicita `POST /api/auth/profile/email/request-change`.
2. El backend envia un OTP al nuevo correo.
3. `POST /api/auth/profile/email/confirm-change` activa el nuevo correo tras validar OTP.

Cambio de password desde perfil:

1. `POST /api/auth/profile/password/request-change` valida password actual y genera OTP.
2. `POST /api/auth/profile/password/confirm-change` valida OTP y actualiza password.
3. El flujo termina limpiando sesiones para exigir reautenticacion limpia cuando aplica.

### 3. Campanas y donaciones con PayPal

1. El usuario autenticado elige una campana y monto.
2. El frontend llama `POST /api/paypal-checkout/orders`.
3. `paypalCheckoutService.createOrder()` autentica contra PayPal y crea una orden `CAPTURE`.
4. Cuando PayPal aprueba el pago, el frontend envia `POST /api/paypal-checkout/capture`.
5. El backend captura la orden en PayPal.
6. Si la captura fue `COMPLETED`, registra en secuencia:
   - donacion
   - factura
   - relacion donacion-factura
   - pago PayPal
7. El resultado final vuelve como donacion registrada.

Reglas que vale la pena conocer:

- Las donaciones publicas aun requieren usuario autenticado; no existe flujo anonimo.
- La moneda interna de la factura se resuelve por `PAYPAL_CURRENCY_ID` o, si no existe, intentando encontrar USD activa en catalogos.

### 4. Checkout de tienda, factura PDF y correo

1. El usuario autenticado arma el carrito en el frontend.
2. Cuando el usuario abre `GET /api/catalogs/products/:idProducto`, la API puede devolver `imagenes` activas para que el frontend arme una galeria sin consultar otra ruta publica.
3. El frontend envia `POST /api/store-checkout/orders` con el total calculado.
4. El backend convierte CRC a USD usando `CRC_USD_RATE` y crea la orden PayPal.
5. Tras aprobar el pago, el frontend llama `POST /api/store-checkout/capture` con `orderId` e items.
6. El backend vuelve a validar contra BD cada producto:
   - existencia
   - estado activo
   - inventario disponible
   - cantidad solicitada
7. Se captura la orden PayPal.
8. Se crea la venta.
9. Se crean las lineas venta-producto.
10. Se generan movimientos de inventario de egreso.
11. Se crea la factura.
12. Se enlaza venta-factura.
13. Se registra el pago PayPal.
14. Se genera el PDF de factura con PDFKit.
15. Si el usuario tiene correo activo, se envia la factura por email.
16. La respuesta incluye `pdfBase64` para descarga inmediata en el frontend.

Este flujo es especialmente sensible porque mezcla pasarela de pago, inventario, facturacion y correo en una sola operacion.

### 5. Solicitud de adopcion

1. El cliente carga `GET /api/adoption-requests/bootstrap`.
2. El backend devuelve:
   - perritos disponibles
   - id del tipo de solicitud de adopcion
   - preguntas activas ligadas a ese tipo
3. El usuario autenticado responde el formulario y envia `POST /api/adoption-requests`.
4. `adoptionRequestService.createAdoptionRequest()` valida:
   - elegibilidad del solicitante
   - que no exista otra solicitud abierta para ese perrito
   - que todas las preguntas activas tengan respuesta
   - tipo correcto de respuesta segun catalogo
5. Luego crea:
   - solicitud base
   - respuestas individuales
   - registro de adopcion en estado pendiente

Importante: en este proyecto, enviar el formulario no solo crea la solicitud; tambien crea una adopcion ligada a esa solicitud con estado pendiente para que el proceso siga dentro del sistema.

### 6. Seguimiento y evidencias

1. El usuario autenticado consulta `GET /api/auth/profile/follow-ups`.
2. La API solo devuelve seguimientos activos y no vencidos para la vista publica.
3. El payload publico del seguimiento no expone comentarios administrativos ni estados internos.
4. Para un seguimiento especifico se consultan evidencias con `GET /api/evidences/follow-up/:idSeguimiento`.
5. El usuario final puede subir nueva evidencia con `POST /api/evidences` usando `multipart/form-data`.
6. El backend valida:
   - acceso a ese seguimiento
   - fecha dentro del rango del seguimiento
   - imagen obligatoria en el formulario publico
7. Si hay imagen, se sube a Cloudinary.
8. La evidencia creada por usuario final queda forzada a estado `Pendiente`.
9. Los comentarios quedan reservados para administracion y no se aceptan desde el formulario publico.
10. `PUT /api/evidences/:idEvidencia` y `DELETE /api/evidences/:idEvidencia` quedan restringidos a administradores.
11. En respuestas publicas, la API solo mantiene visibles estados de evidencia aptos para usuario final, como `Pendiente` y `Aprobado`.

Complemento operativo de BD:

- `FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_SP` desactiva seguimientos cuya `FECHA_FIN` ya paso.
- `FIDE_DESACTIVAR_SEGUIMIENTOS_VENCIDOS_JOB` ejecuta ese proceso cada 5 minutos mediante `DBMS_SCHEDULER`.
- El dashboard administrativo puede seguir viendo y gestionando esos registros segun las reglas del modulo.

### 7. Reportes PDF administrativos

1. Solo administradores pueden acceder a `GET /api/reports/summary`.
2. Ese resumen alimenta el dashboard con:
   - facturas recientes
   - productos con stock bajo
   - seguimientos proximos o vencidos
3. El stock bajo ahora se define por `FIDE_INVENTARIO_TB.STOCK_MINIMO`; los endpoints de inventario exponen `stockMinimo` y usan `10` por defecto si no se envia.
4. `GET /api/reports/:reportType/pdf` genera reportes PDF tabulares para:
   - `facturas`
   - `donaciones`
   - `adopciones`
   - `inventario-bajo`
5. La generacion usa consultas agregadas desde `reportRepository` y `PDFKit`.

## Integraciones externas

### Oracle

Toda la aplicacion asume que Oracle es la fuente de verdad. Los repositorios usan cursores, funciones y procedures; no hay ORM.

Ademas del package `KALO.FIDE_KALO_PKG`, el proyecto usa jobs de `DBMS_SCHEDULER` para tareas operativas como la desactivacion automatica de seguimientos vencidos.

### SMTP

El correo no es accesorio. Sin SMTP funcional se rompen estos flujos:

- verificacion de cuenta
- cambio de correo
- cambio de password
- recuperacion de password
- envio de factura de tienda

### Cloudinary

Sin Cloudinary no podras manejar correctamente imagenes de:

- perritos
- productos
- campanas
- evidencias
- detalle de eventos

### PayPal

PayPal es obligatorio para:

- donaciones desde campanas
- checkout de tienda

## Contratos operativos que conviene tener claros

- El frontend debe consumir `http://localhost:3000/api` si dejas el puerto por defecto.
- El backend acepta frontend en `http://localhost:5173` salvo que cambies `src/app.js`.
- El access token viaja en `Authorization: Bearer ...`.
- El refresh token viaja en cookie httpOnly; por eso el cliente debe usar `withCredentials: true`.
- Muchas lecturas usan cache en memoria por proceso; reiniciar el backend limpia esa cache.
- La base de datos y los servicios externos son parte del arranque real del sistema; no hay modo local mockeado dentro del repo.

## Troubleshooting

### 401 al consumir endpoints protegidos

Revisa:

- que el access token siga en `Authorization`
- que el refresh token exista en cookie
- que el frontend este enviando `withCredentials: true`
- que la sesion siga activa en la tabla de refresh tokens
- que la cuenta o el correo no hayan quedado inactivos

### Login funciona pero el refresh no

Las causas mas comunes aqui son:

- `REFRESH_TOKEN_COOKIE_PATH` no coincide con `/api/auth`
- `REFRESH_TOKEN_COOKIE_SECURE=true` en entorno HTTP local
- `SameSite` demasiado restrictivo para tu entorno
- el frontend apunta a otro host distinto del esperado por CORS

### El servidor no arranca por Oracle

Verifica:

- `DB_USER`, `DB_PASSWORD` y `DB_CONNECT_STRING`
- que `WALLET_DIR` apunte al wallet real
- que `DB_WALLET_PASSWORD` sea correcto
- que la red permita llegar a Oracle

### `db:seed` falla

Revisa:

- que el esquema ya exista
- que `src/resources/inserts.sql` sea compatible con tu package
- que la base este vacia en tablas clave
- que el usuario Oracle tenga permisos sobre el schema esperado

### No llegan correos

Verifica:

- credenciales SMTP
- `MAIL_FROM` y `MAIL_FROM_NAME`
- puerto y politica TLS del proveedor
- si el proveedor exige allowlist o app password

### Fallan uploads o imagenes

Revisa:

- credenciales Cloudinary
- folders `CLOUDINARY_*`
- limites `*_IMAGE_MAX_SIZE_BYTES`
- tipo de payload `multipart/form-data`

### PayPal devuelve error al crear o capturar orden

Verifica:

- `PAYPAL_ENV`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- coherencia entre moneda configurada y flujo del frontend

En tienda, recuerda que el backend convierte CRC a USD antes de crear la orden. Si cambias moneda en frontend o backend, debes mantener ambos lados alineados.

### El PDF se genera pero no llega por correo

Ese escenario es posible: el checkout de tienda no se cae si falla el envio de la factura. Revisa el log del servidor y la configuracion SMTP.

## Recomendaciones para un developer nuevo

Si vienes por primera vez a este repo, el orden mas util para entenderlo es:

1. `server.js`
2. `src/app.js`
3. `src/routes/index.js`
4. `src/controllers/userController.js`
5. `src/services/userService.js`
6. `src/services/adoptionRequestService.js`
7. `src/services/paypalCheckoutService.js`
8. `src/services/storeCheckoutService.js`
9. `src/services/profileService.js`
10. `src/services/reportService.js`

Con ese recorrido entiendes autenticacion, sesiones, adopcion, pagos, seguimiento y reporteria, que son los ejes mas importantes del proyecto.
