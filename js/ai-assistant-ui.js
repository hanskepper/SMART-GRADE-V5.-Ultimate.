// ============================================
// SMART GRADE - AI ASSISTANT (UI)
// Mermaid, Zoom, Téléchargement, Thèmes
// Version finale - 05/07/2026
// ============================================

// ============================================
// VARIABLES DE ZOOM
// ============================================

var zoomScale = 1;
var zoomPanX = 0;
var zoomPanY = 0;
var zoomIsDragging = false;
var zoomStartX = 0;
var zoomStartY = 0;
var zoomStartPanX = 0;
var zoomStartPanY = 0;
var zoomCurrentSvg = null;

// ============================================
// RENDER MERMAID - AVEC COULEURS ADAPTATIVES
// ============================================

function renderMermaidDiagrams() {
  if (typeof mermaid === 'undefined') {
    console.warn('Mermaid not loaded');
    return;
  }

  var isDark = document.body.classList.contains('night-mode');

  // COULEURS ADAPTATIVES
  var colors = isDark ? {
    primary: '#00b4d8',
    secondary: '#0f3b48',
    text: '#e8e8e8',
    background: '#1a1a2e',
    nodeBg: '#2a2a4a',
    clusterBg: '#1a1a2e',
    edgeColor: '#00b4d8'
  } : {
    primary: '#0f3b48',
    secondary: '#00b4d8',
    text: '#1a2a3a',
    background: '#ffffff',
    nodeBg: '#f0f4f8',
    clusterBg: '#e8ecf0',
    edgeColor: '#0f3b48'
  };

  document.querySelectorAll('.mermaid-wrapper').forEach(function(wrapper) {
    var codeDiv = wrapper.querySelector('.mermaid-code');
    var renderDiv = wrapper.querySelector('.mermaid-render');
    if (!codeDiv || !renderDiv) return;

    var code = codeDiv.textContent;
    var id = wrapper.id;

    try {
      code = code.replace(/^[ \t]+/gm, '').trim();

      if (!code || code.length < 5) {
        renderDiv.innerHTML = '<div class="mermaid-error">Diagram code is empty</div>';
        renderDiv.style.display = 'block';
        return;
      }

      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: colors.primary,
          primaryTextColor: colors.text,
          primaryBorderColor: colors.primary,
          lineColor: colors.edgeColor,
          secondaryColor: colors.nodeBg,
          tertiaryColor: colors.background,
          clusterBkg: colors.clusterBg,
          clusterBorder: colors.primary,
          edgeLabelBackground: colors.background,
          nodeBorder: colors.primary,
          nodeTextColor: colors.text,
          textColor: colors.text,
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px'
        }
      });

      mermaid.render(id + '_rendered', code).then(function(result) {
        renderDiv.innerHTML = result.svg;
        renderDiv.style.display = 'block';
        var actions = wrapper.querySelector('.mermaid-actions');
        if (actions) actions.style.display = 'flex';
      }).catch(function(err) {
        console.warn('Mermaid render error:', err.message);
        renderDiv.innerHTML = '<div class="mermaid-error">Error: ' + err.message + '</div>';
        renderDiv.style.display = 'block';
      });

    } catch(e) {
      console.warn('Mermaid error:', e.message);
      renderDiv.innerHTML = '<div class="mermaid-error">Error: ' + e.message + '</div>';
      renderDiv.style.display = 'block';
    }
  });
}

// ============================================
// OBSERVER LE CHANGEMENT DE THÈME
// ============================================

var themeObserver = new MutationObserver(function() {
  setTimeout(function() {
    renderMermaidDiagrams();
    refreshZoomColors();
  }, 100);
});

themeObserver.observe(document.body, {
  attributes: true,
  attributeFilter: ['class']
});

// ============================================
// RAFRAÎCHIR LES DIAGRAMMES
// ============================================

function refreshMermaidDiagrams() {
  renderMermaidDiagrams();
  showToast('Diagrams refreshed');
}

// ============================================
// RAFRAÎCHIR LES COULEURS DU ZOOM
// ============================================

