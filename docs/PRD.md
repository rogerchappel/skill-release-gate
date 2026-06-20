# Product Requirements: skill-release-gate

## Goal

Provide a local-first release-readiness gate for reusable agent skill folders.

## Users

- Agent skill authors preparing public release candidates.
- Maintainers reviewing skill PRs.
- Coding agents checking their own skill packaging work.

## Requirements

- Inspect only local files.
- Support Markdown and JSON output.
- Score activation, inputs, tools, side effects, examples, verification, limitations, release notes, and fixture evidence.
- Fail when required release blockers are missing.
- Include deterministic fixtures and tests.

## Non-goals

- Installing skills into hosts.
- Publishing packages.
- Replacing human review.
