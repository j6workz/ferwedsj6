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
        desc='Jawahar Mariselvam & Ferina Khansa Nabilah — Akad Nikah Rabu, 11 November 2026, 10.00 WIB, KUA Kemayoran. Resepsi 12.00–15.00 WIB, Ayda Hotel, Mangga Dua, Jakarta.',
        og_desc='Akad Nikah · 11 November 2026 · KUA Kemayoran — Resepsi · Ayda Hotel, Mangga Dua, Jakarta',
        image='assets/og-image.jpg', alt='The Wedding of Jawahar & Ferina — 11 · 11 · 2026'),
    'en': dict(
        title='The Wedding of Jawahar & Ferina',
        desc='Jawahar Mariselvam & Ferina Khansa Nabilah — Akad Nikah Wednesday, 11 November 2026, 10:00 WIB, KUA Kemayoran. Reception 12:00–15:00 WIB, Ayda Hotel, Mangga Dua, Jakarta.',
        og_desc='Akad Nikah · 11 November 2026 · KUA Kemayoran — Reception · Ayda Hotel, Mangga Dua, Jakarta',
        image='assets/og-image.jpg', alt='The Wedding of Jawahar & Ferina — 11 · 11 · 2026'),
    'ta': dict(
        title='ஜவஹர் & ஃபெரினா திருமணம்',
        desc='ஜவஹர் மாரிசெல்வம் & ஃபெரினா கன்ஸா நபிலா — நிக்காஹ் புதன், 11 நவம்பர் 2026, காலை 10:00 (WIB), KUA கெமயோரான். வரவேற்பு மதியம் 12:00 – 3:00 (WIB), அய்டா ஹோட்டல், மங்கா துவா, ஜகார்த்தா.',
        og_desc='நிக்காஹ் · 11 நவம்பர் 2026 · KUA கெமயோரான் — வரவேற்பு · அய்டா ஹோட்டல், மங்கா துவா, ஜகார்த்தா',
        image='assets/og-image-ta.jpg', alt='ஜவஹர் & ஃபெரினா திருமணம் — 11 · 11 · 2026'),
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

# ---------------------------------------------------------------------------------------------------------------
# in.html (served at /in): for guests in India who can't come to Jakarta. Same page, but the gift section shows
# only Jawahar's UPI card (Ferina's Mandiri + Touch 'n Go cards are removed) plus small GPay / PhonePe / Paytm
# buttons, the same on iPhone and Android. Deliberately low-key: no instructions or "pay" wording, so it still
# reads as a gift, not a payment request.
#   iPhone  → each app's own link scheme (gpay:// phonepe:// paytmmp://)
#   Android → intent:// links aimed at each app's package (falls back to the Play Store if not installed)
#   desktop → no buttons (the QR on the card is the way)
# No amount is filled in: the guest chooses it. Language follows ?lang= / the guest's choice / the phone language,
# so send /in?lang=ta for a Tamil link. Not linked from the main pages.
# ---------------------------------------------------------------------------------------------------------------
from urllib.parse import quote
VPA, PAYEE, NOTE = '9500442100@ptyes', 'Subbulakshmi Mariselvam', 'Wedding gift'   # Jawahar's mother (Paytm UPI)
q = f'pa={VPA}&pn={quote(PAYEE)}&cu=INR&tn={quote(NOTE)}'
APPS = [  # label, icon (assets/, from Simple Icons, CC0, brand colour), iOS link, Android package (intent:// link)
    ('GPay',    'icon-gpay.svg',    f'gpay://upi/pay?{q}', 'com.google.android.apps.nbu.paisa.user'),
    ('PhonePe', 'icon-phonepe.svg', f'phonepe://pay?{q}',  'com.phonepe.app'),
    ('Paytm',   'icon-paytm.svg',   f'paytmmp://pay?{q}',  'net.one97.paytm'),
]
android_link = lambda pkg: f'intent://pay?{q}#Intent;scheme=upi;package={pkg};end'


def cut(src, start, end, what):
    a = src.find(start)
    b = src.find(end, a + 1) if a >= 0 else -1
    if a < 0 or b < 0: raise SystemExit(f'locale-pages (in): could not find {what} in index.html')
    return src[:a] + src[b:]

def insert_after(src, marker, text, what, last=False):
    i = src.rfind(marker) if last else src.find(marker)
    if i < 0 or (not last and src.count(marker) != 1): raise SystemExit(f'locale-pages (in): could not find {what}')
    return src[:i + len(marker)] + text + src[i + len(marker):]

e = lambda s: html.escape(s, quote=True)
out = src
out = sub(out, r'(<html lang=")[^"]*(")', 'en', 'html lang')   # no data-locale: the guest's language wins
out = sub(out, r'(<title>)[^<]*(</title>)', 'The Wedding of Jawahar &amp; Ferina', 'title')
desc = 'Jawahar Mariselvam & Ferina Khansa Nabilah — Nikah on Wednesday, 11 November 2026 in Jakarta. Send your blessings from India.'
out = sub(out, r'(<meta name="description" content=")[^"]*(")', e(desc), 'description')
out = sub(out, r'(<meta property="og:title" content=")[^"]*(")', 'The Wedding of Jawahar &amp; Ferina', 'og:title')
out = sub(out, r'(<meta property="og:description" content=")[^"]*(")', e('11 November 2026 · Jakarta — send your blessings from India'), 'og:description')
out = sub(out, r'(<meta property="og:image" content=")[^"]*(")', f'{SITE}/assets/og-image.jpg', 'og:image')
out = sub(out, r'(<meta name="twitter:image" content=")[^"]*(")', f'{SITE}/assets/og-image.jpg', 'twitter:image')
out = out.replace('<meta property="og:type" content="website">',
                  f'<meta property="og:type" content="website">\n<meta property="og:url" content="{SITE}/in">\n<meta property="og:locale" content="en_IN">', 1)
