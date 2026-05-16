import { readFileSync } from "node:fs";
import { join } from "node:path";
/** Bronze contract verification for composed Next.js output (not Gold replay). */
export function verifyComposedNextJsBronze(outDir, compose, expectedRoutes) {
    const checks = [];
    checks.push({
        name: "compose produced files",
        ok: compose.filesWritten.length > 0,
        detail: `files=${compose.filesWritten.length}`,
    });
    checks.push({
        name: "no skipped emit roots",
        ok: compose.skippedEmit === 0,
        detail: `skipped=${compose.skippedEmit}`,
    });
    for (const exp of expectedRoutes) {
        const abs = join(outDir, exp.file);
        let contents = "";
        try {
            contents = readFileSync(abs, "utf8");
        }
        catch {
            checks.push({ name: `file exists: ${exp.file}`, ok: false });
            continue;
        }
        checks.push({ name: `file exists: ${exp.file}`, ok: true });
        const fn = `export async function ${exp.method}()`;
        checks.push({
            name: `${exp.file} exports ${exp.method}`,
            ok: contents.includes(fn),
        });
        checks.push({
            name: `${exp.file} cites route path`,
            ok: contents.includes(JSON.stringify(exp.path)),
        });
    }
    const ok = checks.every((c) => c.ok);
    return { pathId: compose.pathId, ok, checks };
}
