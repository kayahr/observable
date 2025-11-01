/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Subscription } from "./Subscription.ts";

/**
 * Partial interface type for observer defining a mandatory `next` method. Used to construct the actual
 * {@link Observer} type.
 */
export interface NextObserver<T = unknown> {
    /**
     * Receives the next value in the sequence.
     *
     * @param value - The next value in the sequence. Not set when observable doesn't have a value type.
     */
    next(value: T): void;
};

/**
 * Partial interface type for observer defining a mandatory `error` method. Used to construct the actual
 * {@link Observer} type.
 */
export interface ErrorObserver {
    /**
     * Receives the sequence error.
     *
     * @param error - The error.
     */
    error(error: Error): void;
};

/**
 * Partial interface type for observer defining a mandatory `complete` method. Used to construct the actual
 * {@link Observer} type.
 */
export interface CompleteObserver {
    /**
     * Receives a completion notification.
     *
     * @param value - Optional completion value. This is not documented in the spec but used in the specs unit tests.
     */
    complete(value?: unknown): void;
};

/**
 * Observer interface type. It is constructed as a union type to ensure that at least one of the next/error/complete
 * properties is set.
 */
export type Observer<T = unknown> = (NextObserver<T> | ErrorObserver | CompleteObserver) & {
    /**
     * Receives the subscription object when `subscribe` is called.
     *
     * @param subscription - The subscription object.
     */
    start?(subscription: Subscription): void;

    /**
     * Receives the next value in the sequence.
     *
     * @param value - The next value in the sequence. Undefined when observable doesn't have a value type.
     */
    next?(value: T): void;

    /**
     * Receives the sequence error.
     *
     * @param error - The error.
     */
    error?(error: Error): void;

    /**
     * Receives a completion notification.
     *
     * @param value - Optional completion value. This is not documented in the spec but used in the specs unit tests.
     */
    complete?(value?: unknown): void;
};
