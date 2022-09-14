import { AbortError } from './createAbortablePromise';
import { createRetriedOnErrorPromise } from './createRetriedOnErrorPromise';
import { waitTimeout } from './timeout';

describe('utils/promises/createRetriedOnErrorPromise works', () => {
  jest.useFakeTimers();

  it('resolves on first try', async () => {
    const p = createRetriedOnErrorPromise(1, () => Promise.resolve(1234));
    await expect(p).resolves.toBe(1234);
  });

  it('resolves after retry', async () => {
    const retries = 3;
    let tries = 0;
    const createPromise = jest.fn((): Promise<number> => {
      tries += 1;
      if (tries < retries) {
        return Promise.reject(new Error('forced bug'));
      }
      return Promise.resolve(1234);
    });

    const p = createRetriedOnErrorPromise(retries, createPromise);
    await expect(p).resolves.toBe(1234);

    expect(createPromise).toBeCalledTimes(retries);
  });

  it('rejects if exceeds retries', async () => {
    const p = createRetriedOnErrorPromise(1, () =>
      Promise.reject(new Error('forced bug')),
    );
    await expect(p).rejects.toEqual(new Error('forced bug'));
  });

  it('rejects if aborted before timeout', async () => {
    const timeout = 1000;
    const abortController = new AbortController();
    const p = createRetriedOnErrorPromise(
      2,
      signal => waitTimeout(timeout, signal),
      abortController.signal,
    );
    jest.advanceTimersByTime(timeout / 2);
    abortController.abort();
    jest.runOnlyPendingTimers();
    await expect(p).rejects.toEqual(new AbortError());
  });

  it('rejects if aborted after timeout', async () => {
    const timeout = 1000;
    const abortController = new AbortController();
    const p = createRetriedOnErrorPromise(
      2,
      signal => waitTimeout(timeout, signal),
      abortController.signal,
    );
    jest.advanceTimersByTime(timeout + 1);
    abortController.abort();
    jest.runOnlyPendingTimers();
    await expect(p).rejects.toEqual(new AbortError());
  });
});
