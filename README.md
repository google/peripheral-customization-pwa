# Peripheral Customization PWA

This repository contains a template Progressive Web App (PWA) that can be used to customize peripherals.

The template was designed for gaming mice, with three settings to customize: RGB LEDs, button mapping, and DPI values/stages. However the template may be used by anyone who wishes to customize settings stored within the onboard memory of a peripheral.

Communication between the PWA and the peripheral is done using the WebHID API.

In order to execute the application in development, you should run

```sh
$ yarn install --frozen-lockfile
$ yarn start -o
```

It will install the dependencies, build, start and open the application in the
`localhost:4200` default location.
