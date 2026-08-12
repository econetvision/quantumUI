/**
 * Content root resolution.
 *
 * QWorld notebooks and images are vendored into `content/qworld/` at the repo
 * root (see `content/qworld/SOURCES.md`). Everything that reads them resolves
 * through here so the app stays portable — no absolute paths baked into source.
 *
 * `QWORLD_CONTENT_ROOT` overrides the default, which is useful when the content
 * is mounted elsewhere (a Docker volume, a CI cache, a shared checkout).
 *
 * Server-only: this module touches `fs` and must never reach a client bundle.
 */

import fs from 'fs';
import path from 'path';

const CONTENT_SUBDIR = path.join('content', 'qworld');

/**
 * Walk up from the working directory looking for the repo root. Under
 * `next dev`/`next start` and npm scripts the cwd is already the project root,
 * but walking up keeps `tsx prisma/seed.ts` working when invoked from a
 * subdirectory. `__dirname` is deliberately not used — Turbopack rewrites it to
 * a path inside `.next/server`.
 */
function findAppRoot(): string {
  let dir = process.cwd();

  for (let depth = 0; depth < 8; depth += 1) {
    if (fs.existsSync(path.join(dir, CONTENT_SUBDIR))) return dir;
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'next.config.ts'))) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return process.cwd();
}

/** Repo root. */
export const APP_ROOT = findAppRoot();

/** Directory holding the vendored QWorld modules. */
export const QWORLD_CONTENT_ROOT =
  process.env.QWORLD_CONTENT_ROOT ?? path.join(APP_ROOT, CONTENT_SUBDIR);

/** Resolve a path inside the QWorld content tree. */
export function qworldPath(...segments: string[]): string {
  return path.join(QWORLD_CONTENT_ROOT, ...segments);
}

/** True when the vendored content is actually present on disk. */
export function hasQworldContent(): boolean {
  return fs.existsSync(QWORLD_CONTENT_ROOT);
}

/**
 * Human-readable hint for scripts that cannot proceed without the content.
 * Kept here so the message stays consistent across seed/extract entry points.
 */
export function missingContentMessage(): string {
  return [
    `QWorld content not found at ${QWORLD_CONTENT_ROOT}.`,
    'Expected the vendored modules committed under content/qworld/.',
    'See content/qworld/SOURCES.md to restore them, or set QWORLD_CONTENT_ROOT',
    'to point at an existing checkout.',
  ].join('\n');
}
