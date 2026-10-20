#!/usr/bin/env python3
"""Rebuild public/media/showcase-film.mp4 (20 s, 960x540 @12 fps, H.264 + AAC).

Design rules (client feedback, round 3):
  * NO grid overlay on the stage — plain navy gradient + two smooth glows.
  * NOTHING overlaps: every scene is a strict vertical stack
    (eyebrow chip -> headline -> one large glass panel -> caption chip)
    inside a 476 px content zone, with a full-height photo column on the
    right that feather-blends into the stage.
  * Elements are LARGE: the panel spans the whole content zone and the photo
    spans the full frame height (slow push-in) — never a small floating card.
  * The logo is the client's real artwork (public/art/logo-source.jpg),
    alpha-lifted off its navy plate — never redrawn.
  * Translucent glass is drawn on a separate RGBA overlay and composited, so
    alpha survives the final RGB conversion.

Scene plan follows the voice-over (public/media/showcase-voiceover.mp3, 19.88 s):
  0.0-5.5   logo lockup + positioning lines           (no photo)
  5.5-9.5   survey engine   — wallet panel            photo: story-4.webp
  9.5-14.0  press desk      — pipeline panel          photo: story-6.webp
  14.0-17.0 team kits       — kit builder panel       photo: kit-jerseys.jpg
  17.0-20.0 outro lockup + tagline                    (no photo)

Run:  python3 scripts/build-showcase-film.py   (needs pillow/numpy/imageio-ffmpeg)
"""

import math
import os
import subprocess
import sys

sys.path.insert(0, "/tmp/pylibs")

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "public", "media")
FRAMES = os.path.join("/tmp", "filmframes")
W, H, FPS = 960, 540, 12
TOTAL = 240  # 20.0 s
FADE = 12  # 1 s cross-fade

NAVY_DEEP = (7, 30, 67)
NAVY = (10, 46, 104)
GOLD = (197, 168, 105)
CREAM = (245, 242, 235)
WHITE = (255, 255, 255)

BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BOLD if bold else REG, size)


def overlay() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


# --------------------------------------------------------------------------
# stage + primitives
# --------------------------------------------------------------------------
def stage() -> Image.Image:
    """Vertical navy gradient + two smooth gaussian glows. No grid, ever."""
    arr = np.zeros((H, W, 3), dtype=np.float64)
    top = np.array(NAVY_DEEP, dtype=np.float64)
    mid = np.array(NAVY, dtype=np.float64)
    ys = np.linspace(0, 1, H)[:, None]
    arr[:, :, :] = (top * (1 - ys) + mid * ys)[:, None, :]

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)

    def glow(cx: int, cy: int, sigma: float, color, strength: float) -> None:
        fall = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * sigma * sigma)))
        arr[:, :, :] += np.dstack([fall * c * strength for c in color])

    glow(140, 70, 190, GOLD, 0.10)
    glow(860, 480, 220, (60, 110, 200), 0.12)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def chip(ov: Image.Image, text: str, cx: int, cy: int, size: int = 15) -> None:
    """Slim glass pill centred on (cx, cy) — lives in its own band, never over art."""
    d = ImageDraw.Draw(ov)
    f = font(size)
    tw = d.textlength(text, font=f)
    pad_x, h = 18, 34
    d.rounded_rectangle(
        (cx - tw / 2 - pad_x, cy - h / 2, cx + tw / 2 + pad_x, cy + h / 2),
        radius=17,
        fill=(255, 255, 255, 30),
        outline=(255, 255, 255, 90),
        width=1,
    )
    d.text((cx - tw / 2, cy - h / 2 + 8), text, font=f, fill=WHITE)


def logo_art(height: int) -> Image.Image:
    """The client's real stacked lockup, alpha-lifted off its navy plate."""
    src = Image.open(os.path.join(ROOT, "public", "art", "logo-source.jpg")).convert("RGB")
    a = np.asarray(src).astype(np.int16)
    corners = np.concatenate([a[:8, :8], a[:8, -8:], a[-8:, :8], a[-8:, -8:]]).reshape(-1, 3)
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - 36) / 48, 0, 1) * 255
    img = Image.fromarray(np.dstack([a, alpha]).astype(np.uint8), "RGBA")
    img = img.crop(img.getbbox())
    scale = height / img.height
    return img.resize((int(img.width * scale), height), Image.LANCZOS)


LOGO_BIG = logo_art(250)
LOGO_SMALL = logo_art(185)


