/*
 * Copyright (C) 2020 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import "symbol-observable";

import { runTests as runObservableTests } from "es-observable-tests";
import { Subject, from, merge } from "rxjs";
import { describe, it } from "node:test";

import { Observable } from "../main/Observable.ts";
import type { Observer } from "../main/Observer.ts";
import type { Subscribable } from "../main/Subscribable.ts";
import type { SubscriptionObserver } from "../main/SubscriptionObserver.ts";
import type { Unsubscribable } from "../main/Unsubscribable.ts";
import { assertDefined, assertEquals, assertInstanceOf, assertSame } from "@kayahr/assert";

describe("Observable", () => {
    it("passes the official es-observable-tests test suite", async () => {
        let output = "";
        const origLog = console.log;
        console.log = (s: string) => { output += `${s}\n`; };
        const result = await runObservableTests(Observable);
        console.log = origLog;
        if (result.logger.failed > 0 || result.logger.errored > 0) {
            throw new Error(`Test suite found ${result.logger.failed} failures and ${result.logger.errored} errors: ${output}`);
        }
    });
    it("correctly supports void as value type", (context) => {
        let exposedObserver: SubscriptionObserver<void> | undefined;
        const observable = new Observable<void>(observer => {
            exposedObserver = observer;
        });
        const subscriber = context.mock.fn();

        observable.subscribe(subscriber);
        if (exposedObserver == null) {
            throw new Error("Observer not exposed");
        }
        exposedObserver.next();
        assertSame(subscriber.mock.callCount(), 1);
    });
    it("can be converted into RxJS observable", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable = new Observable<number>(observer => {
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
        const observable = new Observable<number>(observer => {
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
    it("runs next function with observer as scope", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable = new Observable<number>(observer => {
            exposedObserver = observer;
        });
        const values: number[] = [];
        class MyObserver {
            private readonly factor: number = 2;

            public next(value: number): void {
                values.push(value * this.factor);
            }
        }
        observable.subscribe(new MyObserver());
        if (exposedObserver == null) {
            throw new Error("Observer not exposed");
        }
        exposedObserver.next(2);
        exposedObserver.next(3);
        assertEquals(values, [ 4, 6 ]);
    });
    it("runs complete function with observer as scope", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable = new Observable<number>(observer => {
            exposedObserver = observer;
        });
        const values: number[] = [];
        class MyObserver {
            private readonly factor: number = 3;

            public complete(): void {
                values.push(this.factor);
            }
        }
        observable.subscribe(new MyObserver());
        if (exposedObserver == null) {
            throw new Error("Observer not exposed");
        }
        exposedObserver.complete();
        assertEquals(values, [ 3 ]);
    });
    it("runs error function with observer as scope", () => {
        let exposedObserver: SubscriptionObserver<number> | undefined;
        const observable = new Observable<number>(observer => {
            exposedObserver = observer;
        });
        const values: number[] = [];
        class MyObserver {
            private readonly factor: number = 4;

            public error(e: Error): void {
                values.push(+e.message * this.factor);
            }
        }
        observable.subscribe(new MyObserver());
        if (exposedObserver == null) {
            throw new Error("Observer not exposed");
        }
        exposedObserver.error(new Error("4"));
        assertEquals(values, [ 16 ]);
    });
    describe("[Symbol.observable]", () => {
        it("returns same observable", () => {
            const observable = new Observable(() => {});
            assertSame(observable[Symbol.observable](), observable);
        });
    });
    describe("from", () => {
        it("creates observable from a subscribable object", (context) => {
            class Test implements Subscribable<number> {
                public onNext: ((value: number) => void) | null | undefined = null;

                public subscribe(observer?: null | Observer<number> | ((value: number) => void)): Unsubscribable {
                    if (observer != null) {
                        this.onNext = (observer instanceof Function) ? observer : observer.next?.bind(observer);
                    }
                    return {
                        unsubscribe: () => {
                            this.onNext = null;
                        }
                    };
                }
            }
            const test = new Test();
            const observable = Observable.from(test);
            assertInstanceOf(observable, Observable);
            const observer = context.mock.fn();
            observable.subscribe(observer);
            assertDefined(test.onNext, );
            if (test.onNext != null) {
                test.onNext(23);
            }
            assertSame(observer.mock.callCount(), 1);
            assertSame(observer.mock.calls[0].arguments[0], 23);
        });
        it("creates observable from a RxJS observable", (context) => {
            const subject = new Subject();
            const observable = Observable.from(subject);
            assertInstanceOf(observable, Observable);
            const observer = context.mock.fn();
            observable.subscribe(observer);
            subject.next(42);
            assertSame(observer.mock.callCount(), 1);
            assertSame(observer.mock.calls[0].arguments[0], 42);
        });
    });
});
