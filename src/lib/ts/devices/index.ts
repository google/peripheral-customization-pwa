import type { HIDDeviceConfiguratorConstructor } from './configurator';

import FakeSupportedDevices from './devices/fake';

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
  // FIXME: use the filter for your device
  // here you need to add the filter for your devices
  ...FakeSupportedDevices,
]);

export default SupportedDevices;
