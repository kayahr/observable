/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "symbol-observable";

import { ObservableLike } from "./ObservableLike.js";
import { Observer } from "./Observer.js";
import { isSubscribable, Subscribable } from "./Subscribable.js";
import type { SubscribeArgs } from "./SubscribeArgs.js";
import { SubscriberFunction } from "./SubscriberFunction.js";
import { Subscription } from "./Subscription.js";
import { SubscriptionImpl } from "./SubscriptionImpl.js";
import { isIterable } from "./utils.js";

/**
 * Interface of an observable constructor.
 */
export interface ObservableConstructor<T> {
    /**
     * Constructs a new {@link Observable}.
     *
     * @param subscriber - The subscriber function.
     */
    new (subscriber: SubscriberFunction<T>): ObservableLike<T>;

    /**
     * Converts any observable object or iterable to an {@link Observable}.
     *
     * @param items - The items to convert.
     * @return The created observable.
     */
    of(...items: T[]): ObservableLike<T>;

    /**
     * Converts an observable or iterable to an Observable.
     *
     * @param observable - The observable or iterable to convert.
     * @return The created observable.
     */
    from(observable: Subscribable<T> | Iterable<T>): ObservableLike<T>;
}

/**
 * Observable implementation.
 */
export class Observable<T> implements ObservableLike<T> {
    /** The subscriber function. */
    private readonly subscriber: SubscriberFunction<T>;

    /**
     * Creates a new observable using the given subscriber function.
     *
     * @param subscriber - The subscriber function.
     */
    public constructor(subscriber: SubscriberFunction<T>) {
        if (!(subscriber.constructor === Function || subscriber instanceof Function)) {
            throw new TypeError("Parameter must be a subscriber function");
        }
        this.subscriber = subscriber;
    }

    /**
     * Converts items to an {@link Observable}.
     *
     * @param items - The items to convert.
     * @returns The created observable.
     */
    public static of<T>(...items: T[]): ObservableLike<T> {
        return createObservableOf<T>(this, Observable, ...items);
    }

    /**
     * Converts any observable object or iterable to an {@link Observable}.
     *
     * @param observable - The observable or iterable to convert.
     * @returns The created observable.
     */
    public static from<T>(observable: Subscribable<T> | Iterable<T>): ObservableLike<T> {
        return createObservableFrom<T>(this, Observable, observable);
    }

    /** @inheritDoc */
    public [Symbol.observable](): this {
        return this;
    }

    /** @inheritDoc */
    public subscribe(observer: Observer<T>): Subscription;

    /** @inheritDoc */
    public subscribe(onNext: (value: T) => void, onError?: (error: Error) => void,
        onComplete?: () => void): Subscription;

    /** @deprecated Use an observer instead of a complete callback */
    public subscribe(next: null | undefined, error: null | undefined, complete: () => void): Subscription;

    /** @deprecated Use an observer instead of an error callback */
    public subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Subscription;

    /** @deprecated Use an observer instead of a complete callback */
    public subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Subscription;

    /** @inheritDoc */
    public subscribe(...args: SubscribeArgs<T>): Subscription;

    /** @inheritDoc */
    public subscribe(arg1: (Observer<T> | ((value: T) => void) | null | undefined),
            ...rest: [ (((error: Error) => void) | null)?, ((() => void) | null)? ]): Subscription {
        // This hack is needed because the observable spec unit tests require the method to have ONE fixed argument.
        // IMHO the tests are too strict here and we could get rid of this casted array creation by using `...args`
        // in the method signature directly.
        const args = [ arg1, ...rest ] as SubscribeArgs<T>;
        let observer: Observer<T>;
        if (args[0] instanceof Function) {
            observer = {
                start: undefined,
                next: args[0],
                error: args[1] ?? undefined,
                complete: args[2] ?? undefined
            };
        } else if (args[0] instanceof Object) {
            observer = args[0];
        } else {
            throw new TypeError("Parameter must be an observer object or function");
        }

        return new SubscriptionImpl(observer, this.subscriber);
    }
}

export function createObservableOf<T>(thisConstructor: ObservableConstructor<T>,
        fallbackConstructor: ObservableConstructor<T>, ...items: T[]): ObservableLike<T> {
    const constructor = thisConstructor instanceof Function ? thisConstructor : fallbackConstructor;
    return new constructor(observer => {
        for (const value of items) {
            observer.next(value);
        }
        observer.complete();
    });
}

export function createObservableFrom<T>(thisConstructor: ObservableConstructor<T>,
        fallbackConstructor: ObservableConstructor<T>, observable: Subscribable<T> | Iterable<T>):
        ObservableLike<T> {
    const constructor = thisConstructor instanceof Function ? thisConstructor : fallbackConstructor;
    if (isIterable(observable)) {
        return new constructor(observer => {
            for (const value of observable) {
                observer.next(value);
            }
            observer.complete();
        });
    } else if (observable instanceof Object) {
        const observableFactory = (observable as Observable<T>)[Symbol.observable];
        if (observableFactory instanceof Function) {
            const observable = observableFactory();
            if (observable instanceof Object) {
                if (observable.constructor !== constructor) {
                    return new constructor(observer => observable.subscribe(observer));
                }
                return observable;
            }
        }
        if (isSubscribable(observable)) {
            return new constructor(observer => observable.subscribe(observer));
        }
    }
    throw new TypeError("Not an observable");
}