def photo_column(photo: Image.Image, progress: float) -> Image.Image:
    """Full-height photo on the right 400 px, feather-blended into the stage."""
    cw = 400
    scale = 1.08 - 0.06 * progress  # slow push-in
    sw, sh = int(cw * scale), int(H * scale)
    img = photo.convert("RGB").resize((sw, sh), Image.LANCZOS)
    dx, dy = (sw - cw) // 2, (sh - H) // 2
    img = img.crop((dx, dy, dx + cw, dy + H)).convert("RGBA")
    feather = 110
    ramp = np.ones((H, cw), dtype=np.float64)
    ramp[:, :feather] = np.linspace(0, 1, feather)[None, :]
    img.putalpha(Image.fromarray((ramp * 255).astype(np.uint8), "L"))
    return img


PHOTOS = {
    "survey": Image.open(os.path.join(MEDIA, "story-4.webp")),
    "press": Image.open(os.path.join(MEDIA, "story-6.webp")),
    "kits": Image.open(os.path.join(MEDIA, "kit-jerseys.jpg")),
}


def glass_panel(ov: Image.Image, x: int, y: int, w: int, h: int, title: str) -> ImageDraw.ImageDraw:
    """One large frosted panel on the overlay. Returns a draw bound to it."""
    d = ImageDraw.Draw(ov)
    d.rounded_rectangle(
        (x, y, x + w, y + h),
        radius=20,
        fill=(12, 40, 86, 150),
        outline=(255, 255, 255, 80),
        width=2,
    )
    d.rounded_rectangle((x + 3, y + 3, x + w - 3, y + h - 3), radius=17, outline=(255, 255, 255, 26), width=1)
    d.text((x + 26, y + 20), title, font=font(19), fill=GOLD)
    d.line((x + 26, y + 56, x + w - 26, y + 56), fill=(255, 255, 255, 60), width=1)
    return d


def headline(img: Image.Image, lines, x: int, y: int, size: int = 29) -> None:
    d = ImageDraw.Draw(img)
    f = font(size)
    for i, line in enumerate(lines):
        d.text((x, y + i * (size + 9)), line, font=f, fill=WHITE)


def eyebrow(ov: Image.Image, text: str, x: int, y: int) -> None:
    d = ImageDraw.Draw(ov)
    f = font(12)
    tw = d.textlength(text, font=f)
    d.rounded_rectangle(
        (x, y, x + tw + 28, y + 26),
        radius=13,
        fill=(197, 168, 105, 46),
        outline=(197, 168, 105, 170),
        width=1,
    )
    d.text((x + 14, y + 6), text, font=f, fill=(238, 226, 190))


CZ_X, CZ_W = 64, 476  # content zone
PANEL_Y, PANEL_H = 214, 232


