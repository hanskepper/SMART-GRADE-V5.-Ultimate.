// ============================================
// SMART GRADE v5.0 - STORAGE MANAGER
// Gestion optimisée du localStorage
// ============================================

var StorageManager = {
  // Vérifier l'espace disponible
  getUsage: function() {
    var total = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf('smartgrade_') === 0) {
        total += localStorage.getItem(key).length;
      }
    }
    return {
      used: total,
      usedKB: Math.round(total / 1024),
      usedMB: (total / 1048576).toFixed(2),
      items: localStorage.length
    };
  },
  
  // Obtenir toutes les clés
  getAllKeys: function() {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf('smartgrade_') === 0) keys.push(key);
    }
    return keys;
  },
  
  // Sauvegarder avec vérification
  safeSet: function(key, value) {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (e) {
      return { success: false, error: t('messages.storage_full', 'Storage full'), message: t('messages.free_up_space', 'Please free up space or export your data.') };
    }
  },
  
  // Sauvegarder un objet JSON
  setJSON: function(key, obj) {
    return this.safeSet(key, JSON.stringify(obj));
  },
  
  // Lire un objet JSON
  getJSON: function(key, defaultValue) {
    var d = localStorage.getItem(key);
    if (!d) return defaultValue || null;
    try { return JSON.parse(d); } catch (e) { return defaultValue || null; }
  },
  
  // Supprimer une clé
  remove: function(key) {
    localStorage.removeItem(key);
  },
  
  // Nettoyer les vieilles données
  cleanOldData: function() {
    var keys = this.getAllKeys();
    var cleaned = 0;
    var now = Date.now();
    var ninetyDays = 90 * 24 * 60 * 60 * 1000;
    
    keys.forEach(function(key) {
      // Supprimer les syncs de plus de 90 jours
      if (key.indexOf('smartgrade_sync_') === 0) {
        var data = StorageManager.getJSON(key);
        if (data && data.timestamp && (now - data.timestamp > ninetyDays)) {
          StorageManager.remove(key);
          cleaned++;
        }
      }
      // Supprimer les codes de transfert expirés
      if (key === 'smartgrade_transfer_codes') {
        var codes = StorageManager.getJSON(key, {});
        var changed = false;
        for (var code in codes) {
          if (codes[code] && codes[code].expires < now) {
            delete codes[code];
            changed = true;
          }
        }
        if (changed) StorageManager.setJSON(key, codes);
      }
    });
    return cleaned;
  },
  
  // Export complet
  exportAll: function() {
    var data = {};
    var keys = this.getAllKeys();
    keys.forEach(function(key) {
      data[key] = localStorage.getItem(key);
    });
    return data;
  },
  
  // Import complet
  importAll: function(data) {
    var count = 0;
    for (var key in data) {
      if (key && key.indexOf('smartgrade_') === 0) {
        StorageManager.safeSet(key, data[key]);
        count++;
      }
    }
    return count;
  },
  
  // Réinitialiser tout
  resetAll: function() {
    var keys = this.getAllKeys();
    keys.forEach(function(key) { StorageManager.remove(key); });
    return keys.length;
  },
  
  // Obtenir la taille d'une clé
  getKeySize: function(key) {
    var d = localStorage.getItem(key);
    return d ? d.length : 0;
  },
  
  // Sauvegarder une copie de sécurité
  backup: function() {
    var backup = this.exportAll();
    var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    var backupKey = 'smartgrade_backup_' + timestamp;
    this.setJSON(backupKey, { data: backup, timestamp: Date.now(), version: '5.0' });
    return backupKey;
  },
  
  // Restaurer depuis une copie
  restore: function(backupKey) {
    var backup = this.getJSON(backupKey);
    if (!backup) return { success: false, message: t('messages.backup_not_found', 'Backup not found') };
    return this.importAll(backup.data);
  },
  
  // Lister les sauvegardes
  listBackups: function() {
    var backups = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf('smartgrade_backup_') === 0) {
        var data = this.getJSON(key);
        backups.push({ key: key, timestamp: data.timestamp, version: data.version });
      }
    }
    return backups.sort(function(a, b) { return b.timestamp - a.timestamp; });
  }
};

// Commande console
function showStorageInfo() {
  var usage = StorageManager.getUsage();
  console.log('=== STORAGE INFO ===');
  console.log('Used:', usage.usedKB, 'KB (' + usage.usedMB + ' MB)');
  console.log('Items:', usage.items);
  console.log('Backups:', StorageManager.listBackups().length);
}

// Nettoyage auto au chargement
if (typeof window !== 'undefined') {
  StorageManager.cleanOldData();
}