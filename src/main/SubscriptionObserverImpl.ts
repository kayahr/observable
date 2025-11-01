/*
 * Copyright (C) 2022 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Observer } from "./Observer.ts";
import type { SubscriptionObserver } from "./SubscriptionObserver.ts";
import { toError } from "./utils.ts";

/**
 * Implementation of {@link observable/SubscriptionObserver} which is internally passed to the subscriber function of
 * an {@link observable/Observable}.
 */
export class SubscriptionObserverImpl<T> implements SubscriptionObserver<T> {
    private observer: Observer<T> | null;
    private readonly onClose: () => void;
    private readonly onCleanup: () => void;

    /**
     * Creates new subscription observer.
     *
     * @param observer  - The observer which has been subscribed to the observable.
     * @param onClose   - Callback called when observer is closed.
     * @param onCleanup - Callback called when observer is cleaned up.
     */
    public constructor(observer: Observer<T> | null, onClose: () => void, onCleanup: () => void) {
        this.observer = observer;
        this.onClose = onClose;
        this.onCleanup = onCleanup;

        // Needed to satisfy es-observable-tests, which are (IMHO) to strict
        this.constructor = Object;
    }

    /**
     * Closes the subscription observer and also closes the subscription if not already done.
     */
    public close(): void {
        if (this.observer != null) {
            this.observer = null;
            this.onClose();
        }
    }

    /** @inheritdoc */
    public get closed(): boolean {
        return this.observer == null;
    }

    /** @inheritdoc */
    public next(arg: T): unknown {
        try {
            return this.observer?.next?.(arg);
        } catch (error) {
            try {
                return this.error(toError(error));
            } catch {
                throw error;
            }
        }
    }

    /** @inheritdoc */
    public error(e: Error): unknown {
        const observer = this.observer;
        try {
            this.close();
            const onError = observer?.error ?? null;

            if (onError == null) {
                // When no error handler is present then just throw the error
                throw e;
            }

            // Must be called like this because of strict checking of the number of times the error property is
            // looked up in es-observable-tests. So we cannot simply do a null check on the property and then
            // call it because this would be two lookups instead of the expected one lookup. So this could be
            // optimized when the tests weren't this strict.
            return onError.call(observer, e);
        } finally  {
            try {
                this.onCleanup();
            } catch {
                // Already handling an error. Additional errors during cleanup are intentionally ignored.
            }
        }
    }

    /** @inheritdoc */
    public complete(arg?: unknown): unknown {
        const observer = this.observer;
        try {
            this.close();
            const result = observer?.complete?.(arg);
            this.onCleanup();
            return result;
        } catch (error) {
            try {
                this.onCleanup();
            } catch {
                // Already handling an error. Additional errors during cleanup are intentionally ignored.
            }
            throw error;
        }
    }
}
