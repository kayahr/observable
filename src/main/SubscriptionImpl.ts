/*
 * Copyright (C) 2022 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Observer } from "./Observer.js";
import { SubscriberFunction } from "./SubscriberFunction.js";
import { Subscription } from "./Subscription.js";
import { SubscriptionObserverImpl } from "./SubscriptionObserverImpl.js";
import { TeardownLogic } from "./TeardownLogic.js";
import { isUnsubscribable } from "./Unsubscribable.js";
import { toError } from "./utils.js";

/**
 * Subscription implementation used internally by {@link observable/Observable}.
 */
export class SubscriptionImpl<T> implements Subscription {
    private observer: Observer<T> | null;
    private subscriptionObserver: SubscriptionObserverImpl<T> | null = null;
    private teardown: TeardownLogic | null = null;

    /**
     * Creates a new subscription on an observable.
     *
     * @param observer   - The observer which has been subscribed to the observable.
     * @param subscriber - The subscriber function of the observable.
     */
    public constructor(observer: Observer<T>, subscriber: SubscriberFunction<T>) {
        // Needed to satisfy es-observable-tests, which are (IMHO) to strict
        this.constructor = Object;

        this.observer = observer;

        // Inform observer about new subscription if needed
        if (observer.start != null) {
            observer.start(this);

            // When subscription was closed in the start() callback then we are done here
            if (this.observer == null) {
                return;
            }
        }

        // Create the subscription observer and pass it to the observables subscriber function
        const subscriptionObserver = this.subscriptionObserver = new SubscriptionObserverImpl(observer,
            () => this.close(), () => this.cleanup());
        try {
            const teardown = this.teardown = subscriber(subscriptionObserver);

            // Runtime type check which is needed to satisfy es-observable-tests but could be removed for
            // better speed. The Function constructor check is there because it is faster than instanceof
            if (teardown != null && !isUnsubscribable(teardown)
                    && !(teardown.constructor === Function || teardown instanceof Function)) {
                throw new TypeError("Result must be a callable or subscription");
            }

            // When subscriber function has closed the observable directly then cleanup and we are done
            if (this.closed) {
                this.cleanup();
            }
        } catch (e) {
            // Errors thrown by subscriber function are passed to the error handler of the subscription observer
            subscriptionObserver.error(toError(e));
        }
    }

    /** @inheritDoc */
    public unsubscribe(): void {
        this.cleanup();
        this.close();
    }

    /** @inheritDoc */
    public get closed(): boolean {
        return this.observer == null;
    }

    /**
     * Closes the subscription and also the subscription observer if not already done.
     */
    private close(): void {
        if (this.observer != null) {
            this.observer = null;
            if (this.subscriptionObserver != null) {
                this.subscriptionObserver.close();
                this.subscriptionObserver = null;
            }
        }
    }

    /**
     * Cleans up the subscription if not already done.
     */
    private cleanup(): void {
        const teardown = this.teardown;
        if (teardown != null) {
            this.teardown = null;
            if (isUnsubscribable(teardown)) {
                teardown.unsubscribe();
            } else {
                teardown();
            }
        }
    }
}
