export class AbortError extends Error {
  constructor(message = 'aborted') {
    super(message);
    this.name = new.target.name; // TS changed and it would be "Error" instead of "AbortError"
  }
}

/**
 * Create a promise that `rejects(new Error('aborted'))` whenever signal.aborted is true.
 * @param executor how to create the promise, same as Promise constructor parameter.
 * @param signal event target to monitor abortion
 * @param onAbort optional function to be called before the promise is rejected due abortion
 */

export const createAbortablePromise = <T>(
  executor: (
    resolve: (v: T | PromiseLike<T>) => void,
    reject: (reason: unknown) => void,
  ) => void,
  signal: AbortSignal,
  onAbort?: () => void,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const abortListener = (): void => {
      onAbort?.();
      signal.removeEventListener('abort', abortListener);
      // NOTE: need setTimeout() otherwise abortController.abort() before the promise is awaited
      // will result in an unhandled promise. Then schedule it for the next tick
      setTimeout(() => reject(new AbortError()), 0);
    };

    signal.addEventListener('abort', abortListener);
    if (signal.aborted) {
      abortListener();
      return;
    }

    const createWrapped = <A extends unknown[], R>(
      f: (...args: A) => R,
    ): ((...args: A) => R) => {
      return (...args: A): R => {
        signal.removeEventListener('abort', abortListener);
        return f(...args);
      };
    };

    executor(createWrapped(resolve), createWrapped(reject));
  });
