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


print("=== 1) Crear mascota ===")
pet = call("POST", "/api/pets", {
    "name": "Mochi",
    "creator_name": "Nicolas",
    "recipient_name": "Sarah",
    "drawing_normal": TINY_PNG,
    "drawing_feliz": TINY_PNG,
    "drawing_enojado": TINY_PNG,
    "food_preferences": [
        {"food_name": "Pizza", "preference": "gusta", "reaction_message": "Mi favorita, gracias amor"},
        {"food_name": "Brocoli", "preference": "no_gusta", "reaction_message": "Esto no me gusta, por favor otra cosa"},
    ],
    "phrases": [
        {"category": "casual", "text": "Ya llegaste, te esperaba"},
        {"category": "positiva", "text": "Hoy me siento muy feliz"},
    ],
    "photos": [
        {"url": "https://example.com/foto1.jpg", "caption": "Nuestra primera cita", "used_for": "puzzle"},
    ],
    "songs": [
        {"title": "Nuestra cancion", "embed_url": "https://open.spotify.com/embed/track/xyz"},
    ],
})
slug = pet["slug"]
print("Slug generado:", slug)
print("Nombre:", pet["name"], "| mood inicial:", pet["current_mood"], "| hambre:", pet["hunger_meter"], "| amor:", pet["love_meter"])
print("Comidas configuradas:", [f["food_name"] for f in pet["food_preferences"]])

print("\n=== 2) Obtener mascota por slug ===")
fetched = call("GET", f"/api/pets/{slug}")
print("Recuperada correctamente:", fetched["name"], "(slug=" + slug + ")")

print("\n=== 3) manifest.json dinamico ===")
manifest = call("GET", f"/api/pets/{slug}/manifest.json")
print("name:", manifest["name"])
print("start_url:", manifest["start_url"])
print("theme_color:", manifest["theme_color"])
print("icon src (recortado):", manifest["icons"][0]["src"][:50] + "...")

print("\n=== 4) Alimentar con Pizza (le gusta) ===")
print(call("POST", f"/api/pets/{slug}/feed", {"food_name": "Pizza"}))

print("\n=== 5) Alimentar con Brocoli (no le gusta) ===")
print(call("POST", f"/api/pets/{slug}/feed", {"food_name": "Brocoli"}))

print("\n=== 6) Comida no configurada (reaccion neutral) ===")
print(call("POST", f"/api/pets/{slug}/feed", {"food_name": "Sushi"}))

print("\n=== 7) Mascota inexistente (debe dar 404) ===")
try:
    call("GET", "/api/pets/noexiste123")
    print("ERROR: no debio encontrarla")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code} (correcto, esperado 404)")
