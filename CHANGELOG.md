# Changelog

## Unreleased

- Preserve configured thresholds when the CLI does not receive `--threshold`, while retaining explicit
  CLI overrides and rejecting missing option values.
- Reject invalid thresholds, documentation lists, and waiver maps in config files.
- Reject unknown config fields and waiver check IDs before running release checks.
- Treat warning reports as blocking CLI results, consistently with release-check policy.

## 0.1.0

- Initial public CLI and skill package for local skill release-readiness checks,
  with fixture-backed tests, CLI smoke coverage, and package validation.
