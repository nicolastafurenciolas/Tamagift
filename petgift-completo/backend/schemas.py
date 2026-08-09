from pydantic import BaseModel
from typing import List, Optional


class FoodPreferenceIn(BaseModel):
    food_name: str
    preference: str  # "gusta" | "no_gusta"
    reaction_message: str
    image: Optional[str] = None  # data URL opcional


class PhraseIn(BaseModel):
    category: str  # "positiva" | "negativa" | "casual"
    text: str


class PhotoIn(BaseModel):
    url: str
    caption: Optional[str] = None
    used_for: str = "puzzle"  # "puzzle" | "poster"
    price: int = 0  # sólo aplica a pósters; 0 = gratis


class PhotoOut(PhotoIn):
    # Id estable: la tienda necesita saber cuál póster ya se compró sin
    # depender de la posición en la lista (igual que Outfit y DecorItem).
    id: int

    class Config:
        from_attributes = True


class SongIn(BaseModel):
    title: Optional[str] = None
    source_type: str = "embed"  # "embed" | "upload"
    embed_url: Optional[str] = None
    audio_data: Optional[str] = None  # data URL, sólo si source_type == "upload"


class OutfitIn(BaseModel):
    name: str
    price: int = 0
    drawing_normal: str
    drawing_feliz: str
    drawing_enojado: str


class OutfitOut(OutfitIn):
    # Id estable (no la posición en la lista): si en el futuro se agrega,
    # quita o reordena una prenda, el juego no debe confundir cuál llevaba
    # puesta o comprada quien ya estaba jugando.
    id: int

    class Config:
        from_attributes = True


class WhackTargetIn(BaseModel):
    name: str
    image: str   # PNG con transparencia, en data URL


class WhackTargetOut(WhackTargetIn):
    id: int

    class Config:
        from_attributes = True


class DecorItemIn(BaseModel):
    name: str
    description: Optional[str] = None
    price: int = 0
    image: str          # PNG con transparencia, en data URL
    ratio: float = 1.0  # ancho/alto de la imagen recortada


class DecorItemOut(DecorItemIn):
    # El juego necesita un id estable para saber qué ya se compró.
    id: int

    class Config:
        from_attributes = True


class AccessKeyCheck(BaseModel):
    key: str


class PetCreate(BaseModel):
    # Llave de acceso comprada. Se valida y se gasta en el servidor.
    access_key: Optional[str] = None
    name: str
    creator_name: Optional[str] = None
    recipient_name: Optional[str] = None
    drawing_normal: str
    drawing_feliz: str
    drawing_enojado: str
    # JSON (string) de la receta modular con la que se armó la mascota.
    # Se guarda para que quien la reciba pueda reabrir el mismo editor
    # si más adelante decide rediseñarla.
    recipe_original: Optional[str] = None
    food_preferences: List[FoodPreferenceIn] = []
    phrases: List[PhraseIn] = []
    photos: List[PhotoIn] = []
    songs: List[SongIn] = []
    outfits: List[OutfitIn] = []
    decor_items: List[DecorItemIn] = []
    whack_targets: List[WhackTargetIn] = []


class PetOut(BaseModel):
    slug: str
    name: str
    # Se guardaban al crear pero nunca se devolvian, asi que el juego
    # no podia usar los nombres para personalizar nada.
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
    hunger_meter: int
    love_meter: int
    current_mood: str
    food_preferences: List[FoodPreferenceIn] = []
    phrases: List[PhraseIn] = []
    photos: List[PhotoOut] = []
    songs: List[SongIn] = []
    outfits: List[OutfitOut] = []
    decor_items: List[DecorItemOut] = []
    whack_targets: List[WhackTargetOut] = []

    class Config:
        from_attributes = True


class RedesignIn(BaseModel):
    recipe: dict
    drawing_normal: str
    drawing_feliz: str
    drawing_enojado: str


class ActiveDesignIn(BaseModel):
    active_design: str  # "original" | "redesign"


class FeedRequest(BaseModel):
    food_name: str


class FeedResponse(BaseModel):
    mood: str
    hunger_meter: int
    love_meter: int
    reaction_message: str
