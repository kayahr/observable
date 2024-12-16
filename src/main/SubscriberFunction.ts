/*
 * Copyright (C) 2018 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { SubscriptionObserver } from "./SubscriptionObserver.js";
import { TeardownLogic } from "./TeardownLogic.js";

/**
 * The type of the subscriber function passed to the observable constructor.
 */
export type SubscriberFunction<T = unknown> = (observer: SubscriptionObserver<T>) => TeardownLogic;