function refreshZoomColors() {
  var overlay = document.getElementById('zoomOverlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  if (!zoomCurrentSvg) return;

  var isDark = document.body.classList.contains('night-mode');

  var colors = isDark ? {
    text: '#e8e8e8',
    background: '#1a1a2e',
    nodeBg: '#2a2a4a',
    clusterBg: '#1a1a2e',
    edgeColor: '#00b4d8',
    primary: '#00b4d8'
  } : {
    text: '#1a2a3a',
    background: '#ffffff',
    nodeBg: '#f0f4f8',
    clusterBg: '#e8ecf0',
    edgeColor: '#0f3b48',
    primary: '#0f3b48'
  };

  var svgClone = zoomCurrentSvg.cloneNode(true);

  // Appliquer les couleurs
  var allTexts = svgClone.querySelectorAll('text');
  for (var i = 0; i < allTexts.length; i++) {
    allTexts[i].setAttribute('fill', colors.text);
    allTexts[i].style.fill = colors.text;
  }

  var nodes = svgClone.querySelectorAll('.node rect, .node circle, .node polygon');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].setAttribute('fill', colors.nodeBg);
    nodes[i].style.fill = colors.nodeBg;
    nodes[i].setAttribute('stroke', colors.primary);
    nodes[i].style.stroke = colors.primary;
  }

  var clusters = svgClone.querySelectorAll('.cluster rect');
  for (var i = 0; i < clusters.length; i++) {
    clusters[i].setAttribute('fill', colors.clusterBg);
    clusters[i].style.fill = colors.clusterBg;
  }

  var paths = svgClone.querySelectorAll('.edgePath .path');
  for (var i = 0; i < paths.length; i++) {
    paths[i].setAttribute('stroke', colors.edgeColor);
    paths[i].style.stroke = colors.edgeColor;
  }

  var edgeLabels = svgClone.querySelectorAll('.edgeLabel rect');
  for (var i = 0; i < edgeLabels.length; i++) {
    edgeLabels[i].setAttribute('fill', colors.background);
    edgeLabels[i].style.fill = colors.background;
  }

  var edgeTexts = svgClone.querySelectorAll('.edgeLabel text, .edgeLabel span');
  for (var i = 0; i < edgeTexts.length; i++) {
    edgeTexts[i].setAttribute('fill', colors.text);
    edgeTexts[i].style.fill = colors.text;
    edgeTexts[i].style.color = colors.text;
  }

  svgClone.setAttribute('style', 
    'background: ' + colors.background + ' !important; ' +
    'border-radius: 12px; ' +
    'padding: 16px;'
  );

  var container = document.getElementById('zoomImageWrapper');
  if (container) {
    container.innerHTML = '';
    var finalSvg = svgClone.cloneNode(true);
    finalSvg.style.maxWidth = '100%';
    finalSvg.style.maxHeight = '100%';
    finalSvg.style.width = 'auto';
    finalSvg.style.height = 'auto';
    container.appendChild(finalSvg);
  }

  zoomCurrentSvg = svgClone;
}

// ============================================
// ZOOM - OUVERTURE
// ============================================

