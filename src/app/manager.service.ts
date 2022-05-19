import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DPICapabilities } from 'src/lib/ts/devices/dpi';
import {
  Color,
  LEDCapabilities,
  LEDModes,
  LEDZones,
} from 'src/lib/ts/devices/led';

import { HIDDeviceConfigurator } from 'src/lib/ts/devices/configurator';
import manager from 'src/lib/ts/manager';

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
      console.error(`Error connecting to device:`, error);
    }
  }

  get device$(): Observable<HIDDeviceConfigurator | undefined> {
    return this.deviceSubject.asObservable();
  }

  get device(): HIDDeviceConfigurator | undefined {
    return this.deviceSubject.getValue();
  }

  get ledCapabilities(): LEDCapabilities | undefined {
    return this.device?.ledCapabilities?.();
  }

  setLed(color: Color, zone: LEDZones, mode?: LEDModes): void {
    this.device?.setLed?.(color, zone, mode);
  }

  get dpiCapabilities(): DPICapabilities | undefined {
    return this.device?.dpiCapabilities?.();
  }

  setDpiLevel(level: number, cpi: number): void {
    this.device?.setDPILevel?.(level, cpi);
  }
}
