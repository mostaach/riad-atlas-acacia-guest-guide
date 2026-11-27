import base64
import os
import shutil
from PIL import Image, ImageDraw

base_dir = r"d:\Workspace\MosaicOS\01_SYSTEM\AgenticOS project manager\projects\degitize-riad-acacia"
user_img_path = r"C:/Users/mehdi/.gemini/antigravity/brain/c1475805-ff09-48db-b36f-e8cc56d5edea/.user_uploaded/media_1795791964787_e716268d.jpg"
logo_dest = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo.png")
pub_dir = os.path.join(base_dir, "client", "public")

# 1. Load user upscaled image
raw_img = Image.open(user_img_path).convert("RGBA")

# Center & Radius of the golden circular medallion
cx, cy = 502, 458
radius = 434

# Crop square around the circular medallion
box = (cx - radius, cy - radius, cx + radius, cy + radius)
cropped = raw_img.crop(box)

# Super-sampled antialiased circular mask for silky smooth outer edge
scale = 4
mask_size = (cropped.width * scale, cropped.height * scale)
mask = Image.new("L", mask_size, 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, mask_size[0], mask_size[1]), fill=255)
mask = mask.resize(cropped.size, Image.LANCZOS)
cropped.putalpha(mask)

# Save master 512x512 logo.png
logo_512 = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
resized_504 = cropped.resize((504, 504), Image.LANCZOS)
logo_512.paste(resized_504, (4, 4), resized_504)
logo_512.save(logo_dest, "PNG")
print("Saved master logo.png to:", logo_dest)

# Helper function to generate square icons
def make_icon(size, padding_ratio=1.0):
    target_dim = max(1, int(size * padding_ratio))
    resized = cropped.resize((target_dim, target_dim), Image.LANCZOS)
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
make_icon(180, 0.95).save(os.path.join(pub_dir, "apple-touch-icon.png"), "PNG")
make_icon(192, 0.95).save(os.path.join(pub_dir, "icon-192.png"), "PNG")
make_icon(512, 0.95).save(os.path.join(pub_dir, "icon-512.png"), "PNG")

# 4. Maskable PWA icon (with Android ~75% safe area margin)
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

print("Generated all updated icons from user's upscaled medallion!")
