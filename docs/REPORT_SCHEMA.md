# Report Schema

The JSON report is stable enough for local automation.

```json
{
  "tool": "skill-release-gate",
  "path": "/absolute/path",
  "name": "skill-name",
  "score": 100,
  "threshold": 70,
  "status": "pass",
  "summary": {
    "pass": 8,
    "waived": 1,
    "warn": 0,
    "fail": 0,
    "error": 4,
    "warning": 5
  },
  "files": ["SKILL.md"],
  "findings": [
    {
      "id": "activation",
      "title": "Activation guidance",
      "severity": "error",
      "result": "pass",
      "message": "Evidence found.",
      "weight": 15
    }
  ]
}
```

Statuses are `pass`, `warn`, or `fail`.

Finding results are `pass`, `waived`, `warn`, or `fail`. Waived findings include the configured reason in `message`.
