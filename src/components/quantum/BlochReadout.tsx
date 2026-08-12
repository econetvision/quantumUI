'use client';

import type { BlochVector } from '@/lib/quantum-client';

/**
 * Per-qubit Bloch vectors, rendered from real statevector data.
 *
 * The projection is deliberately simple — an orthographic view down a tilted
 * axis — because the teaching point is *where the vector sits*, in particular
 * that an entangled qubit's vector shrinks toward the centre. A vector of
 * length 0 is drawn as a dot at the origin with an explicit "maximally mixed"
 * label, since an arrow of zero length would otherwise just disappear.
 */
function BlochGlyph({ vector }: { vector: BlochVector }) {
  const size = 120;
  const radius = 46;
  const cx = size / 2;
  const cy = size / 2;

  // Orthographic projection: x goes right-and-down, y right-and-up, z straight up.
  const tilt = 0.42;
  const px = cx + vector.x * radius * 0.85 + vector.y * radius * 0.5;
  const py = cy - vector.z * radius + vector.x * radius * tilt * 0.4 - vector.y * radius * tilt * 0.4;

  const isMixed = vector.length < 0.02;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-28 w-28 shrink-0"
      role="img"
      aria-label={
        isMixed
          ? `Qubit ${vector.qubit} is maximally mixed — its Bloch vector is at the origin`
          : `Qubit ${vector.qubit} Bloch vector: x ${vector.x.toFixed(2)}, y ${vector.y.toFixed(2)}, z ${vector.z.toFixed(2)}`
      }
    >
      {/* Sphere */}
      <circle cx={cx} cy={cy} r={radius} fill="var(--q-sphere)" stroke="var(--q-axis)" strokeWidth="1" />
      {/* Equator */}
      <ellipse cx={cx} cy={cy} rx={radius} ry={radius * tilt} fill="none" stroke="var(--q-axis)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Z axis */}
      <line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke="var(--q-axis)" strokeWidth="1" />

      <text x={cx} y={cy - radius - 4} textAnchor="middle" className="fill-[var(--text-subtle)]" fontSize="9" fontFamily="monospace">
        |0⟩
      </text>
      <text x={cx} y={cy + radius + 11} textAnchor="middle" className="fill-[var(--text-subtle)]" fontSize="9" fontFamily="monospace">
        |1⟩
      </text>

      {isMixed ? (
        <circle cx={cx} cy={cy} r="4" fill="var(--q-one)" />
      ) : (
        <>
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="var(--q-one)" strokeWidth="2.5" strokeLinecap="round" />
          {/* 2px surface ring keeps the head legible where it overlaps the sphere edge */}
          <circle cx={px} cy={py} r="4.5" fill="var(--q-one)" stroke="var(--surface-raised)" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

export function BlochReadout({ vectors }: { vectors: BlochVector[] }) {
  if (!vectors.length) return null;

  const anyMixed = vectors.some((vector) => vector.length < 0.98);

  return (
    <div>
      <h3 className="font-mono text-sm font-bold">Bloch vectors</h3>
      <p className="mt-1 text-xs leading-relaxed text-content-muted">
        Computed from the reduced density matrix of each qubit. Length 1 means a
        pure state on the sphere surface; shorter means the qubit is entangled
        with the rest of the register.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {vectors.map((vector) => (
          <div
            key={vector.qubit}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3"
          >
            <BlochGlyph vector={vector} />
            <dl className="min-w-0 flex-1 text-xs">
              <dt className="font-mono font-bold text-content">
                qubit {vector.qubit}
              </dt>
              <dd className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono tabular-nums text-content-muted">
                <span className="text-content-subtle">x</span>
                <span>{vector.x.toFixed(3)}</span>
                <span className="text-content-subtle">y</span>
                <span>{vector.y.toFixed(3)}</span>
                <span className="text-content-subtle">z</span>
                <span>{vector.z.toFixed(3)}</span>
                <span className="text-content-subtle">|r|</span>
                <span>{vector.length.toFixed(3)}</span>
              </dd>
              <dd className="mt-1.5 text-content-subtle">
                {vector.length < 0.02
                  ? 'maximally mixed'
                  : vector.length > 0.98
                    ? 'pure state'
                    : 'partially mixed'}
              </dd>
            </dl>
          </div>
        ))}
      </div>

      {anyMixed && (
        <p className="mt-3 rounded-lg border border-line bg-surface-raised p-3 text-xs leading-relaxed text-content-muted">
          At least one qubit sits inside the sphere. That is the signature of
          entanglement: the register as a whole is in a pure state, but no
          single qubit has a definite state of its own.
        </p>
      )}
    </div>
  );
}
