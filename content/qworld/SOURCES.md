# QWorld Content Sources

These directories are vendored copies of QWorld's open educational materials.
They were cloned from GitLab and their `.git` directories were detached so the
content ships as part of this repository rather than as nested clones.

The app reads notebooks and images from here at build/seed time. See
`src/lib/content-paths.ts` for how the root is resolved.

| Directory | Upstream | Branch | Vendored commit |
| --- | --- | --- | --- |
| `qbook101` | https://gitlab.com/qworld/qeducation/qbook101.git | `main` | `1f8f623cfce7118ace64ac38443f4a1a275f47f2` |
| `adequate-qbook1` | https://gitlab.com/qworld/qeducation/educational-materials/adequate-qbook1.git | `main` | `541eb54cb17851627d709be71703fcd4c5697046` |
| `silver-qcourse511` | https://gitlab.com/qworld/qeducation/educational-materials/silver-qcourse511.git | `master` | `82cd6e002762bfc850134ae9ea66360db81d5622` |
| `qkd` | https://gitlab.com/qworld/qeducation/educational-materials/self-study-modules/qkd.git | `main` | `451f896620f94c0652d71d1e926ab8c501bbdc16` |
| `qec` | https://gitlab.com/qworld/qeducation/educational-materials/self-study-modules/qec.git | `main` | `c745c22814ae34968cbe679c059f59e0980f559a` |
| `tqc` | https://gitlab.com/qworld/qeducation/educational-materials/self-study-modules/tqc.git | `main` | `3fdaf922c48000618049ec76f8442bf2cec60d85` |
| `qnickel-qcourse511-2` | https://gitlab.com/qworld/qeducation/educational-materials/self-study-modules/qnickel-qcourse511-2.git | `main` | `82b8e763e2432b5f56c33cb06f0e2e18ef1de10c` |

## Refreshing a module

```bash
cd content/qworld
rm -rf qbook101
git clone --depth 1 https://gitlab.com/qworld/qeducation/qbook101.git qbook101
rm -rf qbook101/.git
```

Then re-run the extraction scripts so derived data picks up the change:

```bash
npm run content:labs     # regenerates src/data/labs/lab-questions.json
npm run db:seed          # re-seeds tracks/lessons from notebooks
```

## Licensing

QWorld materials are released under Creative Commons / GPL terms that vary per
module — each directory keeps its own `LICENSE*` and `README.md`. Those files
were preserved verbatim; consult them before redistributing.
