import { existsSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { composeOpenApiIrHono } from "../src/compose-openapi-hono.js";
import { verifyComposedHonoBronze } from "../src/verify-hono-bronze.js";

const chrysalisRoot = process.env.CHRYSALIS_ROOT ?? "";
const canRun = Boolean(chrysalisRoot && existsSync(join(chrysalisRoot, "scripts", "emit-webir-bundle-hono.mjs")));
const fixtureOpenApi = join(import.meta.dirname, "..", "fixtures", "petstore-mini.openapi.json");
const tempDirs: string[] = [];

afterEach(() => {
  for (const d of tempDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe.skipIf(!canRun)("openapi-ir-hono compose", () => {
  it("emits bronze Hono handlers for petstore-mini", () => {
    const outDir = mkdtempSync(join(tmpdir(), "wptp-hono-"));
    tempDirs.push(outDir);
    const compose = composeOpenApiIrHono(fixtureOpenApi, outDir, { chrysalisRoot });
    expect(compose.emitOk).toBe(true);
    const verify = verifyComposedHonoBronze(outDir, compose, ["listPets", "createPet", "getPet"]);
    expect(verify.ok).toBe(true);
  });
});
