# Desplegar PetGift — guía paso a paso (Railway + Netlify)

Decisiones ya tomadas para este lanzamiento (no las repitas ni las reconsideres
sin volver a hablarlo):
- Backend + base de datos: **Railway** (Postgres administrado).
- Imágenes (dibujos, fotos, objetos): se quedan como texto base64 dentro de las
  filas de Postgres, **no** se migran a S3/R2 todavía. Es una optimización real
  pendiente (ver comentario en `models.py`), pero no bloquea el lanzamiento a
  la escala de un regalo personalizado (decenas de fotos por mascota, no miles).
- Frontend: **Netlify**.

## 0. ANTES DE SUBIR NADA A GITHUB — leer esto

Ya existe un `.gitignore` en la raíz del proyecto que deja fuera:

- **`llaves-*.csv`** — el inventario de llaves en claro. En la base de datos
  solo se guarda el hash, así que ese CSV es la **única** copia legible. Si
  llega a un repo público, cualquiera puede crear mascotas gratis: es
  literalmente el producto que vendés.
- **`*.db`** — la base SQLite local con datos de prueba.
- **`.env`**, `node_modules/`, `dist/`, `__pycache__/`.

Comprobalo antes del primer push (tiene que responder que están ignorados):

```bash
git check-ignore -v petgift-completo/backend/llaves-lote-inicial.csv petgift-completo/backend/petgift.db
```

Si por lo que sea el CSV ya se subió alguna vez, **no alcanza con borrarlo en un
commit nuevo**: queda en el historial. En ese caso hay que generar un lote nuevo
de llaves y dar por quemadas las anteriores.

## 1. Backend + Postgres en Railway

1. Crea una cuenta en railway.app (o entra con GitHub).
2. Sube la carpeta `petgift-completo/` completa a un repositorio de GitHub
   (o solo `backend/` y `frontend/` como dos repos separados, si preferís
   desplegarlos como proyectos independientes — cualquiera de las dos formas
   funciona, los pasos de abajo no cambian).
3. En Railway: **New Project > Deploy from GitHub repo**, elige el repo.
   - Si subiste `petgift-completo/` completo: en la configuración del
     servicio, poné **Root Directory** = `backend`.
   - Railway detecta Python automáticamente y usa el `Procfile` que ya
     existe en `backend/Procfile` (`web: uvicorn main:app --host 0.0.0.0 --port $PORT`).
4. En el mismo proyecto de Railway: **New > Database > Add PostgreSQL**.
   Railway crea la base y expone `DATABASE_URL` automáticamente — andá a la
   pestaña **Variables** del servicio backend y confirmá que `DATABASE_URL`
   ya está ahí (Railway la enlaza sola entre el servicio y la base cuando
   están en el mismo proyecto; si no aparece, copiala manualmente desde la
   pestaña **Connect** de la base de Postgres).
5. En **Variables** del servicio backend, agregá también:
   ```
   REQUIRE_ACCESS_KEY=1
   ```
   (Sin esta variable, el código ya default a requerir llave — pero ponela
   explícita para no depender de un default y que quede documentado en el
   panel de Railway qué está pasando.)
   `ALLOWED_ORIGINS` lo vas a agregar en el paso 3, después de tener el
   dominio de Netlify — por ahora podés dejarlo sin setear (el backend
   acepta cualquier origen mientras tanto, no pasa nada porque nadie más
   que vos lo está usando todavía).
6. Esperá el primer deploy (unos minutos). Railway te da una URL pública
   como `https://petgift-api-production.up.railway.app` — la vas a necesitar
   en el paso 2 y 3.
7. Verificá que funciona abriendo `https://tu-url.up.railway.app/docs` en el
   navegador — deberías ver la documentación automática de la API (Swagger).

## 2. Generar las llaves de acceso reales (contra Railway, no contra tu SQLite local)

Las 300 llaves que ya generaste (`llaves-lote-inicial.csv`) están en tu base
SQLite **local** — no sirven para producción, ahí no hay nadie escuchando.
Generá un lote nuevo apuntando directo a la base de Railway:

1. En Railway, abrí la base de Postgres > pestaña **Connect** > copiá la
   `Connection URL` (empieza con `postgresql://`).
2. En tu máquina, desde `petgift-completo/backend/`:
   ```bash
   DATABASE_URL="postgresql://usuario:pass@host:puerto/db" python generate_keys.py 300 --lote "lanzamiento-tiktok"
   ```
   (En PowerShell: `$env:DATABASE_URL="postgresql://..."; python generate_keys.py 300 --lote "lanzamiento-tiktok"`)
3. Esto inserta las 300 llaves (hasheadas) directo en la base de producción y
   te deja el CSV en claro en tu máquina — **guardalo bien, es tu inventario
   real, no se puede recuperar desde la base**.
4. `python generate_keys.py --estado` (con el mismo `DATABASE_URL`) te dice
   cuántas quedan disponibles en cualquier momento, para reabastecer.

