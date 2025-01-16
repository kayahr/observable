/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import { describe, expect, it } from "vitest";

import * as exports from "../main/index.js";
import { type InteropObservable, type InteropSubscribable } from "../main/interop.js";
import { Observable } from "../main/Observable.js";
import { type ObservableLike } from "../main/ObservableLike.js";
import { type CompleteObserver, type ErrorObserver, type NextObserver, type Observer } from "../main/Observer.js";
import { SharedObservable } from "../main/SharedObservable.js";
import { isSubscribable, type Subscribable } from "../main/Subscribable.js";
import { type SubscriberFunction } from "../main/SubscriberFunction.js";
import { type Subscription } from "../main/Subscription.js";
import { type SubscriptionObserver } from "../main/SubscriptionObserver.js";
import { type TeardownLogic } from "../main/TeardownLogic.js";
import { isUnsubscribable, type Unsubscribable } from "../main/Unsubscribable.js";

describe("index", () => {
    it("exports relevant types and functions and nothing more", () => {
        // Check classes and enums
        expect({ ...exports }).toEqual({
            isSubscribable,
            isUnsubscribable,
            Observable,
            SharedObservable
        });

        // Interfaces and types can only be checked by TypeScript
        ((): InteropObservable => (({} as exports.InteropObservable)))();
        ((): InteropSubscribable => (({} as exports.InteropSubscribable)))();
        ((): ObservableLike => (({} as exports.ObservableLike)))();
        ((): Subscribable => (({} as exports.Subscribable)))();
        ((): Subscription => (({} as exports.Subscription)))();
        ((): SubscriptionObserver => (({} as exports.SubscriptionObserver)))();
        ((): SubscriberFunction => (({} as exports.SubscriberFunction)))();
        ((): TeardownLogic => (({} as exports.TeardownLogic)))();
        ((): Unsubscribable => (({} as exports.Unsubscribable)))();
        ((): Observer => (({} as exports.Observer)))();
        ((): NextObserver => (({} as exports.NextObserver)))();
        ((): ErrorObserver => (({} as exports.ErrorObserver)))();
        ((): CompleteObserver => (({} as exports.CompleteObserver)))();
    });
});
