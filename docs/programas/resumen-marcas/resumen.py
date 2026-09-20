# -*- coding: utf-8 -*-
"""Maqueta del resumen para marcas. 5 paginas, 1080x1920 vertical.
Reusa el sistema visual de la propuesta de sponsoreo."""
import base64, os, re
import contenido as C

ASSETS = "../carpeta-programacion/assets"
CSS_BASE = "../propuesta-sponsors/estilos.css"
LOGO = None

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    def rep(m):
        return "url(%s)" % b64(os.path.join(ASSETS, "fonts", os.path.basename(m.group(1))), "font/woff2")
    return re.sub(r"url\(([^)]+\.woff2)\)", rep, css)

EXTRA = """
.rubros{ display:flex; flex-wrap:wrap; gap:13px; }
.rubro{ font-family:'Barlow Condensed',sans-serif; font-size:28px; font-weight:600;
  letter-spacing:.07em; text-transform:uppercase; color:#C3CBD6;
  border:1px solid var(--line); border-radius:999px; padding:11px 24px 9px; }
.cond{ display:flex; flex-wrap:wrap; gap:14px; }
.cond > div{ flex:1 1 44%; border:1px solid var(--line); border-radius:16px;
  padding:20px 24px; background:rgba(255,255,255,.03); }
.cond b{ font-family:'Sora',sans-serif; font-size:31px; font-weight:700; display:block;
  letter-spacing:-.02em; }
.cond span{ font-size:26px; line-height:1.38; color:#97A1B0; display:block; margin-top:7px; }
.ej{ display:flex; flex-direction:column; gap:15px; }
.ejr{ border-left:5px solid var(--a); padding-left:24px; }
.ejt{ font-family:'Barlow Condensed',sans-serif; font-size:29px; font-weight:700;
  letter-spacing:.14em; text-transform:uppercase; color:var(--a); }
.ejd{ font-size:29px; line-height:1.4; color:#D5DCE5; margin-top:6px; }
.serv{ display:flex; flex-direction:column; gap:20px; }
.scard{ border:1px solid var(--line); border-radius:20px; padding:26px 28px;
  background:rgba(255,255,255,.03); border-left:5px solid var(--a); }
.sn{ font-family:'Barlow Condensed',sans-serif; font-size:27px; font-weight:700;
  letter-spacing:.18em; color:var(--a); }
.st{ font-family:'Sora',sans-serif; font-size:37px; font-weight:700; letter-spacing:-.024em;
  margin-top:6px; }
.sd{ font-size:29px; line-height:1.42; color:#AEB8C6; margin-top:11px; }
.chk{ list-style:none; }
.chk li{ position:relative; padding-left:42px; font-size:30px; line-height:1.38;
  color:#D5DCE5; padding-bottom:17px; }
.chk li::before{ content:''; position:absolute; left:4px; top:12px; width:15px; height:15px;
  border-radius:50%; background:var(--blue2); }
.eq{ display:flex; flex-direction:column; }
.p5 .prow{ padding:24px 0; }
.p5 .cbox{ padding:28px 30px; }
.p5 .cn{ font-size:40px; }
.eqr{ display:flex; justify-content:space-between; align-items:baseline; gap:22px;
  padding:15px 0; border-top:1px solid rgba(255,255,255,.08); }
.eq .eqr:first-child{ border-top:0; }
.eqn{ font-family:'Sora',sans-serif; font-size:34px; font-weight:700; letter-spacing:-.024em; }
.eqc{ font-family:'Barlow Condensed',sans-serif; font-size:27px; font-weight:600;
  letter-spacing:.13em; text-transform:uppercase; color:var(--mut); text-align:right;
  flex:0 0 auto; }
"""

