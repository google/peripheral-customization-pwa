# Peripheral Customization PWA

This repository contains a template Progressive Web App (PWA) that can be used to customize peripherals.

The template was designed for gaming mice, with three settings to customize: RGB LEDs, button mapping, and DPI values/stages. However the template may be used by anyone who wishes to customize settings stored within the onboard memory of a peripheral.

Communication between the PWA and the peripheral is done using the WebHID API.

# Development

In order to execute the application in development, you should run

```sh
$ yarn install --frozen-lockfile
$ yarn start -o
```

It will install the dependencies, build, start and open the application in the
`localhost:4200` default location.

# Deploy

Generate static pages for the local deploy:

```
$ yarn build --base-href ${base_url}
```

## GitHub pages

See the [blog post](https://angular.schule/blog/2020-01-everything-github).
To deploy the App to GH pages manually:

```
ng deploy --base-href=/peripheral-customization-pwa/
```

The result will be available here: https://google.github.io/peripheral-customization-pwa/
