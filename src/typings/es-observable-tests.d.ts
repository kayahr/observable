/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

declare module "es-observable-tests" {
    export function runTests(implementation: unknown): Promise<{
        logger: {
            passed: number;
            failed: number;
            errored: number;
        };
    }>;
}
