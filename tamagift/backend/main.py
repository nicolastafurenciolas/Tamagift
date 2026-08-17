import json
import os
import secrets
import string
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from datetime import datetime, timezone

from sqlalchemy import text

import database
import models
import schemas
import licensing

models.Base.metadata.create_all(bind=database.engine)

# ── Columnas agregadas después de la primera versión ────────────────
#
# `create_all` solo crea tablas que faltan POR COMPLETO: si una tabla ya
# existe y el modelo gana una columna nueva, no la agrega. Sin esto,
# cualquier despliegue posterior al primero rompería en producción al
# consultar una columna que no está en la base — y encima en silencio,
# porque el arranque no falla, falla la primera petición.
#
# Por eso esto corre en CADA arranque y en los dos motores. Al agregar
# una columna nueva al modelo, agregarla también a esta lista.
LATE_COLUMNS = [
    ("songs", "source_type", "VARCHAR(10) DEFAULT 'embed'"),
    ("songs", "audio_data", "TEXT"),
    ("photos", "price", "INTEGER DEFAULT 0"),
    ("pets", "recipe_original", "TEXT"),
    ("pets", "recipe_redesign", "TEXT"),
    ("pets", "drawing_normal_redesign", "TEXT"),
    ("pets", "drawing_feliz_redesign", "TEXT"),
    ("pets", "drawing_enojado_redesign", "TEXT"),
    ("pets", "active_design", "VARCHAR(10) DEFAULT 'original'"),
]


def ensure_late_columns():
    is_sqlite = database.DATABASE_URL.startswith("sqlite")
    with database.engine.connect() as conn:
        for table, column, coltype in LATE_COLUMNS:
            if is_sqlite:
                # SQLite no admite ADD COLUMN IF NOT EXISTS: hay que mirar antes.
                existing = [r[1] for r in conn.execute(text(f"PRAGMA table_info({table})"))]
                if column in existing:
                    continue
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}"))
            else:
                # Postgres sí lo admite, así que es idempotente de por sí.
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {coltype}"))
        conn.commit()


ensure_late_columns()

app = FastAPI(title="Tamagift API")

