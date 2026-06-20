import assert from "node:assert/strict";
import test from "node:test";
import { checkSkillFolder, renderJson, renderMarkdown } from "../src/index.js";

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
  assert.match(renderMarkdown(report), /Status: pass/);
});

test("threshold can hold a low-scoring package in warning status", () => {
  const report = checkSkillFolder("fixtures/pass", { threshold: 101 });
  assert.equal(report.status, "warn");
});
