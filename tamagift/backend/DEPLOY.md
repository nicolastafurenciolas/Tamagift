# Desplegar Tamagift — guía paso a paso

Repositorio: https://github.com/nicolastafurenciolas/Tamagift

## Qué hace cada servicio (y por qué hacen falta tres)

| Servicio | Qué hace | Por qué |
|---|---|---|
| **Netlify** | Sirve el frontend (HTML/JS/CSS) | Es lo que abre tu pareja al tocar el link |
| **Supabase** | Base de datos Postgres | Guarda las mascotas y las llaves vendidas |
| **Railway** | Ejecuta el backend Python | Netlify solo sirve archivos; no puede correr Python |

**¿Por qué no todo en Supabase, como en tu otro proyecto?** Porque en aquel el
navegador habla directo con Supabase. Acá no se puede: la validación de llaves
tiene que correr en un servidor. Si viviera en el navegador, cualquiera abre las
herramientas de desarrollador, inserta una mascota y se salta el pago. Railway
existe solo para eso.

---

## PASO 1 — Supabase (la base de datos)

1. Entrá a supabase.com → **New project**.
2. Ponele nombre `tamagift`, elegí una contraseña para la base y **guardala**
   (la vas a necesitar en el paso siguiente y no se puede volver a ver).
3. Región: la más cercana a donde estén tus clientas.
4. Cuando termine de crearse: **Project Settings → Database → Connection string**.
5. Elegí la pestaña **URI** y copiá la cadena. Se ve así:
   ```
   postgresql://postgres.xxxxx:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
6. Reemplazá `[TU-PASSWORD]` por la contraseña del paso 2.

> **Importante:** usá el puerto **5432** (Session mode) o la conexión directa.
> El puerto 6543 (Transaction mode) da problemas con SQLAlchemy, que es lo que
> usa este backend.

No hay que crear ninguna tabla a mano: el backend las crea solo al arrancar.

---

## PASO 2 — Railway (el backend)

1. Entrá a railway.app y entrá con GitHub.
2. **New Project → Deploy from GitHub repo** → elegí `Tamagift`.
3. Abrí el servicio que se creó → pestaña **Settings**:
   - **Root Directory**: `tamagift/backend`
   - El resto se detecta solo (usa el `Procfile` que ya está en el repo).
4. Pestaña **Variables** → agregá estas dos:
   ```
   DATABASE_URL = <la cadena que copiaste de Supabase en el paso 1>
   REQUIRE_ACCESS_KEY = 1
   ```
5. Esperá a que termine el despliegue. En **Settings → Networking → Generate
   Domain** te da una URL pública tipo `tamagift-production.up.railway.app`.
6. **Comprobalo**: abrí `https://TU-URL.up.railway.app/docs` en el navegador.
   Tenés que ver la documentación de la API con el título **Tamagift API**.

---

## PASO 3 — Generar las llaves reales

Las llaves que tenés en tu computadora están en la base local y **no sirven en
producción**. Hay que generar un lote nuevo apuntando a Supabase.

Desde `tamagift/backend/` en tu computadora, en PowerShell:

```powershell
$env:DATABASE_URL="<la misma cadena de Supabase>"
python generate_keys.py 300 --lote "lanzamiento"
```

Esto:
- Inserta las 300 llaves **hasheadas** en Supabase.
- Te deja un CSV con las llaves en claro en tu computadora.

> **El CSV es tu inventario y la ÚNICA copia legible.** En la base solo queda el
> hash: si lo perdés, esas llaves no se recuperan. Ya está en `.gitignore`, así
> que no se sube a GitHub — guardalo aparte (Drive, disco externo).

Para ver cuántas quedan sin usar, en cualquier momento:
```powershell
python generate_keys.py --estado
```

---

## PASO 4 — Netlify (el frontend)

1. Entrá a netlify.com → **Add new site → Import an existing project** → GitHub
   → elegí `Tamagift`.
