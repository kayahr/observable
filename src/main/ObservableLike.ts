/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Observer } from "./Observer.js";
import { Subscribable } from "./Subscribable.js";
import { Subscription } from "./Subscription.js";

/**
 * The base interface for observable objects.
 */
export interface ObservableLike<T = unknown> extends Subscribable<T> {
    /** @inheritDoc */
    subscribe(observer: Observer<T>): Subscription;

    /** @inheritDoc */
    subscribe(onNext: (value: T) => void, onError?: (error: Error) => void, onComplete?: () => void):
        Subscription;

    /** @inheritDoc */
    subscribe(...args: [ Observer<T> ] | [ (value: T) => void, ((error: Error) => void)?, (() => void)? ]):
        Subscription;

    /**
     * Returns itself.
     */
    [Symbol.observable]?(): ObservableLike<T>;

    /**
     * Returns itself. This is used as a fallback for environments which don't support `Symbol.observable`.
     */
    "@@observable"?(): ObservableLike<T>;
}
