import { Subscribable } from "./Subscribable.js";

export type SubscribableOperator<T, R = T> = (arg: Subscribable<T>) => Subscribable<R>;
