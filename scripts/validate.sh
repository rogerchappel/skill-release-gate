#!/usr/bin/env bash
set -euo pipefail

npm test
npm run check
npm run build
npm run smoke
node bin/skill-release-gate.js check fixtures/pass --format json >/tmp/skill-release-gate-report.json
test -s /tmp/skill-release-gate-report.json
