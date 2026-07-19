/* ============================================
   SMART GRADE - TRANSLATOR (i18n)
   VERSION CORRIGÉE - Charge les traductions
   ============================================ */

var currentLang = localStorage.getItem('smartgrade_language') || 'en';
var translations = {};

// ============================================
// DÉTECTION DU CHEMIN DES FICHIERS JSON
// ============================================

function getLocaleBasePath() {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute('src') || '';
    if (src.indexOf('translator.js') !== -1) {
      return src.replace(/js\/translator\.js.*$/, '');
    }
  }
  return './';
}

// ============================================
// CHARGEMENT DES TRADUCTIONS - CORRIGÉ
// ============================================

async function loadTranslations(lang) {
  console.log('[Translator] Loading translations for:', lang);
  try {
    var base = getLocaleBasePath();
    var url = base + 'locales/' + lang + '/translation.json';
    console.log('[Translator] Fetching:', url);
    
    var response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    var data = await response.json();
    console.log('[Translator] Data received:', Object.keys(data));
    
    // ✅ CORRECTION : Assigner directement les données
    translations = data;
    
    currentLang = lang;
    localStorage.setItem('smartgrade_language', lang);
    document.documentElement.setAttribute('lang', lang);
    
    console.log('[Translator] Translations loaded:', Object.keys(translations).length, 'keys');
    console.log('[Translator] Keys:', Object.keys(translations));
    
    applyTranslations();
    updateAllLanguageButtons();
    
  } catch (e) {
    console.error('[Translator] ❌ Error loading translations:', e);
    // Fallback : créer un objet vide
    translations = {};
  }
}

// ============================================
// RÉCUPÉRATION D'UNE TRADUCTION
// ============================================

function getTranslation(key) {
  if (!key) return null;
  var keys = key.split('.');
  var value = translations;
  for (var i = 0; i < keys.length; i++) {
    if (value && typeof value === 'object' && value[keys[i]] !== undefined) {
      value = value[keys[i]];
    } else {
      return null;
    }
  }
  return typeof value === 'string' ? value : null;
}

function t(key, fallback) {
  var value = getTranslation(key);
  if (value !== null) return value;
  return fallback !== undefined ? fallback : key;
}

// ============================================
// APPLICATION DES TRADUCTIONS
// ============================================

function applyTranslations() {
  console.log('[Translator] Applying translations...');
  var count = 0;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var value = getTranslation(key);
    if (value !== null) {
      el.innerHTML = value;
      count++;
    } else {
      console.warn('[Translator] Key not found:', key);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    var value = getTranslation(key);
    if (value !== null) {
      el.setAttribute('placeholder', value);
      count++;
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-title');
    var value = getTranslation(key);
    if (value !== null) {
      el.setAttribute('title', value);
      count++;
    }
  });

  console.log('[Translator] Translated', count, 'elements');
}

// ============================================
// METTRE À JOUR LES BOUTONS
// ============================================

function updateAllLanguageButtons() {
  var langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.innerHTML = currentLang === 'en'
      ? '<i class="fas fa-globe"></i> Switch to FR'
      : '<i class="fas fa-globe"></i> Switch to EN';
  }

  var enBtn = document.getElementById('langEnBtn');
  var frBtn = document.getElementById('langFrBtn');

  if (enBtn) {
    enBtn.style.borderColor = currentLang === 'en' ? 'var(--primary)' : 'var(--border)';
    enBtn.style.background = currentLang === 'en' ? 'rgba(15,59,72,0.08)' : 'transparent';
  }
  if (frBtn) {
    frBtn.style.borderColor = currentLang === 'fr' ? 'var(--primary)' : 'var(--border)';
    frBtn.style.background = currentLang === 'fr' ? 'rgba(15,59,72,0.08)' : 'transparent';
  }
}

// ============================================
// CHANGER DE LANGUE
// ============================================

function changeLanguage(lang) {
  console.log('[Translator] changeLanguage called:', lang);
  if (lang !== 'en' && lang !== 'fr') return;
  if (lang === currentLang) {
    console.log('[Translator] Already', lang);
    return;
  }
  loadTranslations(lang);
}

function toggleLanguage() {
  console.log('[Translator] toggleLanguage called');
  var newLang = currentLang === 'en' ? 'fr' : 'en';
  changeLanguage(newLang);
}

// ============================================
// EXPOSER LES FONCTIONS
// ============================================

window.changeLanguage = changeLanguage;
window.toggleLanguage = toggleLanguage;
window.t = t;
window.applyTranslations = applyTranslations;
window.updateAllLanguageButtons = updateAllLanguageButtons;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Translator] DOM ready, loading translations...');
  loadTranslations(currentLang);
});

console.log('[Translator] Script loaded');