import { createMaybeAbortablePromise } from './createMaybeAbortablePromise';

export const wait = (
  timeInMilliseconds: number,
  signal?: AbortSignal,
): Promise<void> => {
  let timeoutId: undefined | ReturnType<typeof setTimeout>;
  const onAbort = (): void => {
    if (!timeoutId) {
      return;
    }
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  const executor = (resolve: () => void): void => {
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      resolve();
    }, timeInMilliseconds);
  };

  return createMaybeAbortablePromise(executor, signal, onAbort);
};
