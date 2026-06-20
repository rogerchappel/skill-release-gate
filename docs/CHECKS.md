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
