#!/usr/bin/env python3
"""
Generate physics animations for the curriculum.

These are *computed*, not illustrated. The wavefunction frames come from
numerically integrating the time-dependent Schrödinger equation with a
split-step Fourier method; the Grover frames come from applying the real
oracle and diffusion operators to a real amplitude vector. Nothing here is a
stylised impression of what quantum mechanics looks like — if the physics
changes, the picture changes with it.

That matters for teaching: a learner who measures a tunnelling probability off
one of these frames gets the number the equation actually predicts.

Usage:
    python3 scripts/generate_physics_animations.py [--only NAME] [--width 900]
                                                   [--fps 20] [--scale 1.0]

Output: public/images/physics/<name>.gif  plus <name>.json (frame captions)
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys

import numpy as np

import matplotlib
matplotlib.use("Agg")  # headless: never try to open a window
import matplotlib.pyplot as plt
from matplotlib import rcParams

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(APP_ROOT, "public", "images", "physics")

# Palette matches the app's validated chart tokens (see globals.css).
INK = "#e8edf5"
MUTED = "#9aa6b8"
BG = "#0b0e13"
ACCENT = "#4d8dff"     # --q-zero
ACCENT_2 = "#d9752e"   # --q-one
GOOD = "#3fca87"

rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor": BG,
    "savefig.facecolor": BG,
    "text.color": INK,
    "axes.labelcolor": MUTED,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.edgecolor": "#2a313d",
    "font.family": "DejaVu Sans",
    "mathtext.fontset": "dejavusans",
})


# ---------------------------------------------------------------------------
# Frame plumbing
# ---------------------------------------------------------------------------


def figure(width_px: int, height_px: int, dpi: int = 100):
    return plt.figure(figsize=(width_px / dpi, height_px / dpi), dpi=dpi)


def fig_to_frame(fig):
    """Render a matplotlib figure to a PIL image."""
    from PIL import Image

    fig.canvas.draw()
    buf = np.asarray(fig.canvas.buffer_rgba())
    plt.close(fig)
    return Image.fromarray(buf).convert("RGB")


def save_gif(name: str, frames, fps: int, captions=None):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f"{name}.gif")

    # Palette-quantise once so colours stay stable across frames rather than
    # shimmering, which is very visible on a dark background.
    quantised = [f.quantize(colors=128, method=2, dither=0) for f in frames]
    quantised[0].save(
        path,
        save_all=True,
        append_images=quantised[1:],
        duration=int(1000 / fps),
        loop=0,
        optimize=True,
        disposal=2,
    )

    size_kb = os.path.getsize(path) / 1024
    print(f"  {name:34s} {len(frames):3d} frames  {size_kb:7.0f} KB  {frames[0].size[0]}x{frames[0].size[1]}")

    if captions:
        with open(os.path.join(OUT_DIR, f"{name}.json"), "w") as fh:
            json.dump({"name": name, "fps": fps, "steps": captions}, fh, indent=2)

    return path


# ---------------------------------------------------------------------------
# 1. Schrödinger equation — step-by-step derivation
# ---------------------------------------------------------------------------

SCHRODINGER_STEPS = [
    (
        "Start from the classical energy of a particle",
        r"$E = \frac{p^2}{2m} + V$",
        "Kinetic plus potential. Nothing quantum yet — this is Newtonian bookkeeping.",
    ),
    (
        "de Broglie: matter carries a wave",
        r"$\lambda = \frac{h}{p}, \qquad p = \hbar k$",
        "1924. If light can behave as particles, particles can behave as waves.",
    ),
    (
        "Planck & Einstein: energy is quantised",
        r"$E = h\nu = \hbar\omega$",
        "Energy relates to frequency, momentum to wavenumber.",
    ),
    (
        "Write a plane wave for a free particle",
        r"$\Psi(x,t) = A\,e^{\,i(kx - \omega t)}$",
        "The simplest wave carrying momentum ℏk and energy ℏω.",
    ),
    (
        "Differentiate in time — it pulls out the energy",
        r"$i\hbar\frac{\partial \Psi}{\partial t} = \hbar\omega\,\Psi = E\,\Psi$",
        "One time derivative returns E times the wave.",
    ),
    (
        "Differentiate twice in space — it pulls out p²",
        r"$-\hbar^2\frac{\partial^2 \Psi}{\partial x^2} = \hbar^2k^2\Psi = p^2\Psi$",
        "Two spatial derivatives return p² times the wave.",
    ),
    (
        "Substitute both into the energy relation",
        r"$i\hbar\frac{\partial\Psi}{\partial t} = -\frac{\hbar^2}{2m}\frac{\partial^2\Psi}{\partial x^2} + V\Psi$",
        "Replace E and p²/2m with the operators just derived.",
    ),
    (
        "The time-dependent Schrödinger equation",
        r"$i\hbar\frac{\partial}{\partial t}|\Psi\rangle = \hat{H}|\Psi\rangle$",
        "Schrödinger, 1926. The Hamiltonian Ĥ generates time evolution.",
    ),
    (
        "Born rule: what the wavefunction means",
        r"$P(x)\,dx = |\Psi(x,t)|^2 dx$",
        "Born, 1926. Ψ is not observable — its squared magnitude is a probability density.",
    ),
    (
        "This is exactly what a quantum computer evolves",
        r"$|\psi'\rangle = U|\psi\rangle, \qquad U = e^{-i\hat{H}t/\hbar}$",
        "A quantum gate is a unitary U — the solution of this equation for a chosen Ĥ.",
    ),
]


def render_derivation(name: str, title: str, steps, width: int, fps: int, hold: int):
    """Render a step list as an accumulating GIF, one step revealed at a time."""
    frames = []
    height = int(width * 0.62)

    for idx in range(len(steps)):
        fig = figure(width, height)
        ax = fig.add_axes([0, 0, 1, 1])
        ax.axis("off")

        ax.text(0.5, 0.93, title, ha="center", va="top", fontsize=15, color=INK, weight="bold")
        ax.text(0.5, 0.855, f"step {idx + 1} of {len(steps)}",
                ha="center", va="top", fontsize=9, color=MUTED, family="monospace")

        heading, equation, note = steps[idx]

        # Trail of previous steps, faded, so the derivation reads as a chain.
        y = 0.74
        start = max(0, idx - 2)
        for prev in range(start, idx):
            ax.text(0.5, y, steps[prev][1], ha="center", va="center",
                    fontsize=13, color="#5b6473")
            y -= 0.10

        ax.text(0.5, y - 0.02, heading, ha="center", va="center", fontsize=12, color=ACCENT)
        ax.text(0.5, y - 0.17, equation, ha="center", va="center", fontsize=21, color=INK)
        ax.text(0.5, y - 0.31, note, ha="center", va="center", fontsize=10,
                color=MUTED, wrap=True)

        frame = fig_to_frame(fig)
        frames.extend([frame] * hold)  # hold each step long enough to read

    captions = [{"step": i + 1, "heading": h, "equation": e, "note": n}
                for i, (h, e, n) in enumerate(steps)]
    return save_gif(name, frames, fps, captions)


# ---------------------------------------------------------------------------
# 2. Real TDSE solutions (split-step Fourier)
# ---------------------------------------------------------------------------


def evolve_tdse(psi, V, dx, dt, steps_per_frame):
    """
    One frame's worth of evolution under the split-step Fourier method.

    Uses natural units ħ = m = 1. The operator split is
        exp(-iV dt/2) · exp(-i k² dt/2) · exp(-iV dt/2)
    which is accurate to O(dt³) per step.
    """
    n = psi.size
    k = 2 * np.pi * np.fft.fftfreq(n, d=dx)
    kinetic = np.exp(-0.5j * (k ** 2) * dt)
    half_pot = np.exp(-0.5j * V * dt)

    for _ in range(steps_per_frame):
        psi = half_pot * psi
        psi = np.fft.ifft(kinetic * np.fft.fft(psi))
        psi = half_pot * psi
    return psi


def gaussian_packet(x, x0, k0, sigma):
    norm = (2 * np.pi * sigma ** 2) ** -0.25
    return norm * np.exp(-((x - x0) ** 2) / (4 * sigma ** 2)) * np.exp(1j * k0 * x)


def make_tunnelling(width: int, fps: int, frames_n: int, barrier: float):
    """A wavepacket hitting a barrier — part reflects, part tunnels through."""
    n = 1024
    x = np.linspace(-60, 60, n)
    dx = x[1] - x[0]

    V = np.zeros_like(x)
    V[(x > 0) & (x < 2.0)] = barrier          # thin rectangular barrier

    psi = gaussian_packet(x, x0=-25, k0=2.6, sigma=3.5)
    psi /= np.sqrt(np.sum(np.abs(psi) ** 2) * dx)

    height = int(width * 0.55)
    frames, captions = [], []

    for f in range(frames_n):
        density = np.abs(psi) ** 2
        transmitted = float(np.sum(density[x > 2.0]) * dx)
        reflected = float(np.sum(density[x < 0]) * dx)

        fig = figure(width, height)
        ax = fig.add_axes([0.09, 0.15, 0.87, 0.70])

        ax.fill_between(x, 0, V / barrier * density.max() * 1.15,
                        color="#2a313d", zorder=1)
        ax.plot(x, density, color=ACCENT, lw=2.0, zorder=3)
        ax.fill_between(x, 0, density, color=ACCENT, alpha=0.18, zorder=2)
        ax.plot(x, np.real(psi) * 0.45 * density.max() / (np.abs(psi).max() + 1e-9),
                color=ACCENT_2, lw=1.0, alpha=0.75, zorder=4)

        ax.set_xlim(-60, 60)
        ax.set_ylim(0, density.max() * 1.35 + 1e-9)
        ax.set_yticks([])
        ax.set_xlabel("position  x")
        ax.set_title("Quantum tunnelling — a real solution of the Schrödinger equation",
                     fontsize=12, color=INK, pad=14)

        ax.text(0.015, 0.95, r"$|\Psi(x,t)|^2$", transform=ax.transAxes,
                color=ACCENT, fontsize=11, va="top")
        ax.text(0.015, 0.86, r"$\mathrm{Re}\,\Psi$", transform=ax.transAxes,
                color=ACCENT_2, fontsize=10, va="top")
        ax.text(0.98, 0.95,
                f"transmitted {transmitted*100:5.1f}%\nreflected   {reflected*100:5.1f}%",
                transform=ax.transAxes, ha="right", va="top",
                color=MUTED, fontsize=10, family="monospace")

        frames.append(fig_to_frame(fig))
        captions.append({"frame": f, "transmitted": round(transmitted, 4),
                         "reflected": round(reflected, 4)})

        psi = evolve_tdse(psi, V, dx, dt=0.06, steps_per_frame=7)

    return save_gif("schrodinger-tunnelling", frames, fps, captions)


def make_free_spreading(width: int, fps: int, frames_n: int):
    """A free wavepacket spreading — uncertainty growing in real time."""
    n = 1024
    x = np.linspace(-50, 50, n)
    dx = x[1] - x[0]
    V = np.zeros_like(x)

    psi = gaussian_packet(x, x0=-15, k0=1.8, sigma=2.0)
    psi /= np.sqrt(np.sum(np.abs(psi) ** 2) * dx)

    height = int(width * 0.55)
    frames, captions = [], []

    for f in range(frames_n):
        density = np.abs(psi) ** 2
        mean_x = float(np.sum(x * density) * dx)
        var_x = float(np.sum((x - mean_x) ** 2 * density) * dx)
        sigma_x = math.sqrt(max(var_x, 0))

        # Momentum-space width, for the uncertainty product.
        phi = np.fft.fftshift(np.fft.fft(psi))
        kk = np.fft.fftshift(2 * np.pi * np.fft.fftfreq(n, d=dx))
        pdens = np.abs(phi) ** 2
        pdens /= np.sum(pdens)
        mean_k = float(np.sum(kk * pdens))
        sigma_k = math.sqrt(float(np.sum((kk - mean_k) ** 2 * pdens)))

        fig = figure(width, height)
        ax = fig.add_axes([0.09, 0.15, 0.87, 0.70])
        ax.plot(x, density, color=ACCENT, lw=2.0)
        ax.fill_between(x, 0, density, color=ACCENT, alpha=0.18)
        ax.set_xlim(-50, 50)
        ax.set_ylim(0, 0.22)
        ax.set_yticks([])
        ax.set_xlabel("position  x")
        ax.set_title("A free wavepacket spreads — Heisenberg uncertainty in motion",
                     fontsize=12, color=INK, pad=14)
        ax.text(0.98, 0.95,
                f"$\\sigma_x$ = {sigma_x:5.2f}\n"
                f"$\\sigma_k$ = {sigma_k:5.2f}\n"
                f"$\\sigma_x\\sigma_k$ = {sigma_x*sigma_k:5.2f}  (≥ 0.5)",
                transform=ax.transAxes, ha="right", va="top",
                color=MUTED, fontsize=10)

        frames.append(fig_to_frame(fig))
        captions.append({"frame": f, "sigma_x": round(sigma_x, 3),
                         "sigma_k": round(sigma_k, 3),
                         "product": round(sigma_x * sigma_k, 3)})

        psi = evolve_tdse(psi, V, dx, dt=0.08, steps_per_frame=6)

    return save_gif("heisenberg-uncertainty", frames, fps, captions)


def make_double_slit(width: int, fps: int, frames_n: int):
    """Interference pattern building up one detection at a time."""
    rng = np.random.default_rng(42)
    screen = np.linspace(-25, 25, 600)

    # Real two-slit intensity: envelope from slit width, fringes from separation.
    slit_sep, slit_w, wavelength, dist = 1.2, 0.28, 0.02, 40.0
    theta = np.arctan(screen / dist)
    beta = np.pi * slit_w * np.sin(theta) / wavelength
    delta = np.pi * slit_sep * np.sin(theta) / wavelength
    envelope = np.sinc(beta / np.pi) ** 2
    intensity = envelope * np.cos(delta) ** 2
    prob = intensity / intensity.sum()

    height = int(width * 0.55)
    frames, captions = [], []
    hits = np.zeros_like(screen)
    per_frame = 60

    for f in range(frames_n):
        idx = rng.choice(len(screen), size=per_frame, p=prob)
        np.add.at(hits, idx, 1)
        total = int(hits.sum())

        fig = figure(width, height)
        ax = fig.add_axes([0.09, 0.16, 0.87, 0.68])
        ax.bar(screen, hits, width=(screen[1] - screen[0]) * 1.6,
               color=ACCENT, alpha=0.85)
        ax.plot(screen, intensity * hits.max() / (intensity.max() + 1e-9),
                color=ACCENT_2, lw=1.6, alpha=0.9)
        ax.set_xlim(-25, 25)
        ax.set_yticks([])
        ax.set_xlabel("position on screen")
        ax.set_title("Double slit: fringes emerge from individual detections",
                     fontsize=12, color=INK, pad=14)
        ax.text(0.98, 0.95, f"detections: {total:,}", transform=ax.transAxes,
                ha="right", va="top", color=MUTED, fontsize=10, family="monospace")
        ax.text(0.015, 0.95, "prediction  $|\\Psi_1 + \\Psi_2|^2$", transform=ax.transAxes,
                color=ACCENT_2, fontsize=10, va="top")

        frames.append(fig_to_frame(fig))
        captions.append({"frame": f, "detections": total})

    return save_gif("double-slit-interference", frames, fps, captions)


def make_grover(width: int, fps: int, n_qubits: int, target: int):
    """Grover's algorithm on real amplitudes — oracle then diffusion, step by step."""
    N = 2 ** n_qubits
    amps = np.ones(N) / math.sqrt(N)
    optimal = int(round(math.pi / 4 * math.sqrt(N)))

    height = int(width * 0.55)
    frames, captions = [], []
    labels = [format(i, f"0{n_qubits}b") for i in range(N)]

    def draw(stage: str, iteration: int):
        fig = figure(width, height)
        ax = fig.add_axes([0.09, 0.22, 0.87, 0.62])
        colors = [ACCENT_2 if i == target else ACCENT for i in range(N)]
        ax.bar(range(N), amps, color=colors)
        ax.axhline(amps.mean(), color=GOOD, lw=1.2, ls="--", alpha=0.9)
        ax.set_xticks(range(N))
        ax.set_xticklabels(labels, rotation=90, fontsize=7, family="monospace")
        ax.set_ylim(-0.6, 1.05)
        ax.set_ylabel("amplitude")
        ax.set_title(f"Grover's search — {stage}", fontsize=12, color=INK, pad=14)
        p = amps[target] ** 2
        ax.text(0.98, 0.95,
                f"iteration {iteration}/{optimal}\nP(target) {p*100:5.1f}%",
                transform=ax.transAxes, ha="right", va="top",
                color=MUTED, fontsize=10, family="monospace")
        ax.text(0.015, 0.95, "dashed = mean amplitude", transform=ax.transAxes,
                color=GOOD, fontsize=9, va="top")
        return fig_to_frame(fig)

    frames.extend([draw("equal superposition after Hadamards", 0)] * 6)
    captions.append({"stage": "init", "p_target": round(float(amps[target] ** 2), 4)})

    for it in range(1, optimal + 1):
        amps[target] *= -1  # oracle: flip the sign of the marked state
        frames.extend([draw("oracle marks the target (sign flip)", it)] * 5)
        captions.append({"stage": f"oracle-{it}", "p_target": round(float(amps[target] ** 2), 4)})

        mean = amps.mean()
        amps = 2 * mean - amps  # diffusion: reflect about the mean
        frames.extend([draw("diffusion reflects about the mean", it)] * 5)
        captions.append({"stage": f"diffusion-{it}", "p_target": round(float(amps[target] ** 2), 4)})

    frames.extend([draw("measure — target found", optimal)] * 8)
    return save_gif("grover-amplitude-amplification", frames, fps, captions)


