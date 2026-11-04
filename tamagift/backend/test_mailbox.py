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

    # como mucho 15 por día
    for i in range(13):
        assert client.post(f"/api/pets/{slug}/letters", json={"text": f"carta {i}", "token": token}).status_code == 200
    assert client.post(f"/api/pets/{slug}/letters", json={"text": "una más", "token": token}).status_code == 429

    # validación
    assert client.post(f"/api/pets/{other['slug']}/letters", json={"text": "", "token": other["owner_token"]}).status_code == 400
    assert client.post(f"/api/pets/{other['slug']}/letters", json={"text": "x" * 1201, "token": other["owner_token"]}).status_code == 422
    print("ok: buzón")
    regalo_vivo()


def regalo_vivo():
    """Ficha personal, cartas con fecha, paquetes, voz, respuestas y rincón."""
    import json
    from datetime import datetime, timedelta, timezone
    prof = json.dumps({"nickname": "Lu", "situations": {"triste": ["Acá estoy"]}})
    r = client.post("/api/pets", json={"name": "Sol", "drawing_normal": TINY_PNG, "drawing_feliz": TINY_PNG,
                                        "drawing_enojado": TINY_PNG, "profile": prof})
    assert r.status_code == 200, r.text
    pet = r.json()
    slug, token = pet["slug"], pet["owner_token"]
    assert json.loads(client.get(f"/api/pets/{slug}").json()["profile"])["nickname"] == "Lu"
    # la ficha: solo quien regaló la cambia, y tiene que ser un objeto JSON
    assert client.put(f"/api/pets/{slug}/profile", json={"profile": "{}"}).status_code == 403
    assert client.put(f"/api/pets/{slug}/profile", json={"profile": "[1]", "token": token}).status_code == 422
    assert client.put(f"/api/pets/{slug}/profile", json={"profile": json.dumps({"nickname": "Lulú"}), "token": token}).status_code == 200
    assert json.loads(client.get(f"/api/pets/{slug}").json()["profile"])["nickname"] == "Lulú"

    # carta con fecha: cerrada hasta el día, sin contenido; no se puede marcar abierta
    later = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    r = client.post(f"/api/pets/{slug}/letters", json={"text": "Feliz aniversario", "open_at": later, "token": token})
    assert r.status_code == 200, r.text
    dated = r.json()
    got = client.get(f"/api/pets/{slug}/letters/{dated['id']}").json()
    assert got["locked"] is True and got["text"] == "" and got["open_at"]
    assert client.post(f"/api/pets/{slug}/letters/{dated['id']}/opened").status_code == 409

    # paquete, voz y nota
    assert client.post(f"/api/pets/{slug}/letters", json={"kind": "paquete", "text": "Lo vi y pensé en ti", "token": token}).status_code == 400
    pk = client.post(f"/api/pets/{slug}/letters", json={"kind": "paquete", "text": "Lo vi y pensé en ti",
                                                        "payload": json.dumps({"kind": "decor", "id": "osito"}), "token": token}).json()
    assert pk["kind"] == "paquete" and json.loads(pk["payload"])["id"] == "osito"
    assert client.post(f"/api/pets/{slug}/letters", json={"kind": "voz", "audio": TINY_PNG, "token": token}).status_code == 422
    vz = client.post(f"/api/pets/{slug}/letters", json={"kind": "voz", "audio": "data:audio/webm;base64,AAAA", "token": token}).json()
    assert vz["has_audio"] is True and vz["audio"] is None
    assert client.get(f"/api/pets/{slug}/letters/{vz['id']}").json()["audio"].startswith("data:audio/")
    # abrir una carta normal la marca
    op = client.post(f"/api/pets/{slug}/letters/{pk['id']}/opened").json()
    assert op["opened_at"]

    # respuestas de quien recibe: pregunta → quien regaló responde; canje → cumplido
    q = client.post(f"/api/pets/{slug}/replies", json={"kind": "pregunta", "text": "¿Qué te gustó primero de mí?"}).json()
    c = client.post(f"/api/pets/{slug}/replies", json={"kind": "canje", "ref": "cena"}).json()
    assert client.post(f"/api/pets/{slug}/replies", json={"kind": "carta"}).status_code == 400
    assert client.post(f"/api/pets/{slug}/replies/{q['id']}/answer", json={"answer": "Tu risa"}).status_code == 403
    assert client.post(f"/api/pets/{slug}/replies/{q['id']}/answer", json={"answer": "Tu risa", "token": token}).json()["answer"] == "Tu risa"
    assert client.post(f"/api/pets/{slug}/replies/{c['id']}/answer", json={"done": True, "token": token}).json()["done"] is True
    lst = client.get(f"/api/pets/{slug}/replies").json()
    assert {x["id"]: x for x in lst}[q["id"]]["answer"] == "Tu risa"

    # rincón: todo junto, y quien regaló ve sus cartas con fecha completas
    assert client.post(f"/api/pets/{slug}/rincon", json={}).status_code == 403
    rc = client.post(f"/api/pets/{slug}/rincon", json={"token": token}).json()
    assert rc["name"] == "Sol" and json.loads(rc["profile"])["nickname"] == "Lulú"
    d = {x["id"]: x for x in rc["letters"]}[dated["id"]]
    assert d["text"] == "Feliz aniversario" and d["locked"] is False
    assert {x["id"]: x for x in rc["letters"]}[pk["id"]]["opened_at"]
    assert len(rc["replies"]) == 2
    print("ok: regalo vivo")


if __name__ == "__main__":
    run()
