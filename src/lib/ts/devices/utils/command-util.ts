import type {
  CommandBuffer,
  CommandCreator,
  CommandOptions,
  DefaultCommandOptions,
} from './command-types';
import { createRetriedOnErrorPromise } from './promises/createRetriedOnErrorPromise';
import { createTimeLimitedPromise } from './promises/createTimeLimitedPromise';

const createTimeLimitedCommandCreator = <T = void>(
  timeout: number | null | undefined,
  createCommand: CommandCreator<T>,
): CommandCreator<T> =>
  typeof timeout === 'number' && timeout > 0
    ? (signal?: AbortSignal): Promise<T> =>
        createTimeLimitedPromise(timeout, createCommand, signal)
    : createCommand;

const createRetriedCommandCreator = <T = void>(
  retries: number | null | undefined,
  createCommand: CommandCreator<T>,
): CommandCreator<T> =>
  typeof retries === 'number' && retries > 0
    ? (signal?: AbortSignal): Promise<T> =>
        createRetriedOnErrorPromise(retries, createCommand, signal)
    : createCommand;

// watchout the order, below we have the timeout inside!
// so if we retry `R` times, it will wait up to `T` milliseconds each time, resulting in `R * T` milliseconds total.
const createCommandCreator = <T = void>(
  createCommand: CommandCreator<T>,
  options: CommandOptions,
): CommandCreator<T> =>
  createRetriedCommandCreator(
    options.retries,
    createTimeLimitedCommandCreator(options.timeout, createCommand),
  );

export const createCommandBuffer = (
  defaultOptions: DefaultCommandOptions = { retries: 3, timeout: 200 },
): CommandBuffer => {
  const pending: (() => Promise<void>)[] = [];

  const addPendingCommand = (pendingCommand: () => Promise<void>): void => {
    pending.push(pendingCommand);
    if (pending.length === 1) {
      // it's the first command, execute it
      pendingCommand();
    }
  };

  const nextCommand = (): void => {
    pending.shift();
    if (pending.length > 0) {
      pending[0]();
    }
  };

  const queue = <T = unknown>(
    createCommand: CommandCreator<T>,
    options?: CommandOptions,
  ): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const pendingCommand = createCommandCreator(createCommand, {
        ...defaultOptions,
        ...options,
      });

      addPendingCommand(() =>
        pendingCommand(options?.signal)
          .then(resolve, reject)
          .then(() => nextCommand()),
      );
    });

  return { queue };
};
