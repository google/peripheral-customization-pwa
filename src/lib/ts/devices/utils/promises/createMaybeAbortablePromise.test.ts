import { AbortError } from './createAbortablePromise';
import { createMaybeAbortablePromise } from './createMaybeAbortablePromise';

describe('utils/promises/createMaybeAbortablePromise works', () => {
  it('resolves without signal', async () => {
    const p = createMaybeAbortablePromise(resolve => resolve(1234));
    await expect(p).resolves.toBe(1234);
  });

  it('rejects without signal', async () => {
    const error = new Error('forced bug');
    const p = createMaybeAbortablePromise((_, reject) => reject(error));
    await expect(p).rejects.toBe(error);
  });

  it('resolves with signal', async () => {
    const abortController = new AbortController();
    const p = createMaybeAbortablePromise(
      resolve => resolve(1234),
      abortController.signal,
    );
    await expect(p).resolves.toBe(1234);
  });

  it('rejects with signal', async () => {
    const error = new Error('forced bug');
    const abortController = new AbortController();
    const p = createMaybeAbortablePromise(
      (_, reject) => reject(error),
      abortController.signal,
    );
    await expect(p).rejects.toBe(error);
  });

  it('rejects when aborted', async () => {
    const abortController = new AbortController();
    abortController.abort();
    const p = createMaybeAbortablePromise(
      resolve => resolve(1234),
      abortController.signal,
    );
    await expect(p).rejects.toEqual(new AbortError());
  });
});
