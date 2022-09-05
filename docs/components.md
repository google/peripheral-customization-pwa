# Components

On the `app` folder you can see that all of the components are on separate folders.

## App

The app component is the root of the application, when the app is served the first component that renders is this one. On initialization the app component subscribes to the device observable, after a successful connection it sets the title of the app with the device name using the `TitleService` and displays the home component.

## Connect

The connect component is a button that when clicked calls the `connectToDevice()` method from the `ManagerService`.

## Home

The home component serves as a skeleton of the application. It is as a single page that contains the header, menu, and the footer component.

## Header

The header component holds information about the device such as the name, the remaining battery life, and the firmware version.

## Menu

The menu component has a navigation list that routes the user to the appropriate navigation link, these links are stored on the `navLinks` variable which is an array of links, the link has a `label` and a `link` that is used for the angular routing navigation. The angular routing paths are accessed on the `app-routing.module.ts`

## Footer

The footer component holds a centralized logo on a container, the logo of the device is retrieved with the use of methods from the `AssetsService`.

## Adjust CPI

The adjust cpi component on initialization requests all of the CPI information from the device and initializes all of the variables used for the UI's logic.

Methods:

```
setCpiInput(stage, cpiValue)
setCpiSlider(cpiValue: number)
changeStage(stage: number)
resetToDefault()
getKeyFromCpiValue(cpiValue: number)
```

These methods should:

- `setCpiInput`: Sets the selected stage with the chosen CPI value
- `setCpiSlider`: Sets the selected stage with the CPI value from the slider
- `changeStage`: Changes selected stage
- `resetToDefault`: Reset the stages with the default CPI values
- `getKeyFromCpiValue`: Get the key from a CPI value

## Customize Buttons

The customize buttons component on initialization requests the device input bindings so that it can be displayed and changed on the UI

Methods:

```
selectKey(button: Input)
bindToTypes(selectedButton: Input)
bindToKeys(selectedButton: Input
changeBindTo(selectedButton: Input)
```

These methods should:

- `selectKey`: Selects the button and assigns it to the selected variables
- `bindToTypes`: Binds the types of inputs on the selected button
- `bindToKeys`: Binds the available keys to the selected button
- `changeBindTo`: Sets the selected key to the selected button

## RGB Profile

The rgb profile component on initialization sets the zones from the ledCapabilities of the device, if the there is a single zone it uses as default.

Methods:

```
setZones()
setRgbList(zone: Zone)
chooseZone(zone: Zone)
hasSingleZone()
setRGBValue(event: MatSelectionListChange)
addColorsToSettings()
```

These methods should:

- `setZones`: Gets the zone of the device and sets it as an array
- `setRgbList`: Sets the RGB list with the ColorRange from a zone
- `chooseZone`: Selects a zone
- `hasSingleZone`: Checks if the device has a single zone
- `setRGBValue`: Sets selected RGB value on the device
- `addColorsToSettings`: Adds simple colors to the list
