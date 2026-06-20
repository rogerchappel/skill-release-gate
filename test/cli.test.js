import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

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
  const result = spawnSync("node", ["bin/skill-release-gate.js", "check", "fixtures/fail"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 1);
});
