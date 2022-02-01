importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');
const {precaching, routing, strategies} = workbox;

const CacheStrategy = strategies.NetworkFirst;

precaching.precacheAndRoute([
    { url: '/index.html', revision: 1 },
    { url: '/app.js', revision: 1 },
    { url: '/style.css', revision: 1 },
    { url: '/device.png', revision: 1 },
    { url: '/device-bottom.png', revision: 1 },
    { url: '/logo.png', revision: 1 },
])

routing.registerRoute(
    ({url}) => url.origin === location.origin,
    new CacheStrategy()
)