import { createAbortablePromise, AbortError } from './createAbortablePromise';

describe('utils/promises/createAbortablePromise works', () => {
  it('allows success without abort', async () => {
    const abortController = new AbortController();
    const onAbort = jest.fn();
    const p = createAbortablePromise<number>(
      resolve => resolve(1234),
      abortController.signal,
      onAbort,
    );
    await expect(p).resolves.toBe(1234);
    expect(onAbort).not.toBeCalled();
  });

  it('rejects if aborted after creation and calls onAbort', async () => {
    const abortController = new AbortController();
    const onAbort = jest.fn();
    const executor = jest.fn();
    const p = createAbortablePromise<number>(
      executor,
      abortController.signal,
      onAbort,
    );

    abortController.abort();

    await expect(p).rejects.toThrowError(new AbortError());
    expect(onAbort).toBeCalledTimes(1);

    expect(executor).toBeCalledTimes(1);
  });

  it('rejects if aborted after creation (without onAbort)', async () => {
    const abortController = new AbortController();
    const executor = jest.fn();
    const p = createAbortablePromise<number>(executor, abortController.signal);

    abortController.abort();

    await expect(p).rejects.toThrowError(new AbortError());

    expect(executor).toBeCalledTimes(1);
  });

  it('rejects if started aborted, not calling executor', async () => {
    const abortController = new AbortController();
    const onAbort = jest.fn();
    const executor = jest.fn();

    abortController.abort();

    const p = createAbortablePromise<number>(
      executor,
      abortController.signal,
      onAbort,
    );
    await expect(p).rejects.toThrowError(new AbortError());
    expect(onAbort).toBeCalledTimes(1);

    expect(executor).not.toBeCalled();
  });
});
