import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { importOpenApiJson } from "@wptp/adapter-openapi";
import { assertIrDocumentV0, exportIrToWebIrBundleV0 } from "@wptp/ir";
function resolveChrysalisEmitScript() {
    const root = process.env.CHRYSALIS_ROOT;
    if (root)
        return join(root, "scripts", "emit-webir-bundle-hono.mjs");
    return null;
}
/** OpenAPI → IR → WebIR bundle → Chrysalis emit-hono (bronze stubs). */
export function composeOpenApiIrHono(openapiJsonPath, outDir, options) {
    const openapi = JSON.parse(readFileSync(openapiJsonPath, "utf8"));
    const ir = importOpenApiJson(openapi, options?.sourceApp);
    assertIrDocumentV0(ir);
    const bundle = exportIrToWebIrBundleV0(ir);
    const bundlePath = join(outDir, ".wptp", "petstore.webir.bundle.json");
    mkdirSync(dirname(bundlePath), { recursive: true });
    writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), "utf8");
    const prevRoot = process.env.CHRYSALIS_ROOT;
    if (options?.chrysalisRoot)
        process.env.CHRYSALIS_ROOT = options.chrysalisRoot;
    const script = options?.chrysalisRoot
        ? join(options.chrysalisRoot, "scripts", "emit-webir-bundle-hono.mjs")
        : resolveChrysalisEmitScript();
    let emitOk = false;
    let handlerCount = 0;
    if (script) {
        const run = spawnSync(process.execPath, [script, "--bundle", bundlePath, "--out", outDir], {
            encoding: "utf8",
            env: process.env,
        });
        if (run.status === 0) {
            emitOk = true;
            try {
                const summary = JSON.parse(run.stdout.trim().split("\n").pop() ?? "{}");
                handlerCount = typeof summary.handlerCount === "number" ? summary.handlerCount : 0;
            }
            catch {
                handlerCount = bundle.module.roots.length;
            }
        }
    }
    if (options?.chrysalisRoot !== undefined) {
        if (prevRoot === undefined)
            delete process.env.CHRYSALIS_ROOT;
        else
            process.env.CHRYSALIS_ROOT = prevRoot;
    }
    return {
        pathId: "openapi-ir-hono",
        bundlePath,
        outDir,
        irNodeCount: ir.nodes.length,
        webirNodeCount: bundle.module.nodes.length,
        handlerCount,
        emitOk,
    };
}
