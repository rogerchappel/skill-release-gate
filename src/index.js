import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const REQUIRED_DOCS = ["SKILL.md", "README.md", "docs/PRD.md", "docs/TASKS.md", "docs/ORCHESTRATION.md"];
const CONFIG_FILES = [".skill-release-gate.json", "skill-release-gate.config.json"];

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

export function loadGateConfig(targetPath) {
  const root = resolve(targetPath);
  for (const name of CONFIG_FILES) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    try {
      const config = JSON.parse(readFileSync(path, "utf8"));
      return { path, config };
    } catch (error) {
      throw new Error(`Invalid ${name}: ${error.message}`);
    }
  }
  return { path: "", config: {} };
}

function configuredDocs(config) {
  const extra = Array.isArray(config.extraRequiredDocs) ? config.extraRequiredDocs : [];
  const ignore = new Set(Array.isArray(config.ignoreRequiredDocs) ? config.ignoreRequiredDocs : []);
  return [...REQUIRED_DOCS, ...extra].filter((name, index, docs) => docs.indexOf(name) === index && !ignore.has(name));
}

function collectFiles(root, requiredDocs) {
  const files = [];
  for (const name of requiredDocs) {
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

function classifyStatus(score, findings, threshold = 70) {
  if (findings.some((finding) => finding.result === "fail" && finding.severity === "error")) return "fail";
  if (score < threshold || findings.some((finding) => finding.result === "warn")) return "warn";
  return "pass";
}

function summarizeFindings(findings) {
  const summary = {
    pass: 0,
    waived: 0,
    warn: 0,
    fail: 0,
    error: 0,
    warning: 0
  };
  for (const finding of findings) {
    summary[finding.result] += 1;
    if (finding.severity === "error") summary.error += 1;
    if (finding.severity === "warn") summary.warning += 1;
  }
  return summary;
}

export function checkSkillFolder(targetPath, options = {}) {
  const root = resolve(targetPath);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`Skill folder not found: ${targetPath}`);
  }

  const { path: configPath, config } = loadGateConfig(root);
  const requiredDocs = configuredDocs(config);
  const waivers = config.waivers && typeof config.waivers === "object" ? config.waivers : {};
  const files = collectFiles(root, requiredDocs);
  const combined = files.map((file) => file.text).join("\n\n");
  const findings = [];
  let score = 0;

  for (const check of CHECKS) {
    const passed = check.fileCheck ? hasFixtureEvidence(root) : check.pattern.test(combined);
    const waiverReason = typeof waivers[check.id] === "string" ? waivers[check.id].trim() : "";
    if (passed || waiverReason) score += check.weight;
    findings.push({
      id: check.id,
      title: check.title,
      severity: check.severity,
      result: passed ? "pass" : waiverReason ? "waived" : check.severity === "error" ? "fail" : "warn",
      message: passed ? "Evidence found." : waiverReason ? `Waived: ${waiverReason}` : check.message,
      weight: check.weight
    });
  }

  const missingDocs = requiredDocs.filter((name) => !existsSync(join(root, name)));
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

  const threshold = options.threshold ?? config.threshold ?? 70;
  const summary = summarizeFindings(findings);

  return {
    tool: "skill-release-gate",
    path: root,
    name: basename(root),
    score,
    threshold,
    status: classifyStatus(score, findings, threshold),
    summary,
    config: configPath ? { path: configPath, requiredDocs } : { path: "", requiredDocs },
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
    `Threshold: ${report.threshold}`,
    `Config: ${report.config.path || "default"}`,
    `Summary: ${report.summary.pass} pass, ${report.summary.waived} waived, ${report.summary.warn} warn, ${report.summary.fail} fail`,
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
