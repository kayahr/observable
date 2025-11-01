/*
 * Copyright (C) 2024 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import { describe, it } from "node:test";
import { assertEquals } from "@kayahr/assert";
import * as exports from "../main/index.ts";
import type { InteropObservable, InteropSubscribable } from "../main/interop.ts";
import { Observable } from "../main/Observable.ts";
import type { ObservableLike } from "../main/ObservableLike.ts";
import type { CompleteObserver, ErrorObserver, NextObserver, Observer } from "../main/Observer.ts";
import { SharedObservable } from "../main/SharedObservable.ts";
import { type Subscribable, isSubscribable } from "../main/Subscribable.ts";
import type { SubscriberFunction } from "../main/SubscriberFunction.ts";
import type { Subscription } from "../main/Subscription.ts";
import type { SubscriptionObserver } from "../main/SubscriptionObserver.ts";
import type { TeardownLogic } from "../main/TeardownLogic.ts";
import { type Unsubscribable, isUnsubscribable } from "../main/Unsubscribable.ts";

describe("index", () => {
    it("exports relevant types and functions and nothing more", () => {
        // Check classes and enums
        assertEquals({ ...exports }, {
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
