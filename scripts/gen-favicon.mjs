import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconPath = join(root, "app", "icon.png");
const outPath = join(root, "app", "favicon.ico");

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npx, ["--yes", "png-to-ico", iconPath], {
  cwd: root,
  encoding: "buffer",
  maxBuffer: 20 * 1024 * 1024,
});

if (result.status !== 0 || !result.stdout?.length) {
  console.error(result.stderr?.toString() || "png-to-ico failed");
  process.exit(1);
}

writeFileSync(outPath, result.stdout);
console.log(`Wrote ${outPath} (${result.stdout.length} bytes)`);
