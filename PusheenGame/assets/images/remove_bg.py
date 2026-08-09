import os
from PIL import Image

def remove_white_background(folder_path):
    print(f"Buscando imagenes en {folder_path}...")
    for filename in os.listdir(folder_path):
        if filename.endswith(".png") and filename.startswith("pusheen-"):
            filepath = os.path.join(folder_path, filename)
            try:
                img = Image.open(filepath).convert("RGBA")
                datas = img.getdata()
                
                newData = []
                for item in datas:
                    # check if it is white or very close to white
                    # r, g, b, a
                    if item[0] > 230 and item[1] > 230 and item[2] > 230:
                        newData.append((255, 255, 255, 0)) # transparent
                    else:
                        newData.append(item)
                        
                img.putdata(newData)
                img.save(filepath, "PNG")
                print(f"Fondo eliminado: {filename}")
            except Exception as e:
                print(f"Error procesando {filename}: {e}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    remove_white_background(current_dir)
    print("¡Listo! Ya puedes cerrar esta ventana.")
