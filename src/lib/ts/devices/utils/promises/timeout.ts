import { wait } from './wait';

export class TimedOutError extends Error {
  constructor(message = 'timed out') {
    super(message);
    this.name = new.target.name; // TS changed and it would be "Error" instead of "TimedOut"
  }
}

/**
 * Convenience on top of wait(), will reject with Error('timed out') when time expires.
 */
export const waitTimeout = (
  timeInMilliseconds: number,
  signal?: AbortSignal,
): Promise<never> =>
  wait(timeInMilliseconds, signal).then(() => {
    throw new TimedOutError();
  });
