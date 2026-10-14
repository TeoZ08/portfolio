"""Render the already approved CSS m. mark; optional asset build helper, not runtime."""
from pathlib import Path
import os
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
font_path = os.environ.get('QA_FAVICON_FONT', '/usr/share/fonts/truetype/msttcorefonts/Georgia_Bold_Italic.ttf')
scale = 4
font = ImageFont.truetype(font_path, 24 * scale)
image = Image.new('RGBA', (32 * scale, 32 * scale), '#f0ebdf')
draw = ImageDraw.Draw(image)
draw.text((4 * scale, 25 * scale), 'm', font=font, fill='#303c34', anchor='ls')
draw.text((4 * scale + font.getlength('m') - .12 * 24 * scale, 25 * scale), '.', font=font, fill='#303c34', anchor='ls')
image = image.resize((32, 32), Image.Resampling.LANCZOS)
image.save(root / 'src/app/favicon.ico', sizes=[(16, 16), (32, 32)])
preview = os.environ.get('QA_FAVICON_PREVIEW')
if preview:
    image.save(preview)
print('Approved mark rendered to favicon.ico; font file is referenced, not redistributed.')
