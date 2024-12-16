/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Interface for a subscription observer.
 */
export interface SubscriptionObserver<T = unknown> {
    /**
     * A boolean value indicating whether the subscription is closed.
     */
    readonly closed: boolean;

    /**
     * Sends the next value in the sequence
     *
     * @param value - The next value.
     */
    next(value: T): void;

    /**
     * Sends the sequence error.
     *
     * @param error - The error to send.
     */
    error(error: Error): void;

    /**
     * Sends the completion notification.
     */
    complete(): void;
}
