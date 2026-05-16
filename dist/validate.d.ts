import type { CompatibilityMatrix } from "./types.js";
export declare class MatrixValidationError extends Error {
    constructor(message: string);
}
export declare function assertCompatibilityMatrix(value: unknown): asserts value is CompatibilityMatrix;
