/**
 * Service Worker for PT. Holly Xaviera Export
 * Production-ready with caching strategies for offline support
 */

const CACHE_NAME = 'hxe-cache-v1';
const STATIC_CACHE = 'hxe-static-v1';
const API_CACHE = 'hxe-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/pwa/manifest.json',
    '/images/favicon.ico',
    '/images/favicon-16.png',
    '/images/favicon-32.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/rest/v1/products',
    '/rest/v1/articles'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle API requests with stale-while-revalidate
    if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // Handle static assets with cache-first strategy
    event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with stale-while-revalidate strategy
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>} The response
 */
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE);

    try {
        // Try to get from cache first
        const cachedResponse = await cache.match(request);
        
        // Fetch from network in background
        const networkFetch = fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }).catch(() => null);

        // Return cached response immediately, or wait for network
        return cachedResponse || networkFetch;
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle static asset requests with cache-first strategy
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>} The response
 */
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    
    try {
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Return cached response
            return cachedResponse;
        }

        // Fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the response
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return offline fallback for images
        if (request.destination === 'image') {
            return new Response('', {
                status: 404,
                statusText: 'Offline'
            });
        }
        
        throw error;
    }
}

/**
 * Handle navigation requests with network-first strategy
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>} The response
 */
async function handleNavigation(request) {
    try {
        // Try network first for fresh content
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // Fallback to cache for offline support
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match('/index.html');
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Last resort - return offline page
        return new Response('You are offline. Please check your connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => caches.delete(name))
                );
            })
        );
    }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-contact-form') {
        event.waitUntil(syncContactForm());
    }
});

/**
 * Sync contact form submissions when back online
 */
async function syncContactForm() {
    // Get pending submissions from IndexedDB
    // In production, implement IndexedDB storage for offline form data
    const pendingSubmissions = [];
    
    for (const submission of pendingSubmissions) {
        try {
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });
        } catch (error) {
            // Keep in queue for next sync
        }
    }
}

// Push notifications (optional)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/pwa/icons/icon-192.png',
            badge: '/pwa/icons/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Products',
                    icon: '/pwa/icons/icon-72.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/pwa/icons/icon-72.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/#products')
        );
    }
});
