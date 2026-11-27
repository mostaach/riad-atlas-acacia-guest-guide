import base64
import os
from PIL import Image, ImageDraw

base_dir = r"d:\Workspace\MosaicOS\01_SYSTEM\AgenticOS project manager\projects\degitize-riad-acacia"
src_path = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo-source.jpg")
logo_dest = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo.png")
pub_dir = os.path.join(base_dir, "client", "public")

raw_img = Image.open(src_path).convert("RGBA")

# Crop to the outer golden ring bounds
# X: 35 to 980 (width 945)
# Y: 29 to 943 (height 914)
cropped = raw_img.crop((35, 29, 980, 943))

# Normalize to a mathematically perfect 1:1 square circular medallion (1024x1024 master)
norm_size = 1024
medallion_1024 = cropped.resize((norm_size, norm_size), Image.LANCZOS)

# Create 4x supersampled circular mask for ultra-smooth antialiased edge
scale = 4
mask_hi = Image.new("L", (norm_size * scale, norm_size * scale), 0)
draw = ImageDraw.Draw(mask_hi)
draw.ellipse((0, 0, norm_size * scale, norm_size * scale), fill=255)
mask = mask_hi.resize((norm_size, norm_size), Image.LANCZOS)
medallion_1024.putalpha(mask)

# Save master 512x512 logo.png with 6px margin (500x500 on 512x512)
logo_512 = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
resized_500 = medallion_1024.resize((500, 500), Image.LANCZOS)
logo_512.paste(resized_500, (6, 6), resized_500)
logo_512.save(logo_dest, "PNG")
print("Saved 1:1 circular master logo.png to:", logo_dest)

# Helper function to generate clean square icons
def make_icon(size, padding_ratio=1.0):
    target_dim = max(1, int(size * padding_ratio))
    resized = medallion_1024.resize((target_dim, target_dim), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    paste_pos = ((size - target_dim) // 2, (size - target_dim) // 2)
    canvas.paste(resized, paste_pos, resized)
    return canvas

# 1. Multi-size favicon.ico (16, 32, 48)
ico_16 = make_icon(16)
ico_32 = make_icon(32)
ico_48 = make_icon(48)
ico_48.save(
    os.path.join(pub_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# 2. Standard favicon and touch icon PNGs
make_icon(16).save(os.path.join(pub_dir, "favicon-16x16.png"), "PNG")
make_icon(32).save(os.path.join(pub_dir, "favicon-32x32.png"), "PNG")
make_icon(64).save(os.path.join(pub_dir, "favicon.png"), "PNG")
make_icon(180, 0.96).save(os.path.join(pub_dir, "apple-touch-icon.png"), "PNG")
make_icon(192, 0.96).save(os.path.join(pub_dir, "icon-192.png"), "PNG")
make_icon(512, 0.96).save(os.path.join(pub_dir, "icon-512.png"), "PNG")

# 3. Maskable PWA icon (with Android safe area ~75% margin)
make_icon(512, 0.75).save(os.path.join(pub_dir, "icon-maskable-512.png"), "PNG")

# 4. Base64 embedded favicon.svg
with open(os.path.join(pub_dir, "favicon-32x32.png"), "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="32" height="32"/>
</svg>
'''
with open(os.path.join(pub_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

print("All icons successfully generated from official logo-source.jpg!")
