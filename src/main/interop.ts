/*
 * Copyright (C) 2025 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Observer } from "./Observer.ts";
import type { Unsubscribable } from "./Unsubscribable.ts";

/**
 * Minimal interface for a subscribable, meant for interoperation between different observable implementations.
 */
export interface InteropSubscribable<T = unknown> {
    /**
     * Subscribes the given observer to this object.
     *
     * @param observer - The observer to subscribe.
     * @returns Object which can be used to unsubscribe the observer.
     */
    subscribe(observer: Observer<T>): Unsubscribable;
}

/**
 * Interface for observable interoperation.
 */
export interface InteropObservable<T = unknown> {
    /**
     * @returns an interop subscribable.
     */
    [Symbol.observable](): InteropSubscribable<T>;
}
