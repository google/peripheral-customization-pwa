import { AbortError } from './createAbortablePromise';
import { wait } from './wait';

describe('utils/promises/wait works', () => {
  jest.useFakeTimers();

  it('resolves on expires (without signal)', async () => {
    const timeout = 100;
    const callback = jest.fn();
    const p = wait(timeout).then(callback);

    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(timeout);

    await expect(p).resolves.toBeUndefined();
    expect(callback).toBeCalled();
  });

  it('resolves on expires (with signal)', async () => {
    const timeout = 100;
    const callback = jest.fn();
    const abortController = new AbortController();
    const p = wait(timeout, abortController.signal).then(callback);

    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(timeout);

    await expect(p).resolves.toBeUndefined();
    expect(callback).toBeCalled();
  });

  it('can be aborted after start', async () => {
    const timeout = 100;
    const callback = jest.fn();
    const abortController = new AbortController();
    const p = wait(timeout, abortController.signal).then(callback);

    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(timeout / 2);
    abortController.abort();
    jest.runOnlyPendingTimers();
    await expect(p).rejects.toThrowError(new AbortError());
    expect(callback).not.toBeCalled();
  });

  it('can be aborted before start', async () => {
    const timeout = 100;
    const abortController = new AbortController();
    abortController.abort();
    const p = wait(timeout, abortController.signal);
    jest.runOnlyPendingTimers();
    await expect(p).rejects.toThrowError(new AbortError());
  });
});
