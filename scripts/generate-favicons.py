import base64
import os
from PIL import Image, ImageDraw

base_dir = r"d:\Workspace\MosaicOS\01_SYSTEM\AgenticOS project manager\projects\degitize-riad-acacia"
src_path = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo-source.jpg")
logo_dest = os.path.join(base_dir, "client", "public", "riad-atlas-acacia", "logo.png")
pub_dir = os.path.join(base_dir, "client", "public")

raw_img = Image.open(src_path).convert("RGBA")

# Center and radii for exact 0.982 normalized distance
# This crops right on the peak of the outer solid gold ring, eliminating 100% of the dark outer edge
cx, cy = 507.5, 486.0
rx = (943 / 2.0) * 0.982
ry = (912 / 2.0) * 0.982

x1, x2 = int(cx - rx), int(cx + rx)
y1, y2 = int(cy - ry), int(cy + ry)

cropped = raw_img.crop((x1, y1, x2, y2))
norm_size = 1024
medallion_1024 = cropped.resize((norm_size, norm_size), Image.LANCZOS)

# Create 4x supersampled circular mask for ultra-smooth antialiased edge
scale = 4
mask_hi = Image.new("L", (norm_size * scale, norm_size * scale), 0)
draw = ImageDraw.Draw(mask_hi)
draw.ellipse((0, 0, norm_size * scale, norm_size * scale), fill=255)
mask = mask_hi.resize((norm_size, norm_size), Image.LANCZOS)
medallion_1024.putalpha(mask)

# Save master 512x512 logo.png with 6px margin (500x500 on 512x512, transparent background for header & hero)
logo_512 = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
resized_500 = medallion_1024.resize((500, 500), Image.LANCZOS)
logo_512.paste(resized_500, (6, 6), resized_500)
logo_512.save(logo_dest, "PNG")
print("Saved 100% clean circular master logo.png to:", logo_dest)

# Luxury Riad Atlas Acacia Obsidian Charcoal: #1C1917 -> RGB(28, 25, 23)
THEME_BG = (28, 25, 23, 255)

# Helper function to generate transparent web favicons
def make_web_favicon(size, padding_ratio=1.0):
    target_dim = max(1, int(size * padding_ratio))
    resized = medallion_1024.resize((target_dim, target_dim), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    paste_pos = ((size - target_dim) // 2, (size - target_dim) // 2)
    canvas.paste(resized, paste_pos, resized)
    return canvas

# Helper function to generate solid luxury mobile app icons (100% opaque, 0 transparent pixels)
def make_mobile_app_icon(size, padding_ratio=0.82):
    target_dim = max(1, int(size * padding_ratio))
    resized = medallion_1024.resize((target_dim, target_dim), Image.LANCZOS)
    
    # 100% opaque solid background canvas
    base_canvas = Image.new("RGBA", (size, size), THEME_BG)
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    paste_pos = ((size - target_dim) // 2, (size - target_dim) // 2)
    overlay.paste(resized, paste_pos, resized)
    
    # Proper alpha composite so no alpha degradation occurs
    solid_icon = Image.alpha_composite(base_canvas, overlay)
    return solid_icon

# 1. Multi-size favicon.ico (16, 32, 48) - Transparent for browser tab
ico_16 = make_web_favicon(16)
ico_32 = make_web_favicon(32)
ico_48 = make_web_favicon(48)
ico_48.save(
    os.path.join(pub_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# 2. Standard Web Favicons (Transparent for browser tab)
make_web_favicon(16).save(os.path.join(pub_dir, "favicon-16x16.png"), "PNG")
make_web_favicon(32).save(os.path.join(pub_dir, "favicon-32x32.png"), "PNG")
make_web_favicon(64).save(os.path.join(pub_dir, "favicon.png"), "PNG")

# 3. Mobile Home Screen Icons (iOS & Android PWA): Solid 100% Opaque #1C1917 Luxury Background
# Apple Touch Icon: 180x180 solid opaque PNG
apple_icon = make_mobile_app_icon(180, 0.82).convert("RGB")
apple_icon.save(os.path.join(pub_dir, "apple-touch-icon.png"), "PNG")

# Android PWA Standard Icons (Solid #1C1917)
make_mobile_app_icon(192, 0.82).save(os.path.join(pub_dir, "icon-192.png"), "PNG")
make_mobile_app_icon(512, 0.82).save(os.path.join(pub_dir, "icon-512.png"), "PNG")

# Android PWA Maskable Icon: within 74% safe area on solid #1C1917 for Android Adaptive Launchers
make_mobile_app_icon(512, 0.74).save(os.path.join(pub_dir, "icon-maskable-512.png"), "PNG")

# 4. Base64 embedded favicon.svg
with open(os.path.join(pub_dir, "favicon-32x32.png"), "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="32" height="32"/>
</svg>
'''
with open(os.path.join(pub_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

print("SUCCESS: Mobile app icons generated with solid #1C1917 luxury background!")
print("Browser tab favicons and in-app logo remain transparent!")
