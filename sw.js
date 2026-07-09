// ============================================================
//  SMART GRADE - SERVICE WORKER V5.0.1
//  Stratégie : Network First (hors ligne + mise à jour auto)
//  Version: 5.0.1
// ============================================================

const CACHE_NAME = 'smartgrade-v5.0.1';
const VERSION = '5.0.1';

// ============================================================
//  TOUS LES FICHIERS À METTRE EN CACHE
// ============================================================

const FILES_TO_CACHE = [
  // Pages principales
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
  './chat.html',
  './admin-homework.html',
  './welcome.html',

  // Pages publiques
  './guide.html',
  './about.html',

  // Pages d'erreur
  './maintenance.html',
  './400.html',
  './401.html',
  './403.html',
  './404.html',
  './500.html',
  './502.html',
  './503.html',

  // Pages légales
  './terms.html',
  './privacy.html',
  './cookies.html',
  './license.html',
  './eula.html',
  './doc.html',

  // Pages développeur
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

  // JavaScript
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

  // Icons PWA
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

  // Icons iOS
  './icons/icon-57x57.png',
  './icons/icon-60x60.png',
  './icons/icon-76x76.png',
  './icons/icon-114x114.png',
  './icons/icon-120x120.png',
  './icons/icon-167x167.png',
  './icons/icon-180x180.png',
  './icons/icon-1024x1024.png',

  // Avatars
  './icons/avatar-boy.png',
  './icons/avatar-girl.png',

  // Logos
  './icons/icon.png',
  './icons/icon.svg',

  // PWA
  './manifest.json',

  // Données
  './homeworks.json',
  './version.json',
  './robots.txt',
  './sitemap.xml',
  './README.md',
  './LICENSE.md',
  './congfig.js',
  './.nojekyll'
];

// ============================================================
//  API DOMAINS (toujours en ligne)
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
//  INSTALLATION - Met tout en cache
// ============================================================

self.addEventListener('install', function(event) {
  console.log('[SW] 📦 Installation v' + VERSION + '...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] 📁 Mise en cache de ' + FILES_TO_CACHE.length + ' fichiers');
        
        var promises = FILES_TO_CACHE.map(function(url) {
          return cache.add(url).catch(function() {
            console.warn('[SW] ⚠️ Fichier ignoré:', url);
            return Promise.resolve();
          });
        });
        
        return Promise.all(promises);
      })
      .then(function() {
        console.log('[SW] ✅ Installation terminée');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] ❌ Erreur:', error);
      })
  );
});

// ============================================================
//  ACTIVATION - Supprime les anciens caches
// ============================================================

self.addEventListener('activate', function(event) {
  console.log('[SW] 🔄 Activation v' + VERSION + '...');

  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('smartgrade')) {
              console.log('[SW] 🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        console.log('[SW] ✅ Activation terminée');
        return self.clients.claim();
      })
  );
});

// ============================================================
//  INTERCEPTION - Network First (hors ligne = cache)
// ============================================================

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // ==========================================================
  //  1. API → toujours en ligne
  // ==========================================================

  for (var i = 0; i < API_DOMAINS.length; i++) {
    if (url.hostname === API_DOMAINS[i] || url.hostname.endsWith('.' + API_DOMAINS[i])) {
      event.respondWith(
        fetch(request).catch(function() {
          return new Response(
            JSON.stringify({ error: 'Hors ligne', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
      );
      return;
    }
  }

  // ==========================================================
  //  2. sw.js → jamais en cache
  // ==========================================================

  if (url.pathname === '/sw.js') {
    event.respondWith(fetch(request));
    return;
  }

  // ==========================================================
  //  3. Fichiers statiques → Network First avec cache
  // ==========================================================

  // Vérifier si c'est un fichier statique
  var extensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.webp', '.txt', '.xml', '.md'];
  var isStatic = false;
  
  for (var j = 0; j < extensions.length; j++) {
    if (url.pathname.endsWith(extensions[j])) {
      isStatic = true;
      break;
    }
  }

  if (isStatic || url.pathname === '/manifest.json' || url.pathname === '/') {
    event.respondWith(
      // ESSAYER EN LIGNE D'ABORD
      fetch(request)
        .then(function(response) {
          // Si la requête réussit, mettre à jour le cache
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(function() {
          // SI HORS LIGNE → UTILISER LE CACHE
          return caches.match(request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si pas dans le cache, retourner une page d'erreur
              return new Response('Hors ligne', { status: 503 });
            });
        })
    );
    return;
  }

  // ==========================================================
  //  4. Autres → réseau d'abord
  // ==========================================================

  event.respondWith(
    fetch(request).catch(function() {
      return new Response('Hors ligne', { status: 503 });
    })
  );
});

// ============================================================
//  MESSAGES - Pour la version
// ============================================================

self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'getVersion') {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// ============================================================
//  LOG
// ============================================================

console.log('[SW] ✅ Service Worker v' + VERSION + ' chargé');
console.log('[SW] 📁 ' + FILES_TO_CACHE.length + ' fichiers en cache');
console.log('[SW] 🌐 Stratégie: Network First (hors ligne = cache)');
console.log('[SW] 🔄 Mise à jour automatique quand connecté');
