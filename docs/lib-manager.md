# src/lib/ts/manager.ts

## Manager
Singleton class.
Gets the selected device from the UI and instantiate its backend back to the frontend.

### Properties

```
backend?: HIDDeviceConfigurator
```

Stores the specific device configurator.

### Methods

```
async connect(): Promise<HIDDeviceConfigurator>
```

Filter all the supported devices by `vendorId` and `productId`, then requires the user to choose one of them, if any are connected to the computer. After the user selected the proper device, it will instantiate that device configurator in the `backend` property, using it to emit a signal to initialize UI with capabilities, information and current settings. Finally, will return the `backend` to the UI.

```
async createBackendForDevices(
  devices: HIDDevice[],
): Promise<HIDDeviceConfigurator>
```

It will use the SupportedDevices object map to instantiate that device configurator, opening its EventEmitter connection.
