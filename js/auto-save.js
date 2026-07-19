// ============================================
// SMART GRADE - AUTO SAVE SYSTEM
// Version: 4.1
// ============================================

var AutoSaveManager = {
  enabled: true,
  intervalId: null,
  intervalSeconds: 30,
  lastSave: null,
  pendingChanges: false
};

function initAutoSave() {
  var saved = localStorage.getItem('smartgrade_autosave');
  if (saved !== null) {
    AutoSaveManager.enabled = saved === 'true';
  }
  
  if (AutoSaveManager.enabled) {
    startAutoSaveInterval();
  }
  
  document.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      AutoSaveManager.pendingChanges = true;
    }
  });
  
  window.addEventListener('beforeunload', function() {
    if (AutoSaveManager.pendingChanges) {
      executeAutoSave();
    }
  });
}

function startAutoSaveInterval() {
  if (AutoSaveManager.intervalId) clearInterval(AutoSaveManager.intervalId);
  
  AutoSaveManager.intervalId = setInterval(function() {
    if (AutoSaveManager.pendingChanges) {
      executeAutoSave();
    }
  }, AutoSaveManager.intervalSeconds * 1000);
}

function executeAutoSave() {
  var currentUser = getCurrentStudent();
  if (!currentUser) return;
  
  var inputs = document.querySelectorAll('input.grade-input, input.gi, input[type="number"]');
  var anyChange = false;
  
  if (inputs.length > 0) {
    var grades = getStudentGrades(currentUser.id);
    
    inputs.forEach(function(input) {
      var subjectId = parseInt(input.dataset.subj);
      var sequenceId = parseInt(input.dataset.seq);
      var value = parseFloat(input.value);
      
      if (!isNaN(value) && value >= 0 && value <= 20) {
        var existingIndex = grades.findIndex(function(g) {
          return g.subjectId === subjectId && g.sequenceId === sequenceId;
        });
        
        var roundedValue = Math.round(value * 100) / 100;
        
        if (existingIndex !== -1) {
          if (grades[existingIndex].value !== roundedValue) {
            grades[existingIndex].value = roundedValue;
            anyChange = true;
          }
        } else if (input.value !== '') {
          var newId = Date.now() + Math.floor(Math.random() * 10000);
          grades.push({
            id: newId,
            subjectId: subjectId,
            sequenceId: sequenceId,
            value: roundedValue,
            date: new Date().toISOString().split('T')[0]
          });
          anyChange = true;
        }
      }
    });
    
    if (anyChange) {
      saveStudentGrades(currentUser.id, grades);
      AutoSaveManager.lastSave = new Date();
      AutoSaveManager.pendingChanges = false;
      showAutoSaveNotification();
    }
  }
}

function showAutoSaveNotification() {
  var existing = document.querySelector('.autosave-notification');
  if (existing) existing.remove();
  
  var toast = document.createElement('div');
  toast.className = 'autosave-notification';
  toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#27ae60;color:white;padding:8px 16px;border-radius:30px;font-size:0.7rem;z-index:1000;animation:fadeInUp 0.3s ease;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
  toast.innerHTML = '<i class="fas fa-save"></i> ' + t('messages.auto_saved', 'Auto-saved');
  document.body.appendChild(toast);
  
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 500);
  }, 2000);
}

function toggleAutoSave() {
  AutoSaveManager.enabled = !AutoSaveManager.enabled;
  localStorage.setItem('smartgrade_autosave', AutoSaveManager.enabled);
  
  if (AutoSaveManager.enabled) {
    startAutoSaveInterval();
    showToast(t('messages.autosave_enabled', 'Auto-save enabled'));
  } else {
    if (AutoSaveManager.intervalId) {
      clearInterval(AutoSaveManager.intervalId);
      AutoSaveManager.intervalId = null;
    }
    showToast(t('messages.autosave_disabled', 'Auto-save disabled'));
  }
}

function addAutoSaveToSettings() {
  var settingsContainer = document.querySelector('.glass-card');
  if (!settingsContainer) return;
  
  var autoSaveCard = document.createElement('div');
  autoSaveCard.className = 'glass-card';
  autoSaveCard.innerHTML = `
    <h3><i class="fas fa-save"></i> Auto-Save</h3>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
      <span style="font-size:0.75rem;">Save grades every 30 seconds automatically</span>
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
        <span style="font-size:0.7rem;">Off</span>
        <input type="checkbox" id="autoSaveToggle" style="width:40px;height:20px;cursor:pointer;" ${AutoSaveManager.enabled ? 'checked' : ''}>
        <span style="font-size:0.7rem;">On</span>
      </label>
    </div>
    <p style="font-size:0.6rem;color:var(--text-light);margin-top:10px;">
      <i class="fas fa-info-circle"></i> Grades are saved automatically while you type
    </p>
  `;
  
  var firstCard = document.querySelector('.glass-card');
  if (firstCard && firstCard.parentNode) {
    firstCard.parentNode.insertBefore(autoSaveCard, firstCard.nextSibling);
  }
  
  var toggle = document.getElementById('autoSaveToggle');
  if (toggle) {
    toggle.onchange = function(e) {
      if (e.target.checked) {
        AutoSaveManager.enabled = true;
        localStorage.setItem('smartgrade_autosave', 'true');
        startAutoSaveInterval();
        showToast(t('messages.autosave_enabled', 'Auto-save enabled'));
      } else {
        AutoSaveManager.enabled = false;
        localStorage.setItem('smartgrade_autosave', 'false');
        if (AutoSaveManager.intervalId) {
          clearInterval(AutoSaveManager.intervalId);
          AutoSaveManager.intervalId = null;
        }
        showToast(t('messages.autosave_disabled', 'Auto-save disabled'));
      }
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoSave);
} else {
  initAutoSave();
}