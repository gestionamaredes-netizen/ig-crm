# -*- coding: utf-8 -*-
import base64, re, io
from PIL import Image

HTML = "/home/user/ig-crm/web-fabbenok/index.html"
LOGO = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/imgs/blur-logo.png"

# logo a tamaño razonable para el thumb (ancho ~640)
im = Image.open(LOGO).convert("RGBA")
if im.width > 720:
    im = im.resize((720, int(im.height*720/im.width)), Image.LANCZOS)
buf = io.BytesIO(); im.save(buf, "PNG")
b64 = base64.b64encode(buf.getvalue()).decode()
datauri = "data:image/png;base64," + b64

article = (
    '      <article class="proj">\n'
    '        <div class="thumb"><img class="plogo" src="' + datauri + '"></div>\n'
    '        <div class="body"><h3 class="pname">Blur</h3><div class="cat">Agencia creativa · dirección<br>Ideas, eventos y música en vivo</div>\n'
    '          <div class="row"><span class="num">11</span><div class="plinks">'
    '<a class="plink" href="https://instagram.com/ama.blur" target="_blank" rel="noopener">IG ↗</a></div></div></div>\n'
    '      </article>\n'
)

html = open(HTML, encoding="utf-8").read()

# localizar el bloque de 21:15 Films y su </article> de cierre
idx = html.find('pname">21:15 Films')
assert idx != -1, "no encontré 21:15 Films"
close = html.find('</article>', idx)
assert close != -1
insert_at = close + len('</article>\n')
# asegurar que insertamos justo después del salto de línea siguiente
# (close apunta al inicio de </article>; avanzamos hasta el fin de esa línea)
eol = html.find('\n', close)
insert_at = eol + 1

new_html = html[:insert_at] + article + html[insert_at:]
assert 'pname">Blur' in new_html
open(HTML, "w", encoding="utf-8").write(new_html)
print("OK — Blur insertado. logo b64 kb:", round(len(b64)/1024,1))
