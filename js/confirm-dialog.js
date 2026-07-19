// ============================================
// SMART GRADE - CONFIRM DIALOG SYSTEM
// Version: 4.1
// ============================================

function showConfirmDialog(options) {
  var existingModal = document.querySelector('.custom-confirm-modal');
  if (existingModal) existingModal.remove();
  
  var modal = document.createElement('div');
  modal.className = 'custom-confirm-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:2000;display:flex;align-items:center;justify-content:center;';
  
  var detailHtml = '';
  if (options.detail) {
    detailHtml = '<p style="font-size:0.7rem;font-weight:600;color:#e74c3c;margin-bottom:16px;">' + options.detail + '</p>';
  }
  
  var iconHtml = '';
  if (options.icon) {
    iconHtml = '<i class="fas ' + options.icon + '" style="font-size:48px;color:' + (options.iconColor || '#e74c3c') + ';margin-bottom:16px;"></i>';
  }
  
  modal.innerHTML = `
    <div style="background:var(--card-bg);border-radius:24px;padding:24px;max-width:320px;width:85%;text-align:center;animation:fadeInUp 0.3s ease;">
      ${iconHtml}
      <h3 style="margin-bottom:8px;">${options.title}</h3>
      <p style="font-size:0.75rem;color:var(--text-light);margin-bottom:8px;">${options.message}</p>
      ${detailHtml}
      <div style="display:flex;gap:12px;">
        <button class="confirm-cancel-btn" style="flex:1;padding:12px;border-radius:40px;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;">${options.cancelText || t('common.cancel', 'Cancel')}</button>
        <button class="confirm-ok-btn" style="flex:1;padding:12px;border-radius:40px;background:${options.confirmColor || '#e74c3c'};color:white;border:none;cursor:pointer;">${options.confirmText || t('register.confirm', 'Confirm')}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.confirm-cancel-btn').onclick = function() {
    modal.remove();
    if (options.onCancel) options.onCancel();
  };
  
  modal.querySelector('.confirm-ok-btn').onclick = function() {
    modal.remove();
    if (options.onConfirm) options.onConfirm();
  };
  
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.remove();
      if (options.onCancel) options.onCancel();
    }
  };
}

function showPromptDialog(options) {
  var existingModal = document.querySelector('.custom-prompt-modal');
  if (existingModal) existingModal.remove();
  
  var modal = document.createElement('div');
  modal.className = 'custom-prompt-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:2000;display:flex;align-items:center;justify-content:center;';
  
  modal.innerHTML = `
    <div style="background:var(--card-bg);border-radius:24px;padding:24px;max-width:320px;width:85%;text-align:center;">
      <i class="fas fa-key" style="font-size:48px;color:var(--primary);margin-bottom:16px;"></i>
      <h3 style="margin-bottom:8px;">${options.title}</h3>
      <p style="font-size:0.7rem;color:var(--text-light);margin-bottom:16px;">${options.message}</p>
      <input type="${options.inputType || 'text'}" id="promptInput" maxlength="${options.maxlength || '4'}" placeholder="${options.placeholder || ''}" style="width:100%;padding:12px;border-radius:12px;border:2px solid var(--border);background:var(--card-bg);color:var(--text);text-align:center;font-size:1.2rem;margin-bottom:16px;box-sizing:border-box;">
      <div style="display:flex;gap:12px;">
        <button class="prompt-cancel-btn" style="flex:1;padding:12px;border-radius:40px;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;">Cancel</button>
        <button class="prompt-ok-btn" style="flex:1;padding:12px;border-radius:40px;background:var(--primary);color:white;border:none;cursor:pointer;">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  var input = document.getElementById('promptInput');
  input.focus();
  
  modal.querySelector('.prompt-cancel-btn').onclick = function() {
    modal.remove();
    if (options.onCancel) options.onCancel();
  };
  
  modal.querySelector('.prompt-ok-btn').onclick = function() {
    var value = input.value;
    modal.remove();
    if (options.onConfirm) options.onConfirm(value);
  };
  
  input.onkeypress = function(e) {
    if (e.key === 'Enter') {
      var value = input.value;
      modal.remove();
      if (options.onConfirm) options.onConfirm(value);
    }
  };
}