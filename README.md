# Pronósticos Mundialistas

Aplicación web para organizar un juego de pronósticos de fútbol entre amigos: cada participante pronostica el marcador de los partidos, el organizador registra los resultados reales y la tabla de posiciones se calcula sola.

## Integrantes

| Nombre | Responsabilidades |
|---|---|
| Santiago Zambrano | Proyecto individual: diseño de la API (Node + Express), reglas de puntaje y validaciones, pruebas con Vitest, front-end en React, despliegue en AWS (S3 + EC2) y documentación. |

## Tecnologías

- **Front-end:** React 19 + Vite 8
- **Back-end:** Node.js (22.12 o superior) + Express 5, `cors`, `dotenv`
- **Pruebas:** Vitest 5 (en `api/` y en `front/`)
- **Infraestructura:** AWS S3 (sitio estático del front) y AWS EC2 (API), Amazon Linux 2023

Estructura del repositorio:

```
pronosticos-mundialistas/
├── api/                      # Back-end
│   ├── .env.example
│   └── src/
│       ├── servidor.js       # Levanta Express, CORS y monta las rutas
│       ├── rutas/            # Solo reciben la petición y responden
│       ├── logica/           # Reglas del negocio y validaciones (sin req ni res) + pruebas
│       ├── datos/            # Repositorio en memoria y datos de ejemplo
│       └── http/             # Lo compartido por las rutas: responder() y middlewares
├── front/                    # Front-end
│   ├── .env.example
│   └── src/
│       ├── api.js            # Único lugar que habla con la API
│       ├── App.jsx
│       └── componentes/      # TarjetaPartido, TablaPosiciones, formularios…
└── infra/
    └── user-data.sh          # Script que instala y arranca la API en EC2
```

## Cómo levantarlo en local

Requisitos: Node.js 22.12 o superior y npm.

```bash
git clone https://github.com/Sant1011/pronosticos-mundialistas.git
cd pronosticos-mundialistas

# Terminal 1: la API (queda en http://localhost:3000)
cd api
cp .env.example .env
npm install
npm run dev

# Terminal 2: el front (queda en http://localhost:5173)
cd front
cp .env.example .env
npm install
npm run dev
```

Variables de entorno (los valores de ejemplo de cada `.env.example` sirven tal cual para trabajar en local):

| Proyecto | Variable | Para qué sirve | De dónde sale |
|---|---|---|---|
| `api` | `PORT` | Puerto donde escucha la API | `3000` en local, `80` en EC2 |
| `api` | `CORS_ORIGIN` | Única dirección autorizada a llamar la API | `http://localhost:5173` en local; en producción, la URL del sitio web del bucket S3 |
| `front` | `VITE_API_URL` | Dirección de la API que usa el front | `http://localhost:3000` en local; en producción, `http://<IP pública de EC2>` en `.env.production` |

Si falta `CORS_ORIGIN`, la API no arranca a propósito, para que nunca quede abierta a cualquier página por olvido.

La API arranca con 6 partidos de ejemplo (3 jugados y 3 pendientes) y algunos pronósticos, para que la tabla tenga datos desde el primer momento. Los datos viven en memoria: al reiniciar la API vuelven a ese estado inicial.

## Endpoints de la API

| Método | Ruta | Qué hace | Respuesta |
|---|---|---|---|
| GET | `/partidos` | Lista todos los partidos con su estado (`pendiente` o `finalizado`) y resultado | 200 · arreglo |
| GET | `/pronosticos` | Lista los pronósticos con los puntos ganados (`null` si el partido no se ha jugado) | 200 · arreglo |
| GET | `/tabla` | Tabla de posiciones calculada: puntos, marcadores exactos y aciertos por participante | 200 · arreglo ordenado |
| GET | `/reglas` | Puntaje del reglamento y máximo de goles permitido | 200 · objeto |
| POST | `/pronosticos` | Crea un pronóstico. Cuerpo: `{ participante, partidoId, golesLocal, golesVisitante }` | 201 · el creado<br>400 · datos inválidos o partido ya jugado<br>409 · esa persona ya pronosticó ese partido |
| POST | `/partidos/:id/resultado` | Registra el resultado real. Cuerpo: `{ golesLocal, golesVisitante }` | 200 · el partido actualizado<br>400 · goles inválidos o resultado ya registrado<br>404 · no existe el partido |

Todos los errores responden con el mismo formato: `{ "error": "mensaje que explica qué está mal" }`.

Reglas de puntaje (en `api/src/logica/reglas-pronosticos.js`): marcador exacto = 3 puntos, acertar ganador o empate = 1 punto, fallo = 0. Desempate: más marcadores exactos y luego orden alfabético. Los goles deben ser enteros entre 0 y 20.

