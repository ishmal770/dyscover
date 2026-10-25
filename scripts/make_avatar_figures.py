#!/usr/bin/env python3
"""Builds each explorer's full-body picture (src/assets/avatars-full/<id>.svg): the open-source
"Lorelei" portrait (CC0, DiceBear) as the head, on a watercolor-style body in an explorer
outfit, wearing a backpack. It also gives each portrait a skin tone (the originals have white
faces). Everything is drawn in code - no AI-generated images. Run: python3 scripts/make_avatar_figures.py
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORTRAITS = ROOT / "src" / "assets" / "avatars"
OUT = ROOT / "src" / "assets" / "avatars-full"
OUT.mkdir(exist_ok=True)

# id: (skin, shirt, pants)  - shirt/pants match src/data/avatars.js
AVATARS = {
    "zara": ("#8d5a3b", "#e8a33d", "#5b4636"),
    "kai": ("#e7b98f", "#4a90d9", "#2f3e5c"),
    "maya": ("#c68a5e", "#7ccf4a", "#3f5b3a"),
    "leo": ("#f4d2b0", "#d9d0b8", "#6b5b3e"),
    "amara": ("#6b4430", "#e8574f", "#3a3a4a"),
    "sam": ("#d9a273", "#9b6fd6", "#34405f"),
    "noor": ("#d8a47c", "#2fb3a3", "#46506b"),
}


def darker(hex_color, amount=0.28):
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02x%02x%02x" % tuple(int(c * (1 - amount)) for c in (r, g, b))


def wash(shape, color, extra=""):
    """A watercolor wash: a soft translucent fill with a darker, thinner pooled edge."""
    edge = darker(color)
    return (
        f'<g>{shape.format(fill=color, stroke="none", sw=0, op=0.82, extra=extra)}'
        f'{shape.format(fill="none", stroke=edge, sw=1.4, op=0.35, extra=extra)}</g>'
    )


def rect(x, y, w, h, r):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{{fill}}" stroke="{{stroke}}" stroke-width="{{sw}}" opacity="{{op}}"{{extra}}/>'


def circle(cx, cy, r):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{{fill}}" stroke="{{stroke}}" stroke-width="{{sw}}" opacity="{{op}}"{{extra}}/>'


def ellipse(cx, cy, rx, ry):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{{fill}}" stroke="{{stroke}}" stroke-width="{{sw}}" opacity="{{op}}"{{extra}}/>'


for avatar_id, (skin, shirt, pants) in AVATARS.items():
    # 1. give the portrait a skin tone (its face is the first white fill)
    path = PORTRAITS / f"{avatar_id}.svg"
    svg = path.read_text()
    if 'fill="#ffffff"' in svg and f"<!--skin:{skin}-->" not in svg:
        svg = svg.replace('fill="#ffffff"', f'fill="{skin}"', 1)
        svg = f"<!--skin:{skin}-->" + svg  # marks the portrait as done, so a second run does not recolor again
        path.write_text(svg)
    portrait = base64.b64encode(path.read_bytes()).decode()

    body = "".join(
        [
            ellipse(78, 231, 44, 6).format(fill="#000", stroke="none", sw=0, op=0.12, extra=""),
            # backpack (behind the body)
            wash(rect(14, 86, 56, 84, 20), "#e8943a"),
            wash(rect(24, 132, 36, 28, 9), "#f4b266"),
            '<path d="M24 98 Q42 84 60 98" fill="none" stroke="#b9661a" stroke-width="2" stroke-linecap="round" opacity="0.6"/>',
            # legs, shoes
            wash(rect(60, 156, 20, 64, 10), pants),
            wash(rect(84, 156, 20, 64, 10), pants),
            wash(ellipse(68, 222, 15, 8), "#8a5a3a"),
            wash(ellipse(96, 222, 15, 8), "#8a5a3a"),
            # neck, body
            wash(rect(68, 76, 22, 20, 8), skin),
            wash(rect(48, 88, 62, 76, 22), shirt),
            f'<path d="M48 112 Q79 132 110 112 L110 124 Q79 144 48 124Z" fill="#000" opacity="0.07"/>',
            wash(rect(48, 146, 62, 10, 5), "#8a5a3a"),
            wash(circle(79, 151, 4), "#e8c35a"),
            '<path d="M62 90 L62 150 M96 90 L96 150" stroke="#c9792a" stroke-width="4" stroke-linecap="round" opacity="0.55"/>',
            # arms and hands
            wash(rect(104, 92, 16, 58, 8), shirt),
            wash(circle(112, 154, 9), skin),
            wash(rect(38, 92, 16, 56, 8), shirt),
            wash(circle(46, 152, 9), skin),
        ]
    )

    figure = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 240" width="150" height="240">
  <defs>
    <filter id="wc" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="rough"/>
      <feGaussianBlur in="rough" stdDeviation="0.55"/>
    </filter>
    <clipPath id="head"><circle cx="78" cy="46" r="38"/></clipPath>
  </defs>
  <g filter="url(#wc)">{body}</g>
  <circle cx="78" cy="46" r="41" fill="#fff" opacity="0.95"/>
  <image href="data:image/svg+xml;base64,{portrait}" x="40" y="8" width="76" height="76" clip-path="url(#head)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="78" cy="46" r="38" fill="none" stroke="{darker(skin, 0.1)}" stroke-opacity="0.35" stroke-width="2"/>
</svg>
'''
    (OUT / f"{avatar_id}.svg").write_text(figure)
    print("wrote", OUT / f"{avatar_id}.svg")
