import base64
import os
from PIL import Image

base_dir = r"d:\Workspace\MosaicOS\01_SYSTEM\AgenticOS project manager\projects\degitize-riad-acacia"
logo_path = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo.png")
pub_dir = os.path.join(base_dir, "client", "public")

img = Image.open(logo_path).convert("RGBA")

# 1. Generate proper multi-size favicon.ico (16, 32, 48)
img.save(os.path.join(pub_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# 2. Generate standard favicon PNG sizes
img.resize((16, 16), Image.LANCZOS).save(os.path.join(pub_dir, "favicon-16x16.png"), "PNG")
img.resize((32, 32), Image.LANCZOS).save(os.path.join(pub_dir, "favicon-32x32.png"), "PNG")
img.resize((64, 64), Image.LANCZOS).save(os.path.join(pub_dir, "favicon.png"), "PNG")
img.resize((180, 180), Image.LANCZOS).save(os.path.join(pub_dir, "apple-touch-icon.png"), "PNG")
img.resize((192, 192), Image.LANCZOS).save(os.path.join(pub_dir, "icon-192.png"), "PNG")

icon512 = img.resize((512, 512), Image.LANCZOS)
icon512.save(os.path.join(pub_dir, "icon-512.png"), "PNG")
icon512.save(os.path.join(pub_dir, "icon-maskable-512.png"), "PNG")

# 3. Generate self-contained favicon.svg with embedded base64 data URI
with open(os.path.join(pub_dir, "favicon-32x32.png"), "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="32" height="32"/>
</svg>
'''

with open(os.path.join(pub_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

print("Icons generated successfully!")
