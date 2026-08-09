from PIL import Image

def remove_white_bg(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # threshold for "white"
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0)) # transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(img_path, "PNG")

remove_white_bg("assets/images/pusheen-normal.png")
remove_white_bg("assets/images/pusheen-happy.png")
remove_white_bg("assets/images/pusheen-angry.png")
print("Background removed from all 3 images.")
