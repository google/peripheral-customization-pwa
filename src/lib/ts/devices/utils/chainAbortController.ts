// eslint-disable-next-line no-console
const dbg = console.log;

export const chainAbortController = (
  abortController: AbortController,
  signal: AbortSignal,
): (() => void) => {
  const abortListenerChain = (): void => {
    dbg(
      'chainAbortController: aborted by signal! Abort local controller',
      signal,
    );
    abortController.abort();
  };
  signal.addEventListener('abort', abortListenerChain);
  return () => {
    signal.removeEventListener('abort', abortListenerChain);
  };
};
