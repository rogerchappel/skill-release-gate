import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["pack", "--json"], { encoding: "utf8" });
if (result.status !== 0) {
  process.stdout.write(`${result.stdout || ""}${result.stderr || ""}`);
  process.exit(result.status || 1);
}

let tarball;
try {
  tarball = JSON.parse(result.stdout)[0]?.filename;
} catch {
  console.error("npm pack did not return valid JSON metadata");
  process.exit(1);
}
if (!tarball) {
  console.error("npm pack did not report a tarball filename");
  process.exit(1);
}

const required = [
  "bin/skill-release-gate.js", "src/index.js", "fixtures/pass/SKILL.md",
  "docs/CHECKS.md", "docs/RELEASE_CANDIDATE.md", "docs/example-report.json",
  "SKILL.md", "README.md", "LICENSE", "SECURITY.md", "CHANGELOG.md", "CONTRIBUTING.md"
];
const temp = mkdtempSync(join(tmpdir(), "skill-release-gate-pack-"));
try {
  const archive = join(process.cwd(), tarball);
  const unpack = spawnSync("tar", ["-xzf", archive, "-C", temp], { encoding: "utf8" });
  if (unpack.status !== 0) throw new Error(`cannot extract package: ${unpack.stderr}`);
  const packageDir = join(temp, "package");
  const missing = required.filter((file) => {
    try { readFileSync(join(packageDir, file)); return false; } catch { return true; }
  });
  if (missing.length) throw new Error(`packed artifact missing files:\n${missing.join("\n")}`);

  const cli = spawnSync(process.execPath, [join(packageDir, "bin/skill-release-gate.js"), "check", join(packageDir, "fixtures/pass"), "--format", "markdown"], { encoding: "utf8" });
  if (cli.status !== 0) throw new Error(`packed CLI failed (${cli.status}):\n${cli.stdout}\n${cli.stderr}`);
  if (!cli.stdout.includes("PASS")) throw new Error(`packed CLI returned unexpected output:\n${cli.stdout}`);
  console.log("skill-release-gate packed artifact smoke ok");
} finally {
  rmSync(temp, { recursive: true, force: true });
  rmSync(tarball, { force: true });
}
