import type { HIDDeviceConfiguratorConstructor } from 'src/lib/ts/devices/configurator';

import FakeMouse from './company-fake-mouse';

const devices: HIDDeviceConfiguratorConstructor[] = [FakeMouse];

export default devices;
