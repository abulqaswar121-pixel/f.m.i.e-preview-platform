#!/usr/bin/env python3
"""Rebuild the 60-second showcase film + its voice-over track.

Outputs
  public/media/showcase-voiceover-60s.mp3  (8 TTS segments concatenated)
  public/media/showcase-film-v4.mp4        (scene per segment, speech-matched)

Design rules (client feedback, rounds 3-4):
  * NO grid on the stage — plain navy gradient + two smooth gaussian glows.
  * NOTHING overlaps: every scene is a strict vertical stack
    (eyebrow chip -> headline -> one large glass panel -> caption chip)
    inside a 488 px content zone, with a full-height photo column on the
    right that feather-blends into the stage.
  * Transitions dip to plain navy — two scenes are never superimposed.
  * Elements are LARGE: the panel spans the whole content zone, the photo
    spans the full frame height with a slow push-in.
  * The logo is the client's real artwork (public/art/logo-source.jpg),
    alpha-lifted off its navy plate — never redrawn.
  * Kit colours are real jersey crops, never colour circles.
  * Translucent glass is drawn on an RGBA overlay then composited.

Scene plan (one per voice-over segment, timed to the measured audio):
  1 logo lockup + positioning lines                    (no photo)
  2 survey engine   — wallet panel        story-4.webp
  3 research console — results panel      story-3.webp
  4 press desk      — pipeline panel      story-6.webp
  5 outlet catalogue — tier price panel   story-5.webp
  6 team kits       — kit builder panel   kit-jerseys.jpg
  7 professional services — advisory panel story-8.webp
  8 outro lockup + tagline                             (no photo)

Run:  python3 scripts/build-showcase-film.py   (needs pillow/numpy/imageio-ffmpeg)
"""

import math
import os
import re
import subprocess
import sys

sys.path.insert(0, "/tmp/pylibs")

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "public", "media")
VO_SEGMENTS = [f"/tmp/vo/seg{i}.mp3" for i in range(1, 9)]
FRAMES = os.path.join("/tmp", "filmframes")
W, H, FPS = 960, 540, 12

NAVY_DEEP = (7, 30, 67)
NAVY = (10, 46, 104)
GOLD = (197, 168, 105)
CREAM = (245, 242, 235)
WHITE = (255, 255, 255)

BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

FF = imageio_ffmpeg.get_ffmpeg_exe()


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BOLD if bold else REG, size)


def overlay() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def probe(path: str) -> float:
    r = subprocess.run([FF, "-i", path], capture_output=True, text=True)
    h, m, s = re.search(r"Duration: ([0-9:.]+)", r.stderr).group(1).split(":")
    return float(h) * 3600 + float(m) * 60 + float(s)


# --------------------------------------------------------------------------
# stage + primitives
# --------------------------------------------------------------------------
def stage() -> Image.Image:
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


LOGO = logo_art(240)


def photo_column(photo: Image.Image, progress: float) -> Image.Image:
    cw = 410
    scale = 1.08 - 0.06 * progress
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
    "research": Image.open(os.path.join(MEDIA, "story-3.webp")),
    "press": Image.open(os.path.join(MEDIA, "story-6.webp")),
    "catalogue": Image.open(os.path.join(MEDIA, "story-5.webp")),
    "kits": Image.open(os.path.join(MEDIA, "kit-jerseys.jpg")),
    "services": Image.open(os.path.join(MEDIA, "story-8.webp")),
}


def rounded_thumb(box, label: str):
    src = PHOTOS["kits"]
    w, h = src.size
    crop = src.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    thumb = crop.convert("RGBA").resize((60, 40), Image.LANCZOS)
    mask = Image.new("L", (60, 40), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 59, 39), radius=8, fill=255)
    thumb.putalpha(mask)
    return (thumb, label)


KIT_THUMBS = [
    rounded_thumb((0.06, 0.28, 0.46, 0.76), "Navy"),
    rounded_thumb((0.37, 0.27, 0.74, 0.75), "White"),
    rounded_thumb((0.63, 0.27, 0.97, 0.76), "Gold"),
]

STAGE = stage()
DIP_OUT, DIP_IN = 0.5, 0.4


def glass_panel(ov, x, y, w, h, title):
    d = ImageDraw.Draw(ov)
    d.rounded_rectangle((x, y, x + w, y + h), radius=20, fill=(12, 40, 86, 150), outline=(255, 255, 255, 80), width=2)
    d.rounded_rectangle((x + 3, y + 3, x + w - 3, y + h - 3), radius=17, outline=(255, 255, 255, 26), width=1)
    d.text((x + 26, y + 20), title, font=font(19), fill=GOLD)
    d.line((x + 26, y + 56, x + w - 26, y + 56), fill=(255, 255, 255, 60), width=1)
    return d


