export type DefaultCommandOptions = Readonly<{
  retries?: number | null;
  timeout?: number | null;
}>;

export type CommandOptions = Readonly<
  DefaultCommandOptions & { signal?: AbortSignal }
>;

export type CommandCreator<T> = (signal?: AbortSignal) => Promise<T>;

export type CommandBuffer = {
  queue: <T>(
    createCommand: CommandCreator<T>,
    options?: CommandOptions,
  ) => Promise<T>;
};
