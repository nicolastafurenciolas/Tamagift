import json
from pydantic import field_validator, BaseModel, Field
from typing import List, Optional, Literal

# ─────────────────────────────────────────────────────────────────
# Esquemas de la API.
#
# Los de ENTRADA (…In, PetCreate) traen límites: largo máximo de cada
# texto igual al de su columna en models.py, cuántos elementos caben en
# cada lista y cuánto puede pesar cada imagen o audio. Sin ellos, un
# texto de 250 caracteres hacía fallar la creación con un error 500 en
# Postgres, y un precio negativo en la tienda REGALABA monedas.
#
# Los de SALIDA (…Out) no llevan límites: si una fila vieja quedó con
# una foto más pesada que el límite actual, el regalo igual tiene que
# poder abrirse.
# ─────────────────────────────────────────────────────────────────

# Estilos visuales que existen en el frontend (styles/registry.js).
StyleId = Literal["pixel", "lofi", "retro", "papel", "neon", "sticker"]

# Tamaños máximos de los data URL (en caracteres de base64).
IMG_MAX = 3_000_000      # una foto o un dibujo (ya se comprimen en el navegador)
# Receta de la mascota en JSON. Puede traer los retoques a mano de cada
# ánimo (tres PNG transparentes chicos), por eso no es un texto corto.
RECIPE_MAX = 3_000_000
AUDIO_MAX = 14_000_000   # un archivo de audio de hasta 10 MB
# La partida guardada (JSON). Una partida muy jugada pesa unos 30 KB;
# el tope deja margen sin dejar que alguien llene la base.
GAME_SAVE_MAX = 400_000


class FoodPreferenceBase(BaseModel):
    food_name: str
    preference: str
    reaction_message: str
    image: Optional[str] = None


class FoodPreferenceIn(FoodPreferenceBase):
    food_name: str = Field(min_length=1, max_length=60)
    preference: Literal["gusta", "no_gusta"]
    reaction_message: str = Field(min_length=1, max_length=200)
    image: Optional[str] = Field(default=None, max_length=IMG_MAX)


class PhraseBase(BaseModel):
    category: str
    text: str


class PhraseIn(PhraseBase):
    category: Literal["positiva", "negativa", "casual"]
    text: str = Field(min_length=1, max_length=200)


class PhotoBase(BaseModel):
    url: str
    caption: Optional[str] = None
    used_for: str = "puzzle"
    price: int = 0


class PhotoIn(PhotoBase):
    url: str = Field(min_length=1, max_length=IMG_MAX)
    caption: Optional[str] = Field(default=None, max_length=150)
    used_for: Literal["puzzle", "poster"] = "puzzle"
    price: int = Field(default=0, ge=0, le=9999)


class PhotoOut(PhotoBase):
    # Id estable: la tienda necesita saber cuál póster ya se compró sin
    # depender de la posición en la lista.
    id: int

    class Config:
        from_attributes = True


class SongBase(BaseModel):
    title: Optional[str] = None
    source_type: str = "embed"
    embed_url: Optional[str] = None
    audio_data: Optional[str] = None


class SongIn(SongBase):
    title: Optional[str] = Field(default=None, max_length=100)
    source_type: Literal["embed", "upload"] = "embed"
    embed_url: Optional[str] = Field(default=None, max_length=300)
    audio_data: Optional[str] = Field(default=None, max_length=AUDIO_MAX)


class OutfitBase(BaseModel):
    name: str
    price: int = 0
    drawing_normal: str
    drawing_feliz: str
    drawing_enojado: str
    # Receta de la mochi con este traje (JSON). Con ella el juego la dibuja
    # en el estilo activo; los PNG quedan como respaldo.
    recipe: Optional[str] = None


class OutfitIn(OutfitBase):
    name: str = Field(min_length=1, max_length=60)
    price: int = Field(default=0, ge=0, le=9999)
    drawing_normal: str = Field(max_length=IMG_MAX)
    drawing_feliz: str = Field(max_length=IMG_MAX)
    drawing_enojado: str = Field(max_length=IMG_MAX)
    recipe: Optional[str] = Field(default=None, max_length=RECIPE_MAX)


class OutfitOut(OutfitBase):
    id: int

    class Config:
        from_attributes = True


class WhackTargetBase(BaseModel):
    name: str
    image: str


class WhackTargetIn(WhackTargetBase):
    name: str = Field(min_length=1, max_length=60)
    image: str = Field(min_length=1, max_length=IMG_MAX)


class WhackTargetOut(WhackTargetBase):
    id: int

    class Config:
        from_attributes = True


class DecorItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int = 0
    image: str
    ratio: float = 1.0


class DecorItemIn(DecorItemBase):
    name: str = Field(min_length=1, max_length=60)
    description: Optional[str] = Field(default=None, max_length=200)
    price: int = Field(default=0, ge=0, le=9999)
    image: str = Field(min_length=1, max_length=IMG_MAX)
    ratio: float = Field(default=1.0, gt=0.05, lt=20)


class DecorItemOut(DecorItemBase):
    id: int

    class Config:
        from_attributes = True


class AccessKeyCheck(BaseModel):
    key: str = Field(default="", max_length=80)


