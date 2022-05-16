import SupportedDevices from './devices';
import {
  ConfiguratorEvents,
  HIDDeviceConfigurator,
} from './devices/configurator';

class Manager {
  backend?: HIDDeviceConfigurator;

  async connect(): Promise<HIDDeviceConfigurator> {
    // FIXME: get USB IDs for filters from the backend classes.
    const devices = await navigator.hid.requestDevice({
      filters: [],
    });

    if (!devices.length) throw Error('No device was selected');

    // eslint-disable-next-line no-console
    console.log(`Looking for backend for: ${devices}`);
    this.backend = await this.createBackendForDevices(devices);

    // Initialize UI with capabilities, information and current settings
    this.backend.emit(ConfiguratorEvents.CONNECT);

    await Promise.all([
      this.backend.requestFirmwareVersion(),
      this.backend.requestCurrentLedConfig?.(),
    ]);

    return this.backend;
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
}

// Singleton
export default new Manager();

export { LEDColorRange, LEDZones } from './devices/led';
export { Buttons } from './devices/buttons';