## 3. Frontend en Netlify

1. En Netlify: **Add new site > Import an existing project**, conectá el
   mismo repo de GitHub.
   - Si subiste `petgift-completo/` completo: **Base directory** = `frontend`.
   - `netlify.toml` ya está en `frontend/` con el comando de build
     (`npm run build`), la carpeta a publicar (`dist`), y el redirect que
     hace falta para que `/p/{slug}` funcione aunque alguien lo abra
     directo (no solo navegando desde adentro de la app).
2. En **Site settings > Environment variables**, agregá:
   ```
   VITE_API_BASE=https://tu-url.up.railway.app
   ```
   (la URL de Railway del paso 1.6, sin barra al final).
3. Deploy. Netlify te da un dominio tipo `tu-sitio.netlify.app`.
4. Volvé a Railway y agregá la variable que faltaba en el backend:
   ```
   ALLOWED_ORIGINS=https://tu-sitio.netlify.app
   ```
   Railway redepliega solo al guardar la variable.
5. El asistente queda en `tu-sitio.netlify.app` (raíz), y cada mascota en
   `tu-sitio.netlify.app/p/{slug}` — ese es el link que se comparte.

## 4. Dominio propio (cuando lo quieras — no hace falta para lanzar)

Podés lanzar con `tu-sitio.netlify.app` y comprar el dominio después: el cambio
no rompe las mascotas ya creadas **si seguís este orden**.

1. Comprá el dominio donde prefieras (Namecheap, Cloudflare, GoDaddy…).
   Cloudflare suele ser el más barato y no cobra sobreprecio por renovar.
2. En Netlify: **Domain settings > Add a custom domain** → escribí tu dominio.
3. Netlify te dice qué poner en el panel de tu proveedor. Dos caminos:
   - **Más simple:** apuntar los *nameservers* del dominio a los de Netlify.
     Netlify gestiona todo el DNS.
   - **Si querés seguir manejando el DNS vos:** un registro `CNAME` de `www`
     apuntando a `tu-sitio.netlify.app`, y el dominio raíz con `ALIAS`/`ANAME`
     (o los `A` que indique Netlify).
4. Esperá la propagación (de minutos a unas horas) y activá **HTTPS** en
   Netlify — el certificado es gratis y automático.
5. **Paso que NO hay que olvidarse:** volvé a Railway y actualizá
   `ALLOWED_ORIGINS` con el dominio nuevo, por ejemplo:
   ```
   ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com,https://tu-sitio.netlify.app
   ```
   Si no lo hacés, el navegador bloquea las llamadas al backend desde el dominio
   nuevo por CORS y la app queda en blanco. Dejá también el `.netlify.app` en la
   lista mientras convivan los dos.

Los links viejos (`tu-sitio.netlify.app/p/abc123`) siguen funcionando: Netlify
mantiene el subdominio. Y como el `slug` no cambia, la misma mascota es
alcanzable desde los dos dominios.

### ¿Y si algún día querés mudarte de Railway/Netlify?
Lo único verdaderamente atado al proveedor es la base de datos. Antes de mudarte,
sacá un volcado (`pg_dump`) y restauralo en el destino: los slugs, las mascotas y
las llaves usadas viajan con él. El código no tiene nada específico de Railway
más allá del `Procfile` (un archivo de una línea).

## Qué ya está probado (en esta sesión, contra el backend corriendo local)

- Todo el flujo del asistente y del juego, de punta a punta, en un navegador
  real (Chrome, viewport móvil simulado) — mascotas completas, música,
  minijuegos, tienda, re-personalización, etc. Ver `SESION_CAMBIOS.md` en la
  raíz del proyecto para el detalle completo de qué se verificó y cómo.
- El backend acepta y devuelve correctamente el payload completo del wizard.
- Las migraciones ad-hoc de columnas nuevas corren sin romper una base
  SQLite ya existente con datos.

## Qué NO está probado todavía (pendiente, requiere que lo hagas vos)

- El despliegue real en Railway y Netlify — preparé toda la configuración
  (`Procfile`, `netlify.toml`, variables de entorno documentadas arriba) pero
  no tengo forma de crear cuentas ni desplegar por vos.
- Postgres real en vez de SQLite — el código ya soporta `DATABASE_URL` de
  Postgres (`psycopg2-binary` en `requirements.txt`, conversión automática de
  `postgres://` a `postgresql://` en `database.py`), pero nunca corrió contra
  un Postgres real en esta sesión.
- El flujo completo en un celular físico (iOS/Android), con dedo en vez de
  mouse/touch simulado — especialmente importante para: la pantalla de
  apertura "Toca para abrir tu regalo" (el gesto real que desbloquea audio),
  el editor de retoque a mano (canvas), y el recorte de fondo de objetos
  decorativos (`BgRemover.jsx`). Una vez desplegado, abrí el link de Netlify
  directo desde el celular (no rotado desde una PC) y probá esos tres puntos
  primero — son los que más dependen de un dispositivo táctil real.
