#!/usr/bin/env python3
"""
Generate the history-of-quantum-mechanics animations.

Companion to `generate_physics_animations.py`, sharing its rendering helpers.
The same rule applies: anything numeric is computed, not asserted. The Bohr
spectral lines come from the Rydberg formula, the Born-rule convergence comes
from actually sampling a distribution, and the blackbody curves come from
evaluating Planck's law against the Rayleigh-Jeans limit.

Usage:
    python3 scripts/generate_history_animations.py [--only NAME] [--width 900]
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys

import numpy as np

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_physics_animations import (  # noqa: E402
    ACCENT, ACCENT_2, BG, GOOD, INK, MUTED, OUT_DIR,
    figure, fig_to_frame, save_gif,
)

# ---------------------------------------------------------------------------
# 1. The pioneers — a timeline that builds
# ---------------------------------------------------------------------------

PIONEERS = [
    (1900, "Max Planck",
     r"$E = h\nu$",
     "Energy comes in discrete packets. Planck called it 'an act of desperation' — "
     "it was the only way to fix the blackbody catastrophe."),
    (1905, "Albert Einstein",
     r"$E_{max} = h\nu - \phi$",
     "The photoelectric effect. Light itself is quantised, not just its emission. "
     "This — not relativity — won him the Nobel Prize."),
    (1913, "Niels Bohr",
     r"$E_n = -\frac{13.6\ \mathrm{eV}}{n^2}$",
     "Electrons occupy fixed orbits and jump between them. It explained hydrogen's "
     "spectrum exactly, and nothing heavier."),
    (1924, "Louis de Broglie",
     r"$\lambda = \frac{h}{p}$",
     "If waves can be particles, particles can be waves. A PhD thesis so bold his "
     "examiners sent it to Einstein to check."),
    (1925, "Werner Heisenberg",
     r"$\sigma_x\,\sigma_p \geq \frac{\hbar}{2}$",
     "Matrix mechanics, and the uncertainty principle. Position and momentum cannot "
     "both be sharp — not from clumsy measurement, but in principle."),
    (1926, "Erwin Schrödinger",
     r"$i\hbar\frac{\partial\Psi}{\partial t} = \hat{H}\Psi$",
     "Wave mechanics. A continuous equation that reproduced Bohr's discrete levels "
     "as its natural solutions."),
    (1926, "Max Born",
     r"$P(x) = |\Psi(x)|^2$",
     "What Ψ actually means: not a physical wave, but a probability amplitude. "
     "The interpretation Einstein never accepted."),
    (1928, "Paul Dirac",
     r"$(i\gamma^\mu\partial_\mu - m)\psi = 0$",
     "Quantum mechanics made relativistic. The equation demanded antimatter exist — "
     "and four years later the positron was found."),
    (1935, "Einstein, Podolsky, Rosen",
     r"$|\Psi\rangle = \frac{1}{\sqrt{2}}(|01\rangle - |10\rangle)$",
     "The EPR paradox: entanglement implies 'spooky action at a distance'. Intended "
     "to show quantum mechanics was incomplete."),
    (1964, "John Bell",
     r"$|S| \leq 2 \quad \mathrm{(classical)}$",
     "Bell turned EPR into a testable inequality. Experiments violate it — nature "
     "really is non-local. Nobel Prize, 2022."),
]


def make_pioneers(width: int, fps: int, hold: int):
    frames = []
    height = int(width * 0.66)
    years = [p[0] for p in PIONEERS]
    y_min, y_max = min(years) - 3, max(years) + 3

    for idx in range(len(PIONEERS)):
        year, who, equation, note = PIONEERS[idx]

        fig = figure(width, height)
        ax = fig.add_axes([0, 0, 1, 1])
        ax.axis("off")

        ax.text(0.5, 0.955, "How quantum mechanics was built",
                ha="center", va="top", fontsize=15, color=INK, weight="bold")

        # Timeline rail with a marker per discovery, revealed as we go.
        rail_y = 0.80
        ax.plot([0.07, 0.93], [rail_y, rail_y], color="#2a313d", lw=1.6,
                transform=ax.transAxes)

        for j, (yr, *_rest) in enumerate(PIONEERS):
            frac = (yr - y_min) / (y_max - y_min)
            x = 0.07 + frac * 0.86
            done = j <= idx
            ax.plot([x], [rail_y], marker="o", markersize=9 if j == idx else 5,
                    color=ACCENT_2 if j == idx else (ACCENT if done else "#39414f"),
                    transform=ax.transAxes)
            if j == idx:
                ax.text(x, rail_y + 0.045, str(yr), ha="center", va="bottom",
                        fontsize=10, color=ACCENT_2, family="monospace",
                        transform=ax.transAxes)

        ax.text(0.5, 0.655, f"{year}   ·   {who}", ha="center", va="center",
                fontsize=15, color=ACCENT, weight="bold")
        ax.text(0.5, 0.50, equation, ha="center", va="center", fontsize=25, color=INK)

        # Wrap the note by hand — matplotlib's wrap ignores axes-fraction width.
        words, lines, line = note.split(), [], ""
        for word in words:
            if len(line) + len(word) + 1 > 74:
                lines.append(line)
                line = word
            else:
                line = f"{line} {word}".strip()
        lines.append(line)
        for k, text in enumerate(lines):
            ax.text(0.5, 0.33 - k * 0.055, text, ha="center", va="center",
                    fontsize=11, color=MUTED)

        ax.text(0.5, 0.06, f"{idx + 1} of {len(PIONEERS)}", ha="center", va="center",
                fontsize=9, color="#5b6473", family="monospace")

        frames.extend([fig_to_frame(fig)] * hold)

    captions = [{"year": y, "who": w, "equation": e, "note": n}
                for y, w, e, n in PIONEERS]
    return save_gif("quantum-pioneers", frames, fps, captions)


# ---------------------------------------------------------------------------
# 2. Bohr model — real spectral lines from the Rydberg formula
# ---------------------------------------------------------------------------

RYDBERG = 1.0973731568e7  # m^-1


def hydrogen_wavelength_nm(n_hi: int, n_lo: int) -> float:
    inv = RYDBERG * (1 / n_lo ** 2 - 1 / n_hi ** 2)
    return 1e9 / inv


def wavelength_to_rgb(nm: float):
    """Approximate visible-spectrum colour, for drawing real emission lines."""
    if nm < 380 or nm > 750:
        return (0.55, 0.55, 0.62)  # outside visible: grey
    if nm < 440:
        r, g, b = -(nm - 440) / 60, 0.0, 1.0
    elif nm < 490:
        r, g, b = 0.0, (nm - 440) / 50, 1.0
    elif nm < 510:
        r, g, b = 0.0, 1.0, -(nm - 510) / 20
    elif nm < 580:
        r, g, b = (nm - 510) / 70, 1.0, 0.0
    elif nm < 645:
        r, g, b = 1.0, -(nm - 645) / 65, 0.0
    else:
        r, g, b = 1.0, 0.0, 0.0
    return (min(r, 1), min(g, 1), min(b, 1))


def make_bohr_atom(width: int, fps: int):
    """Balmer series: electron drops to n=2, emitting a photon of computed wavelength."""
    transitions = [(6, 2), (5, 2), (4, 2), (3, 2)]
    height = int(width * 0.60)
    frames, captions = [], []

    levels = range(1, 7)
    energies = {n: -13.605693 / n ** 2 for n in levels}

    for t_index, (n_hi, n_lo) in enumerate(transitions):
        lam = hydrogen_wavelength_nm(n_hi, n_lo)
        colour = wavelength_to_rgb(lam)
        dE = energies[n_hi] - energies[n_lo]

        for phase in range(10):
            fig = figure(width, height)
            ax = fig.add_axes([0.10, 0.12, 0.52, 0.76])

            for n in levels:
                e = energies[n]
                ax.hlines(e, 0, 1, color="#39414f", lw=1.4)
                ax.text(1.03, e, f"n={n}   {e:6.2f} eV", va="center",
                        fontsize=9, color=MUTED, family="monospace")

            # Electron: sits high, then drops as the phase advances.
            frac = min(1.0, phase / 6)
            e_now = energies[n_hi] + (energies[n_lo] - energies[n_hi]) * frac
            ax.plot([0.5], [e_now], marker="o", markersize=11, color=ACCENT_2)

            if phase >= 6:
                ax.annotate("", xy=(0.5, energies[n_lo]), xytext=(0.5, energies[n_hi]),
                            arrowprops=dict(arrowstyle="->", color=colour, lw=2.0))

            ax.set_ylim(-14.5, 0.6)
            ax.set_xlim(0, 1)
            ax.set_xticks([])
            ax.set_ylabel("energy (eV)")
            ax.set_title("Bohr model — hydrogen", fontsize=12, color=INK, pad=12)

            # Emission spectrum panel, accumulating the lines already emitted.
            ax2 = fig.add_axes([0.70, 0.12, 0.27, 0.76])
            ax2.set_xlim(380, 700)
            ax2.set_ylim(0, 1)
            ax2.set_yticks([])
            ax2.set_xlabel("wavelength (nm)")
            ax2.set_title("Balmer lines", fontsize=11, color=INK, pad=12)
            for prev in range(t_index + (1 if phase >= 6 else 0)):
                p_hi, p_lo = transitions[prev]
                p_lam = hydrogen_wavelength_nm(p_hi, p_lo)
                ax2.vlines(p_lam, 0, 1, color=wavelength_to_rgb(p_lam), lw=3)
                ax2.text(p_lam, 1.02, f"{p_lam:.0f}", ha="center", fontsize=8,
                         color=MUTED, rotation=90, va="bottom")

            fig.text(0.5, 0.025,
                     f"n={n_hi} → n={n_lo}     ΔE = {dE:.2f} eV     λ = {lam:.1f} nm"
                     "     (Rydberg formula)",
                     ha="center", color=MUTED, fontsize=10, family="monospace")

            frames.append(fig_to_frame(fig))

        captions.append({"transition": f"{n_hi}->{n_lo}",
                         "delta_eV": round(dE, 4),
                         "wavelength_nm": round(lam, 2)})

    return save_gif("bohr-hydrogen-spectrum", frames, fps, captions)


# ---------------------------------------------------------------------------
# 3. Born rule — probability emerging from repeated measurement
# ---------------------------------------------------------------------------


def make_born_rule(width: int, fps: int, frames_n: int):
    """Sample a real |Ψ|² and watch the histogram converge onto it."""
    rng = np.random.default_rng(7)
    x = np.linspace(-6, 6, 240)

    # A superposition of two Gaussians: a distribution with real structure.
    psi = (np.exp(-((x + 2.0) ** 2) / 1.4) + 0.85 * np.exp(-((x - 1.8) ** 2) / 0.9))
    density = psi ** 2
    density /= np.trapezoid(density, x)
    prob = density / density.sum()

    height = int(width * 0.55)
    frames, captions = [], []
    counts = np.zeros_like(x)
    per_frame = 45

    for f in range(frames_n):
        idx = rng.choice(len(x), size=per_frame, p=prob)
        np.add.at(counts, idx, 1)
        total = int(counts.sum())

        # Normalise the histogram the same way as the density, so the two are
        # directly comparable rather than merely similar in shape.
        norm = counts / (counts.sum() * (x[1] - x[0])) if counts.sum() else counts
        err = float(np.trapezoid(np.abs(norm - density), x))

        fig = figure(width, height)
        ax = fig.add_axes([0.09, 0.16, 0.87, 0.68])
        ax.bar(x, norm, width=(x[1] - x[0]) * 1.05, color=ACCENT, alpha=0.85)
        ax.plot(x, density, color=ACCENT_2, lw=2.2)
        ax.set_xlim(-6, 6)
        ax.set_ylim(0, density.max() * 1.5)
        ax.set_yticks([])
        ax.set_xlabel("position  x")
        ax.set_title("Born's rule: measurements converge on $|\\Psi|^2$",
                     fontsize=12, color=INK, pad=14)
        ax.text(0.015, 0.95, r"$|\Psi(x)|^2$  (theory)", transform=ax.transAxes,
                color=ACCENT_2, fontsize=10, va="top")
        ax.text(0.015, 0.87, "measurements", transform=ax.transAxes,
                color=ACCENT, fontsize=10, va="top")
        ax.text(0.98, 0.95, f"N = {total:,}\nL¹ error = {err:.3f}",
                transform=ax.transAxes, ha="right", va="top",
                color=MUTED, fontsize=10, family="monospace")

        frames.append(fig_to_frame(fig))
        captions.append({"frame": f, "samples": total, "l1_error": round(err, 4)})

    return save_gif("born-rule-convergence", frames, fps, captions)


# ---------------------------------------------------------------------------
# 4. Planck vs Rayleigh-Jeans — the catastrophe that started it
# ---------------------------------------------------------------------------


def make_blackbody(width: int, fps: int):
    """Planck's law against the classical prediction that diverges."""
    h, c, kB = 6.62607015e-34, 2.99792458e8, 1.380649e-23
    lam = np.linspace(50e-9, 3000e-9, 600)

    height = int(width * 0.55)
    frames, captions = [], []
    temps = np.linspace(3000, 7000, 40)

    for T in temps:
        planck = (2 * h * c ** 2 / lam ** 5) / (np.exp(h * c / (lam * kB * T)) - 1)
        rj = 2 * c * kB * T / lam ** 4  # classical: diverges as λ → 0

        peak_nm = lam[np.argmax(planck)] * 1e9
        wien_nm = 2.897771955e-3 / T * 1e9  # Wien's displacement law

        fig = figure(width, height)
        ax = fig.add_axes([0.11, 0.16, 0.85, 0.68])
        ax.plot(lam * 1e9, planck / 1e12, color=ACCENT, lw=2.4, label="Planck (quantised)")
        ax.plot(lam * 1e9, rj / 1e12, color=ACCENT_2, lw=1.8, ls="--",
                label="Rayleigh–Jeans (classical)")
        ax.set_xlim(0, 3000)
        ax.set_ylim(0, (planck.max() / 1e12) * 1.5)
        ax.set_xlabel("wavelength (nm)")
        ax.set_ylabel("spectral radiance")
        ax.set_yticks([])
        ax.set_title("The ultraviolet catastrophe — and Planck's fix",
                     fontsize=12, color=INK, pad=14)
        ax.legend(loc="upper right", frameon=False, fontsize=9, labelcolor=MUTED)
        ax.text(0.015, 0.95,
                f"T = {T:.0f} K\npeak {peak_nm:6.0f} nm\nWien {wien_nm:6.0f} nm",
                transform=ax.transAxes, va="top",
                color=MUTED, fontsize=10, family="monospace")

        frames.append(fig_to_frame(fig))
        captions.append({"T": round(float(T)), "peak_nm": round(float(peak_nm), 1),
                         "wien_nm": round(float(wien_nm), 1)})

    return save_gif("planck-blackbody", frames, fps, captions)


# ---------------------------------------------------------------------------

def build_all(width: int, fps: int, only: str | None):
    builders = {
        "quantum-pioneers": lambda: make_pioneers(width, fps=max(2, fps // 10), hold=1),
        "bohr-hydrogen-spectrum": lambda: make_bohr_atom(width, fps=8),
        "born-rule-convergence": lambda: make_born_rule(width, fps, frames_n=55),
        "planck-blackbody": lambda: make_blackbody(width, fps=12),
    }

    if only:
        if only not in builders:
            print(f"Unknown: {only}. Options: {', '.join(builders)}", file=sys.stderr)
            return 1
        builders = {only: builders[only]}

    print(f"\nGenerating history animations at {width}px -> {OUT_DIR}\n")
    for build in builders.values():
        build()
    print("\nDone.\n")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only")
    parser.add_argument("--width", type=int, default=900)
    parser.add_argument("--fps", type=int, default=20)
    args = parser.parse_args()
    return build_all(args.width, args.fps, args.only)


if __name__ == "__main__":
    sys.exit(main())
