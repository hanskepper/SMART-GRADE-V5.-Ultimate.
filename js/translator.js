var currentLang = localStorage.getItem('smartgrade_language') || 'en';
var translations = {};

async function loadTranslations(lang) {
  try {
    var response = await fetch('./locales/' + lang + '/translation.json');
    if (!response.ok) {
      console.error('Translation file not found for', lang);
      return;
    }
    translations = await response.json();
    currentLang = lang;
    localStorage.setItem('smartgrade_language', lang);
    applyTranslations();
  } catch (e) {
    console.error('Failed to load translations', e);
  }
}

function t(key) {
  if (!key) return '';
  var keys = key.split('.');
  var value = translations;
  for (var i = 0; i < keys.length; i++) {
    if (value && value[keys[i]] !== undefined) value = value[keys[i]];
    else return '';
  }
  return (typeof value === 'string') ? value : '';
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var attr = el.getAttribute('data-i18n-attr');
    var translated = t(key);
    if (translated) {
      if (attr) {
        el.setAttribute(attr, translated);
      } else {
        // preserve SMART GRADE text when key is app.title
        if (key === 'app.title') {
          // only set innerHTML if it isn't SMART GRADE or if element contains more content
          if (el.textContent.trim() !== 'SMART GRADE') el.innerHTML = translated;
        } else {
          el.innerHTML = translated;
        }
      }
    }
  });
}

function changeLanguage(lang) {
  loadTranslations(lang);
}

// helper to replace literal strings in JS code: t('path.key')
window.t = t;
window.changeLanguage = changeLanguage;

document.addEventListener('DOMContentLoaded', function() {
  loadTranslations(currentLang);
});
