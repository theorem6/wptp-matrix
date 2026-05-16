import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComposeHonoResult } from "./compose-openapi-hono.js";
import type { ContractCheck } from "./verify-contract.js";

export function verifyComposedHonoBronze(
  outDir: string,
  compose: ComposeHonoResult,
  expectedHandlers: ReadonlyArray<string>,
): { ok: boolean; checks: ContractCheck[] } {
  const checks: ContractCheck[] = [];
  checks.push({ name: "chrysalis emit ran", ok: compose.emitOk });
  checks.push({
    name: "bundle written",
    ok: existsSync(compose.bundlePath),
    detail: compose.bundlePath,
  });
  checks.push({
    name: "package.json emitted",
    ok: existsSync(join(outDir, "package.json")),
  });
  checks.push({
    name: "src/index.ts emitted",
    ok: existsSync(join(outDir, "src/index.ts")),
  });
  checks.push({
    name: "handler count",
    ok: compose.handlerCount >= expectedHandlers.length,
    detail: `handlers=${compose.handlerCount}`,
  });

  for (const name of expectedHandlers) {
    const handlerFile = join(outDir, "src", "handlers", `${name}.ts`);
    const ok = existsSync(handlerFile);
    checks.push({ name: `handler file: ${name}`, ok });
    if (ok) {
      const src = readFileSync(handlerFile, "utf8");
      checks.push({
        name: `${name} is bronze stub`,
        ok: src.includes("__respond") && src.includes("route"),
      });
    }
  }

  const ok = checks.every((c) => c.ok);
  return { ok, checks };
}
