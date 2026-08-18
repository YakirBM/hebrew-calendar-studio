# QA evidence

This directory contains packaged visual and machine-readable evidence from the
layout and print test runs.

- `layout-test-results.json` — measurements and assertions for the final SVG
  calendar renderer.
- `final-a4-preview.png` — representative A4 preview.
- `examples/` — representative A4, A3, and explicitly multi-page PDF exports.
- `test-artifacts/`, `layout-artifacts/`, and `clipping-diagnostics/` — generated
  when `run-tests.ps1` is executed; these folders are intentionally ignored by
  Git because they are reproducible.

The PDFs are QA examples, not user data templates. Generate current calendars
from `../index.html`.
