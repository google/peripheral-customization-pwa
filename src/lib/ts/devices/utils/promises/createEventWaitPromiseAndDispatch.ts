import { EventEmitter } from 'events';
import { chainAbortController } from '../chainAbortController';
import { AbortError } from './createAbortablePromise';
import { createEventWaitPromise } from './createEventWaitPromise';

export const createEventWaitPromiseAndDispatch = <
  T = Event,
  A extends unknown[] = [Event],
>(
  createTriggerPromise: (signal?: AbortSignal) => Promise<unknown>,
  target: EventEmitter,
  eventName: string,
  signal?: AbortSignal,
  parseEvent?: (...args: A) => T | PromiseLike<T>,
): Promise<T> => {
  if (signal?.aborted) {
    return Promise.reject(new AbortError());
  }

  const abortController = new AbortController();
  const cleanupAbortListenerChain =
    signal && chainAbortController(abortController, signal);

  return Promise.all([
    createEventWaitPromise<T, A>(
      target,
      eventName,
      abortController.signal,
      parseEvent,
    ),
    createTriggerPromise(signal).catch(error => {
      abortController.abort();
      throw error;
    }),
  ])
    .then(([eventResult]) => eventResult)
    .finally(cleanupAbortListenerChain);
};
