/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { InteropObservable } from "./interop.js";
import type { Observer } from "./Observer.js";
import type { Subscription } from "./Subscription.js";

/**
 * The base interface for observable objects.
 */
export interface ObservableLike<T = unknown> extends InteropObservable<T> {

    /**
     * Subscribes the given observer to this object.
     *
     * @param observer - The observer to subscribe.
     * @return Object which can be used to unsubscribe the observer.
     */
    subscribe(observer: Observer<T>): Subscription;

    /**
     * Constructs a new observer using the given callback functions and subscribes it to this object.
     *
     * @param next     - Receives the next value in the sequence.
     * @param error    - Receives the sequence error.
     * @param complete -  Receives a completion notification.
     * @return Object which can be used to unsubscribe the observer.
     */
    subscribe(next: (value: T) => void, error?: (error: Error) => void, complete?: () => void): Subscription;
}
