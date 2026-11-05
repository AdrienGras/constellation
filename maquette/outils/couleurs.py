"""Outils couleur : contraste WCAG, OKLCH, simulation de daltonisme."""
import math

def hex2rgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))

def rgb2hex(c):
    return '#' + ''.join(f'{max(0, min(255, round(v * 255))):02x}' for v in c)

def lin(v): return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
def delin(v): return 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055

def lum(h):
    r, g, b = (lin(v) for v in hex2rgb(h)); return 0.2126 * r + 0.7152 * g + 0.0722 * b

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)

def hex2oklch(h):
    r, g, b = (lin(v) for v in hex2rgb(h))
    l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
    m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
    s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
    l, m, s = (x ** (1/3) for x in (l, m, s))
    L = 0.2104542553*l + 0.7936177850*m - 0.0040720468*s
    A = 1.9779984951*l - 2.4285922050*m + 0.4505937099*s
    B = 0.0259040371*l + 0.7827717662*m - 0.8086757660*s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360

def oklch2hex(L, C, H):
    A, B = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + 0.3963377774*A + 0.2158037573*B) ** 3
    m = (L - 0.1055613458*A - 0.0638541728*B) ** 3
    s = (L - 0.0894841775*A - 1.2914855480*B) ** 3
    r = 4.0767416621*l - 3.3077115913*m + 0.2309699292*s
    g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
    b = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    return rgb2hex(tuple(delin(max(0, min(1, v))) for v in (r, g, b)))

# Machado et al. 2009, sévérité 1.0
MATRICES = {
    'deuteranopie': ((0.367322, 0.860646, -0.227968), (0.280085, 0.672501, 0.047413), (-0.011820, 0.042940, 0.968881)),
    'protanopie': ((0.152286, 1.052583, -0.204868), (0.114503, 0.786281, 0.099216), (-0.003882, -0.048116, 1.051998)),
}

def simuler(h, type_):
    c = [lin(v) for v in hex2rgb(h)]
    out = [sum(M * x for M, x in zip(row, c)) for row in MATRICES[type_]]
    return rgb2hex(tuple(delin(max(0, min(1, v))) for v in out))

def distance_ok(a, b):
    L1, C1, H1 = hex2oklch(a); L2, C2, H2 = hex2oklch(b)
    a1, b1 = C1*math.cos(math.radians(H1)), C1*math.sin(math.radians(H1))
    a2, b2 = C2*math.cos(math.radians(H2)), C2*math.sin(math.radians(H2))
    return math.dist((L1, a1, b1), (L2, a2, b2))