function openZoom(wrapperId) {
  var wrapper = document.getElementById(wrapperId);
  if (!wrapper) {
    showToast('Image not found');
    return;
  }

  var svg = wrapper.querySelector('.mermaid-render svg');
  if (!svg) {
    showToast('No image to zoom');
    return;
  }

  var svgClone = svg.cloneNode(true);

  var isDark = document.body.classList.contains('night-mode');

  var colors = isDark ? {
    text: '#e8e8e8',
    background: '#1a1a2e',
    nodeBg: '#2a2a4a',
    clusterBg: '#1a1a2e',
    edgeColor: '#00b4d8',
    primary: '#00b4d8'
  } : {
    text: '#1a2a3a',
    background: '#ffffff',
    nodeBg: '#f0f4f8',
    clusterBg: '#e8ecf0',
    edgeColor: '#0f3b48',
    primary: '#0f3b48'
  };

  // Appliquer les couleurs au SVG cloné
  var allTexts = svgClone.querySelectorAll('text');
  for (var i = 0; i < allTexts.length; i++) {
    allTexts[i].setAttribute('fill', colors.text);
    allTexts[i].style.fill = colors.text;
  }

  var nodes = svgClone.querySelectorAll('.node rect, .node circle, .node polygon');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].setAttribute('fill', colors.nodeBg);
    nodes[i].style.fill = colors.nodeBg;
    nodes[i].setAttribute('stroke', colors.primary);
    nodes[i].style.stroke = colors.primary;
  }

  var clusters = svgClone.querySelectorAll('.cluster rect');
  for (var i = 0; i < clusters.length; i++) {
    clusters[i].setAttribute('fill', colors.clusterBg);
    clusters[i].style.fill = colors.clusterBg;
  }

  var paths = svgClone.querySelectorAll('.edgePath .path');
  for (var i = 0; i < paths.length; i++) {
    paths[i].setAttribute('stroke', colors.edgeColor);
    paths[i].style.stroke = colors.edgeColor;
  }

  var edgeLabels = svgClone.querySelectorAll('.edgeLabel rect');
  for (var i = 0; i < edgeLabels.length; i++) {
    edgeLabels[i].setAttribute('fill', colors.background);
    edgeLabels[i].style.fill = colors.background;
  }

  var edgeTexts = svgClone.querySelectorAll('.edgeLabel text, .edgeLabel span');
  for (var i = 0; i < edgeTexts.length; i++) {
    edgeTexts[i].setAttribute('fill', colors.text);
    edgeTexts[i].style.fill = colors.text;
    edgeTexts[i].style.color = colors.text;
  }

  svgClone.setAttribute('style', 
    'background: ' + colors.background + ' !important; ' +
    'border-radius: 12px; ' +
    'padding: 16px;'
  );

  zoomCurrentSvg = svgClone;

  var titleEl = wrapper.closest('.message-bubble').querySelector('h3, h4, strong');
  var diagramName = titleEl ? titleEl.textContent.trim().substring(0, 40) : 'Diagram';
  document.querySelector('.zoom-title .title-text').innerHTML = diagramName;

  var container = document.getElementById('zoomImageWrapper');
  container.innerHTML = '';
  var finalSvg = zoomCurrentSvg.cloneNode(true);
  finalSvg.style.maxWidth = '100%';
  finalSvg.style.maxHeight = '100%';
  finalSvg.style.width = 'auto';
  finalSvg.style.height = 'auto';
  container.appendChild(finalSvg);

  zoomScale = 1;
  zoomPanX = 0;
  zoomPanY = 0;
  updateZoomTransform();
  updateZoomIndicator();

  document.getElementById('zoomOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ============================================
// ZOOM - FERMETURE
// ============================================

function closeZoom() {
  document.getElementById('zoomOverlay').classList.remove('active');
  document.body.style.overflow = '';
  zoomCurrentSvg = null;
}

// ============================================
// ZOOM - IN / OUT / RESET
// ============================================

function zoomIn() {
  zoomScale = Math.min(zoomScale + 0.2, 5);
  updateZoomTransform();
  updateZoomIndicator();
}

function zoomOut() {
  zoomScale = Math.max(zoomScale - 0.2, 0.5);
  updateZoomTransform();
  updateZoomIndicator();
}

function zoomReset() {
  zoomScale = 1;
  zoomPanX = 0;
  zoomPanY = 0;
  updateZoomTransform();
  updateZoomIndicator();
}

// ============================================
// ZOOM - TRANSFORMATIONS
// ============================================

function updateZoomTransform() {
  var wrapper = document.getElementById('zoomImageWrapper');
  if (!wrapper) return;
  wrapper.style.transform = 'translate(' + zoomPanX + 'px, ' + zoomPanY + 'px) scale(' + zoomScale + ')';
  wrapper.style.transformOrigin = 'center center';
}

function updateZoomIndicator() {
  var indicator = document.getElementById('zoomIndicator');
  if (!indicator) return;
  indicator.innerHTML = Math.round(zoomScale * 100) + '%';
}

// ============================================
// ZOOM - ÉVÉNEMENTS (MOELLE, DRAG, TACTILE)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('zoomOverlay');
  if (overlay) {
    overlay.addEventListener('wheel', function(e) {
      if (!this.classList.contains('active')) return;
      e.preventDefault();
      var delta = e.deltaY > 0 ? -0.15 : 0.15;
      zoomScale = Math.min(Math.max(zoomScale + delta, 0.5), 5);
      updateZoomTransform();
      updateZoomIndicator();
    }, { passive: false });
  }

  var container = document.getElementById('zoomImageContainer');
  if (!container) return;

  container.addEventListener('mousedown', function(e) {
    if (zoomScale <= 1) return;
    zoomIsDragging = true;
    zoomStartX = e.clientX;
    zoomStartY = e.clientY;
    zoomStartPanX = zoomPanX;
    zoomStartPanY = zoomPanY;
    this.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!zoomIsDragging) return;
    var dx = e.clientX - zoomStartX;
    var dy = e.clientY - zoomStartY;
    zoomPanX = zoomStartPanX + dx;
    zoomPanY = zoomStartPanY + dy;
    updateZoomTransform();
  });

  document.addEventListener('mouseup', function() {
    if (zoomIsDragging) {
      zoomIsDragging = false;
      var container = document.getElementById('zoomImageContainer');
      if (container) container.style.cursor = 'grab';
    }
  });

  // TACTILE
  var isPinching = false;
  var touchDist = 0;
  var lastTouchScale = 0;

  container.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1 && zoomScale > 1) {
      zoomIsDragging = true;
      zoomStartX = e.touches[0].clientX;
      zoomStartY = e.touches[0].clientY;
      zoomStartPanX = zoomPanX;
      zoomStartPanY = zoomPanY;
    } else if (e.touches.length === 2) {
      isPinching = true;
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist = Math.sqrt(dx * dx + dy * dy);
      lastTouchScale = zoomScale;
    }
  }, { passive: true });

  container.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (zoomIsDragging && e.touches.length === 1) {
      var dx = e.touches[0].clientX - zoomStartX;
      var dy = e.touches[0].clientY - zoomStartY;
      zoomPanX = zoomStartPanX + dx;
      zoomPanY = zoomStartPanY + dy;
      updateZoomTransform();
    } else if (isPinching && e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var newDist = Math.sqrt(dx * dx + dy * dy);
      var diff = newDist - touchDist;
      zoomScale = Math.min(Math.max(lastTouchScale + diff * 0.01, 0.5), 5);
      updateZoomTransform();
      updateZoomIndicator();
    }
  }, { passive: false });

  container.addEventListener('touchend', function() {
    zoomIsDragging = false;
    isPinching = false;
  }, { passive: true });
});