def make_bloch_precession(width: int, fps: int, frames_n: int):
    """A qubit precessing on the Bloch sphere under an Rz-style Hamiltonian."""
    height = int(width * 0.62)
    frames, captions = [], []
    theta = math.pi / 3  # fixed polar angle

    for f in range(frames_n):
        phi = 2 * math.pi * f / frames_n
        bx = math.sin(theta) * math.cos(phi)
        by = math.sin(theta) * math.sin(phi)
        bz = math.cos(theta)

        fig = figure(width, height)
        ax = fig.add_subplot(111, projection="3d")
        ax.set_facecolor(BG)

        u = np.linspace(0, 2 * np.pi, 40)
        v = np.linspace(0, np.pi, 20)
        ax.plot_wireframe(np.outer(np.cos(u), np.sin(v)),
                          np.outer(np.sin(u), np.sin(v)),
                          np.outer(np.ones_like(u), np.cos(v)),
                          color="#2a313d", linewidth=0.4)

        ax.quiver(0, 0, 0, bx, by, bz, color=ACCENT_2, linewidth=2.6, arrow_length_ratio=0.14)
        ax.plot([0, 0], [0, 0], [-1.25, 1.25], color="#3a4250", lw=0.9)
        ax.text(0, 0, 1.38, r"$|0\rangle$", color=MUTED, ha="center", fontsize=11)
        ax.text(0, 0, -1.5, r"$|1\rangle$", color=MUTED, ha="center", fontsize=11)

        ax.set_xlim(-1, 1); ax.set_ylim(-1, 1); ax.set_zlim(-1, 1)
        ax.set_box_aspect((1, 1, 1))
        ax.axis("off")
        ax.set_title("Phase evolution: the state precesses, probabilities do not change",
                     fontsize=11, color=INK, pad=2)

        p0 = math.cos(theta / 2) ** 2
        fig.text(0.5, 0.05,
                 f"$\\phi$ = {math.degrees(phi):5.0f}°     "
                 f"P(0) = {p0:.2f}   P(1) = {1-p0:.2f}   (constant)",
                 ha="center", color=MUTED, fontsize=10)

        frames.append(fig_to_frame(fig))
        captions.append({"frame": f, "phi_deg": round(math.degrees(phi), 1)})

    return save_gif("bloch-phase-precession", frames, fps, captions)


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