def render():
    total = 5
    pages = []

    def bar(n):
        return ('<div class="bar"><img src="%s"><span class="pg">%02d / %d</span></div>'
                % (LOGO, n, total))

    def foot(t):
        return ('  <div class="body-pad" style="padding-bottom:40px">\n'
                '    <div class="footrule"></div>\n'
                '    <div class="foot"><span>%s</span><span class="r">%s</span></div>\n  </div>\n'
                % (t, C.TEMPORADA))

    def glow(a, b="rgba(4,6,10,0)"):
        return ('<div class="glow" style="background:'
                'radial-gradient(80%% 30%% at 12%% 5%%, %s 0%%, rgba(4,6,10,0) 62%%),'
                'radial-gradient(74%% 28%% at 90%% 95%%, %s 0%%, rgba(4,6,10,0) 62%%);"></div>'
                % (a, b))

    def page(inner, bg="", cls=""):
        pages.append('<div class="page%s">%s<div class="stack">%s</div></div>\n' % (cls, bg, inner))

    def cab(n, eyebrow, titulo):
        return ('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
                '  <div class="body-pad" style="padding-top:34px">\n'
                '    <div class="eyebrow">%s</div>\n'
                '    <h2 class="h2" style="margin-top:18px">%s</h2>\n  </div>\n'
                % (bar(n), eyebrow, titulo.replace("\n", "<br>")))

    AZUL, ROJO = "rgba(27,111,232,.26)", "rgba(222,28,43,.20)"

    # 01 — portada
    P = C.PORTADA
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <img class="cover-logo" src="%s">\n'
         '    <div class="eyebrow" style="margin-top:54px">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:106px; margin-top:22px">%s</h1>\n'
         '    <p class="parr" style="margin-top:26px">%s</p>\n'
         '    <div class="kicker">%s</div>\n  </div>\n'
         '  <div class="spacer"></div>\n'
         % (bar(1), b64(ASSETS + "/nexo-principal.jpg", "image/jpeg"), P["eyebrow"],
            P["titulo"].replace("\n", "<br>"), P["bajada"], P["pie"])
         + foot("Resumen para marcas"),
         glow("rgba(27,111,232,.30)", "rgba(222,28,43,.24)"), cls=" negro")

    # 02 — a quien le hablamos
    R = C.RECONOCES
    chips = "".join('<span class="rubro">%s</span>' % r for r in C.RUBROS)
    items = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                    % (t, d) for t, d in R["items"])
    page(cab(2, R["eyebrow"], R["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="rubros">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (R["intro"], chips, items)
         + foot("A quién le hablamos"), glow(AZUL, ROJO))

    # 03 — el nicho dorado
    N = C.NICHO
    cond = "".join('<div><b>%s</b><span>%s</span></div>' % (t, d) for t, d in N["condiciones"])
    ejs = "".join('<div class="ejr" style="--a:%s"><div class="ejt">%s</div>'
                  '<div class="ejd">%s</div></div>' % (col, t, d) for t, col, d in N["ejemplos"])
    page(cab(3, N["eyebrow"], N["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px; font-size:34px">'
           '%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="cond">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="lab">%s</div>'
           '<div class="ej" style="margin-top:20px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:30px">'
           '<div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (N["intro"], cond, N["ejemplos_titulo"], ejs, N["cierre"])
         + foot("Tu nicho dorado"), glow("rgba(199,164,94,.24)", AZUL))

    # 04 — que hacemos
    S = C.SERVICIOS
    cards = "".join('<div class="scard" style="--a:%s"><div class="sn">%s</div>'
                    '<div class="st">%s</div><div class="sd">%s</div></div>'
                    % (col, n, t, d) for n, t, col, d in S["items"])
    chk = "".join("<li>%s</li>" % x for x in S["llevas"])
    page(cab(4, S["eyebrow"], S["titulo"])
         + '  <div class="body-pad" style="padding-top:28px"><div class="serv">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="lab">%s</div>'
           '<ul class="chk" style="margin-top:20px">%s</ul></div>\n'
           '  <div class="spacer"></div>\n' % (cards, S["llevas_titulo"], chk)
         + foot("Qué hacemos"), glow(AZUL, "rgba(199,164,94,.18)"))

    # 05 — pasos y equipo
    T = C.PASOS
    ps = "".join('<div class="prow"><div class="pn">%s</div><div>'
                 '<div class="ft">%s</div><div class="fd">%s</div></div></div>'
                 % (n, t, d) for n, t, d in T["items"])
    eq = "".join('<div class="eqr"><div class="eqn">%s</div><div class="eqc">%s</div></div>'
                 % (n, r) for n, r in C.EQUIPO)
    K = C.CONTACTO
    page(cab(5, T["eyebrow"], T["titulo"])
         + '  <div class="body-pad" style="padding-top:22px; --a:#4DA3FF">'
           '<div class="plist">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="lab">%s</div>'
           '<p class="fd" style="margin-top:10px">%s</p>'
           '<div class="eq" style="margin-top:14px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px">'
           '<div class="cbox"><div class="cn">%s</div><div class="cr">%s</div>'
           '<div class="ce">%s</div></div></div>\n'
           '  <div class="spacer"></div>\n'
           % (ps, C.EQUIPO_TITULO, C.EQUIPO_BAJADA, eq,
              K["titulo"], K["bajada"], K["firma"])
         + foot("El equipo"), glow(ROJO, AZUL), cls=" p5")

    css = open(CSS_BASE).read().replace("/*FONTS*/", fonts_css()) + EXTRA
    return ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>Resumen para marcas — Nexo Studios</title>"
            "<style>%s</style></head><body>\n%s</body></html>" % (css, "".join(pages)))

def main():
    global LOGO
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    open(".resumen.inlined.html", "w").write(render())
    print("resumen para marcas · %d paginas"
          % open(".resumen.inlined.html").read().count('class="page'))

if __name__ == "__main__":
    main()
