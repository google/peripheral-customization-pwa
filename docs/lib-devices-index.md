# src/lib/ts/devices/index.ts

Exports the `SupportedDevices` object.
It imports the array of devices configurators by `vendorID` from `src/lib/ts/devices/devices/<vendor>/index.ts` and generate an object mapping each `vendorId` to another object which maps a device `productId` to its configurator constructor.

### SupportedDevices
```
const SupportedDevices: Record<number,Record<number, HIDDeviceConfiguratorConstructor>>
```
