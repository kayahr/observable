# Observable

A simple Observable implementation written in TypeScript and complying to the [TC39 Observable Tests](https://www.npmjs.com/package/es-observable-tests).

The library is very small (around 3KB when minified) and only depends on the [symbol-observable] polyfill.


## Usage

Install the library as a dependency in your project:

```
npm install @kayahr/observable
```

And then use it like this:

```typescript
import { Observable } from "@kayahr/observable";

const observable = new Observable<Date>(subscriber => {
    // Send current time each second
    const interval = setInterval(() => subscriber.next(new Date()), 1000);

    // Stop interval when unsubscribed
    return () => clearInterval(interval);
});

observable.subscribe(date => console.log(date));
```

See [TC39 Observable Proposal](https://github.com/tc39/proposal-observable) for details.


## SharedObservable

While a standard Observable is unicast, in a lot of situations a multicast Observable is preferable. This library provides a specialized `SharedObservable` class for exactly this case. A shared observable is initialized on first subscribe and cleaned up on last unsubscribe. Beside of this there is no difference to the standard Observable.

## RxJS compatibility

RxJS' Observable implementation is not standard-conform, especially because it uses a `pipe` method which is not part of the proposed standard. So in order to use Observable instances of this library in RxJS pipes you have to convert the observable with RxJS' `from` function:

```typescript
import { from } from "rxjs";
import { Observable } from "@kayahr/observable";

const observable = new Observable(...);
const rxjsObservable = from(observable);
rxjsObservable.pipe(...);
```

Vice-versa you can use the static `Observable.from` method to convert an RxJS Observable if needed:

```typescript
import { Subject } from "rxjs";
import { Observable } from "@kayahr/observable";

const subject = new Subject<number>();
const observable = Observable.from(subject);
```

But this should never be necessary as long as you use the `Subscribable` interface instead of a specific `Observable` type in your code, which is compatible to both Observable implementations:

```typescript
import { Subscribable } from "@kayahr/observable";

function foo(subscribable: Subscribable<number>): void {
    subscribable.subscribe(v => console.log(v));
}
```

[symbol-observable]: https://www.npmjs.com/package/symbol-observable
