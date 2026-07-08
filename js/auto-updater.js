// ============================================
// SMART GRADE - AUTO UPDATE SYSTEM
// 100% AUTONOME via GitHub API
// Version: 5.0
// ============================================

(function() {
  
  // Configuration - À MODIFIER UNE SEULE FOIS
  const GITHUB_USER = 'hanskepper';
  const GITHUB_REPO = 'SMART-GRADE-V5.-Ultimate.';
  const REPO_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits?per_page=1`;
  
  let currentHash = null;
  let checkInterval = null;
  let updateInProgress = false;
  
  // ============================================
  // RÉCUPÉRER LE HASH DU DERNIER COMMIT
  // ============================================
  async function getLatestCommitHash() {
    try {
      const response = await fetch(REPO_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.log('[AutoUpdate] GitHub API error:', response.status);
        return null;
      }
      
      const commits = await response.json();
      if (commits && commits[0] && commits[0].sha) {
        const hash = commits[0].sha.substring(0, 7);
        console.log('[AutoUpdate] Dernier commit:', hash);
        return hash;
      }
    } catch (error) {
      console.log('[AutoUpdate] Erreur réseau, mode offline');
    }
    return null;
  }
  
  // ============================================
  // LIRE LE HASH LOCAL
  // ============================================
  function getLocalHash() {
    let local = localStorage.getItem('smartgrade_app_hash');
    if (!local) {
      // Générer un hash initial basé sur le timestamp
      local = Date.now().toString(36);
      localStorage.setItem('smartgrade_app_hash', local);
    }
    return local;
  }
  
  // ============================================
  // ENREGISTRER LE HASH LOCAL
  // ============================================
  function setLocalHash(hash) {
    localStorage.setItem('smartgrade_app_hash', hash);
    currentHash = hash;
  }
  
  // ============================================
  // VÉRIFIER LES MISES À JOUR
  // ============================================
  async function checkForUpdates() {
    if (updateInProgress) return;
    
    const remoteHash = await getLatestCommitHash();
    const localHash = getLocalHash();
    
    if (!remoteHash) return;
    
    if (remoteHash !== localHash) {
      console.log('[AutoUpdate] Nouvelle version détectée!');
      console.log('[AutoUpdate] Local:', localHash, 'Remote:', remoteHash);
      
      updateInProgress = true;
      
      // Afficher une notification à l'utilisateur
      showUpdateNotification(remoteHash);
    }
  }
  
  // ============================================
  // AFFICHER NOTIFICATION DE MISE À JOUR
  // ============================================
  function showUpdateNotification(newHash) {
    // Créer la notification style toast
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #0f3b48, #00b4d8);
      color: white;
      padding: 16px;
      border-radius: 16px;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: slideUp 0.4s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <i class="fas fa-sync-alt" style="font-size: 24px; animation: spin 1s linear infinite;"></i>
        <div>
          <strong>Mise à jour disponible!</strong><br>
          <span style="font-size: 0.7rem;">Nouvelle version prête à être installée</span>
        </div>
      </div>
      <button id="updateNowBtn" style="
        background: white;
        border: none;
        padding: 8px 20px;
        border-radius: 30px;
        font-weight: bold;
        cursor: pointer;
        color: #0f3b48;
      ">
        <i class="fas fa-download"></i> Mettre à jour
      </button>
    `;
    
    document.body.appendChild(notification);
    
    // Ajouter les styles d'animation
    if (!document.getElementById('autoUpdateStyles')) {
      const style = document.createElement('style');
      style.id = 'autoUpdateStyles';
      style.textContent = `
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Gérer le clic sur le bouton
    const updateBtn = document.getElementById('updateNowBtn');
    if (updateBtn) {
      updateBtn.onclick = function() {
        performUpdate(newHash);
        notification.remove();
      };
    }
    
    // Auto-disparition après 30 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) notification.remove();
        }, 300);
      }
    }, 30000);
  }
  
  // ============================================
  // EXÉCUTER LA MISE À JOUR
  // ============================================
  async function performUpdate(newHash) {
    if (updateInProgress) return;
    updateInProgress = true;
    
    // Afficher un message de chargement
    const loadingToast = document.createElement('div');
    loadingToast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 24px 32px;
      border-radius: 20px;
      z-index: 2000;
      text-align: center;
      backdrop-filter: blur(10px);
    `;
    loadingToast.innerHTML = `
      <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
      <strong>Mise à jour en cours...</strong><br>
      <span style="font-size: 0.7rem;">Veuillez patienter</span>
    `;
    document.body.appendChild(loadingToast);
    
    // Sauvegarder les données utilisateur
    const currentUser = localStorage.getItem('smartgrade_current');
    
    // Nettoyer le cache du Service Worker
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (name.startsWith('smartgrade')) {
          await caches.delete(name);
        }
      }
    }
    
    // Forcer le rafraîchissement du Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    
    // Mettre à jour le hash local
    setLocalHash(newHash);
    
    // Afficher un message avant rechargement
    loadingToast.innerHTML = `
      <i class="fas fa-check-circle" style="font-size: 32px; margin-bottom: 12px; display: block; color: #2ecc71;"></i>
      <strong>Mise à jour terminée!</strong><br>
      <span style="font-size: 0.7rem;">Rechargement en cours...</span>
    `;
    
    // Recharger la page
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  }
  
  // ============================================
  // FORCER UNE VÉRIFICATION IMMÉDIATE
  // ============================================
  function forceCheck() {
    console.log('[AutoUpdate] Vérification forcée...');
    checkForUpdates();
  }
  
  // ============================================
  // DÉMARRER LA SURVEILLANCE
  // ============================================
  function startAutoUpdate() {
    console.log('[AutoUpdate] Système démarré - GitHub:', `${GITHUB_USER}/${GITHUB_REPO}`);
    
    // Vérifier immédiatement
    setTimeout(() => checkForUpdates(), 2000);
    
    // Vérifier toutes les 10 minutes
    checkInterval = setInterval(() => checkForUpdates(), 10 * 60 * 1000);
    
    // Vérifier aussi quand la page revient au premier plan
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    });
    
    // Vérifier quand la connexion revient
    window.addEventListener('online', () => {
      console.log('[AutoUpdate] Connexion rétablie');
      checkForUpdates();
    });
  }
  
  // ============================================
  // ARRÊTER LA SURVEILLANCE
  // ============================================
  function stopAutoUpdate() {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }
  
  // ============================================
  // EXPOSER LES FONCTIONS GLOBALEMENT
  // ============================================
  window.AutoUpdate = {
    start: startAutoUpdate,
    stop: stopAutoUpdate,
    check: forceCheck,
    getLocalVersion: () => getLocalHash(),
    getRemoteVersion: async () => await getLatestCommitHash()
  };
  
  // Démarrer automatiquement au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoUpdate);
  } else {
    startAutoUpdate();
  }
  
  console.log('[AutoUpdate] Système prêt - Surveille les commits GitHub');
})();