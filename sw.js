// ============================================================
//  SMART GRADE - SERVICE WORKER V5.0.3
//  SILENT AUTO-UPDATE - NO NOTIFICATIONS
//  ALL PAGES INCLUDED
// ============================================================

const CACHE_NAME = 'smartgrade-v5.0.3';
const APP_VERSION = '5.0.3';

// ============================================================
//  ALL FILES TO CACHE - COMPLETE LIST
// ============================================================

const FILES_TO_CACHE = [
  './',
  './index.html',
  './splash.html',
  './login.html',
  './register.html',
  './dashboard.html',
  './add-grade.html',
  './subjects.html',
  './subject-detail.html',
  './term1.html',
  './term2.html',
  './term3.html',
  './yearly.html',
  './statistics.html',
  './achievements.html',
  './flashcards.html',
  './goals.html',
  './timetable.html',
  './homeworks.html',
  './notebook.html',
  './profile.html',
  './settings.html',
  './shortcuts.html',
  './search.html',
  './ai-assistant.html',
  './support.html',
  './guide-user.html',
  './about-user.html',
  './export.html',
  './backup.html',
  './transfer.html',
  './notifications.html',
  './history.html',
  './maintenance.html',
  './400.html',
  './401.html',
  './403.html',
  './404.html',
  './500.html',
  './502.html',
  './503.html',
  './terms.html',
  './privacy.html',
  './cookies.html',
  './license.html',
  './eula.html',
  './doc.html',
  './guide.html',
  './about.html',
  './admin-homework.html',
  './chat.html',
  './welcome.html',
  './dev-calculator.html',
  './dev-database.html',
  './dev-stats.html',
  './dev-logs.html',
  './dev-backup.html',
  './dev-config.html',

  // CSS
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/themes.css',
  './css/night-mode.css',
  './css/ai-assistant.css',

  // JS
  './js/utils.js',
  './js/database.js',
  './js/auth.js',
  './js/app.js',
  './js/transfer.js',
  './js/confirm-dialog.js',
  './js/install-handler.js',
  './js/pwa.js',
  './js/auto-save.js',
  './js/auto-update.js',
  './js/auto-updater.js',
  './js/cloud-sync.js',
  './js/storage.js',
  './js/ai-assistant-core.js',
  './js/ai-assistant-ui.js',
  './js/widget-data.js',
  './js/avatars-data.js',
  './js/transfer-local.js',
  './js/transfer-manager.js',
  './js/export.js',

  // ICONS PWA
  './icons/icon-48x48.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-256x256.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',

  // ICONS iOS
  './icons/icon-57x57.png',
  './icons/icon-60x60.png',
  './icons/icon-76x76.png',
  './icons/icon-114x114.png',
  './icons/icon-120x120.png',
  './icons/icon-167x167.png',
  './icons/icon-180x180.png',
  './icons/icon-1024x1024.png',

  // AVATARS & LOGOS
  './icons/avatar-boy.png',
  './icons/avatar-girl.png',
  './icons/icon.png',
  './icons/icon.svg',

  // PWA
  './manifest.json',

  // DATA & CONFIG
  './homeworks.json',
  './version.json',
  './robots.txt',
  './sitemap.xml',
  './README.md',
  './LICENSE.md',
  './congfig.js'
];

// ============================================================
//  API DOMAINS - ALWAYS ONLINE
// ============================================================

const API_DOMAINS = [
  'api.groq.com',
  'api.mistral.ai',
  'api.github.com',
  'api.jsonbin.io',
  'fonts.googleapis.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com'
];

// ============================================================
//  INSTALL - SILENT
// ============================================================

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(function() {
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.log('[SW] Install error:', error);
      })
  );
});

// ============================================================
//  ACTIVATE - CLEAN OLD CACHES
// ============================================================

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

// ============================================================
//  FETCH - NETWORK FIRST, CACHE FALLBACK
// ============================================================

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // API domains - always online
  for (var i = 0; i < API_DOMAINS.length; i++) {
    if (url.hostname === API_DOMAINS[i] || url.hostname.endsWith('.' + API_DOMAINS[i])) {
      event.respondWith(
        fetch(request).catch(function() {
          return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
      );
      return;
    }
  }

  // sw.js - never cache
  if (url.pathname === '/sw.js' || url.pathname === './sw.js') {
    event.respondWith(fetch(request));
    return;
  }

  // Static files - network first
  if (url.hostname === self.location.hostname) {
    var extensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.webp', '.txt', '.xml', '.md'];
    var isStatic = false;

    for (var j = 0; j < extensions.length; j++) {
      if (url.pathname.endsWith(extensions[j])) {
        isStatic = true;
        break;
      }
    }

    if (isStatic || url.pathname === '/manifest.json') {
      event.respondWith(
        fetch(request)
          .then(function(response) {
            if (response && response.status === 200) {
              var clone = response.clone();
              caches.open(CACHE_NAME).then(function(cache) {
                cache.put(request, clone);
              });
            }
            return response;
          })
          .catch(function() {
            return caches.match(request)
              .then(function(cached) {
                if (cached) {
                  return cached;
                }
                return new Response('Offline', { status: 503 });
              });
          })
      );
      return;
    }
  }

  // Other requests - network first
  event.respondWith(
    fetch(request).catch(function() {
      return caches.match(request)
        .then(function(cached) {
          if (cached) {
            return cached;
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// ============================================================
//  MESSAGE - SILENT UPDATE
// ============================================================

self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ============================================================
//  LOG - SILENT MODE
// ============================================================

console.log('[SW] Service Worker v' + APP_VERSION + ' loaded');
console.log('[SW] ' + FILES_TO_CACHE.length + ' files cached');