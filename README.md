# Observable

[GitHub] | [NPM] | [API Doc]

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


## Helper functions

The `isSubscribable` type-guard function can be used to check if a given value is an object providing a `subscribe` method:

```typescript
import { isSubscribable } from "@kayahr/observable";

if (isSubscribable(something)) {
    something.subscribe(console.log);
}
```

There is also an `isUnsubscribable` type-guard function to check if given value is an object providing an `unsubscribe` method:

```typescript
import { isUnsubscribable } from "@kayahr/observable";

if (isUnsubscribable(something)) {
    something.unsubscribe();
}
```


## RxJS compatibility

RxJS' Observable implementation is not standard-conform, especially because it uses a `pipe` method which is not part of the proposed standard. RxJS unfortunately also does not use a polyfill for `Symbol.observable`, it just assumes that one is present or otherwise it falls back on using a non-standard `"@@observable"` string instead. To ensure compatibility between RxJS and any other observable implementation make sure to load a `Symbol.observable` polyfill like [symbol-observable] before importing RxJS:

```typescript
import "symbol-observable";
```

In order to use Observable instances of this library in RxJS pipes you have to convert the observable with RxJS' `from` function:

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

[API Doc]: https://kayahr.github.io/observable/
[GitHub]: https://github.com/kayahr/observable
[NPM]: https://www.npmjs.com/package/@kayahr/observable
[symbol-observable]: https://www.npmjs.com/package/symbol-observable
