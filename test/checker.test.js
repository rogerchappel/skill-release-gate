import assert from "node:assert/strict";
import test from "node:test";
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

test("config can waive a named check with a visible reason", () => {
  const report = checkSkillFolder("fixtures/waived");
  const waived = report.findings.find((finding) => finding.id === "side-effects");
  assert.equal(report.status, "pass");
  assert.equal(report.summary.waived, 1);
  assert.equal(waived.result, "waived");
  assert.match(waived.message, /Read-only skill/);
  assert.match(renderMarkdown(report), /WAIVED Side-effect boundaries/);
});
