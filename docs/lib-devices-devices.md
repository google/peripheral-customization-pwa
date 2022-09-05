# How to add a new device

To add a new device, it is necessary to implement its configurator, extending the `HIDDeviceConfigurator` class found in `src/lib/ts/devices/configurator.ts`.
This is currently done by the following structure:

```
src/lib/ts/devices/devices/<vendor>/
  index.ts
  <device>-constants.ts
  <device>-handlers.ts
  <device>.ts
```

## index.ts

This is where a list of all the supported devices configurators will be exported in a `HIDDeviceConfiguratorConstructor[]` type.
It follows the template:
```
import type { HIDDeviceConfiguratorConstructor } from 'src/lib/ts/devices/configurator';

import <Device01> from './<device01>';
import <Device02> from './<device02>';

const devices: HIDDeviceConfiguratorConstructor[] = [<Device01>];

export default devices;
```

## \<device>.ts
Must be a Class <Device> that extends from `HIDDeviceConfigurator` and overrides its optional methods.

## \<device>-constants.ts

This is where general device constants will be stored, like CPI levels, possible input mapping and so on.
This generally where the `types` and `enums` from `src/lib/ts/devices/components` will be used in the backend.

## \<device>-handlers.ts

Set of functions that will receive the device configurator and the device buffer, so that can read the specific values in the latter and emit configurator events accordingly. Those functions will be mapped in the `<device>.ts` and its returns can be listened in the UI.
