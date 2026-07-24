# Checks

`skill-release-gate` scores a skill folder across nine readiness categories.

| Check | Weight | Fails release? |
| --- | ---: | --- |
| Activation guidance | 15 | Yes |
| Required inputs | 10 | Yes |
| Tool requirements | 10 | No |
| Side-effect boundaries | 15 | Yes |
| Examples | 10 | No |
| Verification workflow | 15 | Yes |
| Limitations | 10 | No |
| Release notes | 10 | No |
| Fixture evidence | 5 | No |

The default passing threshold is 70, but any failing blocker keeps the status at `fail`.

## Config

Skill folders can include `.skill-release-gate.json` or `skill-release-gate.config.json`.

Supported keys:

- `threshold`: default score threshold for that folder when the CLI does not receive `--threshold`.
- `extraRequiredDocs`: additional local documentation paths that must exist.
- `ignoreRequiredDocs`: default documentation paths to skip for that folder.
- `waivers`: object mapping a check id to the human-readable reason it is waived.

Waived checks count toward the score and render as `waived`, but the reason remains visible in JSON and Markdown reports. Use waivers for documented, reviewed exceptions rather than to hide missing evidence.

The config is parsed as JSON only. It cannot run code, import packages, or perform side effects.
An explicit CLI `--threshold` value overrides the config for that run; otherwise the fallback threshold is 70.
