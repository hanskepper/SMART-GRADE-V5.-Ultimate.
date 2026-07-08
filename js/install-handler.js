// ============================================
// SMART GRADE - UNIVERSAL INSTALL HANDLER
// Works on Chrome, Opera, Edge, Firefox, Safari
// No emojis version
// ============================================

var InstallHandler = (function() {
  
  // Detect browser
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
  
  // Check if already installed
  function isInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.navigator.standalone === true) return true;
    if (localStorage.getItem('smartgrade_installed') === 'true') return true;
    return false;
  }
  
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
      showManualInstructions('chrome');
      return;
    }
    deferredPrompt.prompt();
    var result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem('smartgrade_installed', 'true');
      hideInstallBanner();
      showToast('App installed successfully');
    }
    deferredPrompt = null;
  }
  
  function installOpera() {
    showManualInstructions('opera');
  }
  
  function installFirefox() {
    showManualInstructions('firefox');
  }
  
  function installSafari() {
    showManualInstructions('safari');
  }
  
  function installSamsung() {
    showManualInstructions('samsung');
  }
  
  function installGeneric() {
    showManualInstructions('generic');
  }
  
  function showManualInstructions(browser) {
    var instructions = {
      chrome: {
        title: 'Install on Chrome',
        steps: [
          '1. Tap the menu button (3 dots) at top right',
          '2. Select Add to Home Screen or Install App',
          '3. Tap Install to add SMART GRADE to your home screen'
        ],
        icon: 'fab fa-chrome'
      },
      opera: {
        title: 'Install on Opera',
        steps: [
          '1. Tap the O menu at bottom right',
          '2. Select Add to Home Screen',
          '3. Tap Add to install SMART GRADE'
        ],
        icon: 'fab fa-opera'
      },
      edge: {
        title: 'Install on Edge',
        steps: [
          '1. Tap the menu button at bottom',
          '2. Select Add to Home Screen or Install App',
          '3. Tap Install to add SMART GRADE'
        ],
        icon: 'fab fa-edge'
      },
      firefox: {
        title: 'Install on Firefox',
        steps: [
          '1. Tap the menu button at bottom right',
          '2. Select Add to Home Screen',
          '3. Tap Add to create a shortcut'
        ],
        icon: 'fab fa-firefox'
      },
      safari: {
        title: 'Install on Safari (iPhone/iPad)',
        steps: [
          '1. Tap the Share button at bottom',
          '2. Scroll down and tap Add to Home Screen',
          '3. Tap Add to install SMART GRADE'
        ],
        icon: 'fab fa-safari'
      },
      samsung: {
        title: 'Install on Samsung Internet',
        steps: [
          '1. Tap the menu button at bottom',
          '2. Select Add to Home Screen',
          '3. Tap Add to install'
        ],
        icon: 'fas fa-mobile-alt'
      },
      generic: {
        title: 'Install SMART GRADE',
        steps: [
          '1. Open your browser menu',
          '2. Look for Add to Home Screen or Install App',
          '3. Follow the prompts to install'
        ],
        icon: 'fas fa-download'
      }
    };
    
    var data = instructions[browser] || instructions.generic;
    
    var modal = document.getElementById('installModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'installModal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000;display:none;align-items:center;justify-content:center;backdrop-filter:blur(5px);';
      modal.innerHTML = '<div style="background:var(--card-bg);border-radius:28px;padding:24px;max-width:320px;width:85%;text-align:center;animation:modalFadeIn 0.3s ease;"><div style="font-size:48px;margin-bottom:16px;" id="installModalIcon"><i class="fab fa-chrome"></i></div><h3 id="installModalTitle" style="color:var(--primary);margin-bottom:12px;">Install App</h3><div id="installModalSteps" style="text-align:left;margin:20px 0;line-height:1.8;"></div><button class="btn btn-primary" onclick="closeInstallModal()" style="width:100%;">Got it</button></div>';
      document.body.appendChild(modal);
      
      if (!document.querySelector('#modalKeyframes')) {
        var style = document.createElement('style');
        style.id = 'modalKeyframes';
        style.textContent = '@keyframes modalFadeIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}';
        document.head.appendChild(style);
      }
    }
    
    document.getElementById('installModalIcon').innerHTML = '<i class="' + data.icon + '" style="font-size:48px;color:var(--primary);"></i>';
    document.getElementById('installModalTitle').innerHTML = data.title;
    document.getElementById('installModalSteps').innerHTML = data.steps.join('<br><br>');
    modal.style.display = 'flex';
    
    window.closeInstallModal = function() {
      modal.style.display = 'none';
    };
  }
  
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
      generic: 'Install SMART GRADE app'
    };
    
    var bannerText = banner.querySelector('.install-prompt-text h4');
    if (bannerText) bannerText.innerHTML = messages[browser] || messages.generic;
    
    banner.classList.add('show');
    banner.style.display = 'flex';
    
    setTimeout(function() {
      if (banner && banner.classList) banner.classList.remove('show');
    }, 10000);
  }
  
  function hideInstallBanner() {
    var banner = document.getElementById('installPrompt');
    if (banner) {
      banner.classList.remove('show');
      banner.style.display = 'none';
    }
  }
  
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
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
    }, 4000);
  }
  
  function install() {
    var browser = getBrowser();
    if (browser === 'chrome' || browser === 'edge') {
      if (deferredPrompt) {
        installChrome();
      } else {
        showManualInstructions(browser);
      }
    } else {
      showManualInstructions(browser);
    }
  }
  
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
  
  return {
    init: function() {
      initChromeInstall();
      autoShowPrompt();
    },
    install: install,
    isInstalled: isInstalled,
    getBrowser: getBrowser
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    InstallHandler.init();
  });
} else {
  InstallHandler.init();
}