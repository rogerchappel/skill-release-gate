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
