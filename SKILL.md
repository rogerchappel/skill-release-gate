# skill-release-gate

Use this skill when an agent is preparing, reviewing, or packaging a reusable agent skill for public or team reuse.

## Required Inputs

- Path to the skill folder.
- Expected host or audience when known.
- Any release-candidate notes the maintainer wants checked.

## Required Tools

- Local shell access.
- Node.js 20 or newer for the CLI.
- Filesystem read access to the target skill folder.

## Side-Effect Boundaries

The checker reads local files and writes only when the user asks for redirected output. Do not publish, push, install, tag, or send reports externally without explicit approval.

## Workflow

1. Run `skill-release-gate check <path> --format markdown`.
2. If the status is `fail`, fix missing blockers such as activation, side-effect boundaries, or verification.
3. If the status is `warn`, decide whether warnings are acceptable for an incubating release.
4. Run `skill-release-gate check <path> --format json` for durable evidence when needed.

## Examples

```bash
skill-release-gate check ./fixtures/pass --format markdown
skill-release-gate check ./skills/repo-review --format json
```

## Validation

Run `npm test`, `npm run check`, `npm run build`, and `npm run smoke` before claiming the package is release-ready.

## Limitations

This skill is a heuristic packaging review. It does not prove safety, correctness, or host compatibility.
