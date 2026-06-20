import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const REQUIRED_DOCS = ["SKILL.md", "README.md", "docs/PRD.md", "docs/TASKS.md", "docs/ORCHESTRATION.md"];

const CHECKS = [
  {
    id: "activation",
    title: "Activation guidance",
    weight: 15,
    severity: "error",
    pattern: /\b(when to use|use this skill|trigger|activation)\b/i,
    message: "Explain when an agent should use the skill."
  },
  {
    id: "inputs",
    title: "Required inputs",
    weight: 10,
    severity: "error",
    pattern: /\b(input|required|provide|expects?)\b/i,
    message: "List required inputs or starting context."
  },
  {
    id: "tools",
    title: "Tool requirements",
    weight: 10,
    severity: "warn",
    pattern: /\b(tool|cli|command|api|mcp|browser|shell|filesystem)\b/i,
    message: "Name required tools or state that none are required."
  },
  {
    id: "side-effects",
    title: "Side-effect boundaries",
    weight: 15,
    severity: "error",
    pattern: /\b(side[- ]effect|write|external action|network|publish|send|delete|approval)\b/i,
    message: "Define side-effect boundaries and approval requirements."
  },
  {
    id: "examples",
    title: "Examples",
    weight: 10,
    severity: "warn",
    pattern: /\b(example|sample|scenario)\b/i,
    message: "Include at least one usage example."
  },
  {
    id: "verification",
    title: "Verification workflow",
    weight: 15,
    severity: "error",
    pattern: /\b(verify|verification|test|smoke|validate|check)\b/i,
    message: "Describe how the skill output is verified."
  },
  {
    id: "limitations",
    title: "Limitations",
    weight: 10,
    severity: "warn",
    pattern: /\b(limitation|out of scope|does not|cannot|unsafe)\b/i,
    message: "Document limitations and non-goals."
  },
  {
    id: "release-notes",
    title: "Release notes",
    weight: 10,
    severity: "warn",
    pattern: /\b(release candidate|release notes|changelog|version)\b/i,
    message: "Add release-candidate notes or a changelog entry."
  },
  {
    id: "fixtures",
    title: "Fixture evidence",
    weight: 5,
    severity: "warn",
    fileCheck: true,
    message: "Include fixture or example files for repeatable review."
  }
];

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function collectFiles(root) {
  const files = [];
  for (const name of REQUIRED_DOCS) {
    const path = join(root, name);
    if (existsSync(path)) files.push({ name, path, text: readIfExists(path) });
  }
  return files;
}

function hasFixtureEvidence(root) {
  for (const name of ["fixtures", "examples", "test", "tests"]) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    if (!statSync(path).isDirectory()) continue;
    const entries = readdirSync(path).filter((entry) => !entry.startsWith("."));
    if (entries.length > 0) return true;
  }
  return false;
}

function classifyStatus(score, findings) {
  if (findings.some((finding) => finding.result === "fail" && finding.severity === "error")) return "fail";
  if (score < 70 || findings.some((finding) => finding.result === "warn")) return "warn";
  return "pass";
}

export function checkSkillFolder(targetPath) {
  const root = resolve(targetPath);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`Skill folder not found: ${targetPath}`);
  }

  const files = collectFiles(root);
  const combined = files.map((file) => file.text).join("\n\n");
  const findings = [];
  let score = 0;

  for (const check of CHECKS) {
    const passed = check.fileCheck ? hasFixtureEvidence(root) : check.pattern.test(combined);
    if (passed) score += check.weight;
    findings.push({
      id: check.id,
      title: check.title,
      severity: check.severity,
      result: passed ? "pass" : check.severity === "error" ? "fail" : "warn",
      message: passed ? "Evidence found." : check.message,
      weight: check.weight
    });
  }

  const missingDocs = REQUIRED_DOCS.filter((name) => !existsSync(join(root, name)));
  for (const name of missingDocs) {
    findings.push({
      id: `missing-${name}`,
      title: `Missing ${name}`,
      severity: name === "SKILL.md" ? "error" : "warn",
      result: name === "SKILL.md" ? "fail" : "warn",
      message: `${name} was not found.`,
      weight: 0
    });
  }

  return {
    tool: "skill-release-gate",
    path: root,
    name: basename(root),
    score,
    status: classifyStatus(score, findings),
    files: files.map((file) => file.name),
    findings
  };
}

export function renderJson(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderMarkdown(report) {
  const lines = [
    `# Skill Release Gate: ${report.name}`,
    "",
    `Status: ${report.status}`,
    `Score: ${report.score}/100`,
    "",
    "## Files",
    ...report.files.map((file) => `- ${file}`),
    "",
    "## Findings"
  ];

  for (const finding of report.findings) {
    lines.push(`- ${finding.result.toUpperCase()} ${finding.title}: ${finding.message}`);
  }

  lines.push("");
  lines.push("## Recommendation");
  if (report.status === "pass") {
    lines.push("The skill has enough local evidence for a release-candidate review.");
  } else if (report.status === "warn") {
    lines.push("Address warnings before publishing outside a small reviewer group.");
  } else {
    lines.push("Do not release until failing checks are fixed.");
  }
  return `${lines.join("\n")}\n`;
}
