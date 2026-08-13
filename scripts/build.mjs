import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)));
    child.once("error", reject);
  });
}

await rm("dist", { recursive: true, force: true });
await run(process.execPath, [fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url)), "-p", "tsconfig.json"]);
await mkdir("dist", { recursive: true });
const [tokens, styles] = await Promise.all([
  readFile("tokens.css", "utf8"),
  readFile("src/styles.css", "utf8"),
]);
await writeFile("dist/styles.css", `${tokens}\n${styles.replace('@import "../tokens.css";', "")}`);
