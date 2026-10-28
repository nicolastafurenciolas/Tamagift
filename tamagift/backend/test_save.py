"""Pruebas de la partida guardada en el servidor (GET/POST …/save).

Corren solas, sin levantar el servidor y con una base de prueba
temporal:

    python test_save.py
"""
import json
import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(_tmp, "prueba.db").replace("\\", "/")
os.environ["REQUIRE_ACCESS_KEY"] = "0"

from fastapi.testclient import TestClient  # noqa: E402
import main  # noqa: E402

client = TestClient(main.app)
TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="


def post_save(slug, body):
    # Como lo manda el juego: texto plano (sin consulta previa de CORS).
    return client.post(f"/api/pets/{slug}/save", content=json.dumps(body), headers={"Content-Type": "text/plain"})


def run():
    pet = client.post("/api/pets", json={
        "name": "Mochi", "drawing_normal": TINY_PNG, "drawing_feliz": TINY_PNG, "drawing_enojado": TINY_PNG,
    }).json()
    slug = pet["slug"]

    # Sin partida todavía
    r = client.get(f"/api/pets/{slug}/save")
    assert r.status_code == 200 and r.json() == {"data": None, "rev": 0, "saved_at": 0}, r.text

    # Primer guardado
    r = post_save(slug, {"data": {"coins": 10}, "rev": 0, "saved_at": 1000})
    assert r.status_code == 200 and r.json()["rev"] == 1, r.text
    assert client.get(f"/api/pets/{slug}/save").json() == {"data": {"coins": 10}, "rev": 1, "saved_at": 1000}

    # Guardado sobre la versión que se tenía
    r = post_save(slug, {"data": {"coins": 25}, "rev": 1, "saved_at": 2000})
    assert r.status_code == 200 and r.json()["rev"] == 2, r.text

    # Otro dispositivo que trabajaba sobre la versión 1: no pisa nada y
    # recibe la versión nueva para decidir.
    r = post_save(slug, {"data": {"coins": 3}, "rev": 1, "saved_at": 1500})
    assert r.status_code == 409, r.text
    assert r.json()["data"] == {"coins": 25} and r.json()["rev"] == 2, r.text

    # …y si decide que la suya es más nueva, la manda sobre esa versión.
    r = post_save(slug, {"data": {"coins": 40}, "rev": 2, "saved_at": 3000})
    assert r.status_code == 200 and r.json()["rev"] == 3, r.text
    assert client.get(f"/api/pets/{slug}/save").json()["data"] == {"coins": 40}

    # Datos que no sirven
    assert post_save(slug, {"data": "hola"}).status_code == 422
    assert client.post(f"/api/pets/{slug}/save", content="no es json", headers={"Content-Type": "text/plain"}).status_code == 422
    assert post_save(slug, {"data": {"x": "a" * 500_000}}).status_code == 422

    # Mascota que no existe
    assert client.get("/api/pets/noexiste1/save").status_code == 404
    assert post_save("noexiste1", {"data": {}}).status_code == 404

    # La mascota se sigue leyendo igual (la partida no viaja con ella)
    assert "data" not in client.get(f"/api/pets/{slug}").json()
    print("ok: partida guardada")


if __name__ == "__main__":
    run()
