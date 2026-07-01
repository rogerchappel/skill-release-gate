import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["pack", "--dry-run"], { encoding: "utf8" });
const output = `${result.stdout || ""}\n${result.stderr || ""}`;

if (result.status !== 0) {
  process.stdout.write(output);
  process.exit(result.status || 1);
}

const required = [
  "bin/skill-release-gate.js",
  "src/index.js",
  "fixtures/pass/SKILL.md",
  "docs/CHECKS.md",
  "docs/RELEASE_CANDIDATE.md",
  "SKILL.md",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md"
];

const missing = required.filter((entry) => !output.includes(entry));
if (missing.length > 0) {
  console.error(`package smoke missing entries:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(output.trim());
console.log("skill-release-gate package smoke ok");
