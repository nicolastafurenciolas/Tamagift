"""Genera llaves de acceso y las exporta a CSV.

Esto lo corres TU, en tu maquina o en el servidor. No esta expuesto en
la web ni tiene endpoint: no hay forma de que alguien de fuera pida
llaves nuevas.

    python generate_keys.py 100
    python generate_keys.py 250 --lote "preventa-enero" --salida llaves.csv
    python generate_keys.py --estado          # cuantas quedan sin usar

El CSV que sale es TU inventario: guardalo bien, porque en la base de
datos solo queda el hash y de ahi no se pueden recuperar las llaves.
"""

import argparse
import os
import sys

import database
import models
import licensing


def cmd_generate(args):
    count = args.cantidad
    if count < 1 or count > 20000:
        print("La cantidad tiene que estar entre 1 y 20000.")
        return 1

    models.Base.metadata.create_all(bind=database.engine)
    keys, rows = licensing.make_batch(count, args.lote)

    db = database.SessionLocal()
    try:
        db.bulk_insert_mappings(models.AccessKey, rows)
        db.commit()
    except Exception as e:
        db.rollback()
        print("No se pudo guardar el lote:", e)
        return 1
    finally:
        db.close()

    salida = args.salida or f"llaves-{rows[0]['batch']}.csv"
    licensing.write_csv(salida, keys, rows[0]["batch"])

    print(f"Generadas {len(keys)} llaves (lote: {rows[0]['batch']})")
    print(f"Guardadas en: {os.path.abspath(salida)}")
    print()
    print("Primeras 5, para que veas el formato:")
    for k in keys[:5]:
        print("   ", k)
    print()
    print("IMPORTANTE: en la base de datos solo queda el hash.")
    print("Si pierdes este CSV, esas llaves no se pueden recuperar.")
    return 0


def cmd_status(args):
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    try:
        total = db.query(models.AccessKey).count()
        usadas = db.query(models.AccessKey).filter(models.AccessKey.used_by_slug.isnot(None)).count()
        print(f"Llaves totales:    {total}")
        print(f"Ya usadas:         {usadas}")
        print(f"Disponibles:       {total - usadas}")
        if usadas:
            print()
            print("Ultimas usadas:")
            recientes = (db.query(models.AccessKey)
                         .filter(models.AccessKey.used_by_slug.isnot(None))
                         .order_by(models.AccessKey.used_at.desc())
                         .limit(10).all())
            for k in recientes:
                print(f"   {k.prefix}...  ->  /p/{k.used_by_slug}   ({k.used_at})")
    finally:
        db.close()
    return 0


def main():
    p = argparse.ArgumentParser(description="Llaves de acceso de PetGift")
    p.add_argument("cantidad", nargs="?", type=int, help="cuantas llaves generar")
    p.add_argument("--lote", help="nombre del lote (por defecto, la fecha)")
    p.add_argument("--salida", help="ruta del CSV")
    p.add_argument("--estado", action="store_true", help="ver cuantas quedan")
    args = p.parse_args()

    if args.estado:
        return cmd_status(args)
    if args.cantidad is None:
        p.print_help()
        return 1
    return cmd_generate(args)


if __name__ == "__main__":
    sys.exit(main())
