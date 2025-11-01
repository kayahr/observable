/*
 * Copyright (C) 2022 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import "symbol-observable";

import { from } from "rxjs";
import { describe, it } from "node:test";

import { SharedObservable } from "../main/SharedObservable.ts";
import type { SubscriptionObserver } from "../main/SubscriptionObserver.ts";
import { assertEquals, assertNotNull, assertSame } from "@kayahr/assert";

describe("SharedObservable", () => {
    it("runs subscriber function only on first subscribe", (context) => {
        const fn = context.mock.fn();
        const o = new SharedObservable(fn);
        assertSame(fn.mock.callCount(), 0);
        o.subscribe(() => {});
        assertSame(fn.mock.callCount(), 1);
        fn.mock.resetCalls();
        o.subscribe(() => {});
        assertSame(fn.mock.callCount(), 0);
    });
    it("runs teardown function only on last unsubscribe", (context) => {
        const fn = context.mock.fn();
        const o = new SharedObservable(() => fn);
        const sub1 = o.subscribe(() => {});
        const sub2 = o.subscribe(() => {});
        sub1.unsubscribe();
        assertSame(fn.mock.callCount(), 0);
        sub2.unsubscribe();
        assertSame(fn.mock.callCount(), 1);
    });
    it("runs teardown unsubscribable only on last unsubscribe", (context) => {
        const fn = context.mock.fn();
        const o = new SharedObservable(() => ({ unsubscribe: fn }));
        const sub1 = o.subscribe(() => {});
        const sub2 = o.subscribe(() => {});
        sub1.unsubscribe();
        assertSame(fn.mock.callCount(), 0);
        sub2.unsubscribe();
        assertSame(fn.mock.callCount(), 1);
    });
    it("emits values to multiple subscribers", (context) => {
        let producer: SubscriptionObserver<number> | undefined;
        const o = new SharedObservable<number>(subscriber => {
            producer = subscriber;
        });
        const fn1 = context.mock.fn();
        o.subscribe(fn1);
        const fn2 = context.mock.fn();
        o.subscribe(fn2);
        assertNotNull(producer, );
        if (producer != null) {
            producer.next(23);
            assertSame(fn1.mock.callCount(), 1);
            assertSame(fn1.mock.calls[0].arguments[0], 23);
            assertSame(fn2.mock.callCount(), 1);
            assertSame(fn2.mock.calls[0].arguments[0], 23);
            assertSame(producer.closed, false);
        }
    });
    it("completes multiple subscribers", (context) => {
        let producer: SubscriptionObserver<number> | undefined;
        const o = new SharedObservable<number>(subscriber => {
            producer = subscriber;
        });
        const fn1 = context.mock.fn();
        o.subscribe({ complete: fn1 });
        const fn2 = context.mock.fn();
        o.subscribe({ complete: fn2 });
        assertNotNull(producer, );
        if (producer != null) {
            producer.complete();
            assertSame(fn1.mock.callCount(), 1);
            assertSame(fn2.mock.callCount(), 1);
            assertSame(producer.closed, true);
        }
    });
    it("emits error to multiple subscribers", (context) => {
        let producer: SubscriptionObserver<number> | undefined;
        const o = new SharedObservable<number>(subscriber => {
            producer = subscriber;
        });
        const fn1 = context.mock.fn();
        o.subscribe({ error: fn1 });
        const fn2 = context.mock.fn();
        o.subscribe({ error: fn2 });
        assertNotNull(producer, );
        if (producer != null) {
            const e = new Error("Foo!");
            producer.error(e);
            assertSame(fn1.mock.callCount(), 1);
            assertSame(fn1.mock.calls[0].arguments[0], e);
            assertSame(fn2.mock.callCount(), 1);
            assertSame(fn2.mock.calls[0].arguments[0], e);
            assertSame(producer.closed, true);
        }
    });
    it("immediately replays error on next subscription after error", (context) => {
        let producer: SubscriptionObserver<number> | undefined;
        const startup = context.mock.fn();
        const teardown = context.mock.fn();
        const o = new SharedObservable<number>(subscriber => {
            startup();
            producer = subscriber;
            return teardown;
        });
        o.subscribe({ error: () => {} });
        startup.mock.resetCalls();
        if (producer != null) {
            const error = new Error("Foo!");
            producer.error(error);
            assertSame(teardown.mock.callCount(), 1);
            teardown.mock.resetCalls();
            const onError = context.mock.fn();
            o.subscribe({ error: onError });
            assertSame(startup.mock.callCount(), 0);
            assertSame(teardown.mock.callCount(), 0);
            assertSame(onError.mock.callCount(), 1);
            assertEquals(onError.mock.calls[0].arguments, [ error ]);
        }
    });
    it("immediately replays complete on next subscription after completion", (context) => {
        let producer: SubscriptionObserver<number> | undefined;
        const startup = context.mock.fn();
        const teardown = context.mock.fn();
        const o = new SharedObservable<number>(subscriber => {
            startup();
            producer = subscriber;
            return teardown;
        });
        o.subscribe(() => {});
        startup.mock.resetCalls();
        if (producer != null) {
            producer.complete();
            assertSame(teardown.mock.callCount(), 1);
            teardown.mock.resetCalls();
            const onComplete = context.mock.fn();
            o.subscribe({ complete: onComplete });
            assertSame(startup.mock.callCount(), 0);
            assertSame(teardown.mock.callCount(), 0);
            assertSame(onComplete.mock.callCount(), 1);
        }
    });
    it("can be converted into RxJS observable", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable = new SharedObservable<number>(observer => {
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
});
