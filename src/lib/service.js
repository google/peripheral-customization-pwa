importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js',
)
const { precaching, routing, strategies } = workbox

const CacheStrategy = strategies.NetworkFirst

precaching.precacheAndRoute([{ url: '/logo.png', revision: 3 }])

routing.registerRoute(
    ({ url }) => url.origin === location.origin,
    new CacheStrategy(),
)