# CORS: el frontend (Vite en :5173 en local, o el dominio de Netlify en
# producción) vive en otro origen que el backend, así que el navegador
# bloquea las peticiones sin estas cabeceras. En local abrimos todo; en
# producción pon ALLOWED_ORIGINS="https://tudominio.com" (separado por comas).
_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
allow_origins = [o.strip() for o in _origins_env.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALPHABET = string.ascii_lowercase + string.digits


def generate_slug(length=8):
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


# Poner REQUIRE_ACCESS_KEY=0 desactiva el cobro (util en desarrollo).
# En produccion se deja activado: sin llave no se crea nada.
REQUIRE_ACCESS_KEY = os.getenv("REQUIRE_ACCESS_KEY", "1") != "0"


def _claim_access_key(db: Session, raw_key: str, slug: str):
    """Comprueba y GASTA una llave. Devuelve el objeto o lanza HTTPException.

    El gasto se hace con un UPDATE condicional (`used_by_slug IS NULL`)
    en vez de leer-y-luego-escribir. Si dos personas envian la misma
    llave a la vez, la base solo deja pasar a una: la segunda ve 0 filas
    afectadas y recibe el error. Con leer-y-escribir las dos podrian
    pasar el chequeo antes de que ninguna escribiera.
    """
    normalized = licensing.normalize_key(raw_key or "")
    if not normalized:
        raise HTTPException(status_code=400, detail="clave-invalida")

    key_hash = licensing.hash_key(normalized)
    row = db.query(models.AccessKey).filter(models.AccessKey.key_hash == key_hash).first()
    if not row:
        raise HTTPException(status_code=400, detail="clave-invalida")
    if row.used_by_slug:
        raise HTTPException(status_code=409, detail="clave-usada")

    claimed = (db.query(models.AccessKey)
               .filter(models.AccessKey.key_hash == key_hash,
                       models.AccessKey.used_by_slug.is_(None))
               .update({"used_by_slug": slug, "used_at": datetime.now(timezone.utc)},
                       synchronize_session=False))
    if claimed != 1:
        raise HTTPException(status_code=409, detail="clave-usada")
    return row


@app.post("/api/access-keys/check")
def check_access_key(payload: schemas.AccessKeyCheck, db: Session = Depends(database.get_db)):
    """Dice si una llave sirve, SIN gastarla.

    Es solo para que el asistente avise pronto; la validacion de verdad
    vuelve a hacerse al crear la mascota. Nunca revela nada mas que
    valida/usada/invalida, asi que no sirve para descubrir llaves.
    """
    if not REQUIRE_ACCESS_KEY:
        return {"estado": "ok", "requerida": False}
    normalized = licensing.normalize_key(payload.key or "")
    if not normalized:
        return {"estado": "invalida", "requerida": True}
    row = db.query(models.AccessKey).filter(
        models.AccessKey.key_hash == licensing.hash_key(normalized)).first()
    if not row:
        return {"estado": "invalida", "requerida": True}
    if row.used_by_slug:
        return {"estado": "usada", "requerida": True}
    return {"estado": "ok", "requerida": True}


@app.get("/api/access-keys/required")
def access_key_required():
    return {"requerida": REQUIRE_ACCESS_KEY}


@app.post("/api/pets", response_model=schemas.PetOut)
def create_pet(payload: schemas.PetCreate, db: Session = Depends(database.get_db)):
    slug = generate_slug()
    while db.query(models.Pet).filter(models.Pet.slug == slug).first():
        slug = generate_slug()

    # La llave se gasta ANTES de escribir nada mas. Si algo falla despues,
    # el rollback deshace tambien el gasto y la llave sigue sirviendo.
    if REQUIRE_ACCESS_KEY:
        _claim_access_key(db, payload.access_key, slug)

    pet = models.Pet(
        slug=slug,
        name=payload.name,
        creator_name=payload.creator_name,
        recipient_name=payload.recipient_name,
        drawing_normal=payload.drawing_normal,
        drawing_feliz=payload.drawing_feliz,
        drawing_enojado=payload.drawing_enojado,
        recipe_original=payload.recipe_original,
    )
    db.add(pet)
    db.flush()

    for f in payload.food_preferences:
        db.add(models.FoodPreference(
            pet_id=pet.id, food_name=f.food_name,
            preference=f.preference, reaction_message=f.reaction_message,
            image=f.image,
        ))
    for p in payload.phrases:
        db.add(models.Phrase(pet_id=pet.id, category=p.category, text=p.text))
    for ph in payload.photos:
        db.add(models.Photo(pet_id=pet.id, url=ph.url, caption=ph.caption, used_for=ph.used_for, price=ph.price))
    for s in payload.songs:
        db.add(models.Song(
            pet_id=pet.id, title=s.title, source_type=s.source_type,
            embed_url=s.embed_url or "", audio_data=s.audio_data,
        ))
    for o in payload.outfits:
        db.add(models.Outfit(
            pet_id=pet.id, name=o.name, price=o.price,
            drawing_normal=o.drawing_normal, drawing_feliz=o.drawing_feliz, drawing_enojado=o.drawing_enojado,
        ))

    for d in payload.decor_items:
        db.add(models.DecorItem(
            pet_id=pet.id, name=d.name, description=d.description,
            price=d.price, image=d.image, ratio=d.ratio,
        ))

    for w in payload.whack_targets:
        db.add(models.WhackTarget(pet_id=pet.id, name=w.name, image=w.image))

    db.commit()
    db.refresh(pet)
    return pet


@app.get("/api/pets/{slug}", response_model=schemas.PetOut)
def get_pet(slug: str, db: Session = Depends(database.get_db)):
    pet = db.query(models.Pet).filter(models.Pet.slug == slug).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return pet


@app.get("/api/pets/{slug}/manifest.json")
def get_manifest(slug: str, db: Session = Depends(database.get_db)):
    pet = db.query(models.Pet).filter(models.Pet.slug == slug).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return {
        "name": pet.name,
        "short_name": pet.name[:12],
        "start_url": f"/p/{slug}",
        "display": "standalone",
        "background_color": "#FBF1EC",
        "theme_color": "#D8697F",
        "icons": [
            {"src": pet.drawing_normal, "sizes": "320x320", "type": "image/png"},
        ],
    }


@app.post("/api/pets/{slug}/feed", response_model=schemas.FeedResponse)
def feed_pet(slug: str, payload: schemas.FeedRequest, db: Session = Depends(database.get_db)):
    pet = db.query(models.Pet).filter(models.Pet.slug == slug).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    food = (
        db.query(models.FoodPreference)
        .filter(models.FoodPreference.pet_id == pet.id, models.FoodPreference.food_name.ilike(payload.food_name))
        .first()
    )

    # Alimentar sube el HAMBRE y cambia el ánimo, pero NUNCA el amor.
    # El amor sólo sube bañando a la mascota o jugando minijuegos.
    if food and food.preference == models.PreferenceEnum.gusta:
        pet.current_mood = "feliz"
        pet.hunger_meter = min(100, pet.hunger_meter + 20)
        message = food.reaction_message
    elif food and food.preference == models.PreferenceEnum.no_gusta:
        pet.current_mood = "enojado"
        pet.hunger_meter = min(100, pet.hunger_meter + 5)
        message = food.reaction_message
    else:
        pet.current_mood = "normal"
        pet.hunger_meter = min(100, pet.hunger_meter + 10)
        message = "Ñam, gracias por la comida."

    db.commit()
    db.refresh(pet)
    return schemas.FeedResponse(
        mood=pet.current_mood,
        hunger_meter=pet.hunger_meter,
        love_meter=pet.love_meter,
        reaction_message=message,
    )


@app.post("/api/pets/{slug}/redesign", response_model=schemas.PetOut)
def redesign_pet(slug: str, payload: schemas.RedesignIn, db: Session = Depends(database.get_db)):
    """Guarda un rediseño hecho por quien recibe el regalo.

    Solo hay DOS diseños posibles, nunca un historial: el original (que
    nunca se toca) y el rediseño (se sobreescribe si se rediseña de nuevo).
    La PRIMERA vez que se rediseña, el diseño original que se está por
    reemplazar queda guardado como un póster de recuerdo gratis.
    """
    pet = db.query(models.Pet).filter(models.Pet.slug == slug).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    # Pets creados antes de este feature nunca mandaron recipe_original:
    # se rellena con el recipe actual para no dejar el campo vacío.
    if not pet.recipe_original:
        pet.recipe_original = json.dumps(payload.recipe)

    if pet.recipe_redesign is None:
        db.add(models.Photo(
            pet_id=pet.id,
            url=pet.drawing_normal,
            caption="El diseño que te hizo tu pareja",
            used_for=models.PhotoUseEnum.poster,
        ))

    pet.recipe_redesign = json.dumps(payload.recipe)
    pet.drawing_normal_redesign = payload.drawing_normal
    pet.drawing_feliz_redesign = payload.drawing_feliz
    pet.drawing_enojado_redesign = payload.drawing_enojado
    pet.active_design = "redesign"

    db.commit()
    db.refresh(pet)
    return pet


@app.post("/api/pets/{slug}/design", response_model=schemas.PetOut)
def set_active_design(slug: str, payload: schemas.ActiveDesignIn, db: Session = Depends(database.get_db)):
    """Alterna cuál de los dos diseños se muestra. No cobra nada: el pago de
    1000 monedas ya se validó y descontó en el cliente antes de rediseñar."""
    pet = db.query(models.Pet).filter(models.Pet.slug == slug).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if payload.active_design not in ("original", "redesign"):
        raise HTTPException(status_code=400, detail="active_design invalido")
    if payload.active_design == "redesign" and pet.recipe_redesign is None:
        raise HTTPException(status_code=400, detail="todavia no hay rediseno")

    pet.active_design = payload.active_design
    db.commit()
    db.refresh(pet)
    return pet
