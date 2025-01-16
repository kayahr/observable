/*
 * Copyright (C) 2022 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information
 */

import "symbol-observable";

import { from } from "rxjs";
import { describe, expect, it, vi } from "vitest";

import { SharedObservable } from "../main/SharedObservable.js";
import { SubscriptionObserver } from "../main/SubscriptionObserver.js";

describe("SharedObservable", () => {
    it("runs subscriber function only on first subscribe", () => {
        const fn = vi.fn();
        const o = new SharedObservable(fn);
        expect(fn).not.toHaveBeenCalled();
        o.subscribe(() => {});
        expect(fn).toHaveBeenCalledOnce();
        fn.mockReset();
        o.subscribe(() => {});
        expect(fn).not.toHaveBeenCalled();
    });
    it("runs teardown function only on last unsubscribe", () => {
        const fn = vi.fn();
        const o = new SharedObservable(() => fn);
        const sub1 = o.subscribe(() => {});
        const sub2 = o.subscribe(() => {});
        sub1.unsubscribe();
        expect(fn).not.toHaveBeenCalled();
        sub2.unsubscribe();
        expect(fn).toHaveBeenCalledOnce();
    });
    it("runs teardown unsubscribable only on last unsubscribe", () => {
        const fn = vi.fn();
        const o = new SharedObservable(() => ({ unsubscribe: fn }));
        const sub1 = o.subscribe(() => {});
        const sub2 = o.subscribe(() => {});
        sub1.unsubscribe();
        expect(fn).not.toHaveBeenCalled();
        sub2.unsubscribe();
        expect(fn).toHaveBeenCalledOnce();
    });
    it("emits values to multiple subscribers", () => {
        let producer: SubscriptionObserver<number> | undefined;
        const o = new SharedObservable<number>(subscriber => {
            producer = subscriber;
        });
        const fn1 = vi.fn();
        o.subscribe(fn1);
        const fn2 = vi.fn();
        o.subscribe(fn2);
        expect(producer).not.toBeNull();
        if (producer != null) {
            producer.next(23);
            expect(fn1).toHaveBeenCalledOnce();
            expect(fn1).toHaveBeenCalledWith(23);
            expect(fn2).toHaveBeenCalledOnce();
            expect(fn2).toHaveBeenCalledWith(23);
            expect(producer.closed).toBe(false);
        }
    });
    it("completes multiple subscribers", () => {
        let producer: SubscriptionObserver<number> | undefined;
        const o = new SharedObservable<number>(subscriber => {
            producer = subscriber;
        });
        const fn1 = vi.fn();
        o.subscribe({ complete: fn1 });
        const fn2 = vi.fn();
        o.subscribe({ complete: fn2 });
        expect(producer).not.toBeNull();
        if (producer != null) {
            producer.complete();
            expect(fn1).toHaveBeenCalledOnce();
            expect(fn2).toHaveBeenCalledOnce();
            expect(producer.closed).toBe(true);
        }
    });
    it("emits error to multiple subscribers", () => {
        let producer: SubscriptionObserver<number> | undefined;
        const o = new SharedObservable<number>(subscriber => {
            producer = subscriber;
        });
        const fn1 = vi.fn();
        o.subscribe({ error: fn1 });
        const fn2 = vi.fn();
        o.subscribe({ error: fn2 });
        expect(producer).not.toBeNull();
        if (producer != null) {
            const e = new Error("Foo!");
            producer.error(e);
            expect(fn1).toHaveBeenCalledOnce();
            expect(fn1).toHaveBeenCalledWith(e);
            expect(fn2).toHaveBeenCalledOnce();
            expect(fn2).toHaveBeenCalledWith(e);
            expect(producer.closed).toBe(true);
        }
    });
    it("immediately replays error on next subscription after error", () => {
        let producer: SubscriptionObserver<number> | undefined;
        const startup = vi.fn();
        const teardown = vi.fn();
        const o = new SharedObservable<number>(subscriber => {
            startup();
            producer = subscriber;
            return teardown;
        });
        o.subscribe({ error: () => {} });
        startup.mockReset();
        if (producer != null) {
            const error = new Error("Foo!");
            producer.error(error);
            expect(teardown).toHaveBeenCalledOnce();
            teardown.mockReset();
            const onError = vi.fn();
            o.subscribe({ error: onError });
            expect(startup).not.toHaveBeenCalled();
            expect(teardown).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalledOnce();
            expect(onError.mock.calls[0]).toEqual([ error ]);
        }
    });
    it("immediately replays complete on next subscription after completion", () => {
        let producer: SubscriptionObserver<number> | undefined;
        const startup = vi.fn();
        const teardown = vi.fn();
        const o = new SharedObservable<number>(subscriber => {
            startup();
            producer = subscriber;
            return teardown;
        });
        o.subscribe(() => {});
        startup.mockReset();
        if (producer != null) {
            producer.complete();
            expect(teardown).toHaveBeenCalledOnce();
            teardown.mockReset();
            const onComplete = vi.fn();
            o.subscribe({ complete: onComplete });
            expect(startup).not.toHaveBeenCalled();
            expect(teardown).not.toHaveBeenCalled();
            expect(onComplete).toHaveBeenCalledOnce();
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
        expect(values).toEqual([ 1 ]);
        exposedObserver.next(2);
        expect(values).toEqual([ 1, 2 ]);
    });
});
