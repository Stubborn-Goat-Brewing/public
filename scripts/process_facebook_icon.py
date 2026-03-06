from PIL import Image
import urllib.request
import io

# Download the source Facebook icon
url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/facebook-square-social-logo-COWVHG4oTI5CixvWDJoum83s1cBJ7z.png"
with urllib.request.urlopen(url) as response:
    img_data = response.read()

# Open the image
img = Image.open(io.BytesIO(img_data)).convert("RGBA")

# Get the pixel data
pixels = img.load()
width, height = img.size

# Target colors to match other icons (dark charcoal bg, light gray icon)
# Based on the other icons: background ~#4a4a4a (74,74,74), icon ~#a0a0a0 (160,160,160)
bg_color = (74, 74, 74, 255)  # Dark charcoal
icon_color = (160, 160, 160, 255)  # Light gray

# Process each pixel
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # If pixel is dark (black background), make it charcoal
        if r < 50 and g < 50 and b < 50:
            pixels[x, y] = bg_color
        # If pixel is light (white "f"), make it light gray
        elif r > 200 and g > 200 and b > 200:
            pixels[x, y] = icon_color

# Resize to match other icons (48x48 is typical for these social icons)
img_resized = img.resize((48, 48), Image.LANCZOS)

# Save the processed icon
output_path = "/vercel/share/v0-project/public/images/icon_facebook.png"
img_resized.save(output_path, "PNG")

print(f"Facebook icon processed and saved to {output_path}")
print(f"Final size: {img_resized.size}")
