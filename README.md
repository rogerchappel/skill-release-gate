# skill-release-gate

Local release-readiness checks for reusable agent skill folders.

`skill-release-gate` helps agents and maintainers catch missing activation guidance, inputs, side-effect boundaries, examples, verification workflow, fixtures, and release notes before a skill is shared.

## Quickstart

```bash
npm install
npm run smoke
node bin/skill-release-gate.js check fixtures/pass --format json
```

## CLI

```bash
skill-release-gate check <path> [--format markdown|json]
```

The command reads local files only. It exits with code `1` when a folder fails release blockers.

## What It Checks

- Activation guidance
- Required inputs
- Required tools
- Side-effect and approval boundaries
- Examples
- Verification workflow
- Limitations
- Release notes
- Fixture or example evidence

See `docs/CHECKS.md` for weights and blocker rules.

## Safety Notes

The tool does not install skills, publish packages, push branches, tag releases, or call remote APIs. Treat its score as reviewer evidence, not as a guarantee.

## Limitations

Checks are heuristic and text-based. A passing result means the package has enough evidence for release-candidate review, not that the skill is correct for every host.

## Release Candidate

See `docs/RELEASE_CANDIDATE.md` for verification evidence and open follow-ups.