# --------------------------------------------------------------------------
# scenes
# --------------------------------------------------------------------------
def scene_logo(t: float) -> Image.Image:
    img = stage()
    pop = min(1.0, t / 0.8)
    lw = int(LOGO_BIG.width * (0.94 + 0.06 * pop))
    lh = int(LOGO_BIG.height * (0.94 + 0.06 * pop))
    logo = LOGO_BIG.resize((lw, lh), Image.LANCZOS)
    img.alpha_composite(logo, (W // 2 - lw // 2, 74))
    d = ImageDraw.Draw(img)
    f = font(27)
    for i, line in enumerate(["Where global business, ideas", "& opportunities meet"]):
        tw = d.textlength(line, font=f)
        d.text((W / 2 - tw / 2, 362 + i * 38), line, font=f, fill=WHITE)
    ov = overlay()
    chip(ov, "Welcome to F.M.I.E", W // 2, 486)
    img.alpha_composite(ov)
    return img


def scene_split(photo_key, eb, lines, title, rows, chip_text, t, dur) -> Image.Image:
    img = stage()
    img.alpha_composite(photo_column(PHOTOS[photo_key], min(1.0, t / dur)), (W - 400, 0))
    headline(img, lines, CZ_X, 106)
    ov = overlay()
    eyebrow(ov, eb, CZ_X, 62)
    fy = int(3 * math.sin(t * 1.3))
    d = glass_panel(ov, CZ_X, PANEL_Y + fy, CZ_W, PANEL_H, title)
    y = PANEL_Y + fy + 74
    for kind, left, right in rows:
        if kind == "kv":
            d.text((CZ_X + 26, y + 6), left, font=font(15, bold=False), fill=(255, 255, 255, 215))
            tw = d.textlength(right, font=font(16))
            d.text((CZ_X + CZ_W - 26 - tw, y + 4), right, font=font(16), fill=GOLD)
        elif kind == "step":
            d.ellipse((CZ_X + 26, y + 4, CZ_X + 50, y + 28), outline=GOLD, width=2)
            d.text((CZ_X + 34, y + 8), left, font=font(13))
            d.text((CZ_X + 62, y + 8), right, font=font(15, bold=False), fill=(255, 255, 255, 225))
        elif kind == "dot":
            d.ellipse((CZ_X + 30, y + 10, CZ_X + 42, y + 22), fill=GOLD)
            d.text((CZ_X + 62, y + 6), right, font=font(15, bold=False), fill=(255, 255, 255, 225))
        elif kind == "swatch":
            for i, color in enumerate(right):
                cx = CZ_X + 30 + i * 44
                d.ellipse((cx, y + 2, cx + 30, y + 32), fill=color, outline=(255, 255, 255, 110), width=2)
            d.text((CZ_X + 226, y + 9), left, font=font(13, bold=False), fill=(255, 255, 255, 200))
        y += 52
    chip(ov, chip_text, CZ_X + CZ_W // 2, 486)
    img.alpha_composite(ov)
    return img


def scene_outro(t: float) -> Image.Image:
    img = stage()
    img.alpha_composite(LOGO_SMALL, (W // 2 - LOGO_SMALL.width // 2, 92))
    d = ImageDraw.Draw(img)
    f = font(33)
    line = "F.M.I.E Means Business"
    tw = d.textlength(line, font=f)
    d.text((W / 2 - tw / 2, 314), line, font=f, fill=WHITE)
    f2 = font(15, bold=False)
    sub = "Connecting Ideas, Insights & Global Opportunities"
    tw2 = d.textlength(sub, font=f2)
    d.text((W / 2 - tw2 / 2, 362), sub, font=f2, fill=(238, 226, 190))
    ov = overlay()
    chip(ov, "fmie.co.uk", W // 2, 486)
    img.alpha_composite(ov)
    return img


SCENES = [
    (0.0, 5.5, lambda t: scene_logo(t)),
    (
        5.5,
        9.5,
        lambda t: scene_split(
            "survey",
            "SURVEY ENGINE",
            ["Earn cash for every", "survey you complete"],
            "Survey earner wallet",
            [
                ("kv", "Available balance", "₦6,500"),
                ("kv", "Last credit", "+ ₦750 · survey completed"),
                ("kv", "Payout", "Paystack · from ₦2,000"),
            ],
            "Answer surveys — earn cash instantly",
            t,
            4.0,
        ),
    ),
    (
        9.5,
        14.0,
        lambda t: scene_split(
            "press",
            "PRESS DESK",
            ["Book press distribution", "across 44 partner desks"],
            "Campaign pipeline",
            [
                ("step", "1", "Submitted & under review"),
                ("step", "2", "Approved & in production"),
                ("step", "3", "Published — editor's discretion"),
            ],
            "Book press distribution",
            t,
            4.5,
        ),
    ),
    (
        14.0,
        17.0,
        lambda t: scene_split(
            "kits",
            "TEAM KITS",
            ["Custom team kits in", "your club colours"],
            "Kit builder",
            [
                ("dot", "", "Roster names & numbers"),
                ("dot", "", "Club colour splits & trims"),
                ("swatch", "House colours & splits", [NAVY, GOLD, CREAM, (33, 37, 41)]),
            ],
            "Kit your team in custom colours",
            t,
            3.0,
        ),
    ),
    (17.0, 20.0, lambda t: scene_outro(t)),
]


def frame_at(i: int) -> Image.Image:
    t = i / FPS
    for idx, (start, end, fn) in enumerate(SCENES):
        if start <= t < end or (idx == len(SCENES) - 1 and t >= end):
            base = fn(t - start)
            nxt = SCENES[idx + 1] if idx + 1 < len(SCENES) else None
            if nxt and t > end - FADE / FPS:
                blend = (t - (end - FADE / FPS)) / (FADE / FPS)
                base = Image.blend(base, nxt[2](0.0), min(1.0, blend))
            return base
    return SCENES[-1][2](0.0)


def main() -> None:
    os.makedirs(FRAMES, exist_ok=True)
    for f in os.listdir(FRAMES):
        os.remove(os.path.join(FRAMES, f))
    for i in range(TOTAL):
        frame_at(i).convert("RGB").save(os.path.join(FRAMES, f"f{i:04d}.png"))
    out = os.path.join(MEDIA, "showcase-film.mp4")
    subprocess.run(
        [
            imageio_ffmpeg.get_ffmpeg_exe(),
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            os.path.join(FRAMES, "f%04d.png"),
            "-i",
            os.path.join(MEDIA, "showcase-voiceover.mp3"),
            "-c:v",
            "libx264",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-shortest",
            "-movflags",
            "+faststart",
            out,
        ],
        check=True,
        capture_output=True,
    )
    print("wrote", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    main()
