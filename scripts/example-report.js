import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const examplePath = new URL("../docs/example-report.json", import.meta.url);
const fixturePath = "fixtures/pass";
const result = spawnSync(
  process.execPath,
  ["bin/skill-release-gate.js", "check", fixturePath, "--format", "json"],
  { cwd: new URL("..", import.meta.url), encoding: "utf8" }
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status || 1);
}

const report = JSON.parse(result.stdout);
report.path = fixturePath;
const expected = `${JSON.stringify(report, null, 2)}\n`;

if (process.argv.includes("--write")) {
  writeFileSync(examplePath, expected);
  console.log(`updated ${examplePath.pathname}`);
  process.exit(0);
}

const actual = readFileSync(examplePath, "utf8");
if (actual !== expected) {
  console.error("docs/example-report.json is stale; run npm run example:update");
  process.exit(1);
}

console.log("example report matches normalized CLI JSON output");
