import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(packageRoot, "..");
const auditScript = join(packageRoot, "scripts", "check-conformance.mjs");
const consumers = [
  "drift-difussion-simulator",
  "fdtd-2d-simulator",
  "low-cost-gds",
  "optothermal_simulator",
  "reflectometry",
  "rf-simulator",
  "setupsketch",
  "spincoatsim",
  "waveguide-mode-solver",
];

let failed = false;
for (const consumer of consumers) {
  const result = spawnSync(process.execPath, [auditScript, join(workspaceRoot, consumer, "src")], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  if (result.stdout.trim()) console.log(`${consumer}: ${result.stdout.trim()}`);
  if (result.status !== 0) {
    failed = true;
    console.error(`${consumer}: ${result.stderr.trim() || "conformance check failed"}`);
  }
}

if (failed) process.exitCode = 1;
else console.log(`All ${consumers.length} consumers pass scientific-ui conformance.`);
