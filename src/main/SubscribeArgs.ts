/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Observer } from "./Observer.js";

/**
 * Subscriber arguments.
 */
export type SubscribeArgs<T = unknown> =
    | [ Observer<T> ]
    | [ (value: T) => void, ((error: Error) => void)?, (() => void)? ]
    | [
        (((value: T) => void) | null | undefined),
        (((error: any) => void) | null | undefined)?,
        ((() => void) | null | undefined)?
    ];
