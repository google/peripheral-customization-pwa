import { AbortError } from './createAbortablePromise';

// eslint-disable-next-line no-console
const dbg = console.log;

export const createRetriedOnErrorPromise = async <T = unknown>(
  retries: number,
  createPromise: (signal?: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  let lastError: unknown;
  for (let tries = 0; tries < retries && !signal?.aborted; tries += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const value = await createPromise(signal);
      dbg(
        'retriablePromise: resolved try',
        tries,
        'value:',
        value,
        createPromise,
      );
      return value;
    } catch (error) {
      dbg(
        'retriablePromise: failed try',
        tries,
        'error:',
        error,
        createPromise,
      );
      lastError = error;
    }
  }
  if (signal?.aborted) {
    lastError = new AbortError();
  }
  dbg('retriablePromise: exceeded retries', retries, createPromise, lastError);
  throw lastError;
};