2. Configuración del build:
   - **Base directory**: `tamagift/frontend`
   - El comando (`npm run build`) y la carpeta (`dist`) ya vienen en
     `netlify.toml`, no hace falta escribirlos.
3. Antes de desplegar, **Add environment variables**:
   ```
   VITE_API_BASE = https://TU-URL.up.railway.app
   ```
   (la URL de Railway del paso 2, **sin barra al final**)
4. Deploy. Te queda un dominio tipo `tamagift.netlify.app`.

---

## PASO 5 — Conectar los dos extremos (no te saltees esto)

Volvé a **Railway → Variables** y agregá:
```
ALLOWED_ORIGINS = https://tamagift.netlify.app
```
(con tu dominio real de Netlify)

Sin esto el navegador bloquea las llamadas al backend por CORS y la app se queda
en blanco sin decir por qué. Railway se redespliega solo al guardar la variable.

---

## PASO 6 — Probar que todo funciona

1. Abrí `https://tamagift.netlify.app` → tenés que ver el asistente.
2. Creá una mascota usando una llave real del CSV.
3. Abrí el link `/p/xxxxx` que te da, **desde el celular**.
4. Probá especialmente:
   - Que la música arranque al tocar "Toca para abrir tu regalo".
   - Los tres juegos con animación: **Torre**, **Cruzar la calle**, **Salta y vuela**.
     Son los únicos que no se pudieron probar a ojo durante el desarrollo (el
     entorno donde se programó no dibuja animaciones), aunque su lógica sí está
     cubierta por pruebas automáticas.
   - Que ningún juego obligue a hacer scroll.
5. Probá que la MISMA llave ya no sirve para crear otra mascota.

---

## Cómo se actualiza a partir de acá

Cada vez que hagamos un cambio y se suba a GitHub:

- **Netlify** detecta el push y republica el frontend solo. ✅
- **Railway** detecta el push y reinicia el backend solo. ✅
- **Supabase** no se actualiza desde GitHub (es una base de datos), pero el
  backend le agrega al arrancar cualquier columna nueva que falte. ✅

O sea: **un push actualiza todo**. No hay que tocar nada a mano.

La única excepción sería borrar o renombrar una columna existente — eso sí
requeriría un paso manual, y lo avisaría antes de hacerlo.

---

## Dominio propio (cuando quieras)

Podés lanzar con `tamagift.netlify.app` y comprar el dominio después: los links
ya entregados siguen funcionando.

1. Comprá el dominio (Cloudflare suele ser el más barato y no infla la renovación).
2. Netlify → **Domain settings → Add a custom domain**.
3. Seguí lo que te indique: lo más simple es apuntar los *nameservers* del
   dominio a los de Netlify.
4. Activá **HTTPS** (gratis y automático).
5. **Volvé a Railway** y sumá el dominio nuevo a `ALLOWED_ORIGINS`, dejando
   también el de Netlify:
   ```
   ALLOWED_ORIGINS = https://tudominio.com,https://www.tudominio.com,https://tamagift.netlify.app
   ```

### Si algún día querés cambiar de proveedor
Lo único atado a Railway es el `Procfile` (un archivo de una línea). La base vive
en Supabase, así que mudar el backend a Render o donde sea es cambiar de servicio
y volver a poner las dos variables de entorno.

---

## Cuidado con el espacio

Cada mascota pesa entre **5 y 25 MB** en la base, porque las fotos y el audio se
guardan dentro de la fila. El plan gratis de Supabase ronda los 500 MB, o sea
**entre 20 y 100 mascotas**.

Cuando te acerques al límite hay dos caminos: pasar al plan pago, o mover las
imágenes y el audio a **Supabase Storage** (que ya viene incluido) y dejar en la
base solo el enlace. Lo segundo es lo correcto a mediano plazo y está anotado
como pendiente.

Podés vigilarlo en Supabase → **Settings → Usage**.
