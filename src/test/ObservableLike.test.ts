/*
 * Copyright (C) 2025 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "symbol-observable";

import { from, merge, Subject } from "rxjs";
import { describe, expect, it } from "vitest";

import { Observable } from "../main/Observable.js";
import type { ObservableLike } from "../main/ObservableLike.js";
import type { SubscriptionObserver } from "../main/SubscriptionObserver.js";

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
        expect(values).toEqual([ 1 ]);
        exposedObserver.next(2);
        expect(values).toEqual([ 1, 2 ]);
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
        expect(values).toEqual([ 1, 2 ]);
    });
});
