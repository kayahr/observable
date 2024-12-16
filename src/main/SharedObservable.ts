/*
 * Copyright (C) 2022 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Observable } from "./Observable.js";
import { SubscriberFunction } from "./SubscriberFunction.js";
import { SubscriptionObserver } from "./SubscriptionObserver.js";
import { TeardownLogic } from "./TeardownLogic.js";
import { isUnsubscribable } from "./Unsubscribable.js";

/**
 * A shared observable is a multicast observable maintaining an internal list of subscribers. The subscriber function
 * is called when the first subscriber subscribes to the observable. The teardown function is called when the last
 * subscriber is unsubscribed.
 */
export class SharedObservable<T> extends Observable<T> {
    public constructor(multicastSubscriber: SubscriberFunction<T>) {
        const subscribers = new Set<SubscriptionObserver<T>>();
        let teardown: TeardownLogic | null = null;
        let isComplete = false;
        let error: Error | null = null;
        super(subscriber => {
            if (isComplete) {
                subscriber.complete();
                return;
            } else if (error != null) {
                subscriber.error(error);
                return;
            }
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                teardown = multicastSubscriber({
                    get closed(): boolean { return subscriber.closed; },
                    next: v => subscribers.forEach(subscriber => subscriber.next(v)),
                    error: e => {
                        if (!isComplete && error == null) {
                            error = e;
                            subscribers.forEach(subscriber => subscriber.error(e));
                        }
                    },
                    complete: () => {
                        if (!isComplete && error == null) {
                            isComplete = true;
                            subscribers.forEach(subscriber => subscriber.complete());
                        }
                    }
                });
            }
            return () => {
                subscribers.delete(subscriber);
                if (teardown != null && subscribers.size === 0) {
                    if (isUnsubscribable(teardown)) {
                        teardown.unsubscribe();
                    } else {
                        teardown();
                    }
                }
            };
        });
    }
}