// ============================================
// RACCOURCIS CLAVIER
// ============================================

document.addEventListener('keydown', function(e) {
  var overlay = document.getElementById('zoomOverlay');
  if (!overlay || !overlay.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeZoom();
  }
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    zoomIn();
  }
  if (e.key === '-') {
    e.preventDefault();
    zoomOut();
  }
  if (e.key === '0') {
    e.preventDefault();
    zoomReset();
  }
});

// ============================================
// TÉLÉCHARGER L'IMAGE EN PNG
// ============================================

function downloadZoomImage() {
  if (!zoomCurrentSvg) {
    showToast('No image to download');
    return;
  }

  try {
    var svgClone = zoomCurrentSvg.cloneNode(true);

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', '#ffffff');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    svgClone.insertBefore(rect, svgClone.firstChild);

    var width = svgClone.clientWidth || 800;
    var height = svgClone.clientHeight || 600;

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgClone);
    var encoded = encodeURIComponent(svgString);
    var dataUrl = 'data:image/svg+xml;charset=utf-8,' + encoded;

    var img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;

      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      var link = document.createElement('a');
      link.download = 'diagram_' + Date.now() + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('PNG downloaded');
    };

    img.onerror = function() {
      var link = document.createElement('a');
      link.download = 'diagram_' + Date.now() + '.svg';
      link.href = dataUrl;
      link.click();
      showToast('SVG downloaded');
    };

    img.src = dataUrl;

  } catch(e) {
    console.error('Download error:', e);
    showToast('Download failed');
  }
}

function downloadMermaidImage(wrapperId) {
  var wrapper = document.getElementById(wrapperId);
  if (!wrapper) {
    showToast('Image not found');
    return;
  }

  var svg = wrapper.querySelector('.mermaid-render svg');
  if (!svg) {
    showToast('No image to download');
    return;
  }

  openZoom(wrapperId);
  setTimeout(function() {
    downloadZoomImage();
  }, 300);
}

// ============================================
// EXPORTER LES FONCTIONS GLOBALES
// ============================================

window.openZoom = openZoom;
window.closeZoom = closeZoom;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.zoomReset = zoomReset;
window.downloadZoomImage = downloadZoomImage;
window.downloadMermaidImage = downloadMermaidImage;
window.renderMermaidDiagrams = renderMermaidDiagrams;
window.refreshMermaidDiagrams = refreshMermaidDiagrams;
window.refreshZoomColors = refreshZoomColors;

console.log('AI Assistant UI loaded - Version finale');