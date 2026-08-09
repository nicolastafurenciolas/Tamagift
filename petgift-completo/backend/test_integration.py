import urllib.request
import urllib.error
import json

BASE = "http://127.0.0.1:8000"
TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="


def call(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---- 1) Payload construido EXACTAMENTE como lo arma handleFinalize() en PetGiftWizard.jsx ----
wizard_payload = {
    "name": "Mochi",
    "recipient_name": "Sarah",
    "drawing_normal": TINY_PNG,
    "drawing_feliz": TINY_PNG,
    "drawing_enojado": TINY_PNG,
    "food_preferences": [
        {"food_name": "Pizza", "preference": "gusta", "reaction_message": "Mi favorita, gracias"},
        {"food_name": "Sushi", "preference": "gusta", "reaction_message": "Me encanta el sushi"},
        {"food_name": "Cebolla", "preference": "no_gusta", "reaction_message": "Esto no, por favor"},
    ],
    "phrases": [
        {"category": "positiva", "text": "Hoy me siento genial"},
        {"category": "negativa", "text": "Estoy un poco triste"},
        {"category": "casual", "text": "Que tengas un buen dia"},
    ],
    "photos": [
        {"url": TINY_PNG, "caption": "Nuestra primera cita", "used_for": "puzzle"},
        {"url": TINY_PNG, "caption": "Su banda favorita", "used_for": "poster"},
        {"url": TINY_PNG, "caption": "Su serie favorita", "used_for": "poster"},
    ],
    "songs": [
        {"title": "Nuestra cancion", "embed_url": "https://open.spotify.com/embed/track/xyz"},
    ],
}

print("=== 1) POST /api/pets con el payload exacto del asistente ===")
created = call("POST", "/api/pets", wizard_payload)
slug = created["slug"]
print("Creado. slug =", slug)

print("\n=== 2) GET /api/pets/{slug} -- esto es lo que consume PetGiftGame.jsx ===")
pet = call("GET", f"/api/pets/{slug}")

# Campos que el juego lee directamente (pet.name, pet.drawing_X, pet.food_preferences, etc.)
required_top = ["name", "drawing_normal", "drawing_feliz", "drawing_enojado", "hunger_meter", "love_meter", "current_mood", "food_preferences", "phrases", "photos", "songs"]
missing = [k for k in required_top if k not in pet]
print("Campos esperados por el juego, faltantes:", missing if missing else "ninguno -- OK")

print("\n=== 3) Simulando buildCardPool() del juego (fotos + comidas + relleno) ===")
photos = pet["photos"]
foods = pet["food_preferences"]
pool = []
for i, p in enumerate(photos):
    if len(pool) < 6 and p.get("url"):
        pool.append(("photo", i))
for i, f in enumerate(foods):
    if len(pool) < 6:
        pool.append(("food", f["food_name"]))
print(f"{len(photos)} fotos + {len(foods)} comidas disponibles -> pool de {len(pool)} items:", pool)

print("\n=== 4) Simulando buildPosterList() del juego (filtra used_for == 'poster') ===")
posters = [p for p in photos if p.get("used_for") == "poster" and p.get("url")]
print(f"{len(posters)} posters encontrados (se esperaban 2)")
assert len(posters) == 2, "MISMATCH: buildPosterList no encontraria los posters esperados"

print("\n=== 5) GET manifest.json ===")
manifest = call("GET", f"/api/pets/{slug}/manifest.json")
print("name:", manifest["name"], "| icon presente:", bool(manifest["icons"][0]["src"]))

print("\n=== 6) POST feed con Pizza (gusta) -- como lo llama PetGiftGame.jsx ===")
r1 = call("POST", f"/api/pets/{slug}/feed", {"food_name": "Pizza"})
print(r1)
assert r1["mood"] == "feliz", "MISMATCH: se esperaba mood=feliz"

print("\n=== 7) POST feed con Cebolla (no_gusta) ===")
r2 = call("POST", f"/api/pets/{slug}/feed", {"food_name": "Cebolla"})
print(r2)
assert r2["mood"] == "enojado", "MISMATCH: se esperaba mood=enojado"

print("\n=== TODO OK: el contrato entre asistente, backend y juego coincide ===")
