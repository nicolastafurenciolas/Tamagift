"""Pruebas del álbum de fotos (las fotos que quien recibe le toma a su
mascota). Corren solas, con una base de prueba temporal:

    python test_album.py
"""
import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(_tmp, "prueba.db").replace("\\", "/")
os.environ["REQUIRE_ACCESS_KEY"] = "0"

from fastapi.testclient import TestClient  # noqa: E402
import main  # noqa: E402

client = TestClient(main.app)
TINY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
JPG = "data:image/jpeg;base64," + "A" * 200


def run():
    slug = client.post("/api/pets", json={"name": "Luna", "drawing_normal": TINY, "drawing_feliz": TINY, "drawing_enojado": TINY}).json()["slug"]
    other = client.post("/api/pets", json={"name": "Sol", "drawing_normal": TINY, "drawing_feliz": TINY, "drawing_enojado": TINY}).json()["slug"]

    assert client.get(f"/api/pets/{slug}/snapshots").json() == []
    r = client.post(f"/api/pets/{slug}/snapshots", json={"image": JPG, "thumb": JPG, "caption": "  Luna · 28 de octubre "})
    assert r.status_code == 200, r.text
    first = r.json()
    assert first["caption"] == "Luna · 28 de octubre" and first["image"] is None
    second = client.post(f"/api/pets/{slug}/snapshots", json={"image": JPG, "thumb": JPG}).json()

    # la lista: miniaturas, la más nueva primero, sin la foto grande
    lst = client.get(f"/api/pets/{slug}/snapshots").json()
    assert [s["id"] for s in lst] == [second["id"], first["id"]]
    assert lst[0]["thumb"] == JPG and lst[0]["image"] is None
    assert client.get(f"/api/pets/{slug}/snapshots/{first['id']}").json()["image"] == JPG
    assert client.get(f"/api/pets/{other}/snapshots/{first['id']}").status_code == 404

    # borrar
    assert client.delete(f"/api/pets/{other}/snapshots/{first['id']}").status_code == 404
    assert client.delete(f"/api/pets/{slug}/snapshots/{first['id']}").json() == {"ok": True}
    assert [s["id"] for s in client.get(f"/api/pets/{slug}/snapshots").json()] == [second["id"]]

    # solo imágenes, y de tamaño razonable
    assert client.post(f"/api/pets/{slug}/snapshots", json={"image": "hola", "thumb": JPG}).status_code == 422
    assert client.post(f"/api/pets/{slug}/snapshots", json={"image": "data:image/jpeg;base64," + "A" * 1_000_000, "thumb": JPG}).status_code == 422

    # como mucho 30 por día
    for _ in range(28):
        assert client.post(f"/api/pets/{other}/snapshots", json={"image": JPG, "thumb": JPG}).status_code == 200
    assert client.post(f"/api/pets/{other}/snapshots", json={"image": JPG, "thumb": JPG}).status_code == 200
    assert client.post(f"/api/pets/{other}/snapshots", json={"image": JPG, "thumb": JPG}).status_code == 200
    assert client.post(f"/api/pets/{other}/snapshots", json={"image": JPG, "thumb": JPG}).status_code == 429
    print("ok: álbum")


if __name__ == "__main__":
    run()
