import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { importOpenApiJson } from "@wptp/adapter-openapi";
import { assertIrDocumentV0 } from "@wptp/ir";
import { emitNextJsAppRouter } from "@wptp/emit-nextjs";

export interface ComposeResult {
  readonly pathId: string;
  readonly filesWritten: ReadonlyArray<string>;
  readonly irNodeCount: number;
  readonly skippedEmit: number;
}

export function composeOpenApiIrNextJs(
  openapiJsonPath: string,
  outDir: string,
  sourceApp?: string,
): ComposeResult {
  const openapi = JSON.parse(readFileSync(openapiJsonPath, "utf8"));
  const ir = importOpenApiJson(openapi, sourceApp);
  assertIrDocumentV0(ir);
  const emitted = emitNextJsAppRouter(ir);
  const filesWritten: string[] = [];
  for (const file of emitted.files) {
    const abs = join(outDir, file.relativePath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, file.contents, "utf8");
    filesWritten.push(file.relativePath);
  }
  return {
    pathId: "openapi-ir-nextjs",
    filesWritten,
    irNodeCount: ir.nodes.length,
    skippedEmit: emitted.skipped.length,
  };
}
