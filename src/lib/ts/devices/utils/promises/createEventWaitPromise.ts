import { EventEmitter } from 'events';
import { createMaybeAbortablePromise } from './createMaybeAbortablePromise';

export const createEventWaitPromise = <T, A extends unknown[] = [Event]>(
  target: EventEmitter,
  eventName: string,
  signal?: AbortSignal,
  parseEvent: (...args: A) => T | PromiseLike<T> = (...args: A): T =>
    (args.length === 1 ? args[0] : args) as unknown as T,
): Promise<T> => {
  let handler: undefined | ((...args: A) => void);
  const cleanupEventHandler = (): void => {
    if (handler) {
      target.removeListener(eventName, handler as (...args: unknown[]) => void);
      handler = undefined;
    }
  };

  const executor = (resolve: (value: T | PromiseLike<T>) => void): void => {
    handler = (...args: A): void => {
      cleanupEventHandler();
      resolve(parseEvent(...args));
    };
    target.addListener(eventName, handler as (...args: unknown[]) => void);
  };

  return createMaybeAbortablePromise(executor, signal, cleanupEventHandler);
};
