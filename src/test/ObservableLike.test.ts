/*
 * Copyright (C) 2025 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "symbol-observable";

import { Subject, from, merge } from "rxjs";
import { describe, it } from "node:test";

import { Observable } from "../main/Observable.ts";
import type { ObservableLike } from "../main/ObservableLike.ts";
import type { SubscriptionObserver } from "../main/SubscriptionObserver.ts";
import { assertEquals } from "@kayahr/assert";

describe("ObservableLike", () => {
    it("can be converted into RxJS observable", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable: ObservableLike<number> = new Observable<number>(observer => {
            exposedObserver = observer;
        });
        const rxjsObservable = from(observable);
        const values: number[] = [];
        rxjsObservable.subscribe(value => values.push(value));
        if (exposedObserver == null) {
            throw new Error("Observer not exposed");
        }
        exposedObserver.next(1);
        assertEquals(values, [ 1 ]);
        exposedObserver.next(2);
        assertEquals(values, [ 1, 2 ]);
    });
    it("can be used in RxJS operators", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable: ObservableLike<number> = new Observable<number>(observer => {
            exposedObserver = observer;
        });
        const subject = new Subject<number>();
        const mergedObservable = merge(subject, observable);
        const values: number[] = [];
        mergedObservable.subscribe(value => values.push(value));
        if (exposedObserver == null) {
            throw new Error("Observer not exposed");
        }
        exposedObserver.next(1);
        subject.next(2);
        assertEquals(values, [ 1, 2 ]);
    });
});
