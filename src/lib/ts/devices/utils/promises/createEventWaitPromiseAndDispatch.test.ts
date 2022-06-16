import { EventEmitter } from 'events';
import { AbortError } from './createAbortablePromise';

import { createEventWaitPromiseAndDispatch } from './createEventWaitPromiseAndDispatch';

describe('utils/promises/createEventWaitPromiseAndDispatch works', () => {
  const eventName = 'fakeEvent';
  type EventDetail = number;

  it('resolves if dispatcher and event', async () => {
    const target = new EventEmitter();
    const abortController = new AbortController();
    const p = createEventWaitPromiseAndDispatch<
      CustomEvent<EventDetail>,
      [CustomEvent<EventDetail>]
    >(() => Promise.resolve(), target, eventName, abortController.signal);

    const evt = new CustomEvent<EventDetail>(eventName, {
      detail: 1234,
    });

    target.emit(eventName, evt);

    await expect(p).resolves.toBe(evt);

    // should be ignored, else will cause warnings of promise already being resolved
    target.emit(
      eventName,
      new CustomEvent<EventDetail>(eventName, { detail: 5555 }),
    );
  });

  it('multiple parameters works', async () => {
    const target = new EventEmitter();
    const p = createEventWaitPromiseAndDispatch<
      [number, string],
      [number, string]
    >(() => Promise.resolve(), target, eventName);

    target.emit(eventName, 1234, 'hello world');

    await expect(p).resolves.toEqual([1234, 'hello world']);

    // should be ignored, else will cause warnings of promise already being resolved
    target.emit(
      eventName,
      new CustomEvent<EventDetail>(eventName, { detail: 5555 }),
    );
  });

  it('parseEvent works', async () => {
    const target = new EventEmitter();
    const p = createEventWaitPromiseAndDispatch<
      number,
      [CustomEvent<EventDetail>, number]
    >(
      () => Promise.resolve(),
      target,
      eventName,
      undefined,
      (event, multiplier) => event.detail * multiplier,
    );

    const evt = new CustomEvent<EventDetail>(eventName, {
      detail: 1234,
    });

    target.emit(eventName, evt, 2);

    await expect(p).resolves.toBe(1234 * 2);

    // should be ignored, else will cause warnings of promise already being resolved
    target.emit(
      eventName,
      new CustomEvent<EventDetail>(eventName, { detail: 5555 }),
    );
  });

  it('rejects if dispatcher and no event', async () => {
    const target = new EventEmitter();
    const error = new Error('forced error');
    const p = createEventWaitPromiseAndDispatch<
      CustomEvent<EventDetail>,
      [CustomEvent<EventDetail>]
    >(() => Promise.reject(error), target, eventName);

    await expect(p).rejects.toBe(error);

    // should be ignored, else will cause warnings of promise already being resolved
    target.emit(
      eventName,
      new CustomEvent<EventDetail>(eventName, { detail: 5555 }),
    );
  });

  it('rejects and cleanup event handlers when aborted', async () => {
    const target = new EventEmitter();
    const abortController = new AbortController();
    const p = createEventWaitPromiseAndDispatch<
      CustomEvent<EventDetail>,
      [CustomEvent<EventDetail>]
    >(() => Promise.resolve(), target, eventName, abortController.signal);

    const evt = new CustomEvent<EventDetail>(eventName, {
      detail: 1234,
    });

    abortController.abort();
    target.emit(eventName, evt);

    await expect(p).rejects.toEqual(new AbortError());
  });

  it('rejects and adds no event handlers if started aborted', async () => {
    const target = new EventEmitter();
    const abortController = new AbortController();
    const createPromise = jest.fn();

    abortController.abort();

    const p = createEventWaitPromiseAndDispatch<
      CustomEvent<EventDetail>,
      [CustomEvent<EventDetail>]
    >(createPromise, target, eventName, abortController.signal);

    const evt = new CustomEvent<EventDetail>(eventName, {
      detail: 1234,
    });

    target.emit(eventName, evt);

    await expect(p).rejects.toEqual(new AbortError());
    expect(createPromise).not.toBeCalled();
  });
});
