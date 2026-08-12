# Checks

`skill-release-gate` scores a skill folder across nine readiness categories.

| Check ID | Check | Weight | Fails release? |
| --- | --- | ---: | --- |
| `activation` | Activation guidance | 15 | Yes |
| `inputs` | Required inputs | 10 | Yes |
| `tools` | Tool requirements | 10 | No |
| `side-effects` | Side-effect boundaries | 15 | Yes |
| `examples` | Examples | 10 | No |
| `verification` | Verification workflow | 15 | Yes |
| `limitations` | Limitations | 10 | No |
| `release-notes` | Release notes | 10 | No |
| `fixtures` | Fixture evidence | 5 | No |

The default passing threshold is 70, but any failing blocker keeps the status at `fail`. A score
below the threshold or an unwaived non-blocking finding produces `warn`. The CLI exits successfully
only for `pass`, so both `warn` and `fail` block automated release checks.

## Config

Skill folders can include `.skill-release-gate.json` or `skill-release-gate.config.json`.

Supported keys:

- `threshold`: default score threshold for that folder when the CLI does not receive `--threshold`.
- `extraRequiredDocs`: additional local documentation paths that must exist.
- `ignoreRequiredDocs`: baseline documentation paths to skip for that folder, except the mandatory
  `SKILL.md` entry point. It does not cancel paths listed in `extraRequiredDocs`.
- `waivers`: object mapping a check id to the human-readable reason it is waived.

Waived checks count toward the score and render as `waived`, but the reason remains visible in JSON and Markdown reports. Use waivers for documented, reviewed exceptions rather than to hide missing evidence.

The config is parsed as JSON only. It cannot run code, import packages, or perform side effects.
Thresholds must be finite numbers from 0 to 100, documentation lists must contain only non-empty
strings, and waiver values must be non-empty reason strings. Invalid fields stop the check with a
config-file error instead of falling back to an ineffective policy.
Only the four supported top-level keys above are accepted. Waiver keys must exactly match a check ID
in the table; unknown fields and IDs are rejected, and the error identifies the config filename and
invalid value. Validation happens before any readiness checks run.
An `ignoreRequiredDocs` entry for `SKILL.md` is invalid so every checked folder must retain its
canonical skill entry point.
An explicit CLI `--threshold` value overrides the config for that run; otherwise the fallback threshold is 70.
