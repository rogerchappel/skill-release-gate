# Release Candidate Notes

## Classification

Ship.

## Included

- Local Node CLI.
- Readiness scoring engine.
- Markdown and JSON renderers.
- Pass, warn, and fail fixtures.
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

## Known Limits

- Text heuristics can miss nuanced unsafe wording.
- Host-specific packaging compatibility is outside V1.
