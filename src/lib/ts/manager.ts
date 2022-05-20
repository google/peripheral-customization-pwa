import SupportedDevices from './devices';
import {
  ConfiguratorEvents,
  DeviceFilter,
  HIDDeviceConfigurator,
} from './devices/configurator';

class Manager {
  backend?: HIDDeviceConfigurator;

  async connect(): Promise<HIDDeviceConfigurator> {
    const filters = Object.values(SupportedDevices).reduce((acc, devices) => {
      const vendorDevices = Object.values(devices).map(device => device.FILTER);
      return [...acc, ...vendorDevices];
    }, [] as DeviceFilter[]);

    const devices = await navigator.hid.requestDevice({ filters });

    if (!devices.length) throw Error('No device was selected');

    // eslint-disable-next-line no-console
    console.log(`Looking for backend for: ${devices}`);
    this.backend = await this.createBackendForDevices(devices);

    // Initialize UI with capabilities, information and current settings
    this.backend.emit(ConfiguratorEvents.CONNECT);

    await Promise.all([
      this.backend.requestFirmwareVersion(),
      this.backend.requestCurrentConfig?.(),
    ]);

    return this.backend;
  }

  async createBackendForDevices(
    devices: HIDDevice[],
  ): Promise<HIDDeviceConfigurator> {
    const device = devices[0];

    const constructor = SupportedDevices[device.vendorId]?.[device.productId];

    if (!constructor) throw Error('No supported devices were found');

    const backend = new constructor(devices);
    await backend.open();
    return backend;
  }
}

// Singleton
export default new Manager();
