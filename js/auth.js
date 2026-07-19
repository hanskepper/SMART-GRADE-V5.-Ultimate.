// ============================================
// SMART GRADE v5.0 - AUTHENTIFICATION SYSTEM
// ============================================

function authenticateWithPin(studentId, pin) {
  var s = getStudentById(studentId);
  if (!s) return { success: false, message: 'Account not found' };
  if (s.pin !== pin) return { success: false, message: 'Incorrect PIN' };
  setCurrentStudent(s);
  updateStreakOnVisit(s.id);
  
  // ⭐ NOTIFICATION DE CONNEXION RÉUSSIE
  if (typeof notifyLoginSuccess === 'function') {
    notifyLoginSuccess(s.name);
  }
  
  return { success: true, student: s };
}

function updateUserPin(studentId, oldPin, newPin) {
  console.log('updateUserPin called with:', studentId, oldPin, newPin);
  
  if (!studentId) return { success: false, message: 'Invalid student ID' };
  if (!oldPin || oldPin.length !== 4) return { success: false, message: 'Current PIN must be 4 digits' };
  if (!newPin || newPin.length !== 4) return { success: false, message: 'New PIN must be 4 digits' };
  if (!/^\d+$/.test(newPin)) return { success: false, message: 'PIN must contain only numbers' };
  
  var students = getAllStudents();
  var studentIndex = -1;
  var student = null;
  
  for (var i = 0; i < students.length; i++) {
    if (students[i].id === studentId) {
      studentIndex = i;
      student = students[i];
      break;
    }
  }
  
  if (!student) return { success: false, message: 'Account not found' };
  if (student.pin !== oldPin) return { success: false, message: 'Current PIN is incorrect' };
  
  students[studentIndex].pin = newPin;
  saveAllStudents(students);
  
  var current = getCurrentStudent();
  if (current && current.id === studentId) {
    current.pin = newPin;
    setCurrentStudent(current);
  }
  
  // ⭐ NOTIFICATION
  if (typeof notifyPinChanged === 'function') {
    notifyPinChanged();
  }
  
  console.log('PIN changed successfully for user:', student.name);
  return { success: true, message: 'PIN changed successfully' };
}

function logout() {
  clearCurrentStudent();
  window.location.href = 'index.html';
}

function requireAuth() {
  var u = getCurrentStudent();
  if (!u) {
    window.location.href = 'login.html';
    return null;
  }
  return u;
}

function isBiometricAvailable() {
  if (typeof PublicKeyCredential === 'undefined') return false;
  if (typeof navigator.credentials === 'undefined') return false;
  return true;
}

