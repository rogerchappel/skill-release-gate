# Security Policy

## Supported Versions

This project is a v0.1.0 public CLI and skill package. Security fixes are made
on the default branch until a stable release line exists.

## Reporting a Vulnerability

Please report suspected vulnerabilities through GitHub private vulnerability
reporting when available, or by opening a minimal public issue that avoids
sharing private skill bundles, credentials, access tokens, proprietary workflow
details, or unpublished workspace contents.

Include the affected version or commit, reproduction steps using synthetic
fixtures, and the expected impact. Do not include private skill source or live
approval workflows in public reports.

## Data Handling

The CLI reads local skill folders and emits release-readiness reports. It should
not install skills, publish packages, tag releases, call remote APIs, or mutate
external systems.
