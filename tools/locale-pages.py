#!/usr/bin/env python3
"""Make ta.html / en.html / id.html from index.html: same page, own link-preview tags.

WhatsApp, Facebook, Telegram etc. read <title> and og:* straight from the HTML and never run JavaScript, so the
language switch can't change the preview. GitHub Pages serves ta.html at /ta, so a guest link like
  https://fer.weds.j6.studio/ta?to=...
gets a Tamil preview and opens in Tamil. The copies sit next to index.html, so every relative path still works.

Run after ANY change to index.html, before committing:   python3 tools/locale-pages.py
"""
import html, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://fer.weds.j6.studio'

PAGES = {
    'id': dict(
        title='The Wedding of Jawahar & Ferina',
        desc='Jawahar Mariselvam & Ferina Khansa Nabilah — Akad Nikah Rabu, 11 November 2026, 11.00 WIB, KUA Kemayoran. Resepsi 12.00–15.00 WIB, Ayda Hotel, Mangga Dua, Jakarta.',
        og_desc='Akad Nikah · 11 November 2026 · KUA Kemayoran — Resepsi · Ayda Hotel, Mangga Dua, Jakarta',
        image='assets/og-image.jpg', alt='The Wedding of Jawahar & Ferina — 11 · 11 · 2026'),
    'en': dict(
        title='The Wedding of Jawahar & Ferina',
        desc='Jawahar Mariselvam & Ferina Khansa Nabilah — Akad Nikah Wednesday, 11 November 2026, 11:00 WIB, KUA Kemayoran. Reception 12:00–15:00 WIB, Ayda Hotel, Mangga Dua, Jakarta.',
        og_desc='Akad Nikah · 11 November 2026 · KUA Kemayoran — Reception · Ayda Hotel, Mangga Dua, Jakarta',
        image='assets/og-image.jpg', alt='The Wedding of Jawahar & Ferina — 11 · 11 · 2026'),
    'ta': dict(
        title='ஜவஹர் & ஃபெரினா திருமணம்',
        desc='ஜவஹர் மாரிசெல்வம் & ஃபெரினா கன்ஸா நபிலா — நிக்காஹ் புதன், 11 நவம்பர் 2026, காலை 11:00 (WIB), KUA கெமயோரான். வரவேற்பு மதியம் 12:00 – 3:00 (WIB), அய்டா ஹோட்டல், மங்கா துவா, ஜகார்த்தா.',
        og_desc='நிக்காஹ் · 11 நவம்பர் 2026 · KUA கெமயோரான் — வரவேற்பு · அய்டா ஹோட்டல், மங்கா துவா, ஜகார்த்தா',
        image='assets/og-image.jpg', alt='ஜவஹர் & ஃபெரினா திருமணம் — 11 · 11 · 2026'),
}

def sub(src, pattern, value, what):
    out, n = re.subn(pattern, lambda m: m.group(1) + value + m.group(2), src, count=1)
    if n != 1: raise SystemExit(f'locale-pages: could not find {what} in index.html')
    return out

src = (ROOT / 'index.html').read_text(encoding='utf-8')
for lang, p in PAGES.items():
    e = lambda s: html.escape(s, quote=True)
    out = src
    out = sub(out, r'(<html lang=")[^"]*(")', f'{lang}" data-locale="{lang}', 'html lang')
    out = sub(out, r'(<title>)[^<]*(</title>)', e(p['title']), 'title')
    out = sub(out, r'(<meta name="description" content=")[^"]*(")', e(p['desc']), 'description')
    out = sub(out, r'(<meta property="og:title" content=")[^"]*(")', e(p['title']), 'og:title')
    out = sub(out, r'(<meta property="og:description" content=")[^"]*(")', e(p['og_desc']), 'og:description')
    out = sub(out, r'(<meta property="og:image" content=")[^"]*(")', f"{SITE}/{p['image']}", 'og:image')
    out = sub(out, r'(<meta name="twitter:image" content=")[^"]*(")', f"{SITE}/{p['image']}", 'twitter:image')
    out = sub(out, r'(<meta property="og:image:alt" content=")[^"]*(")', e(p['alt']), 'og:image:alt')
    out = out.replace('<meta property="og:type" content="website">',
                      f'<meta property="og:type" content="website">\n<meta property="og:url" content="{SITE}/{lang}">\n'
                      f'<meta property="og:locale" content="{ {"id": "id_ID", "en": "en_US", "ta": "ta_IN"}[lang] }">', 1)
    out = out.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- GENERATED from index.html by tools/locale-pages.py. Do not edit; edit index.html and re-run. -->', 1)
    (ROOT / f'{lang}.html').write_text(out, encoding='utf-8')
    print(f'{lang}.html  ← {p["title"]}')
