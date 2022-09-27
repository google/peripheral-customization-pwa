import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createEventWaitPromiseAndDispatch } from 'src/lib/ts/devices/utils/promises/createEventWaitPromiseAndDispatch';
import { CPICapabilities } from 'src/lib/ts/devices/components/cpi';
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
import { cpi, CpiValue } from './model/cpi';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  deviceSubject = new BehaviorSubject<HIDDeviceConfigurator | undefined>(
    undefined,
  );

  currentCpiStageSubject = new BehaviorSubject<number | undefined>(undefined);

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

  async reconnectToDevice(): Promise<void> {
    try {
      const device = await manager.reconnect();
      this.deviceSubject.next(device);
      this.addEventListeners();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Unable to reconnect to device:`, error);
    }
  }

  async forgetDevice(): Promise<void> {
    try {
      await manager.forget();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error on devices removal:`, error);
    }
    window.location.reload();
  }

  addEventListeners(): void {
    this.device?.on(
      ConfiguratorEvents.CHANGED_CURRENT_CPI,
      (level: number, value: number) => this.currentCpiWasChanged(level, value),
    );

    this.device?.on(
      ConfiguratorEvents.RECEIVED_CPI_LEVELS,
      (_, current, levels) =>
        this.currentCpiWasChanged(current, levels[current]),
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
    setCpiLevel: ConfiguratorEvents.CPI_WAS_SET,
    requestCpiLevels: ConfiguratorEvents.RECEIVED_CPI_LEVELS,
    requestCurrentCpi: ConfiguratorEvents.RECEIVED_CURRENT_CPI,
    changeCurrentCpi: ConfiguratorEvents.CHANGED_CURRENT_CPI,
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

  // CPI
  get cpiCapabilities(): CPICapabilities | undefined {
    return this.device?.cpiCapabilities?.();
  }

  setCpiLevel(index: number, stage: number): Promise<CpiValue> {
    return this.addCommandBuffer(
      'setCpiLevel',
      [index, stage],
      (id: number, level: number): CpiValue => ({ id, level }),
    );
  }

  requestCpiLevels(): Promise<cpi> {
    return this.addCommandBuffer(
      'requestCpiLevels',
      [],
      (count: number, current: number, levels: cpi['levels']): cpi => ({
        count,
        current,
        levels,
      }),
    );
  }

  changeCurrentCpi(toIndex: number, withValue: number): Promise<void> {
    return this.addCommandBuffer('changeCurrentCpi', [toIndex, withValue]);
  }

  requestCurrentCpi(): Promise<number> {
    return this.addCommandBuffer('requestCurrentCpi', []);
  }

  currentCpiWasChanged(level: number, value: number): void {
    this.currentCpiStageSubject.next(level);
    // eslint-disable-next-line no-console
    console.log(`Changed to level ${level + 1}, current CPI value is ${value}`);
  }
}
