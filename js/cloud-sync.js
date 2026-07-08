// ============================================
// SMART GRADE - CLOUD SYNC (100% GRATUIT)
// Backup automatique - Aucune configuration utilisateur
// Clé API configurée
// ============================================

var CloudSync = {
  // ✅ Clé API configurée
  API_KEY: '$2a$10$gXi1FvyxfLFtIvUrOeYDEufAP0JhFpgz9lmicqKBBxyXgTHZTcAeK',
  
  MASTER_BIN_ID: null,
  autoBackupInterval: null,
  
  // Initialisation
  init: function() {
    console.log('CloudSync initialisé');
    this.loadMasterBin();
    this.addToSettings();
    this.startAutoBackup();
  },
  
  // Charger ou créer le master bin
  loadMasterBin: function() {
    var masterId = localStorage.getItem('smartgrade_master_bin');
    if (masterId) {
      this.MASTER_BIN_ID = masterId;
      console.log('Master bin chargé:', masterId);
    } else {
      this.createMasterBin();
    }
  },
  
  // Créer le master bin (à faire une seule fois)
  createMasterBin: function() {
    var data = { backups: {}, users: [] };
    
    fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': this.API_KEY,
        'X-Bin-Private': 'false'
      },
      body: JSON.stringify(data)
    })
    .then(function(response) { return response.json(); })
    .then(function(result) {
      CloudSync.MASTER_BIN_ID = result.metadata.id;
      localStorage.setItem('smartgrade_master_bin', result.metadata.id);
      console.log('Master bin créé:', result.metadata.id);
    })
    .catch(function(err) {
      console.log('Erreur création master bin:', err);
    });
  },
  
  // Sauvegarder les données d'un utilisateur
  backupUser: function(userId, userName, data, silent) {
    if (!this.MASTER_BIN_ID) {
      setTimeout(function() { CloudSync.backupUser(userId, userName, data, silent); }, 1000);
      return;
    }
    
    fetch('https://api.jsonbin.io/v3/b/' + this.MASTER_BIN_ID + '/latest', {
      headers: { 'X-Master-Key': this.API_KEY }
    })
    .then(function(response) { return response.json(); })
    .then(function(master) {
      var backups = master.record.backups || {};
      
      backups[userId] = {
        name: userName,
        data: data,
        lastBackup: new Date().toISOString(),
        version: '5.0'
      };
      
      return fetch('https://api.jsonbin.io/v3/b/' + CloudSync.MASTER_BIN_ID, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': CloudSync.API_KEY
        },
        body: JSON.stringify({ backups: backups })
      });
    })
    .then(function() {
      if (!silent) showToast('✅ Backup sauvegardé dans le cloud!');
      console.log('Backup effectué pour', userName);
    })
    .catch(function(err) {
      console.log('Erreur backup:', err);
      if (!silent) showToast('❌ Backup cloud échoué');
    });
  },
  
  // Restaurer les données d'un utilisateur
  restoreUser: function(userId, callback) {
    if (!this.MASTER_BIN_ID) {
      callback({ success: false, message: 'Cloud non prêt' });
      return;
    }
    
    fetch('https://api.jsonbin.io/v3/b/' + this.MASTER_BIN_ID + '/latest', {
      headers: { 'X-Master-Key': this.API_KEY }
    })
    .then(function(response) { return response.json(); })
    .then(function(master) {
      var backups = master.record.backups || {};
      var userBackup = backups[userId];
      
      if (userBackup && userBackup.data) {
        callback({ success: true, data: userBackup.data });
      } else {
        callback({ success: false, message: 'Aucun backup cloud trouvé' });
      }
    })
    .catch(function(err) {
      callback({ success: false, message: 'Restauration cloud échouée' });
    });
  },
  
  // Sauvegarde automatique
  autoBackup: function() {
    var user = getCurrentStudent();
    if (!user) return;
    
    var data = exportAllData(user.id);
    this.backupUser(user.id, user.name, data, true);
  },
  
  // Démarrer l'auto-backup
  startAutoBackup: function() {
    if (this.autoBackupInterval) clearInterval(this.autoBackupInterval);
    
    this.autoBackupInterval = setInterval(function() {
      CloudSync.autoBackup();
    }, 60 * 60 * 1000); // Toutes les heures
    
    // Premier backup après 30 secondes
    setTimeout(function() {
      CloudSync.autoBackup();
    }, 30000);
    
    console.log('Auto-backup démarré (toutes les heures)');
  },
  
  // Ajouter l'interface dans Settings
  addToSettings: function() {
    setTimeout(function() {
      var container = document.querySelector('.main-content');
      if (!container) return;
      
      if (document.getElementById('cloudSyncCard')) return;
      
      var card = document.createElement('div');
      card.id = 'cloudSyncCard';
      card.className = 'glass-card';
      card.innerHTML = `
        <h3><i class="fas fa-cloud-upload-alt"></i> Cloud Backup (Auto)</h3>
        <p style="font-size:0.65rem;color:var(--text-light);margin-bottom:12px;">
          <i class="fas fa-info-circle"></i> Vos données sont automatiquement sauvegardées dans le cloud toutes les heures. Aucune configuration nécessaire!
        </p>
        <div style="display:flex;gap:10px;">
          <button id="cloudBackupNowBtn" class="btn btn-primary" style="flex:1;">
            <i class="fas fa-cloud-upload-alt"></i> Sauvegarder maintenant
          </button>
          <button id="cloudRestoreNowBtn" class="btn btn-secondary" style="flex:1;">
            <i class="fas fa-cloud-download-alt"></i> Restaurer depuis le cloud
          </button>
        </div>
        <div id="cloudSyncStatus" style="margin-top:12px;font-size:0.6rem;color:var(--text-light);text-align:center;">
          <i class="fas fa-clock"></i> Backup automatique toutes les heures
        </div>
      `;
      
      var firstCard = document.querySelector('.glass-card');
      if (firstCard && firstCard.parentNode) {
        firstCard.parentNode.insertBefore(card, firstCard.nextSibling);
      } else {
        container.insertBefore(card, container.firstChild);
      }
      
      document.getElementById('cloudBackupNowBtn').onclick = function() {
        var user = getCurrentStudent();
        if (!user) { showToast('Veuillez vous connecter d\'abord'); return; }
        var data = exportAllData(user.id);
        CloudSync.backupUser(user.id, user.name, data, false);
      };
      
      document.getElementById('cloudRestoreNowBtn').onclick = function() {
        var user = getCurrentStudent();
        if (!user) { showToast('Veuillez vous connecter d\'abord'); return; }
        
        showConfirmDialog({
          title: 'Restaurer depuis le cloud',
          message: 'Cela va remplacer vos données actuelles. Êtes-vous sûr?',
          icon: 'fa-cloud-download-alt',
          iconColor: '#f39c12',
          confirmText: 'Restaurer',
          onConfirm: function() {
            CloudSync.restoreUser(user.id, function(result) {
              if (result.success) {
                importAllData(user.id, result.data);
                showToast('✅ Backup restauré! Rechargement...');
                setTimeout(function() { location.reload(); }, 1500);
              } else {
                showToast('❌ ' + result.message);
              }
            });
          }
        });
      };
    }, 500);
  }
};

// Initialisation automatique
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    CloudSync.init();
  });
} else {
  CloudSync.init();
}