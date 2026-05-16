import type { ComposeResult } from "./compose.js";
export interface ContractCheck {
    readonly name: string;
    readonly ok: boolean;
    readonly detail?: string;
}
export interface ContractVerifyResult {
    readonly pathId: string;
    readonly ok: boolean;
    readonly checks: ReadonlyArray<ContractCheck>;
}
/** Bronze contract verification for composed Next.js output (not Gold replay). */
export declare function verifyComposedNextJsBronze(outDir: string, compose: ComposeResult, expectedRoutes: ReadonlyArray<{
    path: string;
    method: string;
    file: string;
}>): ContractVerifyResult;
