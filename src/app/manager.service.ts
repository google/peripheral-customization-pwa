import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createEventWaitPromiseAndDispatch } from 'src/lib/ts/devices/utils/promises/createEventWaitPromiseAndDispatch';
import { DPICapabilities } from 'src/lib/ts/devices/components/dpi';
import {
  InputBindings,
  InputCapabilities,
  KeyBinding,
} from 'src/lib/ts/devices/components/inputs';
import {
  Color,
  LEDCapabilities,
  LEDModes,
  LEDZones,
} from 'src/lib/ts/devices/components/led';

import {
  ConfiguratorEvents,
  HIDDeviceConfigurator,
} from 'src/lib/ts/devices/configurator';
import { createCommandBuffer } from 'src/lib/ts/devices/utils/command-util';
import manager from 'src/lib/ts/manager';
import { dpi, DpiValue } from './model/dpi';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  deviceSubject = new BehaviorSubject<HIDDeviceConfigurator | undefined>(
    undefined,
  );

  currentDpiStageSubject = new BehaviorSubject<number | undefined>(undefined);

  commandBuffer = createCommandBuffer();

  async connectToDevice(): Promise<void> {
    try {
      const device = await manager.connect();
      this.deviceSubject.next(device);
      this.addEventListeners();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error connecting to device:`, error);
    }
  }

  addEventListeners(): void {
    this.device?.on(
      ConfiguratorEvents.CHANGED_CURRENT_DPI,
      (level: number, value: number) => this.currentDpiWasChanged(level, value),
    );

    this.device?.on(
      ConfiguratorEvents.RECEIVED_DPI_LEVELS,
      (_, current, levels) =>
        this.currentDpiWasChanged(current, levels[current]),
    );
  }

  get device$(): Observable<HIDDeviceConfigurator | undefined> {
    return this.deviceSubject.asObservable();
  }

  get device(): HIDDeviceConfigurator | undefined {
    return this.deviceSubject.getValue();
  }

  static readonly commandToEventMapping = {
    requestFirmwareVersion: ConfiguratorEvents.RECEIVED_FIRMWARE_VERSION,
    requestBatteryLife: ConfiguratorEvents.RECEIVED_BATTERY,
    setLed: ConfiguratorEvents.LED_WAS_SET,
    setInput: ConfiguratorEvents.BUTTON_WAS_SET,
    requestInputBindings: ConfiguratorEvents.RECEIVED_INPUT_BINDINGS,
    setDpiLevel: ConfiguratorEvents.DPI_WAS_SET,
    requestDpiLevels: ConfiguratorEvents.RECEIVED_DPI_LEVELS,
    requestCurrentDpi: ConfiguratorEvents.RECEIVED_CURRENT_DPI,
    changeCurrentDpi: ConfiguratorEvents.CHANGED_CURRENT_DPI,
  } as const;

  private addCommandBuffer<
    T,
    C extends keyof typeof ManagerService.commandToEventMapping,
    A extends unknown[],
  >(
    command: C,
    args: Parameters<Exclude<HIDDeviceConfigurator[C], undefined>>,
    parseEvent?: (...a: A) => T | PromiseLike<T>,
  ): Promise<T> {
    const { device } = this;
    const method = device?.[command] as
      | undefined
      | ((
          ...a: Parameters<Exclude<HIDDeviceConfigurator[C], undefined>>
        ) => ReturnType<Exclude<HIDDeviceConfigurator[C], undefined>>);
    if (!device || !method) {
      return Promise.reject(new Error('unsupported operation'));
    }

    return this.commandBuffer.queue((signal?: AbortSignal) => {
      return createEventWaitPromiseAndDispatch(
        () => method.apply(device, args),
        device,
        ManagerService.commandToEventMapping[command],
        signal,
        parseEvent,
      );
    });
  }

  requestFirmwareVersion(): Promise<string> {
    return this.addCommandBuffer(
      'requestFirmwareVersion',
      [],
      (firmware: Uint8Array): string => String.fromCharCode(...firmware),
    );
  }

  requestBatteryLife(): Promise<number> {
    return this.addCommandBuffer('requestBatteryLife', []);
  }

  // LED
  get ledCapabilities(): LEDCapabilities | undefined {
    return this.device?.ledCapabilities?.();
  }

  setLed(color: Color, zone: LEDZones, mode?: LEDModes): Promise<void> {
    return this.addCommandBuffer('setLed', [color, zone, mode]);
  }

  // INPUT
  get inputCapabilities(): InputCapabilities | undefined {
    return this.device?.inputCapabilities?.();
  }

  setInput(keyBinding: KeyBinding): Promise<void> {
    return this.addCommandBuffer('setInput', [keyBinding]);
  }

  requestInputBindings(): Promise<InputBindings> {
    return this.addCommandBuffer('requestInputBindings', []);
  }

  get defaultInputBindings(): InputBindings | undefined {
    return this.device?.defaultInputBindings;
  }

  // DPI
  get dpiCapabilities(): DPICapabilities | undefined {
    return this.device?.dpiCapabilities?.();
  }

  setDpiLevel(index: number, stage: number): Promise<DpiValue> {
    return this.addCommandBuffer(
      'setDpiLevel',
      [index, stage],
      (id: number, level: number): DpiValue => ({ id, level }),
    );
  }

  requestDpiLevels(): Promise<dpi> {
    return this.addCommandBuffer(
      'requestDpiLevels',
      [],
      (count: number, current: number, levels: dpi['levels']): dpi => ({
        count,
        current,
        levels,
      }),
    );
  }

  changeCurrentDpi(toIndex: number, withValue: number): Promise<void> {
    return this.addCommandBuffer('changeCurrentDpi', [toIndex, withValue]);
  }

  requestCurrentDpi(): Promise<number> {
    return this.addCommandBuffer('requestCurrentDpi', []);
  }

  currentDpiWasChanged(level: number, value: number): void {
    this.currentDpiStageSubject.next(level);
    // eslint-disable-next-line no-console
    console.log(`Changed to level ${level + 1}, current DPI value is ${value}`);
  }
}
