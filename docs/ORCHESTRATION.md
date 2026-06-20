# Orchestration

Agents should run this tool before proposing a public skill release.

1. Inspect the target skill folder.
2. Run `skill-release-gate check <path> --format markdown`.
3. Fix any failing checks before opening a release-candidate PR.
4. Attach JSON output when a reviewer needs machine-readable evidence.

The command performs local file reads only. It does not publish, install, push, or contact remote services.
