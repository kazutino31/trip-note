const CACHE_VERSION = 'trip-note-v1'
const CORE_FILES = ['./', './manifest.webmanifest', './trip-icon.svg']

async function cacheAppShell() {
  const cache = await caches.open(CACHE_VERSION)
  const response = await fetch('./', { cache: 'no-cache' })
  if (!response.ok) throw new Error('Unable to fetch app shell')
  await cache.put('./', response.clone())

  const html = await response.text()
  const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => new URL(match[1], self.location).href)
    .filter((url) => new URL(url).origin === self.location.origin)

  await cache.addAll([...new Set([...CORE_FILES, ...assetPaths])])
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put('./', copy))
          return response
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
      }
      return response
    })),
  )
})
