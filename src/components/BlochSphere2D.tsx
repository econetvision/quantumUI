"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface BlochSphere2DProps {
  theta?: number;
  phi?: number;
  showControls?: boolean;
}

export default function BlochSphere2D({ theta = Math.PI / 4, phi = 0, showControls = true }: BlochSphere2DProps) {
  const [angle, setAngle] = useState({ theta, phi });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Re-render the canvas when the theme flips; colours are read from CSS vars.
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Read theme tokens rather than hardcoding hexes, so the sphere matches
    // the palette in both light and dark mode.
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;

    const accent = token('--q-zero', '#4d8dff');
    const vector = token('--q-one', '#d9752e');
    const axis = token('--q-axis', 'rgba(255,255,255,0.28)');
    const label = token('--text-muted', '#a4aebd');

    const draw = () => {
      // Size to the element's CSS box and scale for device pixel ratio, so the
      // sphere is responsive and stays crisp on high-DPI screens. It was
      // previously a fixed 400x400 that overflowed narrow phones.
      const rect = canvas.getBoundingClientRect();
      const cssSize = Math.max(220, Math.min(rect.width, 420));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      canvas.style.height = `${cssSize}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssSize, cssSize);

      const centerX = cssSize / 2;
      const centerY = cssSize / 2;
      // Leave room for the basis-state labels around the edge.
      const radius = cssSize / 2 - 46;

      // Sphere outline
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Axes
      ctx.strokeStyle = axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - radius - 14, centerY);
      ctx.lineTo(centerX + radius + 14, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 14);
      ctx.lineTo(centerX, centerY + radius + 14);
      ctx.stroke();

      // Basis labels
      ctx.fillStyle = label;
      ctx.font = '13px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('|0⟩', centerX, centerY - radius - 22);
      ctx.fillText('|1⟩', centerX, centerY + radius + 32);
      ctx.textAlign = 'left';
      ctx.fillText('|+⟩', centerX + radius + 18, centerY + 4);
      ctx.textAlign = 'right';
      ctx.fillText('|−⟩', centerX - radius - 18, centerY + 4);
      ctx.textAlign = 'left';

      // State vector
      const x = Math.sin(angle.theta) * Math.cos(angle.phi);
      const z = Math.cos(angle.theta);
      const projX = centerX + x * radius;
      const projY = centerY - z * radius;

      ctx.strokeStyle = vector;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(projX, projY);
      ctx.stroke();

      // Arrowhead
      const arrowAngle = Math.atan2(projY - centerY, projX - centerX);
      const arrowSize = 10;
      ctx.fillStyle = vector;
      ctx.beginPath();
      ctx.moveTo(projX, projY);
      ctx.lineTo(
        projX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
        projY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
      );
      ctx.lineTo(
        projX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
        projY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // State point
      ctx.beginPath();
      ctx.arc(projX, projY, 6, 0, 2 * Math.PI);
      ctx.fill();
    };

    draw();

    // Redraw on resize so the sphere tracks the container width.
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [angle, theme]);

  const prob0 = Math.cos(angle.theta / 2) ** 2;
  const prob1 = Math.sin(angle.theta / 2) ** 2;

  const getStateName = () => {
    if (Math.abs(angle.theta) < 0.1) return "|0⟩";
    if (Math.abs(angle.theta - Math.PI) < 0.1) return "|1⟩";
    if (Math.abs(angle.theta - Math.PI / 2) < 0.1) {
      if (Math.abs(angle.phi) < 0.1) return "|+⟩";
      if (Math.abs(angle.phi - Math.PI) < 0.1) return "|-⟩";
    }
    return "Superposition";
  };

  const presetStates = [
    { name: "|0⟩", theta: 0, phi: 0 },
    { name: "|1⟩", theta: Math.PI, phi: 0 },
    { name: "|+⟩", theta: Math.PI / 2, phi: 0 },
    { name: "|-⟩", theta: Math.PI / 2, phi: Math.PI },
    { name: "|+i⟩", theta: Math.PI / 2, phi: Math.PI / 2 },
    { name: "|-i⟩", theta: Math.PI / 2, phi: 3 * Math.PI / 2 },
  ];

  return (
    <div className="w-full overflow-hidden rounded-lg border border-line bg-surface">
      <div className="grid lg:grid-cols-3">
        {/* Bloch Sphere Visualization */}
        <div className="relative p-4 sm:p-6 lg:col-span-2">
          <div className="mb-3 inline-block rounded-lg border border-line bg-surface-overlay px-3 py-1.5">
            <div className="font-mono text-sm font-bold text-accent">
              State: {getStateName()}
            </div>
          </div>

          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Bloch sphere showing the state ${getStateName()}, theta ${angle.theta.toFixed(2)} radians, phi ${angle.phi.toFixed(2)} radians`}
            className="mx-auto block w-full max-w-[420px]"
          />

          <div className="text-center mt-4 text-content-muted text-sm">
            <p>2D projection of Bloch sphere</p>
            <p className="text-xs mt-1">Adjust θ and φ with the controls</p>
          </div>
        </div>

        {/* Controls Panel */}
        {showControls && (
          <div className="border-t border-line bg-surface-raised p-4 sm:p-6 lg:border-l lg:border-t-0">
            <h3 className="text-xl font-mono font-bold text-quantum-accent mb-4">
              Quantum State Controls
            </h3>

            {/* Probability display */}
            <div className="mb-6 p-4 bg-quantum-bg rounded-lg border border-quantum-accent/20">
              <div className="text-sm text-content-muted mb-2">Measurement Probabilities:</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-mono">|0⟩</span>
                  <span className="text-content font-mono">{(prob0 * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-sunken rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${prob0 * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-purple-400 font-mono">|1⟩</span>
                  <span className="text-content font-mono">{(prob1 * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-sunken rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${prob1 * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Angle controls */}
            <div className="mb-6">
              <label className="block text-sm text-content-muted mb-2">
                θ (Theta): {(angle.theta * 180 / Math.PI).toFixed(1)}°
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.01"
                value={angle.theta}
                onChange={(e) => setAngle({ ...angle, theta: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-quantum-accent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-content-muted mb-2">
                φ (Phi): {(angle.phi * 180 / Math.PI).toFixed(1)}°
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.01"
                value={angle.phi}
                onChange={(e) => setAngle({ ...angle, phi: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface-sunken rounded-lg appearance-none cursor-pointer accent-quantum-accent"
              />
            </div>

            {/* Preset states */}
            <div className="mb-6">
              <h4 className="text-sm font-mono font-bold text-content-muted mb-3">Preset States:</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetStates.map((state) => (
                  <button
                    key={state.name}
                    onClick={() => setAngle({ theta: state.theta, phi: state.phi })}
                    className="px-3 py-2 bg-quantum-accent/10 border border-quantum-accent/30 rounded-lg text-quantum-accent font-mono text-sm hover:bg-quantum-accent/20 transition-all"
                  >
                    {state.name}
                  </button>
                ))}
              </div>
            </div>

            {/* State vector info */}
            <div className="p-4 bg-quantum-bg rounded-lg border border-quantum-accent/20">
              <div className="text-xs text-content-muted mb-2">State Vector:</div>
              <div className="font-mono text-sm text-quantum-accent">
                |ψ⟩ = {(Math.cos(angle.theta / 2)).toFixed(3)}|0⟩
                {Math.sin(angle.theta / 2) >= 0 ? ' + ' : ' '}
                {(Math.sin(angle.theta / 2)).toFixed(3)}|1⟩
              </div>
            </div>

            {/* Info box */}
            <div className="mt-6 p-4 bg-quantum-purple/10 border border-quantum-purple/30 rounded-lg">
              <div className="text-xs text-quantum-purple">
                💡 <strong>Tip:</strong> Adjust θ and φ sliders to explore different quantum states!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
