import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Only the pure libraries are gated. Components need a DOM runner and a
      // different kind of test; holding them to a line-coverage number here
      // would measure the wrong thing.
      include: ['src/lib/quantum-sim.ts', 'src/components/learning/constants.ts'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
