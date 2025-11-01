/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Subscribable } from "./Subscribable.ts";

export type SubscribableOperator<T, R = T> = (arg: Subscribable<T>) => Subscribable<R>;
