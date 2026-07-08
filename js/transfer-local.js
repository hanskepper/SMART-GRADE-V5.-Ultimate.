// ============================================
// TRANSFER LOCAL SYSTEM
// Code: 6 characters (A-Z except O,I + 2-9)
// ============================================

// ============================================
// GENERATE SECURE CODE
// ============================================

function generateSecureCode() {
  var allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) {
    code += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  return code;
}

// ============================================
// STORE TRANSFER DATA
// ============================================

function storeTransferData(code, studentId, data) {
  var transferData = {
    studentId: studentId,
    data: data,
    expires: Date.now() + 5 * 60 * 1000
  };
  
  localStorage.setItem('smartgrade_qr_transfer_' + code, JSON.stringify(transferData));
  
  setTimeout(function() {
    localStorage.removeItem('smartgrade_qr_transfer_' + code);
  }, 5 * 60 * 1000);
}

// ============================================
// GET TRANSFER DATA
// ============================================

function getStoredTransferData(code) {
  var storedData = localStorage.getItem('smartgrade_qr_transfer_' + code);
  
  if (!storedData) {
    return null;
  }
  
  var parsedData = JSON.parse(storedData);
  
  if (parsedData.expires < Date.now()) {
    localStorage.removeItem('smartgrade_qr_transfer_' + code);
    return null;
  }
  
  return parsedData;
}

// ============================================
// DELETE TRANSFER DATA
// ============================================

function deleteTransferData(code) {
  localStorage.removeItem('smartgrade_qr_transfer_' + code);
}

// ============================================
// CHECK IF CODE IS VALID
// ============================================

function isValidCode(code) {
  var codeRegex = /^[A-HJ-NP-Z0-9]{6}$/;
  return codeRegex.test(code);
}