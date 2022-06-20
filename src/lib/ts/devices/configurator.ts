import { EventEmitter } from 'events';

import type {
  Color,
  LEDCapabilities,
  LEDModes,
  LEDZones,
} from './components/led';

import type { DPILevels, DPICapabilities } from './components/dpi';
import { InputCapabilities, KeyBinding } from './components/inputs';

export type DeviceFilter = Required<
  Pick<HIDDeviceFilter, 'productId' | 'vendorId'>
>;

export enum ConfiguratorEvents {
  CONNECT = 'connected',
  RECEIVED_FIRMWARE_VERSION = 'receivedFirmwareVersion',
  RECEIVED_BATTERY = 'receivedBattery',
  RECEIVED_INPUT_BINDINGS = 'receivedInputBindings',
  BUTTON_WAS_SET = 'buttonWasSet',
  RECEIVED_DPI_LEVELS = 'receivedDpiLevels',
  DPI_WAS_SET = 'dpiWasSet',
  CHANGED_CURRENT_DPI = 'dpiChangedCurrent',
  RECEIVED_CURRENT_DPI = 'receivedCurrentDpi',
  RECEIVED_LED = 'receivedLed',
  LED_WAS_SET = 'ledWasSet',
}

export abstract class HIDDeviceConfigurator extends EventEmitter {
  // PROPERTIES
  abstract hidDevice: HIDDevice;

  // BASICS
  abstract handleInputReport(e: HIDInputReportEvent): void;

  handleEvent = (event: HIDInputReportEvent): void => {
    switch (event.type) {
      case 'inputreport':
        this.handleInputReport(event);
        break;
      default:
        break;
    }
  };

  open(): Promise<void> {
    this.hidDevice.addEventListener('inputreport', this);

    return this.hidDevice.open();
  }

  close(): Promise<void> {
    this.hidDevice.removeEventListener('inputreport', this);

    return this.hidDevice.close();
  }

  abstract requestFirmwareVersion(): Promise<void>;

  abstract requestBatteryLife(): Promise<void>;

  sendReport(reportId: number, outputReport: Uint8Array): Promise<void> {
    return this.hidDevice.sendReport(reportId, outputReport);
  }

  sendFeatureReport(
    reportId: number,
    featureReport: Uint8Array,
  ): Promise<void> {
    return this.hidDevice.sendFeatureReport(reportId, featureReport);
  }

  receiveFeatureReport(reportId: number): Promise<DataView> {
    return this.hidDevice.receiveFeatureReport(reportId);
  }

  // RGB
  ledCapabilities?(): LEDCapabilities;

  requestCurrentLedConfig?(): Promise<void[]>;

  ledForZone?(zone: LEDZones): Promise<void>;

  setLed?(color: Color, zone: LEDZones, mode?: LEDModes): Promise<void>;

  protected defaultRequestCurrentLedConfig(
    ledCapabilities: LEDCapabilities,
    ledForZone: (zone: LEDZones) => Promise<void>,
  ): Promise<void[]> {
    const zones = Object.keys(ledCapabilities) as LEDZones[];
    return Promise.all(zones.map(zone => ledForZone(zone)));
  }

  // DPI
  dpiCapabilities?(): DPICapabilities;

  requestDpiLevels?(): Promise<void>;

  setDpiLevel?(index: number, level: number): Promise<void>;

  setDpiLevels?(levels: DPILevels): Promise<void>;

  changeCurrentDpi?(toIndex: number, withValue?: number): Promise<void>;

  requestCurrentDpi?(): Promise<void>;

  // Inputs
  inputCapabilities?(): InputCapabilities;

  requestInputBindings?(): Promise<void[] | void>;

  setInput?(keyBinding: KeyBinding): Promise<void>;

  // Profiles
  requestProfile?(id: number): Promise<void>;
}

export interface HIDDeviceConfiguratorConstructor {
  new (devices: HIDDevice[]): HIDDeviceConfigurator;
  FILTER: DeviceFilter;
}
