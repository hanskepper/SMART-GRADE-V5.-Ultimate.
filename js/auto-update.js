// ============================================
// SMART GRADE - MISE À JOUR AUTOMATIQUE
// Version: 5.0 - Ultimate
// ============================================

// METTEZ À JOUR CETTE LIGNE À CHAQUE MODIFICATION
var APP_VERSION = '5.0';
var APP_BUILD_DATE = '2026-07-08';

var autoUpdate = {
  initialized: false,
  updating: false
};

// Initialiser au chargement
function initAutoUpdate() {
  if (autoUpdate.initialized) return;
  autoUpdate.initialized = true;
  
  console.log('[AutoUpdate] Initialisation, version:', APP_VERSION);
  
  // Vérifier la version au démarrage
  var savedVersion = localStorage.getItem('smartgrade_version');
  
  if (!savedVersion) {
    localStorage.setItem('smartgrade_version', APP_VERSION);
    localStorage.setItem('smartgrade_build_date', APP_BUILD_DATE);
    return;
  }
  
  if (savedVersion !== APP_VERSION) {
    console.log('[AutoUpdate] Nouvelle version détectée! Mise à jour...');
    performSilentUpdate();
  }
  
  // Enregistrer le Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('[AutoUpdate] Service Worker enregistré');
      
      // Vérifier les mises à jour toutes les 30 minutes
      setInterval(function() {
        registration.update();
      }, 30 * 60 * 1000);
      
    }).catch(function(err) {
      console.log('[AutoUpdate] Erreur SW:', err);
    });
  }
}

// Mise à jour silencieuse
function performSilentUpdate() {
  if (autoUpdate.updating) return;
  autoUpdate.updating = true;
  
  console.log('[AutoUpdate] Mise à jour vers', APP_VERSION);
  
  // Sauvegarder la nouvelle version
  localStorage.setItem('smartgrade_version', APP_VERSION);
  localStorage.setItem('smartgrade_build_date', APP_BUILD_DATE);
  
  // Forcer la mise à jour du Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.update().then(function() {
        setTimeout(function() {
          // Ne pas recharger si l'utilisateur est en train de taper
          var activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            console.log('[AutoUpdate] Saisie en cours, rechargement différé');
            setTimeout(function() {
              window.location.reload();
            }, 30000);
          } else {
            window.location.reload();
          }
          autoUpdate.updating = false;
        }, 1500);
      });
    });
  } else {
    autoUpdate.updating = false;
  }
}

// Vider l'ancien cache (une fois)
function clearOldCacheOnce() {
  var cacheCleared = localStorage.getItem('cache_cleared_v5');
  if (cacheCleared) return;
  
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (var i = 0; i < names.length; i++) {
        if (names[i].startsWith('smartgrade') && !names[i].includes(APP_BUILD_DATE.replace(/-/g, ''))) {
          caches.delete(names[i]);
          console.log('[AutoUpdate] Ancien cache supprimé:', names[i]);
        }
      }
    });
  }
  
  localStorage.setItem('cache_cleared_v5', 'true');
}

// Démarrer
clearOldCacheOnce();
initAutoUpdate();