def build_all(width: int, fps: int, scale: float, only: str | None):
    w = int(width * scale)

    builders = {
        "schrodinger-derivation": lambda: render_derivation(
            "schrodinger-derivation",
            "Deriving the Schrödinger equation",
            SCHRODINGER_STEPS, w, fps=max(2, fps // 8), hold=1),
        "schrodinger-tunnelling": lambda: make_tunnelling(w, fps, frames_n=70, barrier=6.0),
        "heisenberg-uncertainty": lambda: make_free_spreading(w, fps, frames_n=60),
        "double-slit-interference": lambda: make_double_slit(w, fps, frames_n=60),
        "grover-amplitude-amplification": lambda: make_grover(w, fps, n_qubits=4, target=11),
        "bloch-phase-precession": lambda: make_bloch_precession(w, fps, frames_n=48),
    }

    if only:
        if only not in builders:
            print(f"Unknown animation '{only}'. Options: {', '.join(builders)}", file=sys.stderr)
            return 1
        builders = {only: builders[only]}

    print(f"\nGenerating physics animations at {w}px, {fps} fps -> {OUT_DIR}\n")
    for name, build in builders.items():
        build()
    print("\nDone. All frames are computed from the equations, not illustrated.\n")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="build a single animation by name")
    parser.add_argument("--width", type=int, default=900, help="base width in px")
    parser.add_argument("--fps", type=int, default=20)
    parser.add_argument("--scale", type=float, default=1.0,
                        help="resolution multiplier, e.g. 0.6 for smaller files")
    args = parser.parse_args()
    return build_all(args.width, args.fps, args.scale, args.only)


if __name__ == "__main__":
    sys.exit(main())
