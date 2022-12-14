# src/lib/ts/devices/configurator.ts

### HIDDeviceConfiguratorConstructor
Interface with the `HIDDeviceConfigurator` constructor and a `FILTER` property that stores both the `vendorId` and `productId` of a device.

### HIDDeviceConfigurator
Abstract class that extends `EventEmitter`.
Holds a `hidDevice` property which stores a `HIDDevice`.
Defines a set of methods that need to be implemented in the `src/lib/ts/devices/devices/<vendor>` which will be used to get data and set configuration properties in the device.

## Properties
```
abstract hidDevice: HIDDevice
handleEvent = (event: HIDInputReportEvent): void
```

## Methods
### handleInputReport
`abstract handleInputReport(e: HIDInputReportEvent): void`

Handles report events coming from the device.

### open
```
open(): Promise<void>
```

Add itself as an event to the `hidDevice` and calls its `open` method, which request the OS to open the HID device.

### close
```
close(): Promise<void>
```

Remove itself as an event to the `hidDevice` and calls its `close` method, which request the OS to close the connection to the HID device.

### requestFirmwareVersion
`abstract requestFirmwareVersion(): Promise<void>`

### sendReport
```
sendReport(reportId: number, outputReport: Uint8Array): Promise<void>
```

Calls `hidDevice.sendReport`.

### sendFeatureReport
```
sendFeatureReport(reportId: number, featureReport: Uint8Array): Promise<void>
```

Calls `hidDevice.sendFeatureReport`.

### receiveFeatureReport
```
receiveFeatureReport(reportId: number): Promise<DataView>
```

Calls `hidDevice.receiveFeatureReport`

### requestCurrentConfig
```
requestCurrentConfig?(): Promise<void[]>
```

Request current configuration.

### requestProfile
```
requestProfile?(id: number): Promise<void>
```

Request current profile configuration.

### LED
```
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
```
When implemented, those methods should:
- `ledCapabilities`: Get the device LEDs capabilities
- `requestCurrentLedConfig`: Request current LED configuration
- `ledForZone`: Get the current LED values for a given zone
- `setLed`: Set the LED of a given zone
- `defaultRequestCurrentLedConfig`: Default way of getting the current LEDs configuration. Its already implemented by the configurator

### CPI
```
cpiCapabilities?(): CPICapabilities;

requestCpiLevels?(): Promise<void>;

setCpiLevel?(index: number, level: number): Promise<void>;

setCpiLevels?(levels: CPILevels): Promise<void>;

changeCurrentCpi?(toIndex: number): Promise<void>;

requestCurrentCpi?(): Promise<void>;
```
When implemented, those methods should:
- `cpiCapabilities`: Get the device CPI capabilities
- `requestCpiLevels`: Request all CPI levels with its set values
- `setCpiLevel`: Set the CPI value of a single level
- `setCpiLevels`: Set CPI value of all levels
- `changeCurrentCpi`: Change the current CPI level selected in the device to another
- `requestCurrentCpi`: Request current CPI value

### Buttons Inputs
```
inputCapabilities?(): InputCapabilities;

requestInputBindings?(): Promise<void[] | void>;

setInput?(keyBinding: KeyBinding): Promise<void>;
```

When implemented, those methods should:
- `inputCapabilities`: Get the buttons input capabilities from the device
- `requestInputBindings`: Request as an event the current input bidings
- `setInput`: Set a given input biding in the device.