def headline(img, lines, x, y, size=29):
    d = ImageDraw.Draw(img)
    f = font(size)
    for i, line in enumerate(lines):
        d.text((x, y + i * (size + 9)), line, font=f, fill=WHITE)


def eyebrow(ov, text, x, y):
    d = ImageDraw.Draw(ov)
    f = font(12)
    tw = d.textlength(text, font=f)
    d.rounded_rectangle((x, y, x + tw + 28, y + 26), radius=13, fill=(197, 168, 105, 46), outline=(197, 168, 105, 170), width=1)
    d.text((x + 14, y + 6), text, font=f, fill=(238, 226, 190))


CZ_X, CZ_W = 56, 488
PANEL_Y, PANEL_H = 210, 240


def scene_logo(t: float) -> Image.Image:
    img = STAGE.copy()
    pop = min(1.0, t / 0.8)
    lw = int(LOGO.width * (0.94 + 0.06 * pop))
    lh = int(LOGO.height * (0.94 + 0.06 * pop))
    logo = LOGO.resize((lw, lh), Image.LANCZOS)
    img.alpha_composite(logo, (W // 2 - lw // 2, 78))
    d = ImageDraw.Draw(img)
    f = font(27)
    for i, line in enumerate(["Where global business, ideas", "& opportunities meet"]):
        tw = d.textlength(line, font=f)
        d.text((W / 2 - tw / 2, 358 + i * 38), line, font=f, fill=WHITE)
    ov = overlay()
    chip(ov, "Welcome to F.M.I.E", W // 2, 486)
    img.alpha_composite(ov)
    return img


def scene_split(photo_key, eb, lines, title, rows, chip_text, t, dur):
    img = STAGE.copy()
    img.alpha_composite(photo_column(PHOTOS[photo_key], min(1.0, t / dur)), (W - 410, 0))
    headline(img, lines, CZ_X, 106)
    ov = overlay()
    eyebrow(ov, eb, CZ_X, 62)
    fy = int(3 * math.sin(t * 1.3))
    d = glass_panel(ov, CZ_X, PANEL_Y + fy, CZ_W, PANEL_H, title)
    y = PANEL_Y + fy + 76
    for kind, left, right in rows:
        if kind == "kv":
            d.text((CZ_X + 26, y + 8), left, font=font(15, bold=False), fill=(255, 255, 255, 215))
            tw = d.textlength(right, font=font(16))
            d.text((CZ_X + CZ_W - 26 - tw, y + 6), right, font=font(16), fill=GOLD)
        elif kind == "step":
            d.ellipse((CZ_X + 26, y + 6, CZ_X + 50, y + 30), outline=GOLD, width=2)
            d.text((CZ_X + 34, y + 10), left, font=font(13))
            d.text((CZ_X + 62, y + 10), right, font=font(15, bold=False), fill=(255, 255, 255, 225))
        elif kind == "dot":
            d.ellipse((CZ_X + 30, y + 12, CZ_X + 42, y + 24), fill=GOLD)
            d.text((CZ_X + 62, y + 8), right, font=font(15, bold=False), fill=(255, 255, 255, 225))
        elif kind == "thumbs":
            for i, (thumb, label) in enumerate(right):
                tx = CZ_X + 26 + i * 78
                ov.alpha_composite(thumb, (tx, y + 2))
                lw = d.textlength(label, font=font(10))
                d.text((tx + 30 - lw / 2, y + 43), label, font=font(10), fill=(255, 255, 255, 190))
            d.text((CZ_X + 268, y + 14), left, font=font(13, bold=False), fill=(255, 255, 255, 200))
        y += 54
    chip(ov, chip_text, CZ_X + CZ_W // 2, 486)
    img.alpha_composite(ov)
    return img


def scene_outro(t: float) -> Image.Image:
    img = STAGE.copy()
    img.alpha_composite(LOGO, (W // 2 - LOGO.width // 2, 88))
    d = ImageDraw.Draw(img)
    f = font(33)
    line = "F.M.I.E Means Business"
    tw = d.textlength(line, font=f)
    d.text((W / 2 - tw / 2, 352), line, font=f, fill=WHITE)
    f2 = font(15, bold=False)
    sub = "Connecting Ideas, Insights & Global Opportunities"
    tw2 = d.textlength(sub, font=f2)
    d.text((W / 2 - tw2 / 2, 400), sub, font=f2, fill=(238, 226, 190))
    ov = overlay()
    chip(ov, "fmie.co.uk", W // 2, 486)
    img.alpha_composite(ov)
    return img


SCENE_FACTORIES = [
    lambda t, dur: scene_logo(t),
    lambda t, dur: scene_split(
        "survey", "SURVEY ENGINE", ["Earn cash for every", "survey you complete"], "Survey earner wallet",
        [
            ("kv", "Available balance", "₦6,500"),
            ("kv", "Last credit", "+ ₦750 · survey completed"),
            ("kv", "Payout", "Paystack · from ₦2,000"),
        ],
        "Answer surveys — earn cash instantly", t, dur),
    lambda t, dur: scene_split(
        "research", "RESEARCH", ["Fund quotas, track responses,", "export clean results"], "Research console",
        [
            ("kv", "Reward lock", "8 pts per complete"),
            ("kv", "Live dashboard", "Filters as responses land"),
            ("kv", "Export", "CSV, one click"),
        ],
        "Fund a quota — read results live", t, dur),
    lambda t, dur: scene_split(
        "press", "PRESS DESK", ["Book press distribution", "across 44 partner desks"], "Campaign pipeline",
        [
            ("step", "1", "Submitted & under review"),
            ("step", "2", "Approved & in production"),
            ("step", "3", "Published — editor's discretion"),
        ],
        "Book press distribution", t, dur),
    lambda t, dur: scene_split(
        "catalogue", "OUTLET CATALOGUE", ["Real tier prices,", "shown before you pay"], "Sample outlet tiers",
        [
            ("kv", "Daily Independent", "₦69,600"),
            ("kv", "Punch", "₦369,600"),
            ("kv", "Forbes", "$37,500"),
        ],
        "44 partner desks across three tiers", t, dur),
    lambda t, dur: scene_split(
        "kits", "TEAM KITS", ["Custom team kits in", "your club colours"], "Kit builder",
        [
            ("dot", "", "Roster names & numbers"),
            ("dot", "", "Club colour splits & trims"),
            ("thumbs", "House colours & splits", KIT_THUMBS),
        ],
        "Kit your team in custom colours", t, dur),
    lambda t, dur: scene_split(
        "services", "PROFESSIONAL SERVICES", ["Executive services,", "delivered by professionals"], "Advisory desk",
        [
            ("dot", "", "Executive profile & autobiography writing"),
            ("dot", "", "Digital marketing contracts"),
            ("dot", "", "Wikipedia policy advisory (COI-aware)"),
        ],
        "Book a professional service", t, dur),
    lambda t, dur: scene_outro(t),
]


def frame_at(t: float, bounds) -> Image.Image:
    for idx, (start, end) in enumerate(bounds):
        if start <= t < end or (idx == len(bounds) - 1 and t >= end):
            local = t - start
            dur = end - start
            base = SCENE_FACTORIES[idx](local, dur)
            if idx > 0 and local < DIP_IN:
                base = Image.blend(STAGE.copy(), base, local / DIP_IN)
            if idx < len(bounds) - 1 and local > dur - DIP_OUT:
                base = Image.blend(base, STAGE.copy(), (local - (dur - DIP_OUT)) / DIP_OUT)
            return base
    return SCENE_FACTORIES[-1](0.0, 1.0)


def main() -> None:
    durs = [probe(p) for p in VO_SEGMENTS]
    total = sum(durs)
    print("segment durations:", [round(d, 2) for d in durs], "total", round(total, 2))

    # one concatenated voice-over track for the card's audio fallback
    vo_out = os.path.join(MEDIA, "showcase-voiceover-60s.mp3")
    cmd = [FF, "-y"]
    for p in VO_SEGMENTS:
        cmd += ["-i", p]
    cmd += [
        "-filter_complex", "concat=n=8:v=0:a=1[a]",
        "-map", "[a]", "-q:a", "2", vo_out,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print("wrote", vo_out, os.path.getsize(vo_out), "bytes")

    bounds = []
    acc = 0.0
    for d in durs:
        bounds.append((acc, acc + d))
        acc += d
    frames = int(round(total * FPS))

    os.makedirs(FRAMES, exist_ok=True)
    for f in os.listdir(FRAMES):
        os.remove(os.path.join(FRAMES, f))
    for i in range(frames):
        frame_at(i / FPS, bounds).convert("RGB").save(os.path.join(FRAMES, f"f{i:04d}.png"))

    out = os.path.join(MEDIA, "showcase-film-v4.mp4")
    subprocess.run(
        [
            FF, "-y",
            "-framerate", str(FPS), "-i", os.path.join(FRAMES, "f%04d.png"),
            "-i", vo_out,
            "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k",
            "-shortest", "-movflags", "+faststart",
            out,
        ],
        check=True,
        capture_output=True,
    )
    print("wrote", out, os.path.getsize(out), "bytes, ~", round(frames / FPS, 1), "s")


if __name__ == "__main__":
    main()
