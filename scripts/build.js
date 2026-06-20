import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const target = resolve("dist/package-check.txt");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, "skill-release-gate build artifact\n");
console.log(`wrote ${target}`);
