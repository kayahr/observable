/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Checks if given object is iterable.
 *
 * @returns True if iterable, false if not.
 */
export function isIterable<T>(object: unknown): object is Iterable<T> {
    return object != null && typeof (object as Iterable<unknown>)[Symbol.iterator] === "function";
}

/**
 * Converts to given parameter to an error. If parameter is already an error then it is returned as-is. Otherwise a new
 * error is created with the string representation of the parameter as message.
 *
 * @param errorOrMessage - Either an error or some value which is used as error message.
 * @returns Either the given error or a newly created error with the parameter used as error message.
 */
export function toError(errorOrMessage: unknown): Error {
    if (errorOrMessage instanceof Error) {
        return errorOrMessage;
    } else {
        return new Error(String(errorOrMessage));
    }
}
