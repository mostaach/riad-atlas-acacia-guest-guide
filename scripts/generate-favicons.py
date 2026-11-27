import base64
import os
from PIL import Image, ImageDraw

base_dir = r"d:\Workspace\MosaicOS\01_SYSTEM\AgenticOS project manager\projects\degitize-riad-acacia"
user_img_path = r"C:/Users/mehdi/.gemini/antigravity/brain/c1475805-ff09-48db-b36f-e8cc56d5edea/.user_uploaded/media_1795796031409_a72b1f8f.jpg"
logo_dest = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo.png")
pub_dir = os.path.join(base_dir, "client", "public")

# 1. Load newly uploaded refined logo
raw_img = Image.open(user_img_path).convert("RGBA")

# Crop to the outer golden ring bounds
cropped = raw_img.crop((33, 28, 982, 943))

# Resize to 512x512 with 4px margin (504x504 medallion on 512x512 canvas)
medallion = cropped.resize((504, 504), Image.LANCZOS)

# 4x supersampled circular mask for clean antialiasing
mask_hi = Image.new("L", (2016, 2016), 0)
draw = ImageDraw.Draw(mask_hi)
draw.ellipse((0, 0, 2016, 2016), fill=255)
mask = mask_hi.resize((504, 504), Image.LANCZOS)
medallion.putalpha(mask)

logo_512 = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
logo_512.paste(medallion, (4, 4), medallion)
logo_512.save(logo_dest, "PNG")
print("Saved refined master logo.png to:", logo_dest)

# Helper function to generate square icons
def make_icon(size, padding_ratio=1.0):
    target_dim = max(1, int(size * padding_ratio))
    resized = medallion.resize((target_dim, target_dim), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    paste_pos = ((size - target_dim) // 2, (size - target_dim) // 2)
    canvas.paste(resized, paste_pos, resized)
    return canvas

# 2. Multi-size favicon.ico (16, 32, 48)
ico_16 = make_icon(16)
ico_32 = make_icon(32)
ico_48 = make_icon(48)
ico_48.save(
    os.path.join(pub_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# 3. Standard favicon and touch icon PNGs
make_icon(16).save(os.path.join(pub_dir, "favicon-16x16.png"), "PNG")
make_icon(32).save(os.path.join(pub_dir, "favicon-32x32.png"), "PNG")
make_icon(64).save(os.path.join(pub_dir, "favicon.png"), "PNG")
make_icon(180, 0.96).save(os.path.join(pub_dir, "apple-touch-icon.png"), "PNG")
make_icon(192, 0.96).save(os.path.join(pub_dir, "icon-192.png"), "PNG")
make_icon(512, 0.96).save(os.path.join(pub_dir, "icon-512.png"), "PNG")

# 4. Maskable PWA icon (with Android safe area ~75% margin)
make_icon(512, 0.75).save(os.path.join(pub_dir, "icon-maskable-512.png"), "PNG")

# 5. Base64 embedded favicon.svg
with open(os.path.join(pub_dir, "favicon-32x32.png"), "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="32" height="32"/>
</svg>
'''
with open(os.path.join(pub_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

print("All icons successfully generated from new refined logo!")
