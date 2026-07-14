// ============================================
// SMART GRADE - INSTALL HANDLER V5.0
// Installation sur toutes les plateformes
// ============================================

(function() {
  
  'use strict';
  
  // ============================================
  // 1. DÉTECTION DU NAVIGATEUR
  // ============================================
  
  function getBrowser() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('chrome') !== -1 && ua.indexOf('edg') === -1 && ua.indexOf('opr') === -1) return 'chrome';
    if (ua.indexOf('edg') !== -1) return 'edge';
    if (ua.indexOf('opr') !== -1 || ua.indexOf('opera') !== -1) return 'opera';
    if (ua.indexOf('firefox') !== -1) return 'firefox';
    if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) return 'safari';
    if (ua.indexOf('samsung') !== -1) return 'samsung';
    return 'other';
  }
  
  // ============================================
  // 2. VÉRIFICATION SI DÉJÀ INSTALLÉ
  // ============================================
  
  function isInstalled() {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.navigator && window.navigator.standalone === true) return true;
    if (localStorage.getItem('smartgrade_installed') === 'true') return true;
    return false;
  }
  
  // ============================================
  // 3. MODALE D'INSTALLATION DÉCORÉE
  // ============================================
  
  function showInstallModal() {
    // Vérifier si la modale existe déjà
    var existing = document.getElementById('smartInstallModal');
    if (existing) {
      existing.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      return;
    }
    
    // Créer la modale
    var modal = document.createElement('div');
    modal.id = 'smartInstallModal';
    modal.style.cssText = [
      'display:flex',
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'background:rgba(0,0,0,0.85)',
      'z-index:99999',
      'align-items:center',
      'justify-content:center',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'animation:installFadeIn 0.3s ease'
    ].join(';');
    
    modal.innerHTML = `
      <div style="
        background:var(--card-bg);
        border-radius:28px;
        padding:32px 24px;
        max-width:340px;
        width:90%;
        text-align:center;
        border:1px solid var(--border);
        box-shadow:0 20px 60px rgba(0,0,0,0.3);
        animation:installScaleIn 0.4s ease;
      ">
        <div style="
          width:80px;
          height:80px;
          border-radius:50%;
          background:linear-gradient(135deg,var(--primary),var(--secondary));
          display:flex;
          align-items:center;
          justify-content:center;
          margin:0 auto 16px;
          box-shadow:0 4px 20px rgba(15,59,72,0.3);
        ">
          <i class="fas fa-download" style="font-size:32px;color:white;"></i>
        </div>
        
        <h2 style="
          font-size:1.2rem;
          font-weight:700;
          color:var(--text);
          margin-bottom:4px;
        ">Install SMART GRADE</h2>
        
        <p style="
          font-size:0.75rem;
          color:var(--text-light);
          margin-bottom:20px;
          line-height:1.6;
        ">
          <i class="fas fa-ellipsis-v" style="color:var(--primary);"></i> 
          <strong>Menu</strong> 
          <i class="fas fa-arrow-right" style="color:var(--primary);margin:0 4px;"></i> 
          <strong>Add to Home Screen</strong>
        </p>
        
        <button onclick="closeInstallModal()" style="
          width:100%;
          padding:14px;
          border-radius:40px;
          border:none;
          background:linear-gradient(135deg,var(--primary),var(--secondary));
          color:white;
          font-weight:600;
          font-size:0.9rem;
          cursor:pointer;
          transition:transform 0.2s;
          font-family:inherit;
        ">
          <i class="fas fa-check-circle"></i> Got it
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Ajouter les styles d'animation
    addInstallStyles();
  }
  
  // ============================================
  // 4. FERMER LA MODALE
  // ============================================
  
  window.closeInstallModal = function() {
    var modal = document.getElementById('smartInstallModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
  
  // ============================================
  // 5. AJOUTER LES STYLES D'ANIMATION
  // ============================================
  
  function addInstallStyles() {
    if (document.getElementById('installModalStyles')) return;
    
    var style = document.createElement('style');
    style.id = 'installModalStyles';
    style.textContent = `
      @keyframes installFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes installScaleIn {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      body.night-mode #smartInstallModal {
        background: rgba(0,0,0,0.92);
      }
      body.night-mode #smartInstallModal > div {
        background: #1a1a2e;
        border-color: rgba(255,255,255,0.08);
      }
      @media (max-width: 480px) {
        #smartInstallModal > div {
          padding: 24px 16px;
          max-width: 300px;
        }
        #smartInstallModal > div h2 {
          font-size: 1rem;
        }
        #smartInstallModal > div .fa-download {
          font-size: 24px;
        }
        #smartInstallModal > div button {
          font-size: 0.8rem;
          padding: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ============================================
  // 6. AFFICHER LA BANNIÈRE D'INSTALLATION
  // ============================================
  
  function showInstallBanner(browser) {
    var banner = document.getElementById('installPrompt');
    if (!banner) return;
    
    var messages = {
      chrome: 'Install SMART GRADE as an app',
      edge: 'Install SMART GRADE on your device',
      opera: 'Add SMART GRADE to home screen',
      firefox: 'Add SMART GRADE to home screen',
      safari: 'Add to Home Screen for best experience',
      samsung: 'Install SMART GRADE on your phone',
      other: 'Install SMART GRADE app'
    };
    
    var bannerText = banner.querySelector('.install-prompt-text h4');
    if (bannerText) {
      bannerText.innerHTML = messages[browser] || messages.other;
    }
    
    banner.classList.add('show');
    banner.style.display = 'flex';
    
    setTimeout(function() {
      if (banner) {
        banner.classList.remove('show');
        setTimeout(function() {
          if (banner) banner.style.display = 'none';
        }, 500);
      }
    }, 10000);
  }
  
  function hideInstallBanner() {
    var banner = document.getElementById('installPrompt');
    if (banner) {
      banner.classList.remove('show');
      banner.style.display = 'none';
    }
  }
  
  // ============================================
  // 7. TOAST NOTIFICATION
  // ============================================
  
  function showToast(message) {
    var container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="fas fa-info-circle"></i> ' + message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }
  
  // ============================================
  // 8. INSTALLATION SUR CHROME/EDGE
  // ============================================
  
  var deferredPrompt = null;
  
  function initChromeInstall() {
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      showInstallBanner('chrome');
    });
  }
  
  async function installChrome() {
    if (!deferredPrompt) {
      showInstallModal();
      return;
    }
    try {
      deferredPrompt.prompt();
      var result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        localStorage.setItem('smartgrade_installed', 'true');
        hideInstallBanner();
        showToast('App installed successfully');
      }
      deferredPrompt = null;
    } catch(e) {
      showInstallModal();
    }
  }
  
  // ============================================
  // 9. INSTALLATION SUR AUTRES NAVIGATEURS
  // ============================================
  
  function installOther() {
    showInstallModal();
  }
  
  // ============================================
  // 10. POINT D'ENTRÉE PRINCIPAL
  // ============================================
  
  function install() {
    var browser = getBrowser();
    if ((browser === 'chrome' || browser === 'edge') && deferredPrompt) {
      installChrome();
    } else {
      showInstallModal();
    }
  }
  
  // ============================================
  // 11. AUTO-AFFICHAGE
  // ============================================
  
  function autoShowPrompt() {
    if (isInstalled()) return;
    
    var browser = getBrowser();
    var hasBeenShown = localStorage.getItem('install_prompt_shown');
    
    if (!hasBeenShown) {
      setTimeout(function() {
        showInstallBanner(browser);
        localStorage.setItem('install_prompt_shown', 'true');
      }, 3000);
    }
  }
  
  // ============================================
  // 12. INITIALISATION
  // ============================================
  
  function init() {
    initChromeInstall();
    autoShowPrompt();
    
    // Exposer la fonction d'installation globalement
    window.installApp = install;
    window.showInstallModal = showInstallModal;
    window.closeInstallModal = window.closeInstallModal;
    
    console.log('[Install] ✅ Install Handler v5.0 chargé');
    console.log('[Install] 📱 Navigateur:', getBrowser());
    console.log('[Install] 📦 Installé:', isInstalled());
  }
  
  // ============================================
  // 13. DÉMARRAGE
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();