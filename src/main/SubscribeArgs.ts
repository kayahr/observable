/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Observer } from "./Observer.ts";

/**
 * Subscriber arguments.
 */
export type SubscribeArgs<T = unknown>
    = [ Observer<T> ]
    | [ (value: T) => void, ((error: Error) => void)?, (() => void)? ]
    | [
        (((value: T) => void) | null | undefined),
        (((error: unknown) => void) | null | undefined)?,
        ((() => void) | null | undefined)?
    ];
