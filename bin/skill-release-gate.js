#!/usr/bin/env node
import { checkSkillFolder, renderJson, renderMarkdown } from "../src/index.js";

function printHelp() {
  console.log(`skill-release-gate

Usage:
  skill-release-gate check <path> [--format markdown|json]

Checks an agent skill folder for release-readiness evidence.`);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

if (command !== "check") {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(2);
}

const target = args[1];
if (!target) {
  console.error("Missing required <path>.");
  process.exit(2);
}

const formatIndex = args.indexOf("--format");
const format = formatIndex >= 0 ? args[formatIndex + 1] : "markdown";

try {
  const report = checkSkillFolder(target);
  if (format === "json") {
    console.log(renderJson(report));
  } else if (format === "markdown") {
    console.log(renderMarkdown(report));
  } else {
    console.error(`Unsupported format: ${format}`);
    process.exit(2);
  }
  process.exit(report.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
