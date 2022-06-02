# Serving the PWA application

To serve and install the app as a Progressive Web App you first need to build the application.

To build the app you need to run the build command, there are two ways to do this:

- Using `yarn run build` with the yarn package manager
- Using `ng build` with the Angular CLI

The built app will be located on the root folder of the project inside `dist/app`

After building the app you need to serve the app on a http server, to do that on Linux you need to run this command with the http-server package inside the build app `dist/app`

```
http-server -p 8080 -c-1
```

Now you can access the built application on the localhost.
