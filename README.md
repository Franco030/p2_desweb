# Ticket de Turno

Aplicación web para solicitar turnos de atención por municipio. Tiene un portal público, donde se registra y modifica la solicitud y se descarga un comprobante PDF con QR, y un área privada para administradores.

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite, **Fluent UI 2** (`@fluentui/react-components`), React Router, Recharts |
| Backend | Node.js + **Express 5** (API REST) |
| Base de datos | **SQLite 3** |
| ORM | **Sequelize** |
| PDF / QR | PDFKit + qrcode |
| Seguridad | JWT, bcrypt, captcha SVG (`svg-captcha`) |

## Requisitos

- Node.js 20 o superior (probado con Node 24)
- npm

## Instalación y ejecución

```bash
npm install
npm run install:all
npm run seed      # opcional: carga 60 solicitudes de ejemplo para el tablero
npm run dev       # API en http://localhost:4000 y web en http://localhost:5173
```

Al iniciar por primera vez se crean las tablas, los catálogos (38 municipios de Coahuila, niveles y asuntos) y el usuario administrador:

- **Usuario:** `admin`
- **Contraseña:** `Admin123*`

Se pueden cambiar con las variables de `server/.env` (ver `server/.env.example`).

### Producción

```bash
npm run build     # compila React en client/dist
npm start         # Express sirve la API y el frontend en http://localhost:4000
```

> Si `npm install` bloquea el script de instalación de `sqlite3` (npm 11+), ya está aprobado en `server/package.json` (`allowScripts`). En caso necesario: `npm rebuild sqlite3 --prefix server`.

## Arquitectura (MVC, orientada a objetos)

```
server/src
├── config/Database.js          Conexión Sequelize (Singleton)
├── models/                     MODELO: clases Sequelize (CatalogoBase → Municipio, NivelEducativo, Asunto; Solicitud, Usuario, Bitacora)
├── controllers/                CONTROLADOR: clases que atienden cada recurso REST
├── services/                   Lógica de negocio: turnos por municipio, PDF, captcha, autenticación
├── patterns/                   Singleton, Factory, Observer y Adapter
├── middleware/                 Autenticación JWT y manejo de errores
├── routes/ApiRouter.js         Definición de rutas /api
└── App.js / server.js          Clase App que arma e inicia el servidor

client/src
├── models/SolicitudModel.js    Modelo del cliente (validación y conversión a payload)
├── services/                   Clases que consumen la API REST (HttpClient Singleton)
├── context/ hooks/             Estado de sesión y utilidades
└── views/                      VISTA: layout, componentes, páginas públicas y de administración
```

### Patrones de diseño

| Patrón | Dónde | Para qué |
| --- | --- | --- |
| **Singleton** | `server/src/config/Database.js`, `client/src/services/HttpClient.js` | Una única conexión ORM y un único cliente HTTP |
| **Factory** | `server/src/patterns/CatalogoFactory.js` | Crea controlador y router CRUD de cada catálogo a partir de su nombre |
| **Observer** | `server/src/patterns/SolicitudSubject.js` + `observers/` | Al crear, modificar, cambiar el estatus o eliminar una solicitud se notifica a la bitácora y a la consola |
| **Adapter** | `server/src/patterns/QrCodeAdapter.js` | Interfaz simple `generarPng()` sobre la librería `qrcode` |

## API REST

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/auth/captcha` | público | Genera un captcha |
| POST | `/api/auth/login` | público | Usuario, contraseña y captcha → JWT |
| POST | `/api/auth/logout` | admin | Cierre de sesión |
| GET | `/api/auth/perfil` | admin | Usuario de la sesión |
| GET | `/api/catalogos/{municipios\|niveles\|asuntos}` | público | Lista (`?activos=1`) |
| POST/PUT/DELETE | `/api/catalogos/{tipo}/:id` | admin | CRUD de catálogos |
| POST | `/api/publico/solicitudes` | público | Registra una solicitud y asigna el turno |
| POST | `/api/publico/solicitudes/buscar` | público | Busca por CURP + turno |
| PUT | `/api/publico/solicitudes/:id` | público | Modifica (valida CURP + turno actuales) |
| GET | `/api/publico/solicitudes/:id/comprobante?curp=&turno=` | público | Comprobante PDF |
| GET | `/api/solicitudes?q=&municipioId=&estatus=` | admin | Consulta por CURP o nombre |
| POST/PUT/DELETE | `/api/solicitudes/:id` | admin | Alta, cambio y baja |
| PATCH | `/api/solicitudes/:id/estatus` | admin | Marca como `Resuelto` o `Pendiente` |
| GET | `/api/solicitudes/:id/comprobante` | admin | Comprobante PDF |
| GET | `/api/dashboard?municipioId=` | admin | Totales por estatus y por municipio |

## Cobertura de requisitos

| # | Requisito | Implementación |
| --- | --- | --- |
| 1 | Login con captcha | `LoginPage.jsx`, `AuthService`, `CaptchaService` |
| 2 | Registro y modificación pública, comprobante PDF, turno por municipio | `NuevaSolicitudPage`, `ModificarSolicitudPage`, `SolicitudService.#siguienteTurno` (turno de 1 a n por municipio, índice único `municipioId + turno`) |
| 3 | QR con la CURP en el PDF | `ComprobantePdfService` + `QrCodeAdapter` |
| 4 | Consulta por CURP o nombre, alta, cambio, baja y estatus | `SolicitudesPage.jsx` |
| 5 | CRUD de catálogos | `CatalogoPage.jsx` (municipios, niveles, asuntos) |
| 6 | Cerrar sesión y menú | `AppLayout.jsx` (menú lateral en escritorio y desplegable en móvil) |
| 7 | API REST | Ver tabla anterior |
| 8 | Tablero con gráficas filtrables por municipio | `DashboardPage.jsx` (dona y barras apiladas) |
| 9 | Git | Historial de commits del repositorio |
| 10 | ORM | Sequelize |
| 11 | Patrón de diseño | Singleton, Factory, Observer y Adapter |
| — | Responsivo | Breakpoints en `styles.css` (escritorio, tableta y móvil) |
