import { AbortError } from './createAbortablePromise';
import { waitTimeout, TimedOutError } from './timeout';

describe('utils/promises/timeout works', () => {
  jest.useFakeTimers();

  it('rejects on expires (without signal)', async () => {
    const timeout = 100;
    const callback = jest.fn();
    const p = waitTimeout(timeout).then(callback);
    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(timeout);

    await expect(p).rejects.toThrowError(TimedOutError);
    expect(callback).not.toBeCalled();
  });

  it('rejects on expires (with signal)', async () => {
    const timeout = 100;
    const callback = jest.fn();
    const abortController = new AbortController();
    const p = waitTimeout(timeout, abortController.signal).then(callback);
    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(timeout);

    await expect(p).rejects.toThrowError(TimedOutError);
    expect(callback).not.toBeCalled();
  });

  it('can be aborted after start', async () => {
    const timeout = 100;
    const callback = jest.fn();
    const abortController = new AbortController();
    const p = waitTimeout(timeout, abortController.signal).then(callback);

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
    const p = waitTimeout(timeout, abortController.signal);
    jest.runOnlyPendingTimers();
    await expect(p).rejects.toThrowError(new AbortError());
  });
});
