import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
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
const sourceExtensions = new Set([".css", ".js", ".jsx", ".scss", ".ts", ".tsx"]);

async function readSourceTree(directory) {
  const chunks = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) chunks.push(await readSourceTree(path));
    else if (sourceExtensions.has(extname(entry.name))) chunks.push(await readFile(path, "utf8"));
  }
  return chunks.flat().join("\n");
}

const failures = [];
for (const consumer of consumers) {
  const source = await readSourceTree(join(workspaceRoot, consumer, "src"));
  for (const component of ["ScientificUiProvider", "ScientificAppShell", "ScientificHeader", "ScientificToolRail", "ScientificStatusBar"]) {
    if (!source.includes(component)) failures.push(`${consumer}: missing ${component}`);
  }
  if (!/(skipLink\s*=|SkipToContent|className=["']skip-link["'])/.test(source)) {
    failures.push(`${consumer}: missing skip link`);
  }
  if (/--scientific-ui-(?:rail-inline-size|panel-inline-size|header-block-size|status-block-size)\s*:/.test(source)) {
    failures.push(`${consumer}: overrides shared shell dimensions`);
  }
  if (/\.scientific-recovery-notice\s*\{/.test(source)) {
    failures.push(`${consumer}: repositions shared recovery notice locally`);
  }
}

if (failures.length) {
  console.error(`Scientific application contract failures:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`All ${consumers.length} consumers satisfy the static application contract.`);
}
