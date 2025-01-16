/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Observer } from "./Observer.js";
import { Unsubscribable } from "./Unsubscribable.js";

/**
 * Interface for subscribable objects.
 */
export interface Subscribable<T = unknown> {
    /**
     * Subscribes the given observer to this object.
     *
     * @param observer - The observer to subscribe.
     * @return Object which can be used to unsubscribe the observer.
     */
    subscribe(observer: Observer<T> | ((value: T) => void)): Unsubscribable;

    /**
     * Constructs a new observer using the given callback functions and subscribes it to this object.
     *
     * @param next     - Receives the next value in the sequence.
     * @param error    - Receives the sequence error.
     * @param complete -  Receives a completion notification.
     * @return Object which can be used to unsubscribe the observer.
     */
    subscribe(next: (value: T) => void, error?: (error: Error) => void, complete?: () => void): Unsubscribable;
}

/**
 * Checks if the given object is a subscribable.
 *
 * @param object - The object to check.
 * @return True if object is a subscribable, false if not.
 */
export function isSubscribable(object: unknown): object is Subscribable {
    return object != null && typeof (object as Subscribable).subscribe === "function";
}
