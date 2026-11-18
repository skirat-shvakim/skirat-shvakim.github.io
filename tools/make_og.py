#!/usr/bin/env python3
"""Render the daily WhatsApp share card (og.png, 1200x630).
Usage: python3 tools/make_og.py "<the hook line of the day>" [output path]
The card shows only the brand and one punchy hook line."""
import sys, html, pathlib
from playwright.sync_api import sync_playwright

hook = html.escape(sys.argv[1].strip())
out = sys.argv[2] if len(sys.argv) > 2 else str(pathlib.Path(__file__).resolve().parent.parent / "og.png")
size = 92 if len(sys.argv[1]) <= 28 else 80 if len(sys.argv[1]) <= 42 else 68

page = f"""<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
*{{margin:0;box-sizing:border-box}}
body{{width:1200px;height:630px;background:radial-gradient(circle at 18% 20%,#22346a 0,#131d3b 45%,#0d1530 100%);font-family:"Heebo","Noto Sans Hebrew","DejaVu Sans",sans-serif;position:relative;overflow:hidden;color:#fff}}
.line{{position:absolute;right:120px;top:0;bottom:0;width:22px;background:linear-gradient(#4d86ff 0 34%,#f5b400 34% 56%,#ff6a55 56% 76%,#2fd08a 76% 100%)}}
.st{{position:absolute;right:107px;width:48px;height:48px;border-radius:50%;background:#0d1530;border:12px solid}}
.brand{{position:absolute;right:210px;top:70px;font-size:46px;font-weight:900;letter-spacing:-.5px}}
.brand span{{color:#ffc93d}}
.hook{{position:absolute;right:210px;left:250px;top:190px;bottom:70px;display:flex;align-items:center;font-size:{size}px;font-weight:900;line-height:1.12;text-wrap:balance}}
.moon{{position:absolute;left:80px;top:90px;width:150px;height:150px;border-radius:50%;box-shadow:-30px 20px 0 0 #ffd76a;transform:rotate(-15deg)}}
.star{{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff;opacity:.8}}
</style></head><body>
<div class="moon"></div>
<i class="star" style="left:70px;top:380px"></i><i class="star" style="left:200px;top:320px;width:4px;height:4px"></i><i class="star" style="left:300px;top:70px"></i><i class="star" style="left:140px;top:520px;width:4px;height:4px"></i><i class="star" style="left:60px;top:60px;width:4px;height:4px"></i>
<div class="line"></div>
<div class="st" style="top:90px;border-color:#4d86ff"></div>
<div class="st" style="top:300px;border-color:#f5b400"></div>
<div class="st" style="top:470px;border-color:#ff6a55"></div>
<div class="brand">בורסה <span>בפיג'מה</span></div>
<div class="hook">{hook}</div>
</body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.set_content(page)
    pg.screenshot(path=out)
    b.close()
print("wrote", out)
