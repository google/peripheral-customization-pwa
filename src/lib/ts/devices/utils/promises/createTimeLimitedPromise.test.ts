import { AbortError } from './createAbortablePromise';
import { createTimeLimitedPromise } from './createTimeLimitedPromise';
import { TimedOutError } from './timeout';

describe('utils/promises/createTimeLimitedPromise works', () => {
  jest.useFakeTimers();

  const createAbortablePromise = (signal?: AbortSignal): Promise<never> =>
    new Promise((_, reject) => {
      const onAbort = (): void => {
        signal?.removeEventListener('abort', onAbort);
        reject(new Error('promise was aborted'));
      };
      signal?.addEventListener('abort', onAbort);
    });

  it('resolves if did not time out', async () => {
    const timeout = 1000;
    const p = createTimeLimitedPromise(timeout, () => Promise.resolve(1234));
    jest.runAllTimers();
    await expect(p).resolves.toBe(1234);
  });

  it('rejects if did not time out', async () => {
    const timeout = 1000;
    const error = new Error('force error');
    const p = createTimeLimitedPromise(timeout, () => Promise.reject(error));
    jest.runAllTimers();
    await expect(p).rejects.toBe(error);
  });

  it('rejects if times out', async () => {
    const timeout = 1000;
    const p = createTimeLimitedPromise(timeout, createAbortablePromise);
    jest.runAllTimers();
    await expect(p).rejects.toEqual(new TimedOutError());
  });

  it('can be aborted after start', async () => {
    const timeout = 1000;
    const abortController = new AbortController();
    const p = createTimeLimitedPromise(
      timeout,
      createAbortablePromise,
      abortController.signal,
    );
    abortController.abort();
    jest.runAllTimers();
    await expect(p).rejects.toEqual(new AbortError());
  });

  it('can be aborted before start', async () => {
    const timeout = 1000;
    const abortController = new AbortController();
    abortController.abort();

    const p = createTimeLimitedPromise(
      timeout,
      createAbortablePromise,
      abortController.signal,
    );
    jest.runAllTimers();
    await expect(p).rejects.toEqual(new AbortError());
  });
});
