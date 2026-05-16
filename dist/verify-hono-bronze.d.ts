import type { ComposeHonoResult } from "./compose-openapi-hono.js";
import type { ContractCheck } from "./verify-contract.js";
export declare function verifyComposedHonoBronze(outDir: string, compose: ComposeHonoResult, expectedHandlers: ReadonlyArray<string>): {
    ok: boolean;
    checks: ContractCheck[];
};
