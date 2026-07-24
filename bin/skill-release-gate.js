#!/usr/bin/env node
import { checkSkillFolder, renderJson, renderMarkdown } from "../src/index.js";
import { writeFileSync } from "node:fs";

function printHelp() {
  console.log(`skill-release-gate

Usage:
  skill-release-gate check <path> [--format markdown|json] [--output file] [--threshold number]

Checks an agent skill folder for release-readiness evidence.`);
}

function optionValue(args, option) {
  const index = args.indexOf(option);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`${option} requires a value.`);
    process.exit(2);
  }
  return value;
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

const format = optionValue(args, "--format") ?? "markdown";
const outputPath = optionValue(args, "--output") ?? "";
const thresholdValue = optionValue(args, "--threshold");
const threshold = thresholdValue === undefined ? undefined : Number(thresholdValue);

if (threshold !== undefined && (!Number.isFinite(threshold) || threshold < 0 || threshold > 100)) {
  console.error("--threshold must be a number from 0 to 100.");
  process.exit(2);
}

try {
  const report = checkSkillFolder(target, threshold === undefined ? {} : { threshold });
  let rendered;
  if (format === "json") {
    rendered = renderJson(report);
  } else if (format === "markdown") {
    rendered = renderMarkdown(report);
  } else {
    console.error(`Unsupported format: ${format}`);
    process.exit(2);
  }
  if (outputPath) {
    writeFileSync(outputPath, rendered);
  } else {
    console.log(rendered);
  }
  process.exit(report.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
