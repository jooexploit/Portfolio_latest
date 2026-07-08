import os
import glob
from PIL import Image, ImageDraw, ImageFont

def crop_center(pil_img, crop_width, crop_height):
    img_width, img_height = pil_img.size
    return pil_img.crop(((img_width - crop_width) // 2,
                         (img_height - crop_height) // 2,
                         (img_width + crop_width) // 2,
                         (img_height + crop_height) // 2))

def make_square(pil_img):
    w, h = pil_img.size
    min_dim = min(w, h)
    return crop_center(pil_img, min_dim, min_dim)

def optimize_images():
    public_dir = "public"
    print("Starting image optimization...")

    # 1. Optimize logo.png
    logo_path = os.path.join(public_dir, "logo.png")
    if os.path.exists(logo_path):
        print("Optimizing logo.png...")
        img = Image.open(logo_path)
        # Original is 1536x1024 (3:2). Let's resize to a high-quality 240x160 (retains transparency)
        logo_optimized = img.resize((240, 160), Image.Resampling.LANCZOS)
        logo_optimized.save(logo_path, "PNG", optimize=True)
        # Also save webp version
        logo_optimized.save(os.path.join(public_dir, "logo.webp"), "WEBP", quality=90)
        print("logo.png optimized and logo.webp created.")

    # 2. Optimize project previews
    previews = [
        "shoky_lms_preview.png",
        "whatsapp_automation_preview.png",
        "chrome_extension_preview.png",
        "analytics_dashboard_preview.png",
        "devops_labs_preview.png",
        "rashed_sport_preview.png"
    ]

    for p in previews:
        p_path = os.path.join(public_dir, p)
        if os.path.exists(p_path):
            print(f"Optimizing preview: {p}...")
            img = Image.open(p_path)
            # The preview images are 1024x1024. Let's resize to 800x800 for web delivery.
            img_rgb = img.convert("RGB")
            img_resized = img_rgb.resize((800, 800), Image.Resampling.LANCZOS)
            
            # Save original filename as compressed JPEG (since they are JPEG internally)
            img_resized.save(p_path, "JPEG", quality=82, optimize=True)
            
            # Save optimized WebP version
            base_name = os.path.splitext(p)[0]
            img_resized.save(os.path.join(public_dir, f"{base_name}.webp"), "WEBP", quality=80)
            print(f"Optimized {p} and generated {base_name}.webp.")

    # 3. Generate favicon package from small_icon.png
    icon_path = os.path.join(public_dir, "small_icon.png")
    if os.path.exists(icon_path):
        print("Generating favicon package from small_icon.png...")
        icon_img = Image.open(icon_path)
        # Center crop to square
        square_icon = make_square(icon_img)

        # Sizes to generate
        sizes = {
            "favicon-16x16.png": (16, 16),
            "favicon-32x32.png": (32, 32),
            "mstile-150x150.png": (150, 150),
            "apple-touch-icon.png": (180, 180),
            "android-chrome-192x192.png": (192, 192),
            "android-chrome-512x512.png": (512, 512)
        }

        for name, size in sizes.items():
            resized = square_icon.resize(size, Image.Resampling.LANCZOS)
            resized.save(os.path.join(public_dir, name), "PNG", optimize=True)
            print(f"Generated: {name} ({size[0]}x{size[1]})")

        # Save favicon.ico
        ico_sizes = [(16, 16), (32, 32), (48, 48)]
        ico_imgs = [square_icon.resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
        ico_imgs[0].save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=ico_sizes, append_images=ico_imgs[1:])
        print("Generated: favicon.ico")

    # 4. Generate og_preview.png (1200x630) social sharing banner
    print("Generating social preview image (og_preview.png)...")
    og_w, og_h = 1200, 630
    og_img = Image.new("RGBA", (og_w, og_h), (9, 9, 11, 255)) # #09090B primary bg
    draw = ImageDraw.Draw(og_img)

    # Draw a stylish accent blue line/glow
    draw.line([(0, 0), (og_w, 0)], fill=(37, 99, 235, 255), width=6) # Top blue border

    # Subtle network grid styling
    for i in range(1, 10):
        x = (og_w // 10) * i
        draw.line([(x, 0), (x, og_h)], fill=(39, 39, 42, 40), width=1)
    for i in range(1, 6):
        y = (og_h // 6) * i
        draw.line([(0, y), (og_w, y)], fill=(39, 39, 42, 40), width=1)

    # Paste logo mark in center top
    logo_icon_path = os.path.join(public_dir, "logo.png")
    if os.path.exists(logo_icon_path):
        icon_img = Image.open(logo_icon_path)
        icon_sq = make_square(icon_img).resize((180, 180), Image.Resampling.LANCZOS)
        og_img.paste(icon_sq, ((og_w - 180) // 2, 100), icon_sq if icon_sq.mode == "RGBA" else None)

    # Try loading a system font, fallback to default
    font_title = None
    font_sub = None
    fonts_to_try = [
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/TTF/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    ]
    for f in fonts_to_try:
        try:
            font_title = ImageFont.truetype(f, 48)
            font_sub = ImageFont.truetype(f.replace("-Bold", ""), 22)
            break
        except Exception:
            continue

    if not font_title:
        print("Using default font for social preview text")
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Draw Title
    title_text = "jooexploit"
    try:
        bbox = draw.textbbox((0, 0), title_text, font=font_title)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
    except Exception:
        tw, th = 200, 48
    draw.text(((og_w - tw) // 2, 320), title_text, fill=(250, 250, 250, 255), font=font_title)

    # Draw Subtitle
    sub_text = "Computer Science  •  DevOps  •  Cloud  •  Linux  •  Automation  •  Education"
    try:
        bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
        sw = bbox[2] - bbox[0]
        sh = bbox[3] - bbox[1]
    except Exception:
        sw, sh = 500, 22
    draw.text(((og_w - sw) // 2, 390), sub_text, fill=(161, 161, 170, 255), font=font_sub)

    # Draw blue accent indicator
    draw.rectangle(((og_w - 60) // 2, 450, (og_w + 60) // 2, 453), fill=(37, 99, 235, 255))

    # Save social preview image
    og_img.convert("RGB").save(os.path.join(public_dir, "og_preview.png"), "PNG")
    print("Generated: og_preview.png")

    # 5. Clean up unused heavy files to save space
    unused_files = [
        "img.png",
        "ChatGPT Image Jul 8, 2026, 02_42_32 PM.png"
    ]
    for u in unused_files:
        u_path = os.path.join(public_dir, u)
        if os.path.exists(u_path):
            os.remove(u_path)
            print(f"Removed unused asset: {u}")

    print("All image optimizations complete successfully!")

if __name__ == "__main__":
    optimize_images()
