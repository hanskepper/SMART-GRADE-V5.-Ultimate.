// ============================================
// SMART GRADE - EXPORT LOGIC
// Version: 5.0 - Complete & Honest
// ============================================

(function() {
  'use strict';

  // ============================================
  // VARIABLES
  // ============================================
  
  var currentUser = null;
  var selectedTerm = 'yearly';
  var selectedMode = 'html';
  
  var DEFAULT_SUBJECTS = [
    { id: 1, name: "COMPUTER SCIENCES" },
    { id: 2, name: "MATHEMATICS" },
    { id: 3, name: "CHEMISTRY" },
    { id: 4, name: "HUMAN BIOLOGY" },
    { id: 5, name: "GEOLOGY" },
    { id: 6, name: "PHYSICS" },
    { id: 7, name: "ADDITIONAL MATHEMATICS" },
    { id: 8, name: "BIOLOGY" },
    { id: 9, name: "ECONOMICS" },
    { id: 10, name: "ENGLISH LANGUAGE" },
    { id: 11, name: "GEOGRAPHY" },
    { id: 12, name: "CITIZENSHIP" },
    { id: 13, name: "FRENCH" },
    { id: 14, name: "FOOD AND NUTRITION" }
  ];

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function getCurrentUser() {
    try {
      var stored = localStorage.getItem('smartgrade_current');
      return stored ? JSON.parse(stored) : null;
    } catch(e) {
      return null;
    }
  }

  function getStudentById(id) {
    try {
      var students = JSON.parse(localStorage.getItem('smartgrade_students') || '[]');
      for (var i = 0; i < students.length; i++) {
        if (students[i].id === id) return students[i];
      }
      return null;
    } catch(e) {
      return null;
    }
  }

  function getStudentGrades(id) {
    try {
      var data = localStorage.getItem('smartgrade_grades_' + id);
      return data ? JSON.parse(data) : [];
    } catch(e) {
      return [];
    }
  }

  function getStudentSelectedSubjects(id, term) {
    try {
      var data = localStorage.getItem('smartgrade_selected_' + id + '_term' + term);
      return data ? JSON.parse(data) : [];
    } catch(e) {
      return [];
    }
  }

  function getSubjectCoefficients(id) {
    try {
      var data = localStorage.getItem('smartgrade_coeffs_' + id);
      return data ? JSON.parse(data) : {};
    } catch(e) {
      return {};
    }
  }

  function getStudentProfile(id) {
    try {
      var data = localStorage.getItem('smartgrade_profile_' + id);
      return data ? JSON.parse(data) : { avatarBase64: '', bio: '' };
    } catch(e) {
      return { avatarBase64: '', bio: '' };
    }
  }

  function getSequencesForTerm(term) {
    var s = (term - 1) * 2 + 1;
    return [s, s + 1];
  }

  function calculateSubjectTermAverage(subjectId, term, grades) {
    var seq = getSequencesForTerm(term);
    var n1 = [], n2 = [];
    
    for (var k = 0; k < grades.length; k++) {
      if (grades[k].subjectId === subjectId && grades[k].sequenceId === seq[0]) {
        n1.push(grades[k].value);
      }
      if (grades[k].subjectId === subjectId && grades[k].sequenceId === seq[1]) {
        n2.push(grades[k].value);
      }
    }
    
    var a1 = 0, a2 = 0;
    
    if (n1.length > 0) {
      var sum1 = 0;
      for (var j = 0; j < n1.length; j++) sum1 += n1[j];
      a1 = sum1 / n1.length;
    }
    
    if (n2.length > 0) {
      var sum2 = 0;
      for (var j = 0; j < n2.length; j++) sum2 += n2[j];
      a2 = sum2 / n2.length;
    }
    
    return (a1 + a2) / 2;
  }

  function calculateStudentTermAverage(id, term) {
    var grades = getStudentGrades(id);
    var selected = getStudentSelectedSubjects(id, term);
    var coeffs = getSubjectCoefficients(id);
    
    if (!selected || selected.length === 0) return 0;
    
    var totalWeighted = 0;
    var totalCoeff = 0;
    
    for (var i = 0; i < selected.length; i++) {
      var subjectId = selected[i];
      var coeff = coeffs[subjectId] || 5;
      var avg = calculateSubjectTermAverage(subjectId, term, grades);
      totalWeighted += avg * coeff;
      totalCoeff += coeff;
    }
    
    return totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
  }

  function calculateYearlyAverage(id) {
    var t1 = calculateStudentTermAverage(id, 1);
    var t2 = calculateStudentTermAverage(id, 2);
    var t3 = calculateStudentTermAverage(id, 3);
    return (t1 + t2 + t3) / 3;
  }

  function getGradeLetter(avg) {
    if (avg >= 18) return 'A+';
    if (avg >= 16) return 'A';
    if (avg >= 14) return 'B+';
    if (avg >= 12) return 'B';
    if (avg >= 10) return 'C';
    if (avg >= 8) return 'D';
    return 'F';
  }

  function getGradeClass(letter) {
    var classes = {
      'A+': 'Aplus',
      'A': 'A',
      'B+': 'Bplus',
      'B': 'B',
      'C': 'C',
      'D': 'D',
      'F': 'F'
    };
    return classes[letter] || 'F';
  }

  function getGradeStatus(avg) {
    if (avg >= 16) return 'Excellent';
    if (avg >= 14) return 'Very Good';
    if (avg >= 12) return 'Good';
    if (avg >= 10) return 'Average';
    if (avg >= 8) return 'Below Average';
    return 'Needs Improvement';
  }

  function getCurrentThemeColors() {
    var themeName = localStorage.getItem('smartgrade_theme') || 'default';
    var themes = {
      'default': { primary: '#0f3b48', secondary: '#00b4d8' },
      'crimson': { primary: '#c0392b', secondary: '#ff4757' },
      'forest': { primary: '#1e8449', secondary: '#2ecc71' },
      'ocean': { primary: '#006994', secondary: '#00b4d8' },
      'royal': { primary: '#6c3483', secondary: '#a569bd' },
      'sunset': { primary: '#d35400', secondary: '#f39c12' },
      'rose': { primary: '#c44569', secondary: '#fd79a8' },
      'turquoise': { primary: '#00897b', secondary: '#1de9b6' },
      'amber': { primary: '#b7950b', secondary: '#f1c40f' },
      'graphite': { primary: '#455a64', secondary: '#90a4ae' },
      'lavender': { primary: '#7b1fa2', secondary: '#ce93d8' },
      'cherry': { primary: '#b71c1c', secondary: '#ef5350' },
      'midnight': { primary: '#1a237e', secondary: '#5c6bc0' },
      'mint': { primary: '#00b894', secondary: '#55efc4' },
      'coral': { primary: '#e74c3c', secondary: '#ff6b6b' },
      'indigo': { primary: '#283593', secondary: '#7986cb' },
      'chocolate': { primary: '#5d4037', secondary: '#a1887f' },
      'electric': { primary: '#6a1b9a', secondary: '#e040fb' },
      'steel': { primary: '#37474f', secondary: '#78909c' },
      'lime': { primary: '#558b2f', secondary: '#aed581' }
    };
    return themes[themeName] || themes['default'];
  }

  function getFontFamily() {
    var savedFont = localStorage.getItem('smartgrade_font_family') || 'inter';
    var fontMap = {
      'inter': 'Inter, sans-serif',
      'roboto': 'Roboto, sans-serif',
      'cinzel': 'Cinzel, serif',
      'quicksand': 'Quicksand, sans-serif',
      'courier-prime': '"Courier Prime", monospace',
      'fredoka': 'Fredoka, sans-serif',
      'pacifico': 'Pacifico, cursive',
      'bangers': 'Bangers, cursive',
      'lobster': 'Lobster, cursive',
      'permanent-marker': '"Permanent Marker", cursive',
      'comfortaa': 'Comfortaa, sans-serif',
      'righteous': 'Righteous, sans-serif'
    };
    return fontMap[savedFont] || 'Inter, sans-serif';
  }

  // ============================================
  // TOAST NOTIFICATION
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
    }, 3000);
  }

  // ============================================
  // UPDATE HEADER AVATAR
  // ============================================

  function updateHeaderAvatar() {
    var headerAvatar = document.getElementById('headerAvatar');
    if (!headerAvatar) return;
    
    if (!currentUser) {
      headerAvatar.innerHTML = '<i class="fas fa-user-graduate"></i>';
      return;
    }
    
    var profile = getStudentProfile(currentUser.id);
    if (profile.avatarBase64 && profile.avatarBase64.length > 100) {
      headerAvatar.innerHTML = '<img src="' + profile.avatarBase64 + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
    } else {
      headerAvatar.innerHTML = '<i class="fas fa-user-graduate"></i>';
    }
  }

  // ============================================
  // APPLY FONT (same as other pages)
  // ============================================

  function applyGlobalFont() {
    var fontFamily = getFontFamily();
    document.body.style.fontFamily = fontFamily;
    
    var allElements = document.querySelectorAll('body *');
    for (var i = 0; i < allElements.length; i++) {
      if (allElements[i].style) {
        allElements[i].style.fontFamily = fontFamily;
      }
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function initExport() {
    try {
      currentUser = getCurrentUser();
      if (!currentUser) {
        // Allow page to load without login for viewing
        return;
      }
      
      var student = getStudentById(currentUser.id);
      if (student) currentUser = student;
      
      updateHeaderAvatar();
      applyGlobalFont();
      
      if (typeof initMobileMenu === 'function') initMobileMenu();
      if (typeof initThemeSelector === 'function') initThemeSelector();
      
      console.log('[Export] Initialized for:', currentUser.name);
      
    } catch(e) {
      console.error('[Export] Init error:', e);
    }
  }

  // ============================================
  // MODAL FUNCTIONS
  // ============================================

  window.chooseTerm = function(mode) {
    selectedMode = mode;
    var overlay = document.getElementById('termOverlay');
    if (overlay) overlay.classList.add('active');
    
    var options = document.querySelectorAll('.term-opt');
    for (var i = 0; i < options.length; i++) {
      options[i].classList.remove('selected');
    }
    var yearlyOpt = document.querySelector('.term-opt[data-term="yearly"]');
    if (yearlyOpt) yearlyOpt.classList.add('selected');
    selectedTerm = 'yearly';
    
    var htmlBtns = document.getElementById('htmlActionButtons');
    var pdfBtns = document.getElementById('pdfActionButtons');
    var csvBtns = document.getElementById('csvActionButtons');
    
    if (htmlBtns) htmlBtns.style.display = 'none';
    if (pdfBtns) pdfBtns.style.display = 'none';
    if (csvBtns) csvBtns.style.display = 'none';
    
    if (mode === 'pdf' && pdfBtns) {
      pdfBtns.style.display = 'block';
    } else if (mode === 'csv' && csvBtns) {
      csvBtns.style.display = 'block';
    } else if (htmlBtns) {
      htmlBtns.style.display = 'block';
    }
  };

  window.selectTerm = function(element) {
    var options = document.querySelectorAll('.term-opt');
    for (var i = 0; i < options.length; i++) {
      options[i].classList.remove('selected');
    }
    element.classList.add('selected');
    selectedTerm = element.dataset.term;
  };

  window.closeTermModal = function() {
    var overlay = document.getElementById('termOverlay');
    if (overlay) overlay.classList.remove('active');
  };

  // ============================================
  // JSON EXPORT
  // ============================================

  window.exportJSON = function() {
    if (!currentUser) {
      showToast(t('messages.please_login_first', 'Please login first'));
      return;
    }
    
    try {
      var student = getStudentById(currentUser.id);
      var exportData = {
        version: '5.0',
        exportDate: new Date().toISOString(),
        student: student,
        grades: getStudentGrades(currentUser.id),
        subjects: {
          term1: getStudentSelectedSubjects(currentUser.id, 1),
          term2: getStudentSelectedSubjects(currentUser.id, 2),
          term3: getStudentSelectedSubjects(currentUser.id, 3)
        },
        coeffs: getSubjectCoefficients(currentUser.id),
        goal: parseFloat(localStorage.getItem('smartgrade_goal_' + currentUser.id) || 12),
        streak: JSON.parse(localStorage.getItem('smartgrade_streak_' + currentUser.id) || '{"days":0,"lastLogin":null}'),
        profile: getStudentProfile(currentUser.id)
      };
      
      var jsonStr = JSON.stringify(exportData, null, 2);
      var blob = new Blob([jsonStr], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      var fileName = 'SMART_GRADE_Backup_' + student.name.replace(/\s/g, '_') + '_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.json';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(t('messages.json_exported_prefix', 'JSON exported (') + Math.round(jsonStr.length / 1024) + t('messages.kb_suffix', ' KB)'));
      
    } catch(e) {
      console.error('[Export] JSON error:', e);
      showToast(t('messages.export_failed', 'Export failed: ') + e.message);
    }
  };

  // ============================================
  // IMPORT JSON
  // ============================================

  window.handleImport = function(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    if (!currentUser) {
      showToast(t('messages.please_login_first', 'Please login first'));
      event.target.value = '';
      return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        
        if (typeof showConfirmDialog === 'function') {
          showConfirmDialog({
            title: 'Import JSON Backup',
            message: 'This will overwrite your current data.',
            detail: 'File size: ' + Math.round(e.target.result.length / 1024) + ' KB',
            icon: 'fa-upload',
            confirmText: 'Import',
            onConfirm: function() {
              importData(data);
            }
          });
        } else {
          if (confirm(t('messages.confirm_import_json', 'Import JSON backup? This will overwrite your current data.'))) {
            importData(data);
          }
        }
      } catch(err) {
        showToast(t('messages.invalid_json_file', 'Invalid JSON file'));
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  function importData(data) {
    try {
      // Restore data
      if (data.grades) localStorage.setItem('smartgrade_grades_' + currentUser.id, JSON.stringify(data.grades));
      if (data.subjects) {
        if (data.subjects.term1) localStorage.setItem('smartgrade_selected_' + currentUser.id + '_term1', JSON.stringify(data.subjects.term1));
        if (data.subjects.term2) localStorage.setItem('smartgrade_selected_' + currentUser.id + '_term2', JSON.stringify(data.subjects.term2));
        if (data.subjects.term3) localStorage.setItem('smartgrade_selected_' + currentUser.id + '_term3', JSON.stringify(data.subjects.term3));
      }
      if (data.coeffs) localStorage.setItem('smartgrade_coeffs_' + currentUser.id, JSON.stringify(data.coeffs));
      if (data.goal !== undefined) localStorage.setItem('smartgrade_goal_' + currentUser.id, data.goal);
      if (data.streak) localStorage.setItem('smartgrade_streak_' + currentUser.id, JSON.stringify(data.streak));
      if (data.profile) localStorage.setItem('smartgrade_profile_' + currentUser.id, JSON.stringify(data.profile));
      
      showToast(t('messages.import_successful_reloading', 'Import successful! Reloading...'));
      setTimeout(function() { location.reload(); }, 1500);
      
    } catch(err) {
      showToast(t('messages.import_failed', 'Import failed: ') + err.message);
    }
  }

  // ============================================
  // GENERATE BULLETIN HTML
  // ============================================

  function generateBulletinHTML() {
    if (!currentUser) return null;
    
    try {
      var grades = getStudentGrades(currentUser.id);
      var coeffs = getSubjectCoefficients(currentUser.id);
      
      var isYearly = (selectedTerm === 'yearly');
      var termNum = isYearly ? 0 : parseInt(selectedTerm);
      var displayTitle = isYearly ? 'YEARLY REPORT' : 'TERM ' + termNum + ' REPORT';
      
      // Get selected subjects
      var selectedSubjects = [];
      if (isYearly) {
        var s1 = getStudentSelectedSubjects(currentUser.id, 1);
        var s2 = getStudentSelectedSubjects(currentUser.id, 2);
        var s3 = getStudentSelectedSubjects(currentUser.id, 3);
        var allSelected = s1.concat(s2).concat(s3);
        var seen = {};
        for (var i = 0; i < allSelected.length; i++) {
          if (!seen[allSelected[i]]) {
            seen[allSelected[i]] = true;
            selectedSubjects.push(allSelected[i]);
          }
        }
      } else {
        selectedSubjects = getStudentSelectedSubjects(currentUser.id, termNum);
      }
      
      var themeColors = getCurrentThemeColors();
      var primaryColor = themeColors.primary;
      var secondaryColor = themeColors.secondary;
      var fontFamily = getFontFamily();
      
      var rows = '';
      var totalWeighted = 0;
      var totalCoeff = 0;
      
      for (var i = 0; i < DEFAULT_SUBJECTS.length; i++) {
        var s = DEFAULT_SUBJECTS[i];
        if (selectedSubjects.indexOf(s.id) === -1) continue;
        
        var coeff = coeffs[s.id] || 5;
        
        if (isYearly) {
          var t1 = calculateSubjectTermAverage(s.id, 1, grades);
          var t2 = calculateSubjectTermAverage(s.id, 2, grades);
          var t3 = calculateSubjectTermAverage(s.id, 3, grades);
          var yearly = (t1 + t2 + t3) / 3;
          var letter = getGradeLetter(yearly);
          var gradeClass = getGradeClass(letter);
          
          rows += '<tr>' +
            '<td class="subject-name">' + s.name + '</td>' +
            '<td>' + coeff + '</td>' +
            '<td>' + (t1 > 0 ? t1.toFixed(2) : '--') + '</td>' +
            '<td>' + (t2 > 0 ? t2.toFixed(2) : '--') + '</td>' +
            '<td>' + (t3 > 0 ? t3.toFixed(2) : '--') + '</td>' +
            '<td><strong>' + yearly.toFixed(2) + '</strong></td>' +
            '<td><span class="grade-letter grade-' + gradeClass + '">' + letter + '</span></td>' +
          '</tr>';
          totalWeighted += yearly * coeff;
          totalCoeff += coeff;
        } else {
          var avg = calculateSubjectTermAverage(s.id, termNum, grades);
          var letter = getGradeLetter(avg);
          var gradeClass = getGradeClass(letter);
          
          rows += '<tr>' +
            '<td class="subject-name">' + s.name + '</td>' +
            '<td>' + coeff + '</td>' +
            '<td><strong>' + (avg > 0 ? avg.toFixed(2) : '--') + '</strong></td>' +
            '<td><span class="grade-letter grade-' + gradeClass + '">' + letter + '</span></td>' +
          '</tr>';
          totalWeighted += avg * coeff;
          totalCoeff += coeff;
        }
      }
      
      var overallAvg = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
      var overallLetter = getGradeLetter(overallAvg);
      var overallClass = getGradeClass(overallLetter);
      var status = getGradeStatus(overallAvg);
      
      var headers = isYearly ?
        '<tr><th>SUBJECT</th><th>COEFF</th><th>TERM 1</th><th>TERM 2</th><th>TERM 3</th><th>YEARLY</th><th>GRADE</th></tr>' :
        '<tr><th>SUBJECT</th><th>COEFF</th><th>AVERAGE</th><th>GRADE</th></tr>';
      
      var totalRow = isYearly ?
        '<tr class="total-row"><td colspan="5"><strong>YEARLY AVERAGE</strong></td><td><strong>' + overallAvg.toFixed(2) + '</strong></td><td><span class="grade-letter grade-' + overallClass + '">' + overallLetter + '</span></td></tr>' :
        '<tr class="total-row"><td colspan="2"><strong>TERM AVERAGE</strong></td><td><strong>' + overallAvg.toFixed(2) + '</strong></td><td><span class="grade-letter grade-' + overallClass + '">' + overallLetter + '</span></td></tr>';
      
      return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
        '<title>' + displayTitle + ' - ' + currentUser.name + '</title>' +
        '<style>' +
        'body { font-family: ' + fontFamily + '; margin: 0; padding: 20px; background: #f0f2f5; }' +
        '.bulletin-container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }' +
        '.bulletin-header { background: linear-gradient(135deg, ' + primaryColor + ', ' + secondaryColor + '); color: white; padding: 24px 20px; text-align: center; }' +
        '.bulletin-header h1 { font-size: 24px; margin: 0; letter-spacing: 2px; }' +
        '.bulletin-header .school { font-size: 14px; margin-top: 4px; opacity: 0.9; }' +
        '.bulletin-header .subtitle { font-size: 12px; margin-top: 8px; opacity: 0.8; }' +
        '.bulletin-student { background: #f5f5f5; padding: 12px 20px; display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #ddd; }' +
        '.student-info { font-size: 13px; }' +
        '.student-info strong { color: ' + primaryColor + '; }' +
        '.bulletin-table { width: 100%; border-collapse: collapse; }' +
        '.bulletin-table th { background: ' + primaryColor + '; color: white; padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; }' +
        '.bulletin-table td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #eee; font-size: 12px; }' +
        '.bulletin-table td.subject-name { text-align: left; font-weight: 500; }' +
        '.bulletin-table .total-row td { background: #f0f0f0; font-weight: bold; border-top: 2px solid ' + primaryColor + '; }' +
        '.grade-letter { display: inline-block; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }' +
        '.grade-Aplus { background: #2ecc71; color: white; }' +
        '.grade-A { background: #27ae60; color: white; }' +
        '.grade-Bplus { background: #3498db; color: white; }' +
        '.grade-B { background: #2980b9; color: white; }' +
        '.grade-C { background: #f39c12; color: white; }' +
        '.grade-D { background: #e67e22; color: white; }' +
        '.grade-F { background: #e74c3c; color: white; }' +
        '.bulletin-result { background: linear-gradient(135deg, ' + primaryColor + ', ' + secondaryColor + '); color: white; padding: 16px; text-align: center; margin: 16px; border-radius: 12px; }' +
        '.result-average { font-size: 32px; font-weight: bold; }' +
        '.result-status { font-size: 14px; margin-top: 4px; opacity: 0.9; }' +
        '.bulletin-signatures { display: flex; justify-content: space-between; padding: 20px; border-top: 1px solid #ddd; margin-top: 16px; }' +
        '.signature { text-align: center; font-size: 11px; }' +
        '.signature-line { width: 120px; border-top: 1px solid #333; margin-top: 20px; padding-top: 6px; }' +
        '.bulletin-footer { text-align: center; padding: 12px; font-size: 10px; color: #999; border-top: 1px solid #eee; }' +
        '@media (max-width: 600px) { .bulletin-table th, .bulletin-table td { padding: 6px 4px; font-size: 10px; } .student-info { font-size: 10px; } .result-average { font-size: 24px; } .signature-line { width: 80px; } }' +
        '</style></head><body>' +
        '<div class="bulletin-container">' +
        '<div class="bulletin-header">' +
        '<h1>REPORT CARD</h1>' +
        '<div class="school">GBHS FOUMBAN</div>' +
        '<div class="subtitle">Form 5B Science - Academic Year 2025-2027 - ' + displayTitle + '</div>' +
        '</div>' +
        '<div class="bulletin-student">' +
        '<div class="student-info"><strong>Student:</strong> ' + currentUser.name + '</div>' +
        '<div class="student-info"><strong>Class:</strong> ' + currentUser.class + '</div>' +
        '<div class="student-info"><strong>Number:</strong> #' + currentUser.number + '</div>' +
        '<div class="student-info"><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</div>' +
        '</div>' +
        '<table class="bulletin-table"><thead>' + headers + '</thead><tbody>' + rows + totalRow + '</tbody></table>' +
        '<div class="bulletin-result">' +
        '<div class="result-average">' + overallAvg.toFixed(2) + ' / 20</div>' +
        '<div class="result-status">' + status + '</div>' +
        '</div>' +
        '<div class="bulletin-signatures">' +
        '<div class="signature"><div class="signature-line"></div>Parent / Guardian</div>' +
        '<div class="signature"><div class="signature-line"></div>Class Teacher</div>' +
        '<div class="signature"><div class="signature-line"></div>Principal</div>' +
        '</div>' +
        '<div class="bulletin-footer">SMART GRADE v5.0 - Generated on ' + new Date().toLocaleDateString() + '</div>' +
        '</div></body></html>';
      
    } catch(e) {
      console.error('[Export] HTML error:', e);
      return null;
    }
  }

  // ============================================
  // CSV GENERATION (complete bulletin)
  // ============================================

  function generateCSVContent() {
    if (!currentUser) return null;
    
    try {
      var grades = getStudentGrades(currentUser.id);
      var coeffs = getSubjectCoefficients(currentUser.id);
      
      var isYearly = (selectedTerm === 'yearly');
      var termNum = isYearly ? 0 : parseInt(selectedTerm);
      var rows = [];
      
      // Header
      if (isYearly) {
        rows.push(['SUBJECT', 'COEFF', 'TERM 1', 'TERM 2', 'TERM 3', 'YEARLY AVG', 'GRADE']);
      } else {
        rows.push(['SUBJECT', 'COEFF', 'AVERAGE', 'GRADE']);
      }
      
      // Get selected subjects
      var selectedSubjects = [];
      if (isYearly) {
        var s1 = getStudentSelectedSubjects(currentUser.id, 1);
        var s2 = getStudentSelectedSubjects(currentUser.id, 2);
        var s3 = getStudentSelectedSubjects(currentUser.id, 3);
        var allSelected = s1.concat(s2).concat(s3);
        var seen = {};
        for (var i = 0; i < allSelected.length; i++) {
          if (!seen[allSelected[i]]) {
            seen[allSelected[i]] = true;
            selectedSubjects.push(allSelected[i]);
          }
        }
      } else {
        selectedSubjects = getStudentSelectedSubjects(currentUser.id, termNum);
      }
      
      var totalWeighted = 0;
      var totalCoeff = 0;
      
      for (var i = 0; i < DEFAULT_SUBJECTS.length; i++) {
        var s = DEFAULT_SUBJECTS[i];
        if (selectedSubjects.indexOf(s.id) === -1) continue;
        
        var coeff = coeffs[s.id] || 5;
        
        if (isYearly) {
          var t1 = calculateSubjectTermAverage(s.id, 1, grades);
          var t2 = calculateSubjectTermAverage(s.id, 2, grades);
          var t3 = calculateSubjectTermAverage(s.id, 3, grades);
          var yearly = (t1 + t2 + t3) / 3;
          var letter = getGradeLetter(yearly);
          
          rows.push([s.name, coeff, t1.toFixed(2), t2.toFixed(2), t3.toFixed(2), yearly.toFixed(2), letter]);
          totalWeighted += yearly * coeff;
          totalCoeff += coeff;
        } else {
          var avg = calculateSubjectTermAverage(s.id, termNum, grades);
          var letter = getGradeLetter(avg);
          
          rows.push([s.name, coeff, avg.toFixed(2), letter]);
          totalWeighted += avg * coeff;
          totalCoeff += coeff;
        }
      }
      
      var overallAvg = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
      var overallLetter = getGradeLetter(overallAvg);
      
      rows.push([]);
      if (isYearly) {
        rows.push(['YEARLY AVERAGE', '', '', '', '', overallAvg.toFixed(2), overallLetter]);
      } else {
        rows.push(['TERM AVERAGE', '', overallAvg.toFixed(2), overallLetter]);
      }
      
      rows.push([]);
      rows.push(['STUDENT:', currentUser.name]);
      rows.push(['CLASS:', currentUser.class]);
      rows.push(['NUMBER:', '#' + currentUser.number]);
      rows.push(['DATE:', new Date().toLocaleDateString()]);
      rows.push(['SCHOOL:', 'GBHS FOUMBAN']);
      rows.push(['YEAR:', '2026-2027']);
      
      // Build CSV string
      var csvContent = '';
      for (var i = 0; i < rows.length; i++) {
        var line = '';
        for (var j = 0; j < rows[i].length; j++) {
          var cell = rows[i][j] !== undefined && rows[i][j] !== null ? String(rows[i][j]) : '';
          if (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1) {
            cell = '"' + cell.replace(/"/g, '""') + '"';
          }
          line += cell;
          if (j < rows[i].length - 1) line += ',';
        }
        csvContent += line + '\n';
      }
      
      return csvContent;
      
    } catch(e) {
      console.error('[Export] CSV error:', e);
      return null;
    }
  }

  // ============================================
  // EXPORT FUNCTIONS - HTML, PDF, CSV
  // ============================================

  window.viewHTML = function() {
    window.closeTermModal();
    
    if (!currentUser) {
      showToast(t('messages.please_login_first', 'Please login first'));
      return;
    }
    
    var html = generateBulletinHTML();
    if (!html) {
      showToast(t('messages.no_data_to_export', 'No data to export'));
      return;
    }
    
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    showToast(t('messages.bulletin_opened', 'Bulletin opened'));
  };

  window.downloadHTML = function() {
    window.closeTermModal();
    
    if (!currentUser) {
      showToast(t('messages.please_login_first', 'Please login first'));
      return;
    }
    
    var html = generateBulletinHTML();
    if (!html) {
      showToast(t('messages.no_data_to_export', 'No data to export'));
      return;
    }
    
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var termLabel = selectedTerm === 'yearly' ? 'Yearly' : 'Term' + selectedTerm;
    a.download = 'SMART_GRADE_Bulletin_' + termLabel + '_' + currentUser.name.replace(/\s/g, '_') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('messages.html_downloaded', 'HTML downloaded'));
  };

  window.downloadPDF = function() {
    window.closeTermModal();
    
    if (!currentUser) {
      showToast(t('messages.please_login_first', 'Please login first'));
      return;
    }
    
    var html = generateBulletinHTML();
    if (!html) {
      showToast(t('messages.no_data_to_export', 'No data to export'));
      return;
    }
    
    var loadingEl = document.getElementById('pdfLoading');
    if (loadingEl) loadingEl.style.display = 'block';
    
    var container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.background = 'white';
    document.body.appendChild(container);
    
    var opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: 'SMART_GRADE_Bulletin_' + currentUser.name.replace(/\s/g, '_') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(container).save().then(function() {
        if (container.parentNode) container.parentNode.removeChild(container);
        if (loadingEl) loadingEl.style.display = 'none';
        showToast(t('messages.pdf_downloaded', 'PDF downloaded'));
      }).catch(function(err) {
        if (container.parentNode) container.parentNode.removeChild(container);
        if (loadingEl) loadingEl.style.display = 'none';
        showToast(t('messages.pdf_error', 'PDF error: ') + err.message);
      });
    } else {
      if (container.parentNode) container.parentNode.removeChild(container);
      if (loadingEl) loadingEl.style.display = 'none';
      showToast(t('messages.pdf_library_not_loaded', 'PDF library not loaded'));
    }
  };

  window.downloadCSV = function() {
    window.closeTermModal();
    
    if (!currentUser) {
      showToast(t('messages.please_login_first', 'Please login first'));
      return;
    }
    
    var csvContent = generateCSVContent();
    if (!csvContent) {
      showToast(t('messages.no_data_to_export', 'No data to export'));
      return;
    }
    
    var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var termLabel = selectedTerm === 'yearly' ? 'Yearly' : 'Term' + selectedTerm;
    a.download = 'SMART_GRADE_Bulletin_' + termLabel + '_' + currentUser.name.replace(/\s/g, '_') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('messages.csv_downloaded', 'CSV downloaded'));
  };

  // ============================================
  // FONT OBSERVER (same as other pages)
  // ============================================

  var fontObserver = new MutationObserver(function() {
    applyGlobalFont();
  });
  
  fontObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });

  window.addEventListener('storage', function(e) {
    if (e.key === 'smartgrade_font_family') {
      applyGlobalFont();
    }
  });

  // ============================================
  // START
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExport);
  } else {
    initExport();
  }

  console.log('[Export] Module loaded successfully');

})();