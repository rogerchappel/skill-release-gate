# Release Candidate Notes

## Classification

Ship.

## Included

- Local Node CLI.
- Readiness scoring engine.
- Markdown and JSON renderers.
- Pass, warn, fail, and waived fixtures.
- Configured waiver reporting with visible reasons.
- Skill instructions and required project docs.

## Verification

Run before release-candidate approval:

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## 2026-06-20 Local Evidence

- `npm test` passed with 7 tests.
- `npm run check` passed syntax checks.
- `npm run build` wrote `dist/package-check.txt`.
- `npm run smoke` produced a passing Markdown report for `fixtures/pass`.
- `bash scripts/validate.sh` reran the full validation sequence successfully.

## 2026-07-05 Local Evidence

- Added config-based check waivers with JSON and Markdown report output.
- Added a waived fixture that proves reasons remain visible.
- Verification reran tests, checks, build, smoke, and validation successfully.

## Known Limits

- Text heuristics can miss nuanced unsafe wording.
- Host-specific packaging compatibility is outside V1.
