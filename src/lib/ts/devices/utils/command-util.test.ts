import { createCommandBuffer } from './command-util';
import { wait } from './promises/wait';
import { TimedOutError } from './promises/timeout';
import { AbortError } from './promises/createAbortablePromise';

const fakeSuccessCommand = <T = void>(result: T): Promise<T> =>
  Promise.resolve(result);

const fakeSuccessCommandWithDelay = <T = void>(
  ms: number,
  result: T,
): Promise<T> => {
  return new Promise(r => {
    setTimeout(() => {
      r(result);
    }, ms);
  });
};

const fakeErrorCommand = <T = void>(error: Error): Promise<T> =>
  Promise.reject(error);

const fakeForceRetries = <T = void>(
  forceRetries: number,
  result: T,
): (() => Promise<T>) => {
  let tries = 0;
  return (): Promise<T> => {
    tries += 1;
    if (tries < forceRetries) {
      return fakeErrorCommand(new Error('forced try failure'));
    }
    return fakeSuccessCommand(result);
  };
};

const fakeForceRetriesTimeout = <T = void>(
  forceRetries: number,
  timeout: number,
  timeoutValue: T,
  result: T,
): (() => Promise<T>) => {
  let tries = 0;
  return (): Promise<T> => {
    tries += 1;
    if (tries < forceRetries) {
      return wait(timeout).then(() => Promise.resolve(timeoutValue));
    }
    return fakeSuccessCommand(result);
  };
};

describe('createCommandBuffer.queue works', () => {
  it('Should have success on first try', async () => {
    const cmdBuf = createCommandBuffer();
    await expect(cmdBuf.queue(() => fakeSuccessCommand(1234))).resolves.toBe(
      1234,
    );
  });

  it('Should have success on second try after error', async () => {
    const cmdBuf = createCommandBuffer();
    await expect(cmdBuf.queue(fakeForceRetries(2, 1234))).resolves.toBe(1234);
  });

  it('Should have success on third try after timeout', async () => {
    const cmdBuf = createCommandBuffer();
    await expect(
      cmdBuf.queue(fakeForceRetriesTimeout(3, 600, 666, 1234)),
    ).resolves.toBe(1234);
  });

  it('Should queue delayed commands in order', async () => {
    const cmdBuf = createCommandBuffer({ timeout: 5000 });
    const results: number[] = [];
    const first = cmdBuf
      .queue(() => fakeSuccessCommandWithDelay(100, 1))
      .then(result => {
        results.push(result);
      });
    const second = cmdBuf
      .queue(() => fakeSuccessCommandWithDelay(3000, 2))
      .then(result => {
        results.push(result);
      });
    const third = cmdBuf
      .queue(() => fakeSuccessCommandWithDelay(100, 3))
      .then(result => {
        results.push(result);
      });
    await Promise.all([first, second, third]);
    expect(results).toHaveLength(3);
    expect(results[0]).toBe(1);
    expect(results[1]).toBe(2);
    expect(results[2]).toBe(3);
  });

  it('Should queue commands in order', async () => {
    const cmdBuf = createCommandBuffer();
    let result1: number | undefined;
    let result2: number | undefined;
    await new Promise<void>((resolve, reject) => {
      let i = 0;
      // more retries, longer timeout to try to force "resolve after" if CommandBuffer is broken:
      cmdBuf
        .queue(fakeForceRetriesTimeout(3, 350, 333, 10), { timeout: 300 })
        .then(value => {
          i += 1;
          if (i !== 1) {
            // eslint-disable-next-line no-console
            console.log(
              'test ordering: out of order - first command resolved after the second',
            );
            reject(new Error('out of order'));
            return;
          }
          result1 = value;
        })
        .catch(reject);

      // less retries, smaller timeout to try to force "resolve before" if CommandBuffer is broken (ie: in parallel):
      cmdBuf
        .queue(fakeForceRetriesTimeout(2, 150, 222, 20), { timeout: 100 })
        .then(value => {
          i += 1;
          if (i !== 2) {
            // eslint-disable-next-line no-console
            console.log(
              'test ordering: out of order - first command resolved after the second',
            );
            reject(new Error('out of order'));
            return;
          }
          result2 = value;
          resolve();
        })
        .catch(reject);
    });
    expect(result1).toBe(10);
    expect(result2).toBe(20);
  });

  it('Should throw error', async () => {
    const cmdBuf = createCommandBuffer();
    await expect(
      cmdBuf.queue(() => fakeErrorCommand(new Error('forced error'))),
    ).rejects.toBeInstanceOf(Error);
  });

  it('Should throw error when timeout is reached', async () => {
    const timeout = 100;
    const cmdBuf = createCommandBuffer({ timeout, retries: 0 });
    await expect(
      cmdBuf.queue(() => fakeSuccessCommandWithDelay(2 * timeout, 1234)),
    ).rejects.toThrowError(new TimedOutError());
  });

  it('Should throw error when retries exceeded', async () => {
    const retries = 2;
    const cmdBuf = createCommandBuffer({ timeout: 0, retries });
    await expect(
      cmdBuf.queue(fakeForceRetries(retries + 1, 1234)),
    ).rejects.toThrowError(new Error('forced try failure'));
  });

  it('Should run a plain command', async () => {
    const cmdBuf = createCommandBuffer({ timeout: 0, retries: 0 });
    await expect(cmdBuf.queue(() => fakeSuccessCommand(1234))).resolves.toBe(
      1234,
    );
  });

  it('Should abort on signal before timeout', async () => {
    const abortController = new AbortController();
    const timeout = 200;
    const cmdBuf = createCommandBuffer({ timeout, retries: 0 });
    const p = cmdBuf.queue(
      () => fakeSuccessCommandWithDelay(timeout / 2, 1234),
      { signal: abortController.signal },
    );
    abortController.abort();
    await expect(p).rejects.toThrowError(new AbortError('aborted'));
  });

  it('Should abort on signal before all retries are completed', async () => {
    const abortController = new AbortController();
    const retries = 3;
    const cmdBuf = createCommandBuffer({ timeout: 0, retries });
    const p = cmdBuf.queue(fakeForceRetries(retries - 1, 1234), {
      signal: abortController.signal,
    });
    abortController.abort();
    await expect(p).rejects.toThrowError(new AbortError('aborted'));
  });
});
