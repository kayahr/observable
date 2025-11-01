/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import type { Unsubscribable } from "./Unsubscribable.ts";

/**
 * Interface for subscriptions.
 */
export interface Subscription extends Unsubscribable {
    /**
     * A boolean value indicating whether the subscription is closed.
     */
    readonly closed: boolean;
}
