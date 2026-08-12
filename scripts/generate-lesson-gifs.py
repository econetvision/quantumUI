#!/usr/bin/env python3
"""
Generate animated GIFs for the demo from existing lesson art.

IMPORTANT: each GIF animates ONE individual artwork only — a gentle
Ken Burns zoom-in/zoom-out loop. No crossfading or blending between
different pieces; every image keeps its own identity.

Output: public/images/animated/<name>.gif
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public", "images")
OUT = os.path.join(IMG, "animated")
os.makedirs(OUT, exist_ok=True)

SIZE = 384          # output resolution
STEPS = 10          # zoom-in frames (mirrored back out for a seamless loop)
DURATION = 140      # ms per frame
ZOOM = 1.07         # max Ken Burns zoom
COLORS = 128        # palette size

# One source image per GIF — individual pieces, never mixed.
GIFS = {
    "quantum-fundamentals": "lesson-images/quantum-fundamentals/track-overview.png",
    "quantum-gates": "lesson-images/quantum-gates/track-overview.png",
    "quantum-entanglement": "lesson-images/quantum-entanglement/track-overview.png",
    "quantum-master-grid": "quantum-master-grid.png",
}


def load_square(path: str) -> Image.Image:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    return im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)


def zoom_frame(im: Image.Image, factor: float) -> Image.Image:
    """Center-zoom by factor (>=1)."""
    side = int(SIZE / factor)
    off = (SIZE - side) // 2
    return im.crop((off, off, off + side, off + side)).resize((SIZE, SIZE), Image.LANCZOS)


def ease(t: float) -> float:
    """Ease-in-out for a smooth, gentle motion."""
    return t * t * (3 - 2 * t)


def build(name: str, rel_path: str) -> None:
    im = load_square(os.path.join(IMG, rel_path))
    zoom_in = [
        zoom_frame(im, 1.0 + (ZOOM - 1.0) * ease(f / (STEPS - 1)))
        for f in range(STEPS)
    ]
    # Ping-pong: zoom in, then back out (skip endpoints to avoid duplicates)
    frames = zoom_in + zoom_in[-2:0:-1]

    pal_frames = [f.convert("P", palette=Image.ADAPTIVE, colors=COLORS) for f in frames]
    out_path = os.path.join(OUT, f"{name}.gif")
    pal_frames[0].save(
        out_path,
        save_all=True,
        append_images=pal_frames[1:],
        duration=DURATION,
        loop=0,
        optimize=True,
    )
    print(f"{name}.gif: {len(frames)} frames, {os.path.getsize(out_path) // 1024} KB")


if __name__ == "__main__":
    for name, path in GIFS.items():
        build(name, path)
