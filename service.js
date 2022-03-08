importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');
const {precaching, routing, strategies} = workbox;

const CacheStrategy = strategies.NetworkFirst;

precaching.precacheAndRoute([
    { url: '/index.html', revision: 2 },
    { url: '/app.js', revision: 2 },
    { url: '/style.css', revision: 2 },
    { url: '/device.png', revision: 2 },
    { url: '/device-bottom.png', revision: 2 },
    { url: '/logo.png', revision: 2 },
])

routing.registerRoute(
    ({url}) => url.origin === location.origin,
    new CacheStrategy()
)