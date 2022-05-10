import SupportedDevices from './devices';
import type { HIDDeviceConfigurator } from './devices/configurator';

import type { Color, LEDCapabilities, LEDModes, LEDZones } from './devices/led';
import { Buttons } from './devices/buttons';

import { byteArrayToString } from './util';

class Manager {
  handlersMap: Record<string, (data: any) => void> = {};

  backend?: HIDDeviceConfigurator;

  async connect(): Promise<void> {
    // FIXME: get USB IDs for filters from the backend classes.
    const devices = await navigator.hid.requestDevice({
      filters: [],
    });

    if (!devices.length) throw Error('No device was selected');

    // eslint-disable-next-line no-console
    console.log(`Looking for backend for: ${devices}`);
    this.backend = await this.createBackendForDevices(devices);

    // Initialize the UI with capabilities, information and current settings.
    this.notify('connected');

    await Promise.all([
      this.requestFirmwareVersion(),
      this.requestCurrentLedConfig(),
    ]);

    // eslint-disable-next-line no-console
    console.log(`Selected backend: ${this.backend}`);
  }

  async createBackendForDevices(
    devices: HIDDevice[],
  ): Promise<HIDDeviceConfigurator> {
    const device = devices[0];

    const constructor = SupportedDevices[device.vendorId]?.[device.productId];

    if (!constructor) throw Error('No supported devices were found');

    const backend = new constructor(this, devices);
    await backend.open();
    return backend;
  }

  // Basics
  requestFirmwareVersion(): Promise<Uint8Array> {
    if (!this.backend) throw Error('Backend is undefined');
    return this.backend.requestFirmwareVersion();
  }

  receiveFirmwareVersion(version: Uint8Array): void {
    // Need to solve how this is going to be integrated with the FE
    // eslint-disable-next-line no-console
    console.log(`fw-version : ${byteArrayToString(version)}`);
  }

  subscribe(handlersMap: Record<string, () => void>): void {
    this.handlersMap = handlersMap;
  }

  notify(eventName: string, data?: any): void {
    const handler = this.handlersMap[eventName];
    if (!handler) {
      throw Error('No handler fot this event');
    }

    handler(data);
  }

  // Buttons
  setButton(button: Buttons, action: string): void {
    // eslint-disable-next-line no-console
    console.log(`button: ${button} action: ${action}`);
  }

  setDPILevel(level: number): void {
    // eslint-disable-next-line no-console
    console.log(`DPI level: ${level}`);
  }

  // RGB
  requestCurrentLedConfig(): Promise<Partial<Record<LEDZones, Color>>> {
    if (!this.backend?.requestCurrentLedConfig)
      throw Error("Backend doesn't support this functionality");

    return this.backend.requestCurrentLedConfig();
  }

  ledCapabilities(): LEDCapabilities {
    if (!this.backend?.ledCapabilities)
      throw Error("Backend doesn't support LED functionality");
    return this.backend.ledCapabilities();
  }

  ledForZone(zone: LEDZones): Promise<Color> {
    if (!this.backend?.ledForZone)
      throw Error("Backend doesn't support ledForZone()");
    return this.backend.ledForZone(zone);
  }

  setLED(color: Color, zone: LEDZones, mode: LEDModes): void {
    if (!this.backend?.setLed) return;

    this.backend.setLed(color, zone, mode);
  }
}

// Singleton
export default new Manager();

export { LEDColorRange, LEDZones } from './devices/led';
export { Buttons } from './devices/buttons';