out = out.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- GENERATED from index.html by tools/locale-pages.py (India page: UPI only). Do not edit; edit index.html and re-run. -->', 1)

# sound: only birdsong, in every language: a calm 3-minute loop of a Nilgiris dawn chorus (DivyaCM, CC BY 4.0,
# Wikimedia Commons), quiet and softened. app.js uses <audio data-song> instead of its per-language list,
# data-manual keeps it silent until the guest taps the sound button, and data-zone plays it only at the lake. The licence asks for a credit: footer line below.
out = out.replace('<audio id="song" loop preload="none" playsinline></audio>',
                  '<audio id="song" loop preload="none" playsinline data-manual data-zone=".opening" data-song="assets/birds-nilgiris.m4a?v=2"></audio>', 1)
if 'data-song=' not in out: raise SystemExit('locale-pages (in): could not find the <audio id="song"> tag')
credit = ('\n    <div class="music-credit">Birdsong: <a href="https://commons.wikimedia.org/wiki/File:Dawn_chorus_at_Glencairnie_big_bungalow_Craigmore_DM.ogg" '
          'target="_blank" rel="noopener">dawn chorus, Craigmore, Nilgiris</a>, DivyaCM · '
          '<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></div>')
out = insert_after(out, 'KuaCham · Jessy · Creamy · Yuzu</div>', credit, 'closing cats line')

# gift: the UPI card on /in is Jawahar's mother's account (Subbulakshmi Mariselvam, Paytm UPI), not his own
for old, new in [('UPI · Google Pay', 'UPI · Paytm'),
                 ('jawaharmarisubbu@okhdfcbank', VPA),
                 ('JAWAHAR MARISELVAM', PAYEE.upper()),
                 ('alt="UPI QR — Google Pay, Jawahar Mariselvam"', f'alt="UPI QR — {PAYEE}"'),
                 ('src="assets/qr-upi.png"', 'src="assets/qr-upi-subbulakshmi.png"'),
                 ('href="assets/qr-upi-jawahar.jpg" download="Jawahar-GooglePay-UPI-QR.jpg"',
                  'href="assets/qr-upi-subbulakshmi.jpg" download="Subbulakshmi-Mariselvam-UPI-QR.jpg"')]:
    if old not in out: raise SystemExit(f'locale-pages (in): could not find {old!r}')
    out = out.replace(old, new)

# gift: drop the first two slides (Ferina's Mandiri + Touch 'n Go) and the carousel dots
out = cut(out, '        <div class="gift-slide">\n          <div class="bank-card">', '        <div class="gift-slide">\n          <div class="flip">\n            <div class="flip-in">\n              <div class="bank-card upi face">', "Ferina's gift slides")
out = cut(out, '      <div class="gift-dots"', '    </div>\n  </div>\n</section>', 'gift dots')
if 'jawaharmarisubbu' in out or 'qr-upi-jawahar' in out or 'qr-upi.png' in out:
    raise SystemExit("locale-pages (in): Jawahar's own UPI details still on the page")
if 'FERINA KHANSA NABILA' in out.split('id="gift"')[1].split('</section>')[0] or 'qr-tng' in out:
    raise SystemExit("locale-pages (in): Ferina's account details still in the gift section")

buttons = '\n'.join(f'            <a class="pill alt" href="{e(ios)}" data-android="{e(android_link(pkg))}"><img src="assets/{icon}" alt="" width="18" height="18">{label}</a>'
                    for label, icon, ios, pkg in APPS)
pay = f'''
          <div class="upi-pay" id="upiPay" hidden>
{buttons}
          </div>'''
out = insert_after(out, '<span data-i18n="gift.showQR">QR</span></button>\n          </div>', pay, 'UPI button row', last=True)

css = '''
/* /in only: one gift card (UPI), centred; small GPay / PhonePe / Paytm buttons under it */
#gift .gift-track{justify-content:center}
.upi-pay{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:10px}
.upi-pay .pill{padding:6px 12px;gap:6px;font-size:14px}
.upi-pay .pill img{width:18px;height:18px;display:block}
.upi-pay[hidden]{display:none}
.music-credit{margin-top:14px;font-family:'Montserrat',sans-serif;font-size:9.5px;letter-spacing:.06em;color:var(--ink-soft);opacity:.75}
.music-credit a{color:inherit;text-decoration:underline;text-underline-offset:2px}
</style>'''
i = out.find('</style>')
if i < 0: raise SystemExit('locale-pages (in): no </style>')
out = out[:i] + css.lstrip('\n') + out[i + len('</style>'):]

js = '''
<script>
// /in only: GPay / PhonePe / Paytm buttons on phones (desktop keeps the QR). The HTML carries the iPhone links;
// on Android each button switches to an intent:// link aimed at that app (Play Store if it isn't installed).
(function(){
  var box = document.getElementById('upiPay'); if (!box) return;
  var ua = navigator.userAgent;
  var android = /Android/i.test(ua);
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!android && !ios) return;
  if (android) box.querySelectorAll('a[data-android]').forEach(function(a){ a.href = a.getAttribute('data-android'); });
  box.hidden = false;
})();
</script>
</body>'''
i = out.rfind('</body>')
if i < 0: raise SystemExit('locale-pages (in): no </body>')
out = out[:i] + js.lstrip('\n') + out[i + len('</body>'):]
(ROOT / 'in.html').write_text(out, encoding='utf-8')
print('in.html  ← India page: UPI only, GPay / PhonePe / Paytm buttons')
