# Services

There are two services inside the `src/app` folder: `AssetsService` and `ManagerService`

## Assets Service

The assets service retrieves the device `vendorId` and `productId` on the constructor and gets all of the assets from both of the id's.

Methods:

```
getDeviceName()
getDeviceLogo()
getDeviceBottomImgUri()
getDeviceTopImgUri()
```

These methods should:

- `getDeviceName`: Gets the device name
- `getDeviceLogo`: Gets the device logo on the Uri format
- `getDeviceBottomImgUri`: Gets the device bottom image on the Uri format
- `getDeviceTopImgUri`: Gets the device top image on the Uri format

## Manager Service

The manager service is the connection between the UI and the device manager. The components use the manager service to do the all of the device relevant operations such as setting the CPI and LED values.

Methods:

```
connectToDevice()
setLed(color: Color, zone: LEDZones, mode?: LEDModes)
setInput(keyBinding: KeyBinding)
requestInputBindings()
setCpiLevel(index: number, level: number)
requestCpiLevels()
```

These methods should:

- `connectToDevice`: Connects to the manager retrieving the device
- `setLed`: Sets the color of the device on a specific zone
- `setInput`: Sets the input of a key binding
- `requestInputBindings`: Retrieves all of the device input bindings
- `setCpiLevel`: Sets the CPI value on a level
- `requestCpiLevels`: Retrieves all of the device CPI levels
