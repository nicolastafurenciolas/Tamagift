"""Llaves de acceso: generacion, normalizacion y validacion.

Como funciona la venta:
  1. Alguien te paga.
  2. Le entregas UNA llave de tu lista (el CSV que genera este modulo).
  3. Con esa llave puede crear UNA mascota. Al crearla, la llave queda
     gastada para siempre.

Por que se guarda un hash y no la llave:
  si la base de datos se filtrara, con las llaves en claro cualquiera
  podria tomar las que aun no se han usado y revenderlas. Con el hash
  eso es imposible: de un SHA-256 no se puede volver a la llave. La
  lista en claro vive unicamente en tu CSV.

Por que la validacion es 100% del servidor:
  cualquier cosa que viaje al navegador se puede leer. Si el frontend
  supiera que llaves son validas, bastaria abrir las herramientas de
  desarrollador para copiarlas todas. El navegador solo envia el texto
  que escribio la persona y recibe un si o un no.
"""

import csv
import hashlib
import secrets
from datetime import datetime, timezone

# Alfabeto sin caracteres que se confunden al dictarlos o copiarlos a
# mano: nada de O/0, I/1/L. Asi una llave se puede pasar por WhatsApp
# sin que llegue mal escrita.
ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
GROUPS = 4
GROUP_LEN = 5
PREFIX = "PETG"


def generate_key() -> str:
    """Devuelve algo como PETG-9F4KM-2QR7T-XW3H8-VN6PY.

    20 caracteres de un alfabeto de 31 => ~99 bits de entropia. Adivinar
    una por fuerza bruta no es realista ni con todo el trafico del mundo.
    `secrets` usa el generador criptografico del sistema, no `random`.
    """
    parts = [
        "".join(secrets.choice(ALPHABET) for _ in range(GROUP_LEN))
        for _ in range(GROUPS)
    ]
    return f"{PREFIX}-" + "-".join(parts)


def normalize_key(raw: str) -> str:
    """Deja la llave en su forma canonica antes de compararla.

    La gente la escribe con espacios, en minusculas o sin guiones. Sin
    esto una llave valida seria rechazada por como se copio.
    """
    if not raw:
        return ""
    cleaned = "".join(ch for ch in raw.upper() if ch.isalnum())
    if cleaned.startswith(PREFIX):
        cleaned = cleaned[len(PREFIX):]
    if len(cleaned) != GROUPS * GROUP_LEN:
        return ""
    if any(ch not in ALPHABET for ch in cleaned):
        return ""
    groups = [cleaned[i:i + GROUP_LEN] for i in range(0, len(cleaned), GROUP_LEN)]
    return f"{PREFIX}-" + "-".join(groups)


def hash_key(normalized: str) -> str:
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def make_batch(count: int, batch_name: str = None):
    """Genera `count` llaves nuevas. Devuelve (claves_en_claro, filas_bd)."""
    batch_name = batch_name or datetime.now(timezone.utc).strftime("lote-%Y%m%d-%H%M")
    seen = set()
    keys = []
    while len(keys) < count:
        k = generate_key()
        if k in seen:      # practicamente imposible, pero es barato mirar
            continue
        seen.add(k)
        keys.append(k)
    rows = [
        {"key_hash": hash_key(k), "prefix": k[:9], "batch": batch_name}
        for k in keys
    ]
    return keys, rows


def write_csv(path, keys, batch_name):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["llave", "lote", "generada"])
        now = datetime.now(timezone.utc).isoformat()
        for k in keys:
            w.writerow([k, batch_name, now])
