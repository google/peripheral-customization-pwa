import { chainAbortController } from '../chainAbortController';
import { AbortError } from './createAbortablePromise';
import { waitTimeout, TimedOutError } from './timeout';

export const createTimeLimitedPromise = <T = unknown>(
  timeout: number,
  abortablePromiseCreator: (signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal /* used to abort the whole thing, behaves like the timeout expired earlier */,
): Promise<T> => {
  if (signal?.aborted) {
    return Promise.reject(new AbortError());
  }

  const abortController = new AbortController();
  const cleanupAbortListenerChain =
    signal && chainAbortController(abortController, signal);

  let failure: Error | undefined;

  return Promise.race([
    waitTimeout(timeout, signal).catch(error => {
      if (!failure && error instanceof TimedOutError) {
        failure = error;
        abortController.abort();
      }
      throw error;
    }),
    abortablePromiseCreator(abortController.signal),
  ])
    .catch(error => {
      if (failure) throw failure;
      if (abortController.signal.aborted) throw new AbortError();
      throw error;
    })
    .finally(cleanupAbortListenerChain);
};
