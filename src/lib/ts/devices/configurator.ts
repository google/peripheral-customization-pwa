import type Manager from '../manager';

import type { Color, LEDCapabilities, LEDModes, LEDZones } from './led';

export type DeviceFilter = Required<
  Pick<HIDDeviceFilter, 'productId' | 'vendorId'>
>;

export abstract class HIDDeviceConfigurator {
  abstract hidDevice: HIDDevice;

  abstract manager: typeof Manager;

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

  abstract requestFirmwareVersion(): Promise<Uint8Array>;

  sendReport(reportId: number, outputReport: Uint8Array): Promise<void> {
    return this.hidDevice.sendReport(reportId, outputReport);
  }

  sendFeatureReport(
    reportId: number,
    featureReport: Uint8Array,
  ): Promise<void> {
    return this.hidDevice.sendFeatureReport(reportId, featureReport);
  }

  // RGB
  ledCapabilities?(): LEDCapabilities;

  requestCurrentLedConfig?(): Promise<Partial<Record<LEDZones, Color>>>;

  ledForZone?(zone: LEDZones): Promise<Color>;

  setLed?(color: Color, zone: LEDZones, mode: LEDModes): Promise<void>;

  protected async defaultRequestCurrentLedConfig(
    ledCapabilities: LEDCapabilities,
    ledForZone: (zone: LEDZones) => Promise<Color>,
  ): Promise<Partial<Record<LEDZones, Color>>> {
    const zones = Object.keys(ledCapabilities) as LEDZones[];
    const colors = await Promise.all(zones.map(zone => ledForZone(zone)));
    return Object.fromEntries(
      zones.map((zone, index) => [zone, colors[index]]),
    );
  }
}

export interface HIDDeviceConfiguratorConstructor {
  new (manager: typeof Manager, devices: HIDDevice[]): HIDDeviceConfigurator;
  FILTER: DeviceFilter;
}
