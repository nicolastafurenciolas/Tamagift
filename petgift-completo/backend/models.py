from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class PreferenceEnum(str, enum.Enum):
    gusta = "gusta"
    no_gusta = "no_gusta"


class PhraseCategoryEnum(str, enum.Enum):
    positiva = "positiva"
    negativa = "negativa"
    casual = "casual"


class PhotoUseEnum(str, enum.Enum):
    puzzle = "puzzle"
    poster = "poster"


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(16), unique=True, index=True, nullable=False)
    name = Column(String(60), nullable=False)
    creator_name = Column(String(80), nullable=True)
    recipient_name = Column(String(80), nullable=True)

    # Each of these is a base64 PNG data URL exported directly by PetMoodStudio.jsx.
    # For production, upload each to object storage (S3/R2) when the pet is created
    # and store the resulting URL here instead of the raw data URL - keeps rows small
    # and avoids shipping megabytes of base64 through every API response.
    drawing_normal = Column(Text, nullable=False)
    drawing_feliz = Column(Text, nullable=False)
    drawing_enojado = Column(Text, nullable=False)

    # Re-personalización: quien recibe el regalo puede rediseñar la mascota
    # dentro del juego, pero el diseño original (el que hizo quien regaló)
    # nunca se pierde. Solo hay DOS estados posibles, no un historial:
    # "original" (fijo desde la creación) y "redesign" (se sobreescribe cada
    # vez que se vuelve a rediseñar). `active_design` dice cuál se muestra.
    recipe_original = Column(Text, nullable=True)   # JSON del recipe de creación
    recipe_redesign = Column(Text, nullable=True)    # JSON del rediseño (None si no existe)
    drawing_normal_redesign = Column(Text, nullable=True)
    drawing_feliz_redesign = Column(Text, nullable=True)
    drawing_enojado_redesign = Column(Text, nullable=True)
    active_design = Column(String(10), nullable=False, default="original")

    hunger_meter = Column(Integer, default=60)
    love_meter = Column(Integer, default=60)
    current_mood = Column(String(20), default="normal")

    created_at = Column(DateTime, default=datetime.utcnow)

    food_preferences = relationship("FoodPreference", back_populates="pet", cascade="all, delete-orphan")
    phrases = relationship("Phrase", back_populates="pet", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="pet", cascade="all, delete-orphan")
    songs = relationship("Song", back_populates="pet", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="pet", cascade="all, delete-orphan")
    decor_items = relationship("DecorItem", back_populates="pet", cascade="all, delete-orphan")
    whack_targets = relationship("WhackTarget", back_populates="pet", cascade="all, delete-orphan")


class FoodPreference(Base):
    __tablename__ = "food_preferences"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    food_name = Column(String(60), nullable=False)
    preference = Column(SAEnum(PreferenceEnum), nullable=False)
    reaction_message = Column(String(200), nullable=False)
    # Imagen opcional de la comida (data URL). Para producción, subir a
    # almacenamiento de objetos y guardar solo la URL, igual que los dibujos.
    image = Column(Text, nullable=True)

    pet = relationship("Pet", back_populates="food_preferences")


class Phrase(Base):
    __tablename__ = "phrases"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    category = Column(SAEnum(PhraseCategoryEnum), nullable=False)
    text = Column(String(200), nullable=False)

    pet = relationship("Pet", back_populates="phrases")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    url = Column(Text, nullable=False)
    caption = Column(String(150), nullable=True)
    used_for = Column(SAEnum(PhotoUseEnum), default=PhotoUseEnum.puzzle)
    # Sólo aplica a used_for=poster: cuesta monedas colocarlo, igual que
    # cualquier otra cosa de la tienda. 0 = gratis (pets viejos, migrados
    # sin precio, quedan gratis en vez de romperse). Las fotos de
    # rompecabezas nunca se compran, este campo no las afecta.
    price = Column(Integer, default=0)

    pet = relationship("Pet", back_populates="photos")


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    title = Column(String(100), nullable=True)
    # "embed" (link de Spotify/YouTube) o "upload" (archivo propio). Para
    # "upload", embed_url queda en "" y el audio vive en audio_data.
    source_type = Column(String(10), nullable=False, default="embed")
    embed_url = Column(String(300), nullable=False, default="")
    # Audio propio como data URL (base64), igual que las fotos/dibujos.
    # Sólo se usa cuando source_type == "upload".
    audio_data = Column(Text, nullable=True)

    pet = relationship("Pet", back_populates="songs")


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    name = Column(String(60), nullable=False)
    price = Column(Integer, default=0)
    # Igual que los dibujos base de la mascota: PNG en data URL por ánimo,
    # dibujados por quien regala (nunca generados por IA).
    drawing_normal = Column(Text, nullable=False)
    drawing_feliz = Column(Text, nullable=False)
    drawing_enojado = Column(Text, nullable=False)

    pet = relationship("Pet", back_populates="outfits")


class WhackTarget(Base):
    """Lo que sale de los agujeros en el minijuego "Dale al que salga".

    Tabla propia y no un `DecorItem` con una marca, porque son cosas
    distintas: la decoración se compra en la tienda y se coloca en el
    cuarto, esto solo aparece dentro de un minijuego y no tiene precio.

    Antes el juego reusaba las fotos de comidas y decoración, que no
    siempre tienen gracia como blanco. Ahora quien regala sube justo lo
    que quiere que se golpee (recortado con la misma herramienta que la
    decoración) — puede ser un chiste privado entre los dos.
    """
    __tablename__ = "whack_targets"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    name = Column(String(60), nullable=False)
    image = Column(Text, nullable=False)

    pet = relationship("Pet", back_populates="whack_targets")


class DecorItem(Base):
    """Objeto decorativo que sube quien regala: una foto recortada (por
    ejemplo un vinilo, un peluche, una entrada de concierto) con nombre,
    descripción y precio. Aparece en la tienda del juego y se puede
    colocar libremente en el cuarto.

    La imagen llega como PNG con transparencia en data URL, ya recortada
    en el navegador — nunca se genera con IA, la recorta la persona.
    """
    __tablename__ = "decor_items"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    name = Column(String(60), nullable=False)
    description = Column(String(200), nullable=True)
    price = Column(Integer, default=0)
    image = Column(Text, nullable=False)
    # alto/ancho de la imagen recortada, para dibujarla sin deformar
    ratio = Column(Float, default=1.0)

    pet = relationship("Pet", back_populates="decor_items")

class AccessKey(Base):
    """Llave de acceso: se compra una, sirve para crear UNA mascota.

    Seguridad: en la base NO se guarda la llave, se guarda su hash
    SHA-256. Si alguien llegara a leer la base de datos, no puede
    revender las llaves sin usar porque no las puede reconstruir. La
    lista en claro solo existe en el CSV que genera el script de
    administracion, en manos del vendedor.

    `used_by_slug` es a la vez el estado y el recibo: si esta puesto,
    la llave ya se gasto y ahi quedo la mascota que creo.
    """
    __tablename__ = "access_keys"

    id = Column(Integer, primary_key=True, index=True)
    key_hash = Column(String(64), unique=True, index=True, nullable=False)
    # Primeros caracteres en claro, solo para poder identificar una
    # llave en un soporte ("la que empieza por PETG-9F4...") sin
    # revelar lo suficiente como para adivinarla.
    prefix = Column(String(12), nullable=True)
    batch = Column(String(40), nullable=True)
    used_by_slug = Column(String(16), nullable=True, index=True)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
