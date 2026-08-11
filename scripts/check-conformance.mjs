import { readdir, readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const ignoredDirectories = new Set([
  ".git", ".hallmark", "build", "coverage", "dist", "node_modules",
  "outputs", "storybook-static", "test-results", "vendor",
]);
const styleExtensions = new Set([".css", ".scss", ".sass"]);
const sourceExtensions = new Set([...styleExtensions, ".js", ".jsx", ".ts", ".tsx"]);
const sharedSelectors = /\.scientific-(?:app-shell|header|tool-rail|task-panel|inspector|status|workbench|command-bar|run-control|panel-section|parameter-group|field-row|results-layout|metric-grid|viewport-toolbar|notifications)(?:[\w-]|__|--)*\b/g;

function lineAt(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

export function auditSource(source, file, { shared = false } = {}) {
  const issues = [];
  const addMatches = (expression, rule, message) => {
    for (const match of source.matchAll(expression)) {
      issues.push({ file, line: lineAt(source, match.index ?? 0), rule, message });
    }
  };
  addMatches(/\.(?:cds|bx)--[\w-]+/g, "carbon-internal-selector", "Do not target Carbon internal selectors; compose a public Carbon component instead.");
  addMatches(/!important\b/g, "important", "Do not use !important; fix ownership or cascade order.");
  if (!shared && styleExtensions.has(extname(file).toLowerCase())) {
    addMatches(sharedSelectors, "shared-selector-override", "Shared scientific-ui geometry must be changed in scientific-ui, not in a consumer stylesheet.");
  }
  return issues;
}

async function filesUnder(target) {
  const details = await stat(target);
  if (details.isFile()) return [target];
  const entries = await readdir(target, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((entry) => !entry.isDirectory() || !ignoredDirectories.has(entry.name))
    .map((entry) => filesUnder(resolve(target, entry.name))));
  return nested.flat();
}

const args = process.argv.slice(2);
const shared = args.includes("--shared");
const targets = args.filter((argument) => !argument.startsWith("--"));
if (targets.length === 0) targets.push("src");

const files = (await Promise.all(targets.map((target) => filesUnder(resolve(target)))))
  .flat()
  .filter((file) => sourceExtensions.has(extname(file).toLowerCase()));
const issues = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  issues.push(...auditSource(source, file, { shared }));
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`${issue.file}:${issue.line} [${issue.rule}] ${issue.message}`);
  process.exitCode = 1;
} else {
  console.log(`scientific-ui conformance: ${files.length} files checked`);
}
