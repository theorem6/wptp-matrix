#!/usr/bin/env node
import { resolve } from "node:path";
import { composeOpenApiIrNextJs } from "./compose.js";
import { verifyComposedNextJsBronze } from "./verify-contract.js";

function usage(): never {
  process.stderr.write(
    "Usage: wptp-compose --path openapi-ir-nextjs --in <openapi.json> --out <dir> [--verify]\n",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
let pathId: string | null = null;
let input: string | null = null;
let out: string | null = null;
let verify = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--path" && args[i + 1]) pathId = args[++i];
  else if (args[i] === "--in" && args[i + 1]) input = args[++i];
  else if (args[i] === "--out" && args[i + 1]) out = args[++i];
  else if (args[i] === "--verify") verify = true;
}

if (pathId !== "openapi-ir-nextjs" || !input || !out) usage();

const outDir = resolve(out);
const result = composeOpenApiIrNextJs(resolve(input), outDir);

console.log(
  JSON.stringify(
    { ok: true, pathId: result.pathId, filesWritten: result.filesWritten, irNodeCount: result.irNodeCount },
    null,
    2,
  ),
);

if (verify) {
  const v = verifyComposedNextJsBronze(outDir, result, [
    { path: "/pets", method: "GET", file: "app/pets/route.ts" },
    { path: "/pets", method: "POST", file: "app/pets/route.ts" },
    { path: "/pets/{id}", method: "GET", file: "app/pets/{id}/route.ts" },
  ]);
  if (!v.ok) {
    process.stderr.write(`${JSON.stringify(v, null, 2)}\n`);
    process.exit(1);
  }
  console.error("contract verify: OK");
}
