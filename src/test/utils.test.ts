/*
 * Copyright (C) 2022 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import { describe, it } from "node:test";

import { isIterable, toError } from "../main/utils.ts";
import { assertSame } from "@kayahr/assert";

class Test<T> implements Iterable<T> {
    public [Symbol.iterator](): Iterator<T> {
        throw new Error("Method not implemented");
    }
}

describe("utils", () => {
    describe("isIterable", () => {
        it("returns true for iterable object", () => {
            assertSame(isIterable(new Test()), true);
            assertSame(isIterable([ 1, 2, 3 ]), true);
            assertSame(isIterable(new Uint8Array([ 1, 2, 3 ])), true);
            assertSame(isIterable("34"), true);
        });
        it("returns false for non-Iterable objects", () => {
            assertSame(isIterable({}), false);
            assertSame(isIterable(34), false);
            assertSame(isIterable(null), false);
            assertSame(isIterable(undefined), false);
            assertSame(isIterable(true), false);
        });
        it("supports optional value type parameter", () => {
            const a = [ 1 ] as Iterable<unknown> | number;
            if (isIterable<number>(a)) {
                for (const value of a) {
                    assertSame(value.toFixed(2), "1.00");
                }
            }
        });
    });
    describe("toError", () => {
        it("returns error as-is", () => {
            const e = new Error("test");
            assertSame(toError(e), e);
        });
        it("returns new error with given string value as message", () => {
            const error = toError("Test");
            assertSame(error.constructor, Error);
            assertSame(error.message, "Test");
        });
        it("returns new error with given numeric value as message", () => {
            const error = toError(2);
            assertSame(error.constructor, Error);
            assertSame(error.message, "2");
        });
        it("returns new error with given null value as message", () => {
            const error = toError(null);
            assertSame(error.constructor, Error);
            assertSame(error.message, "null");
        });
    });
});
