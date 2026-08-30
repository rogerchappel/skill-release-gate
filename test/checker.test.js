import assert from "node:assert/strict";
import test from "node:test";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSkillFolder, loadGateConfig, renderJson, renderMarkdown } from "../src/index.js";

test("passing fixture is release ready", () => {
  const report = checkSkillFolder("fixtures/pass");
  assert.equal(report.status, "pass");
  assert.equal(report.score, 100);
  assert.equal(report.findings.every((finding) => finding.result === "pass"), true);
});

test("warning fixture keeps release in review", () => {
  const report = checkSkillFolder("fixtures/warn");
  assert.equal(report.status, "fail");
  assert.ok(report.findings.some((finding) => finding.id === "side-effects"));
});

test("missing skill file is a release blocker", () => {
  const report = checkSkillFolder("fixtures/fail");
  assert.equal(report.status, "fail");
  assert.ok(report.findings.some((finding) => finding.id === "missing-SKILL.md"));
});

test("directory-valued baseline documents are reported as invalid documents", () => {
  const root = mkdtempSync(join(tmpdir(), "skill-release-gate-baseline-docs-"));
  try {
    mkdirSync(join(root, "SKILL.md"));
    mkdirSync(join(root, "README.md"));
    const report = checkSkillFolder(root);
    assert.equal(report.status, "fail");
    assert.deepEqual(report.files, []);
    assert.deepEqual(
      report.findings.filter((finding) => ["missing-SKILL.md", "missing-README.md"].includes(finding.id)),
      [
        {
          id: "missing-SKILL.md",
          title: "Missing SKILL.md",
          severity: "error",
          result: "fail",
          message: "SKILL.md was not found or is not a regular file.",
          weight: 0
        },
        {
          id: "missing-README.md",
          title: "Missing README.md",
          severity: "warn",
          result: "warn",
          message: "README.md was not found or is not a regular file.",
          weight: 0
        }
      ]
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readiness phrases hidden in comments and fences do not count", () => {
  const report = checkSkillFolder("fixtures/visibility-hidden");
  assert.equal(report.status, "fail");
  assert.equal(report.score, 5);
  assert.deepEqual(
    report.findings.slice(0, 8).map((finding) => finding.result),
    ["fail", "fail", "warn", "fail", "warn", "fail", "warn", "warn"]
  );
});

test("visibility filtering handles CRLF and preserves text after closures", () => {
  const root = mkdtempSync(join(tmpdir(), "skill-release-gate-crlf-"));
  try {
    cpSync("fixtures/visibility-boundaries", root, { recursive: true });
    const skillPath = join(root, "SKILL.md");
    writeFileSync(skillPath, readFileSync(skillPath, "utf8").replaceAll("\n", "\r\n"));
    const report = checkSkillFolder(root);
    assert.equal(report.status, "pass");
    assert.equal(report.score, 100);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("renderers expose deterministic report data", () => {
  const report = checkSkillFolder("fixtures/pass");
  const json = JSON.parse(renderJson(report));
  assert.equal(json.tool, "skill-release-gate");
  assert.equal(json.threshold, 70);
  assert.deepEqual(json.summary, { pass: 9, waived: 0, warn: 0, fail: 0, error: 4, warning: 5 });
  assert.match(renderMarkdown(report), /Status: pass/);
  assert.match(renderMarkdown(report), /Summary: 9 pass, 0 waived, 0 warn, 0 fail/);
});

test("threshold can hold a low-scoring package in warning status", () => {
  const report = checkSkillFolder("fixtures/pass", { threshold: 101 });
  assert.equal(report.status, "warn");
});

test("loads optional gate config from the skill folder", () => {
  const { config } = loadGateConfig("fixtures/configured");
  assert.equal(config.threshold, 90);
  assert.deepEqual(config.extraRequiredDocs, ["docs/SAFETY.md"]);
});

test("config can add required docs and default threshold", () => {
  const report = checkSkillFolder("fixtures/configured");
  assert.equal(report.threshold, 90);
  assert.equal(report.status, "pass");
  assert.ok(report.config.requiredDocs.includes("docs/SAFETY.md"));
  assert.ok(report.files.includes("docs/SAFETY.md"));
});

test("rejects an extra required doc that is not a regular file", () => {
  assert.throws(
    () => checkSkillFolder("fixtures/config-invalid/directory-doc"),
    /extraRequiredDocs.*docs.*regular file/i
  );
});

test("ignoreRequiredDocs applies only to baseline docs, not extra required docs", () => {
  const report = checkSkillFolder("fixtures/configured");
  assert.ok(report.config.requiredDocs.includes("docs/SAFETY.md"));
  assert.ok(report.files.includes("docs/SAFETY.md"));
});

test("config can waive a named check with a visible reason", () => {
  const report = checkSkillFolder("fixtures/waived");
  const waived = report.findings.find((finding) => finding.id === "side-effects");
  assert.equal(report.status, "pass");
  assert.equal(report.summary.waived, 1);
  assert.equal(waived.result, "waived");
  assert.match(waived.message, /Read-only skill/);
  assert.match(renderMarkdown(report), /WAIVED Side-effect boundaries/);
});

test("accepts every documented waiver check ID", () => {
  const { config } = loadGateConfig("fixtures/config-valid/all-waiver-ids");
  assert.deepEqual(Object.keys(config.waivers), [
    "activation",
    "inputs",
    "tools",
    "side-effects",
    "examples",
    "verification",
    "limitations",
    "release-notes",
    "fixtures"
  ]);
});

for (const [fixture, message] of [
  ["invalid-threshold-type", /threshold.*number from 0 to 100/i],
  ["invalid-threshold-range", /threshold.*number from 0 to 100/i],
  ["invalid-docs", /extraRequiredDocs.*array of strings/i],
  ["ignore-skill-doc", /ignoreRequiredDocs.*must not include SKILL\.md/i],
  ["invalid-waivers", /waivers.*object/i],
  ["invalid-waiver-reason", /waivers\.activation.*non-empty string/i],
  ["unknown-waiver-id", /\.skill-release-gate\.json.*unknown waiver check ID side-effects-typo/i],
  ["unknown-field", /\.skill-release-gate\.json.*unknown config field threshhold/i]
]) {
  test(`rejects ${fixture.replaceAll("-", " ")}`, () => {
    assert.throws(() => checkSkillFolder(`fixtures/config-invalid/${fixture}`), message);
  });
}
