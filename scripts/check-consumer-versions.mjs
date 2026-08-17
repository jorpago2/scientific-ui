import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(packageRoot, "..");
const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
const expected = `file:vendor/jorpago2-scientific-ui-${packageJson.version}.tgz`;
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

const mismatches = [];
for (const consumer of consumers) {
  const consumerRoot = join(workspaceRoot, consumer);
  const manifest = JSON.parse(await readFile(join(consumerRoot, "package.json"), "utf8"));
  const actual = manifest.dependencies?.["@jorpago2/scientific-ui"];
  if (actual !== expected) mismatches.push(`${consumer}: ${actual ?? "missing"}`);
  const vendorFiles = (await readdir(join(consumerRoot, "vendor")))
    .filter((name) => /^jorpago2-scientific-ui-.*\.tgz$/.test(name));
  const expectedTarball = `jorpago2-scientific-ui-${packageJson.version}.tgz`;
  if (vendorFiles.length !== 1 || vendorFiles[0] !== expectedTarball) {
    mismatches.push(`${consumer}: vendor contains ${vendorFiles.join(", ") || "no scientific-ui tarball"}`);
  }
  const lockfile = await readFile(join(consumerRoot, "pnpm-lock.yaml"), "utf8");
  if (!lockfile.includes(expectedTarball)) mismatches.push(`${consumer}: lockfile does not resolve ${expectedTarball}`);
}

if (mismatches.length) {
  console.error(`Expected @jorpago2/scientific-ui ${expected}:\n${mismatches.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`All ${consumers.length} consumers use @jorpago2/scientific-ui ${packageJson.version}.`);
}