Ejemplo:

```bash
curl -X POST http://localhost:3000/pronosticos \
  -H "Content-Type: application/json" \
  -d '{"participante":"Profe","partidoId":4,"golesLocal":2,"golesVisitante":1}'
```

## Cómo correr las pruebas

```bash
cd api   && npm test     # 28 pruebas: puntaje, tabla de posiciones y validaciones
cd front && npm test     # 5 pruebas: el cliente que llama a la API
```

Las pruebas del back cubren las reglas del negocio y sus casos límite: el empate exacto (goles iguales), el 0-0, la tabla vacía, el gol en el máximo permitido (20) y uno por encima, el empate en puntos y los datos inválidos (`-1`, `1.5`, `"abc"`, `null`, cuerpo vacío). Con `npm run test:watch` se vuelven a correr solas al guardar.

**Auditoría de dependencias (`npm audit`, 20/11/2026):** 0 vulnerabilidades en `api/` y 0 en `front/`. Hay que volver a correrlo antes de cada entrega, porque cada semana se publican vulnerabilidades nuevas.

## Despliegue

- **Front:** sitio estático en S3 → `http://pronosticos-mundialistas-zambrano-sitio.s3-website-us-east-1.amazonaws.com`
- **API:** instancia EC2 (Amazon Linux 2023, `t3.micro`) → `http://54.82.241.207`

Desplegado y verificado de punta a punta el 20/11/2026: las dos URL quedaron registradas con capturas en el documento de entrega. Para no consumir el presupuesto del Learner Lab, después de tomar las evidencias se terminó la instancia (su IP ya no responde) y no quedaron Elastic IPs reservadas. El sitio del bucket sigue publicado, pero sin API detrás no carga datos.

Recursos en AWS (región `us-east-1`):

| Recurso | Nombre | Para qué |
|---|---|---|
| Bucket S3 público | `pronosticos-mundialistas-zambrano-sitio` | Sitio web estático con el build del front |
| Bucket S3 privado | `pronosticos-mundialistas-zambrano-privado` | Guarda el paquete de la API que descarga EC2. Responde 403 a cualquier acceso público |
| Instancia EC2 | `pronosticos-api` (Amazon Linux 2023, `t3.micro`) | Corre la API en el puerto 80 |
| Security Group | `pronosticos-api-sg` | Una sola regla de entrada: HTTP 80 |

Pasos para volver a desplegar:

1. **Empaquetar la API** y subirla al bucket privado:
   ```bash
   git archive --format=tar.gz -o api.tar.gz main api
   ```
2. **Lanzar la instancia EC2:** Amazon Linux 2023, sin key pair, con *IAM instance profile* `LabInstanceProfile` (le permite leer el bucket privado) y con `infra/user-data.sh` en *Advanced details → User data*. El script instala Node 24, descarga y descomprime la API, crea su `.env` y la deja como servicio de systemd en el puerto 80. No hace falta SSH.
3. **Security Group:** una sola regla de entrada, `HTTP 80` desde `0.0.0.0/0`, porque la API la llama el navegador de cualquier visitante del sitio. Sin SSH.
4. Probar `http://IP-PUBLICA/partidos` en el navegador: debe responder JSON.
5. **Front:** en `front/`, crear `.env.production` con `VITE_API_URL=http://IP-PUBLICA` y correr `npm run build`.
6. **S3:** subir el contenido de `front/dist/` (no la carpeta) a la raíz del bucket del sitio, que tiene *Static website hosting* activo con `index.html` como documento índice y una política que solo permite leer (`s3:GetObject`).
7. Si la IP de la instancia cambia (por ejemplo, al detenerla y encenderla), repetir los pasos 5 y 6.
8. Al terminar: terminar la instancia y liberar la Elastic IP, si se reservó una.

Medidas de seguridad aplicadas:

1. **Validación en el servidor** de todo lo que llega por POST (`api/src/logica/validaciones.js`), con mensajes que dicen qué está mal.
2. **Secretos fuera de Git:** `.env` está en el `.gitignore` y solo se suben los `.env.example`.
3. **CORS restringido** al origen del front, definido en `CORS_ORIGIN`. Sin esa variable la API no arranca.
4. **Security Group mínimo:** solo el puerto 80 y SSH cerrado. El código llega a la instancia por user data, desde un bucket privado que la instancia lee con su rol IAM.
5. **Dependencias auditadas** con `npm audit` (resultado arriba). Además, el cuerpo JSON está limitado a 10 kB y se oculta la cabecera `X-Powered-By`.
