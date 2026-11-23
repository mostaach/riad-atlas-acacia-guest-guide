import os
from PIL import Image, ImageDraw, ImageFilter

def generate_icons():
    # 1. Load source tree
    src_img = Image.open('pdf_images/p1_img1_Im0.png')
    tree_raw = src_img.crop((78, 0, 236, 80)) # 158x80 unclipped tree

    r, g, b, a = tree_raw.split()

    # Create high-res tree alpha via upscaling & gentle smoothing
    scale = 8
    tree_large_a = a.resize((158 * scale, 80 * scale), Image.Resampling.LANCZOS)
    tree_large_a = tree_large_a.filter(ImageFilter.SMOOTH)

    def make_gold_tree(target_w, target_h):
        tree_a = tree_large_a.resize((target_w, target_h), Image.Resampling.LANCZOS)
        # Create gold gradient from bright warm gold #FCD34D to rich Moroccan amber #D97706
        gold_im = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(gold_im)
        for y in range(target_h):
            ratio = y / max(1, target_h - 1)
            r_val = int(252 * (1 - ratio) + 217 * ratio)
            g_val = int(211 * (1 - ratio) + 119 * ratio)
            b_val = int(77 * (1 - ratio) + 6 * ratio)
            draw.line([(0, y), (target_w, y)], fill=(r_val, g_val, b_val, 255))
        gold_im.putalpha(tree_a)
        return gold_im

    def build_icon(size, is_maskable=False):
        icon = Image.new('RGBA', (size, size), (28, 25, 23, 255)) # #1C1917 obsidian
        draw = ImageDraw.Draw(icon)

        # Medallion rings
        # For maskable, keep content strictly inside 75% circle
        scale_factor = 0.82 if is_maskable else 1.0
        c = size / 2.0

        ring_rad = int(175 * (size / 512.0) * scale_factor)
        draw.ellipse([c - ring_rad, c - ring_rad, c + ring_rad, c + ring_rad], fill=None, outline=(234, 179, 8, 90), width=max(1, int(2 * size / 512.0)))
        
        ring_rad2 = int(183 * (size / 512.0) * scale_factor)
        draw.ellipse([c - ring_rad2, c - ring_rad2, c + ring_rad2, c + ring_rad2], fill=None, outline=(234, 179, 8, 45), width=max(1, int(1 * size / 512.0)))

        # Four delicate star pips
        pip_len = max(2, int(6 * size / 512.0))
        pip_w = max(1, int(3 * size / 512.0))
        # Top
        draw.polygon([(c, c - ring_rad2 - pip_len), (c + pip_w, c - ring_rad2), (c, c - ring_rad2 + pip_len // 2), (c - pip_w, c - ring_rad2)], fill=(245, 158, 11, 200))
        # Bottom
        draw.polygon([(c, c + ring_rad2 + pip_len), (c + pip_w, c + ring_rad2), (c, c + ring_rad2 - pip_len // 2), (c - pip_w, c + ring_rad2)], fill=(245, 158, 11, 200))

        # Centered gold acacia tree
        tw = int(250 * (size / 512.0) * scale_factor)
        th = int(126 * (size / 512.0) * scale_factor)
        gold_tree = make_gold_tree(tw, th)
        tx = int(c - tw / 2.0)
        ty = int(c - th / 2.0)
        icon.paste(gold_tree, (tx, ty), gold_tree)

        return icon

    # Output directory
    os.makedirs('client/public/riad-atlas-acacia', exist_ok=True)

    # 1. Standard 512x512 PWA Icon
    icon_512 = build_icon(512, is_maskable=False)
    icon_512.save('client/public/icon-512.png', 'PNG', optimize=True)

    # 2. Maskable 512x512 PWA Icon (safe zone for Android adaptive icons)
    icon_maskable = build_icon(512, is_maskable=True)
    icon_maskable.save('client/public/icon-maskable-512.png', 'PNG', optimize=True)

    # 3. 192x192 PWA Icon
    icon_192 = build_icon(192, is_maskable=False)
    icon_192.save('client/public/icon-192.png', 'PNG', optimize=True)

    # 4. Apple Touch Icon 180x180 (iOS Home Screen)
    icon_apple = build_icon(180, is_maskable=False)
    icon_apple.save('client/public/apple-touch-icon.png', 'PNG', optimize=True)

    # 5. Favicon 64x64
    icon_fav = build_icon(64, is_maskable=False)
    icon_fav.save('client/public/favicon.png', 'PNG', optimize=True)

    # 6. High-res transparent logo for in-app medallion / header
    logo_size = 256
    logo_w = 210
    logo_h = 106
    gold_logo = make_gold_tree(logo_w, logo_h)
    logo_im = Image.new('RGBA', (logo_size, logo_size), (0, 0, 0, 0))
    logo_im.paste(gold_logo, ((logo_size - logo_w) // 2, (logo_size - logo_h) // 2), gold_logo)
    logo_im.save('client/public/riad-atlas-acacia/logo.png', 'PNG', optimize=True)

    print("All icons successfully generated:")
    print(" - client/public/icon-512.png")
    print(" - client/public/icon-maskable-512.png")
    print(" - client/public/icon-192.png")
    print(" - client/public/apple-touch-icon.png")
    print(" - client/public/favicon.png")
    print(" - client/public/riad-atlas-acacia/logo.png")

if __name__ == '__main__':
    generate_icons()
