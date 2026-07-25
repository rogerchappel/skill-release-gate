import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

function runCli(...args) {
  return spawnSync("node", ["bin/skill-release-gate.js", ...args], { encoding: "utf8" });
}

test("cli writes an output report", () => {
  const out = "/tmp/skill-release-gate-cli-test.md";
  rmSync(out, { force: true });
  const result = spawnSync("node", ["bin/skill-release-gate.js", "check", "fixtures/pass", "--output", out], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0);
  assert.equal(existsSync(out), true);
  assert.match(readFileSync(out, "utf8"), /Status: pass/);
});

test("cli exits nonzero for failed fixture", () => {
  const result = runCli("check", "fixtures/fail");
  assert.equal(result.status, 1);
});

test("cli uses the configured threshold when no override is provided", () => {
  const result = spawnSync("node", ["bin/skill-release-gate.js", "check", "fixtures/configured", "--format", "json"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).threshold, 90);
});

test("cli threshold overrides the configured threshold", () => {
  const result = spawnSync(
    "node",
    ["bin/skill-release-gate.js", "check", "fixtures/configured", "--format", "json", "--threshold", "80"],
    { encoding: "utf8" }
  );
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).threshold, 80);
});

test("cli treats warning status as a blocking review result", () => {
  const result = spawnSync("node", ["bin/skill-release-gate.js", "check", "fixtures/review", "--format", "json"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, "warn");
});

test("cli uses the configured threshold when the option is omitted", () => {
  const result = runCli("check", "fixtures/configured", "--format", "json");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).threshold, 90);
});

test("cli threshold overrides the configured threshold", () => {
  const result = runCli("check", "fixtures/configured", "--format", "json", "--threshold", "95");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).threshold, 95);
});

test("cli rejects a missing threshold value", () => {
  const result = runCli("check", "fixtures/pass", "--threshold");
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--threshold requires a value/);
});

test("cli rejects an invalid threshold value", () => {
  const result = runCli("check", "fixtures/pass", "--threshold", "high");
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--threshold must be a number from 0 to 100/);
});

test("cli rejects missing values for format and output options", () => {
  for (const option of ["--format", "--output"]) {
    const result = runCli("check", "fixtures/pass", option);
    assert.equal(result.status, 2);
    assert.match(result.stderr, new RegExp(`${option} requires a value`));
  }
});

test("cli rejects an option where another option value is required", () => {
  const result = runCli("check", "fixtures/pass", "--format", "--threshold", "90");
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--format requires a value/);
});
