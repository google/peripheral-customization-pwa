import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
import manager from 'src/lib/ts/manager';
import { dpi } from './model/dpi';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  deviceSubject = new BehaviorSubject<HIDDeviceConfigurator | undefined>(
    undefined,
  );

  async connectToDevice(): Promise<void> {
    try {
      const device = await manager.connect();
      this.deviceSubject.next(device);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error connecting to device:`, error);
    }
  }

  get device$(): Observable<HIDDeviceConfigurator | undefined> {
    return this.deviceSubject.asObservable();
  }

  get device(): HIDDeviceConfigurator | undefined {
    return this.deviceSubject.getValue();
  }

  // LED
  get ledCapabilities(): LEDCapabilities | undefined {
    return this.device?.ledCapabilities?.();
  }

  setLed(color: Color, zone: LEDZones, mode?: LEDModes): void {
    this.device?.setLed?.(color, zone, mode);
  }

  // INPUT
  get inputCapabilities(): InputCapabilities | undefined {
    return this.device?.inputCapabilities?.();
  }

  setInput(keyBinding: KeyBinding): void {
    this.device?.setInput?.(keyBinding);
  }

  requestInputBindings(): Promise<InputBindings> {
    return new Promise(resolve => {
      this.device?.once(
        ConfiguratorEvents.RECEIVED_INPUT_BINDINGS,
        (inputs: InputBindings) => resolve(inputs),
      );
      this.device?.requestInputBindings?.();
    });
  }

  // DPI
  get dpiCapabilities(): DPICapabilities | undefined {
    return this.device?.dpiCapabilities?.();
  }

  setDpiLevel(index: number, level: number): void {
    this.device?.setDpiLevel?.(index, level);
  }

  requestDpiLevels(): Promise<dpi> {
    return new Promise(resolve => {
      this.device?.once(
        ConfiguratorEvents.RECEIVED_DPI_LEVELS,
        (count, current, levels) => resolve({ count, current, levels }),
      );
      this.device?.requestDpiLevels?.();
    });
  }

  changeCurrentDpi(toIndex: number): Promise<void> {
    return new Promise(resolve => {
      this.device?.once(ConfiguratorEvents.CHANGED_CURRENT_DPI, () => {
        // eslint-disable-next-line no-console
        console.info('Success on change current DPI');
        this.requestCurrentDpi().then(currentDpi => {
          // eslint-disable-next-line no-console
          console.info('Current DPI index is', currentDpi);
          resolve();
        });
      });
      this.device?.changeCurrentDpi?.(toIndex);
    });
  }

  requestCurrentDpi(): Promise<number> {
    return new Promise(resolve => {
      this.device?.once(ConfiguratorEvents.RECEIVED_CURRENT_DPI, current =>
        resolve(current),
      );
      this.device?.requestCurrentDpi?.();
    });
  }
}