class PetCreate(BaseModel):
    # Llave de acceso comprada. Se valida y se gasta en el servidor.
    access_key: Optional[str] = Field(default=None, max_length=80)
    name: str = Field(min_length=1, max_length=60)
    creator_name: Optional[str] = Field(default=None, max_length=80)
    recipient_name: Optional[str] = Field(default=None, max_length=80)
    drawing_normal: str = Field(max_length=IMG_MAX)
    drawing_feliz: str = Field(max_length=IMG_MAX)
    drawing_enojado: str = Field(max_length=IMG_MAX)
    # JSON (string) de la receta modular con la que se armó la mascota,
    # para poder reabrir el mismo editor si se rediseña.
    recipe_original: Optional[str] = Field(default=None, max_length=RECIPE_MAX)
    # Estilo visual que eligió quien regala (quien recibe puede cambiarlo).
    app_style: Optional[StyleId] = None
    food_preferences: List[FoodPreferenceIn] = Field(default=[], max_length=20)
    phrases: List[PhraseIn] = Field(default=[], max_length=40)
    photos: List[PhotoIn] = Field(default=[], max_length=14)
    songs: List[SongIn] = Field(default=[], max_length=5)
    outfits: List[OutfitIn] = Field(default=[], max_length=8)
    decor_items: List[DecorItemIn] = Field(default=[], max_length=12)
    whack_targets: List[WhackTargetIn] = Field(default=[], max_length=8)


class PetOut(BaseModel):
    slug: str
    name: str
    creator_name: Optional[str] = None
    recipient_name: Optional[str] = None
    drawing_normal: str
    drawing_feliz: str
    drawing_enojado: str
    recipe_original: Optional[str] = None
    recipe_redesign: Optional[str] = None
    drawing_normal_redesign: Optional[str] = None
    drawing_feliz_redesign: Optional[str] = None
    drawing_enojado_redesign: Optional[str] = None
    active_design: str = "original"
    app_style: Optional[str] = None
    hunger_meter: int
    love_meter: int
    current_mood: str
    food_preferences: List[FoodPreferenceBase] = []
    phrases: List[PhraseBase] = []
    photos: List[PhotoOut] = []
    songs: List[SongBase] = []
    outfits: List[OutfitOut] = []
    decor_items: List[DecorItemOut] = []
    whack_targets: List[WhackTargetOut] = []

    class Config:
        from_attributes = True


class PetCreated(PetOut):
    # Solo en la respuesta de crear: la llave del buzón (ver Letter).
    owner_token: Optional[str] = None


# Quien escribe se identifica con la llave del buzón o con la llave de
# acceso con que compró el regalo.
class MailboxAuth(BaseModel):
    token: Optional[str] = Field(default=None, max_length=60)
    access_key: Optional[str] = Field(default=None, max_length=80)


class LetterIn(MailboxAuth):
    text: str = Field(min_length=1, max_length=600)
    photo: Optional[str] = Field(default=None, max_length=IMG_MAX)


class LetterOut(BaseModel):
    id: int
    text: str
    has_photo: bool = False
    photo: Optional[str] = None
    created_at: Optional[str] = None


# Fotos del álbum (JPEG en data URL; ya vienen comprimidas del celular).
SNAPSHOT_MAX = 900_000
THUMB_MAX = 60_000


class SnapshotIn(BaseModel):
    image: str = Field(min_length=20, max_length=SNAPSHOT_MAX)
    thumb: str = Field(min_length=20, max_length=THUMB_MAX)
    caption: Optional[str] = Field(default=None, max_length=80)

    @field_validator("image", "thumb")
    @classmethod
    def is_image(cls, v):
        if not v.startswith("data:image/"):
            raise ValueError("Tiene que ser una imagen")
        return v


class SnapshotOut(BaseModel):
    id: int
    thumb: Optional[str] = None
    image: Optional[str] = None
    caption: Optional[str] = None
    created_at: Optional[str] = None


class RedesignIn(BaseModel):
    recipe: dict
    drawing_normal: str = Field(max_length=IMG_MAX)
    drawing_feliz: str = Field(max_length=IMG_MAX)
    drawing_enojado: str = Field(max_length=IMG_MAX)

    @field_validator("recipe")
    @classmethod
    def recipe_size(cls, v):
        if len(json.dumps(v)) > RECIPE_MAX:
            raise ValueError("La receta es demasiado grande")
        return v


class ActiveDesignIn(BaseModel):
    active_design: Literal["original", "redesign"]


class StyleIn(BaseModel):
    app_style: StyleId


class GameSaveIn(BaseModel):
    data: dict
    # Versión sobre la que trabajó el dispositivo (0 = nunca guardó).
    rev: int = Field(default=0, ge=0)
    saved_at: int = Field(default=0, ge=0)

    @field_validator("data")
    @classmethod
    def data_size(cls, v):
        if len(json.dumps(v)) > GAME_SAVE_MAX:
            raise ValueError("La partida es demasiado grande")
        return v


class GameSaveOut(BaseModel):
    data: Optional[dict] = None
    rev: int = 0
    saved_at: int = 0


class FeedRequest(BaseModel):
    food_name: str = Field(min_length=1, max_length=60)


class FeedResponse(BaseModel):
    mood: str
    hunger_meter: int
    love_meter: int
    reaction_message: str
