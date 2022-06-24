# Command Buffer
Because the device can't handle multiple commands being sent in a short span of time, it is necessary a queue infrastructure to have a better control on how these commands are sent.

With that in mind, a `commandBuffer` was created, along with a specific `Promises` infra, in order to:
- Queue commands and send then in order;
- Wait for command related event;
- Set a timeout limit for a command resolution;
- Retry a command a given number of times if the commands either fail by its own or by the timeout.

In order to do that, a queue logic was implemented together with helpers to create Promises with custom features (like timeout and cancellation).

So, in a top-down manner, lets see how to use the `commandBuffer`.

## How it is used in the ManagerService

The `commandBuffer` is a util that lives in `src/lib/ts/devices/utils/command-util.ts`, so it can be called anywhere in the code, even inside the devices configurator, but right now is currently being called exclusively in the `manager.service`.

And instantiated as a parameter in the `ManagerService` class:
### createCommandBuffer
```ts
commandBuffer = createCommandBuffer();
```

| Syntax |
|-----------|
|createCommandBuffer() <br> createCommandBuffer(options)|

| Parameters |
|-----------|
|<b>options: { retries?: number; timeout? number }</b> <br> Object which tells to the buffer how many retries should be done until consider the command a rejection and how much time the buffer should await for a response until also consider the command a rejection (and then retry, if there is still enough retries). <br> If not provided, retries will be equal to 3 and timeout to 200ms|

### addCommandBuffer
After that, a helper is created inside the Manager that will simply the buffer call for each method.
`addCommandBuffer`:
```ts
  private addCommandBuffer<
    T,
    C extends keyof typeof ManagerService.commandToEventMapping,
    A extends unknown[],
  >(
    command: C,
    args: Parameters<Exclude<HIDDeviceConfigurator[C], undefined>>,
    parseEvent?: (...a: A) => T | PromiseLike<T>,
  ): Promise<T>
```

| Syntax |
|-----------|
|addCommandBuffer(command, args) <br> addCommandBuffer(command, args, parseEvent?)|

| Parameters |
|-----------|
|<b>command: string</b> <br> String that matches a device method's name, so a call like `this.device?.requestDpiLevels?.();` has a command string of `'requestDpiLevels'`.|
|<b>args: array </b> <br> If the device command require arguments, it should be passed here in order, so a call like `this.device?.setDpiLevel?.(index, stage);` has an args of `[index, stage]`.|
|<b>parseEvent: function </b> <br> Function which will parse the event return.|

This wrapper will simply easy the queue call, so what used to be a `this.device?.requestDpiLevels?.()`, now it will call `addCommandBuffer`:
```diff

 requestDpiLevels(): Promise<dpi> {
-    return new Promise(resolve => {
-      this.device?.once(
-        ConfiguratorEvents.RECEIVED_DPI_LEVELS,
-        (count, current, levels) => resolve({ count, current, levels }),
-      );
-      this.device?.requestDpiLevels?.();
-    });
+    return this.addCommandBuffer(
+      'requestDpiLevels',
+      [],
+      (count: number, current: number, levels: dpi['levels']): dpi => ({
+        count,
+        current,
+        levels,
+      }),
+    );
 }
```

Then, one can run a device command by just calling:
```
this.addCommandBuffer(
    <device_method_name>,
    <method_args>,
    <function_to_parse_command_event_return>,
)
```

The interesting part, though, is what happens in the return of `addCommandBuffer`, which will see in the next two topics.
```ts
return this.commandBuffer.queue((signal?: AbortSignal) => {
      return createEventWaitPromiseAndDispatch(
        () => method.apply(device, args),
        device,
        ManagerService.commandToEventMapping[command],
        signal,
        parseEvent,
      );
    });
```

## `commandBuffer.queue`
```ts
queue = <T = unknown>(createCommand: CommandCreator<T>, options?: CommandOptions): Promise<T>
```
| Syntax |
|-----------|
|commandBuffer.queue(command) <br> commandBuffer.queue(command, options)|

| Parameters |
|-----------|
|<b>command: Promise</b> <br> Promise containing the command that should be added to the queue.|
|<b>options: { retries?: number; timeout? number }</b> <br> Object which tells to the buffer how many retries should be done until consider the command a rejection and how much time the buffer should await for a response until also consider the command a rejection (and then retry, if there is still enough retries). <br> If not provided, retries will be equal to 3 and timeout to 200ms|

As it is expected, it will add a given command to the queue, running it when possible.
The queue function will receive an Abortable Promise (abortable through an AbortSignal), which will go trough a few helpers to add the retry and timeout functionalities to the Promise to be able to handle all possible outputs before the next command in the queue is executed.

## `createEventWaitPromiseAndDispatch`
```ts
export const createEventWaitPromiseAndDispatch = <
  T = Event,
  A extends unknown[] = [Event],
>(
  createTriggerPromise: (signal?: AbortSignal) => Promise<unknown>,
  target: EventEmitter,
  eventName: string,
  signal?: AbortSignal,
  parseEvent?: (...args: A) => T | PromiseLike<T>,
): Promise<T>
```
| Syntax |
|-----------|
|createEventWaitPromiseAndDispatch(createTriggerPromise, target, eventName) <br> createEventWaitPromiseAndDispatch(createTriggerPromise, target, eventName, signal) <br> createEventWaitPromiseAndDispatch(createTriggerPromise, target, eventName, signal, parseEvent)|

| Parameters |
|-----------|
|<b>createTriggerPromise: Promise</b> <br> Promise containing the command that should be added to the queue.|
|<b>target: EvenEmitter</b> <br> HIDDedviceConfigurator which the command will be sent to.|
|<b>eventName: ConfiguratorEvents</b> <br> String containing the ConfiguratorEvent which will be waited for.|
|<b>signal: AbortSignal</b> <br> Signal to abort the function process.|
|<b>parseEvent: function </b> <br> Function which will parse the event return.|

It will return an Abortable Promise which runs the command to the device and also listen for the given `eventName` event.
It must be abortable so, for instance, if the promise is waiting for its event for too long, the timeout feature in the `queue` will abort this promise.

## Tests
There is a test for every file in `src/lib/ts/devices/utils/`, so you can also see how each feature should be used at each scenario.
Run the tests with:
```
yarn jest src/lib/ts/devices/utils/
```
