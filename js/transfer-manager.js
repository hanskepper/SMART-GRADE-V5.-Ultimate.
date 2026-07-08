// ============================================
// SMART GRADE - TRANSFER MANAGER v2
// Gist dédié : transfer.json
// ============================================

var TransferManager = {
  gistId: null,
  token: null,
  
  init: function() {
    this.gistId = getGistId('transfer');
    this.token = getGithubToken();
    console.log('[Transfer] Initialisé avec Gist:', this.gistId);
  },
  
  // ============================================
  // LIRE LE GIST
  // ============================================
  getData: async function() {
    try {
      var response = await fetch('https://api.github.com/gists/' + this.gistId, {
        headers: { 'Authorization': 'token ' + this.token }
      });
      
      if (!response.ok) throw new Error('Gist inaccessible');
      
      var gist = await response.json();
      var content = JSON.parse(gist.files['transfer.json'].content);
      
      // Nettoyer les codes expirés
      var now = Date.now();
      var changed = false;
      for (var code in content.codes) {
        if (content.codes[code].expiresAt < now) {
          delete content.codes[code];
          changed = true;
        }
      }
      if (changed) {
        await this.saveData(content);
      }
      
      return content;
    } catch(e) {
      console.error('[Transfer] Erreur lecture:', e);
      return { codes: {} };
    }
  },
  
  // ============================================
  // SAUVEGARDER LE GIST
  // ============================================
  saveData: async function(data) {
    try {
      var response = await fetch('https://api.github.com/gists/' + this.gistId, {
        method: 'PATCH',
        headers: {
          'Authorization': 'token ' + this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'transfer.json': {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      });
      
      if (!response.ok) throw new Error('Échec sauvegarde');
      return true;
    } catch(e) {
      console.error('[Transfer] Erreur sauvegarde:', e);
      return false;
    }
  },
  
  // ============================================
  // CRÉER UN CODE DE TRANSFERT
  // ============================================
  generateCode: async function(userId, userName, data) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    var transferData = {
      code: code,
      userId: userId,
      userName: userName,
      data: data,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    
    var gistData = await this.getData();
    gistData.codes[code] = transferData;
    gistData.lastCleanup = new Date().toISOString();
    
    var saved = await this.saveData(gistData);
    return saved ? code : null;
  },
  
  // ============================================
  // RÉCUPÉRER UN TRANSFERT
  // ============================================
  getTransfer: async function(code) {
    var gistData = await this.getData();
    var transfer = gistData.codes[code];
    
    if (!transfer) return null;
    if (transfer.expiresAt < Date.now()) {
      // Supprimer automatiquement
      delete gistData.codes[code];
      await this.saveData(gistData);
      return null;
    }
    
    return transfer;
  },
  
  // ============================================
  // SUPPRIMER UN TRANSFERT
  // ============================================
  deleteTransfer: async function(code) {
    var gistData = await this.getData();
    if (gistData.codes[code]) {
      delete gistData.codes[code];
      await this.saveData(gistData);
      return true;
    }
    return false;
  },
  
  // ============================================
  // NETTOYER TOUS LES TRANSFERTS EXPIRÉS
  // ============================================
  cleanExpired: async function() {
    var gistData = await this.getData();
    var now = Date.now();
    var changed = false;
    
    for (var code in gistData.codes) {
      if (gistData.codes[code].expiresAt < now) {
        delete gistData.codes[code];
        changed = true;
      }
    }
    
    if (changed) {
      gistData.lastCleanup = new Date().toISOString();
      await this.saveData(gistData);
      console.log('[Transfer] Nettoyage effectué');
    }
  }
};

// Initialisation au chargement
TransferManager.init();

// Nettoyage automatique toutes les 30 secondes
setInterval(function() {
  TransferManager.cleanExpired();
}, 30 * 1000);