function registerFingerprint(studentId, studentName, callback) {
  if (!isBiometricAvailable()) {
    callback({ success: false, message: 'Fingerprint not supported on this device' });
    return;
  }

  var challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  var createOptions = {
    publicKey: {
      challenge: challenge,
      rp: { name: 'SMART GRADE' },
      user: {
        id: new Uint8Array(16),
        name: studentName.toLowerCase().replace(/\s+/g, ''),
        displayName: studentName
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: { userVerification: 'required' }
    }
  };

  navigator.credentials.create(createOptions)
    .then(function(credential) {
      var students = getAllStudents();
      var index = students.findIndex(function(s) { return s.id === studentId; });
      if (index !== -1) {
        students[index].hasFingerprint = true;
        students[index].fingerprintHash = 'enabled';
        saveAllStudents(students);
      }
      
      // ⭐ NOTIFICATION
      if (typeof notifyFingerprintEnabled === 'function') {
        notifyFingerprintEnabled();
      }
      
      callback({ success: true, message: 'Fingerprint enabled successfully' });
    })
    .catch(function(err) {
      callback({ success: false, message: 'Could not register fingerprint' });
    });
}

function loginWithFingerprint(callback) {
  if (!isBiometricAvailable()) {
    callback({ success: false, message: 'Fingerprint not available' });
    return;
  }

  var students = getAllStudents().filter(function(s) {
    return s.hasFingerprint && s.fingerprintHash;
  });

  if (students.length === 0) {
    callback({ success: false, message: 'No fingerprint registered' });
    return;
  }

  var challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  var getOptions = {
    publicKey: {
      challenge: challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname || 'localhost'
    }
  };

  navigator.credentials.get(getOptions)
    .then(function(assertion) {
      var student = students[0];
      setCurrentStudent(student);
      updateStreakOnVisit(student.id);
      
      // ⭐ NOTIFICATION
      if (typeof notifyLoginSuccess === 'function') {
        notifyLoginSuccess(student.name);
      }
      
      callback({ success: true, student: student });
    })
    .catch(function(err) {
      callback({ success: false, message: 'Fingerprint not recognized' });
    });
}

function removeFingerprint(studentId) {
  var students = getAllStudents();
  var index = students.findIndex(function(s) { return s.id === studentId; });
  if (index !== -1) {
    students[index].hasFingerprint = false;
    students[index].fingerprintHash = null;
    saveAllStudents(students);
    
    // ⭐ NOTIFICATION
    if (typeof notifyFingerprintRemoved === 'function') {
      notifyFingerprintRemoved();
    }
    
    return true;
  }
  return false;
}

// ============================================
// NOTIFICATIONS SPÉCIFIQUES À L'AUTHENTIFICATION
// ============================================

function notifyLoginSuccess(userName) {
  if (typeof addNotification === 'function') {
    addNotification('account', 'Login Successful', 'Welcome back, ' + userName + '!');
  } else {
    showToast(t('messages.welcome_back', 'Welcome back, ') + userName + '!');
  }
}

function notifyPinChanged() {
  if (typeof addNotification === 'function') {
    addNotification('account', 'PIN Changed', 'Your security PIN has been updated successfully');
  } else {
    showToast(t('messages.pin_changed_successfully', 'PIN changed successfully'));
  }
}

function notifyFingerprintEnabled() {
  if (typeof addNotification === 'function') {
    addNotification('account', 'Fingerprint Enabled', 'You can now login using your fingerprint');
  } else {
    showToast(t('messages.fingerprint_enabled', 'Fingerprint enabled'));
  }
}

function notifyFingerprintRemoved() {
  if (typeof addNotification === 'function') {
    addNotification('account', 'Fingerprint Removed', 'Fingerprint login has been disabled');
  } else {
    showToast(t('messages.fingerprint_removed', 'Fingerprint removed'));
  }
}

function notifyAccountCreated(userId, userName) {
  if (typeof addNotification === 'function') {
    addNotification('account', 'Account Created', 'Welcome ' + userName + '! Your account has been created');
  } else {
    showToast(t('messages.account_created_successfully', 'Account created successfully!'));
  }
}

function notifyLoginFailed(reason) {
  if (typeof addNotification === 'function') {
    addNotification('account', 'Login Failed', reason || 'Invalid credentials');
  }
}

// ============================================
// EXPORT DES FONCTIONS (pour compatibilité)
// ============================================
window.authenticateWithPin = authenticateWithPin;
window.updateUserPin = updateUserPin;
window.logout = logout;
window.requireAuth = requireAuth;
window.isBiometricAvailable = isBiometricAvailable;
window.registerFingerprint = registerFingerprint;
window.loginWithFingerprint = loginWithFingerprint;
window.removeFingerprint = removeFingerprint;
window.notifyLoginSuccess = notifyLoginSuccess;
window.notifyPinChanged = notifyPinChanged;
window.notifyFingerprintEnabled = notifyFingerprintEnabled;
window.notifyFingerprintRemoved = notifyFingerprintRemoved;
window.notifyAccountCreated = notifyAccountCreated;
window.notifyLoginFailed = notifyLoginFailed;

console.log('Auth.js loaded with notifications');