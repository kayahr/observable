/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Interface for objects which can be unsubscribed.
 */
export interface Unsubscribable {
    /**
     * Cancels the subscription.
     */
    unsubscribe(): void;
}

/**
 * Checks if given object is an {@link Unsubscribable}.
 *
 * @param o - The object to check.
 * @returns True if unsubscribable, false if not.
 */
export function isUnsubscribable(o: unknown): o is Unsubscribable {
    return o !== null && typeof (o as (Unsubscribable)).unsubscribe === "function";
}
