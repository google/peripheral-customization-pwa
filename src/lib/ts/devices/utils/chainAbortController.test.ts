import { chainAbortController } from './chainAbortController';

describe('utils/chainAbortController works', () => {
  it('chains if not cleaned up', () => {
    const trigger = new AbortController();
    const repeater = new AbortController();
    const onAbort = jest.fn();
    const cleanup = chainAbortController(repeater, trigger.signal);

    repeater.signal.addEventListener('abort', onAbort);
    expect(onAbort).not.toBeCalled();

    trigger.abort();
    expect(onAbort).toBeCalledTimes(1);

    cleanup();
  });

  it('do not chain if already cleaned up', () => {
    const trigger = new AbortController();
    const repeater = new AbortController();
    const onAbort = jest.fn();
    const cleanup = chainAbortController(repeater, trigger.signal);

    repeater.signal.addEventListener('abort', onAbort);
    expect(onAbort).not.toBeCalled();

    cleanup();

    trigger.abort();
    expect(onAbort).not.toBeCalled();
  });
});
