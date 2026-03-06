from PIL import Image, ImageDraw
import urllib.request
import io
import os

# Ensure output directory exists
os.makedirs("/vercel/share/v0-project/public/images", exist_ok=True)

# Download the source Facebook icon (the user's provided image)
url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/facebook-square-social-logo-2-HVNpFIPlp81kGysYfyPTjGGuz8Arf4.png"
with urllib.request.urlopen(url) as response:
    img_data = response.read()

# Open the image
img = Image.open(io.BytesIO(img_data)).convert("RGBA")
width, height = img.size

# Create a rounded corner mask
radius = int(min(width, height) * 0.12)  # Slight rounding ~12% of size
mask = Image.new("L", (width, height), 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle([(0, 0), (width, height)], radius=radius, fill=255)

# Apply the mask to create rounded corners
output = Image.new("RGBA", (width, height), (0, 0, 0, 0))
output.paste(img, (0, 0), mask)

# Save the processed icon
output_path = "/vercel/share/v0-project/public/images/icon_facebook.png"
output.save(output_path, "PNG")

print(f"Facebook icon with rounded corners saved to {output_path}")
print(f"Final size: {output.size}")
