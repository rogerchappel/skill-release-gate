import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

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
  "docs/example-report.json",
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

function filesUnder(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const machinePathPattern = /(?:\/Users\/[^/\s"']+\/|\/home\/[^/\s"']+\/|[A-Za-z]:\\Users\\[^\\\s"']+\\)/;
const leakedPaths = filesUnder("docs").filter((path) => machinePathPattern.test(readFileSync(path, "utf8")));
if (leakedPaths.length > 0) {
  console.error(`package smoke found maintainer-machine paths in shipped docs:\n${leakedPaths.join("\n")}`);
  process.exit(1);
}

console.log(output.trim());
console.log("skill-release-gate package smoke ok");
