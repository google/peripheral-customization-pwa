import type { HIDDeviceConfiguratorConstructor } from './configurator';

// eslint-disable-next-line import/no-cycle
import Vendor1SupportedDevices from './vendor1';
import Vendor2SupportedDevices from './vendor2';

export type SupportedDevicesMap = Record<
  number,
  Record<number, HIDDeviceConfiguratorConstructor>
>;

const generateSupportedDevices = (
  devices: HIDDeviceConfiguratorConstructor[],
): SupportedDevicesMap =>
  devices.reduce((map: SupportedDevicesMap, constructor) => {
    const { productId, vendorId } = constructor.FILTER;
    const productToConstructor: Record<
      number,
      HIDDeviceConfiguratorConstructor
    > = { [productId]: constructor };

    if (map[vendorId]) {
      Object.assign(map[vendorId], productToConstructor);
    } else {
      Object.assign(map, { [vendorId]: productToConstructor });
    }

    return map;
  }, {});

const SupportedDevices = generateSupportedDevices([
  ...Vendor1SupportedDevices,
  ...Vendor2SupportedDevices,
]);

export default SupportedDevices;
