"""Pruebas del buzón: cartas que quien regaló manda después.

Corren solas, con una base de prueba temporal:

    python test_mailbox.py
"""
import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(_tmp, "prueba.db").replace("\\", "/")
os.environ["REQUIRE_ACCESS_KEY"] = "0"

from fastapi.testclient import TestClient  # noqa: E402
import main  # noqa: E402
import models  # noqa: E402
import database  # noqa: E402
import licensing  # noqa: E402

client = TestClient(main.app)
TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="


def new_pet():
    r = client.post("/api/pets", json={"name": "Luna", "drawing_normal": TINY_PNG, "drawing_feliz": TINY_PNG, "drawing_enojado": TINY_PNG})
    assert r.status_code == 200, r.text
    return r.json()


def run():
    pet = new_pet()
    slug, token = pet["slug"], pet["owner_token"]
    assert token and len(token) >= 20

    # la llave del buzón no se ve al leer la mascota
    assert "owner_token" not in client.get(f"/api/pets/{slug}").json()

    # sin llave (o con una ajena) no se puede escribir
    other = new_pet()
    assert client.post(f"/api/pets/{slug}/letters", json={"text": "hola"}).status_code == 403
    assert client.post(f"/api/pets/{slug}/letters", json={"text": "hola", "token": other["owner_token"]}).status_code == 403
    assert client.post(f"/api/pets/{slug}/mailbox/check", json={"token": "nope"}).json() == {"ok": False}
    assert client.post(f"/api/pets/{slug}/mailbox/check", json={"token": token}).json() == {"ok": True}

    # con la llave sí
    r = client.post(f"/api/pets/{slug}/letters", json={"text": "  Te extraño mucho  ", "token": token})
    assert r.status_code == 200, r.text
    first = r.json()
    assert first["text"] == "Te extraño mucho" and first["has_photo"] is False
    r = client.post(f"/api/pets/{slug}/letters", json={"text": "Mira esta foto", "photo": TINY_PNG, "token": token})
    second = r.json()
    assert second["has_photo"] is True and second["photo"] is None

    # leer: la lista sin fotos; `after` trae solo las nuevas; la foto, aparte
    lst = client.get(f"/api/pets/{slug}/letters").json()
    assert [l["id"] for l in lst] == [first["id"], second["id"]]
    assert all(l["photo"] is None for l in lst)
    assert [l["id"] for l in client.get(f"/api/pets/{slug}/letters?after={first['id']}").json()] == [second["id"]]
    assert client.get(f"/api/pets/{slug}/letters/{second['id']}").json()["photo"] == TINY_PNG
    assert client.get(f"/api/pets/{other['slug']}/letters/{second['id']}").status_code == 404

    # la llave de acceso con que se compró el regalo también sirve
    key = "TAMA-ABCDE-FGHJK-MNPQR-STUVW"
    db = database.SessionLocal()
    db.add(models.AccessKey(key_hash=licensing.hash_key(licensing.normalize_key(key)), prefix="TAMA-ABCDE", used_by_slug=other["slug"]))
    db.commit()
    db.close()
    assert client.post(f"/api/pets/{other['slug']}/letters", json={"text": "hola", "access_key": "tama abcde fghjk mnpqr stuvw"}).status_code == 200
    assert client.post(f"/api/pets/{slug}/letters", json={"text": "hola", "access_key": key}).status_code == 403

    # como mucho 10 por día
    for i in range(8):
        assert client.post(f"/api/pets/{slug}/letters", json={"text": f"carta {i}", "token": token}).status_code == 200
    assert client.post(f"/api/pets/{slug}/letters", json={"text": "una más", "token": token}).status_code == 429

    # validación
    assert client.post(f"/api/pets/{other['slug']}/letters", json={"text": "", "token": other["owner_token"]}).status_code == 422
    assert client.post(f"/api/pets/{other['slug']}/letters", json={"text": "x" * 601, "token": other["owner_token"]}).status_code == 422
    print("ok: buzón")


if __name__ == "__main__":
    run()
