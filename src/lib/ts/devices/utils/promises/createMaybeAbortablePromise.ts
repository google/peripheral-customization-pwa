import { createAbortablePromise } from './createAbortablePromise';

export const createMaybeAbortablePromise = <T>(
  executor: (
    resolve: (v: T | PromiseLike<T>) => void,
    reject: (reason: unknown) => void,
  ) => void,
  signal?: AbortSignal,
  onAbort?: () => void,
): Promise<T> =>
  signal
    ? createAbortablePromise(executor, signal, onAbort)
    : new Promise(executor);
