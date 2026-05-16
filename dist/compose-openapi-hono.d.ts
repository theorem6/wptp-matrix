export interface ComposeHonoResult {
    readonly pathId: "openapi-ir-hono";
    readonly bundlePath: string;
    readonly outDir: string;
    readonly irNodeCount: number;
    readonly webirNodeCount: number;
    readonly handlerCount: number;
    readonly emitOk: boolean;
}
/** OpenAPI → IR → WebIR bundle → Chrysalis emit-hono (bronze stubs). */
export declare function composeOpenApiIrHono(openapiJsonPath: string, outDir: string, options?: {
    readonly sourceApp?: string;
    readonly chrysalisRoot?: string;
}): ComposeHonoResult;
