/**
 * Space Archaeologists — Media Panel Controller
 * Provides:
 *  - Caption/info panel for every media item (title, credit, source, mission, date, alt text)
 *  - Before/after image comparison slider (keyboard accessible)
 *  - "Fly to this machine" button for NASA Eyes on the Solar System
 *  - Image attribution display from media manifest
 */

class MediaPanelController {
  constructor() {
    this.currentDialog = null;
    this.init();
  }

  init() {
    this.injectCaptionDialog();
    this.injectEyesButton();
    this.setupGlobalImageClickHandlers();
  }

  /* ===================== CAPTION DIALOG ===================== */
  injectCaptionDialog() {
    const dialog = document.createElement('dialog');
    dialog.id = 'media-caption-dialog';
    dialog.className = 'media-caption-dialog';
    dialog.setAttribute('aria-label', 'Image information panel');
    dialog.innerHTML = `
      <div class="caption-dialog-inner">
        <button class="caption-close-btn" aria-label="Close">&times;</button>
        <img id="caption-dialog-img" src="" alt="" loading="lazy">
        <div class="caption-dialog-body">
          <h3 id="caption-dialog-title"></h3>
          <div class="caption-meta-grid">
            <div class="caption-meta-item">
              <span class="caption-label">Credit</span>
              <span id="caption-dialog-credit" class="caption-value"></span>
            </div>
            <div class="caption-meta-item">
              <span class="caption-label">Mission</span>
              <span id="caption-dialog-mission" class="caption-value"></span>
            </div>
            <div class="caption-meta-item">
              <span class="caption-label">Source</span>
              <a id="caption-dialog-source" class="caption-value caption-link" href="#" target="_blank" rel="noopener">View on NASA</a>
            </div>
            <div class="caption-meta-item">
              <span class="caption-label">Alt Text</span>
              <span id="caption-dialog-alt" class="caption-value"></span>
            </div>
            <div class="caption-meta-item">
              <span class="caption-label">NASA ID</span>
              <span id="caption-dialog-nasaid" class="caption-value"></span>
            </div>
            <div class="caption-meta-item">
              <span class="caption-label">Usage</span>
              <span id="caption-dialog-license" class="caption-value">NASA media are generally not copyrighted. Credit NASA and the mission team.</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    this.captionDialog = dialog;

    dialog.querySelector('.caption-close-btn').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dialog.close();
    });
  }

  openCaptionPanel(imageData) {
    const d = this.captionDialog;
    if (!d) return;

    const img = d.querySelector('#caption-dialog-img');
    const title = d.querySelector('#caption-dialog-title');
    const credit = d.querySelector('#caption-dialog-credit');
    const mission = d.querySelector('#caption-dialog-mission');
    const source = d.querySelector('#caption-dialog-source');
    const alt = d.querySelector('#caption-dialog-alt');
    const nasaId = d.querySelector('#caption-dialog-nasaid');

    img.src = imageData.image || '';
    img.alt = imageData.alt_text || imageData.name || '';
    title.textContent = imageData.name || 'NASA Image';
    credit.textContent = imageData.primary_image_credit || this.inferCredit(imageData);
    mission.textContent = imageData.mission || '';
    alt.textContent = imageData.primary_image_alt || `NASA photograph of ${imageData.name}`;
    nasaId.textContent = imageData.primary_image_nasa_id || '—';

    const nasaIdVal = imageData.primary_image_nasa_id;
    if (nasaIdVal) {
      source.href = `https://images.nasa.gov/details/${nasaIdVal}`;
      source.textContent = `View on images.nasa.gov`;
    } else {
      source.href = imageData.image || '#';
      source.textContent = 'View source image';
    }

    d.showModal();
  }

  inferCredit(obj) {
    const mission = (obj.mission || '').toLowerCase();
    if (mission.includes('apollo')) return 'NASA/JSC';
    if (mission.includes('curiosity') || mission.includes('msl')) return 'NASA/JPL-Caltech/MSSS';
    if (mission.includes('perseverance') || mission.includes('mars 2020')) return 'NASA/JPL-Caltech';
    if (mission.includes('opportunity') || mission.includes('spirit') || mission.includes('mer')) return 'NASA/JPL-Caltech/Cornell';
    if (mission.includes('viking')) return 'NASA/JPL';
    if (mission.includes('surveyor')) return 'NASA/JPL';
    if (mission.includes('ranger')) return 'NASA/JPL';
    if (mission.includes('insight')) return 'NASA/JPL-Caltech';
    if (mission.includes('phoenix')) return 'NASA/JPL-Caltech/University of Arizona';
    if (mission.includes('lcross') || mission.includes('lro')) return 'NASA/GSFC/Arizona State University';
    if (mission.includes('grail')) return 'NASA/JPL-Caltech/MIT';
    if (mission.includes('ladee')) return 'NASA/Ames Research Center';
    return 'NASA';
  }

  /* ===================== GLOBAL IMAGE CLICK → CAPTION ===================== */
  setupGlobalImageClickHandlers() {
    // When archive photo is clicked in object view, open caption panel
    document.addEventListener('click', (e) => {
      const archiveImg = e.target.closest('#obj-archive-photo');
      const fallbackImg = e.target.closest('#photo-fallback-img');

      if ((archiveImg || fallbackImg) && window.objectViewer?.currentObject) {
        e.preventDefault();
        this.openCaptionPanel(window.objectViewer.currentObject);
      }
    });
  }

  /* ===================== EYES ON THE SOLAR SYSTEM ===================== */
  injectEyesButton() {
    // Insert "Fly to this machine" button in object view
    window.addEventListener('open-object-page', () => {
      setTimeout(() => this.addEyesButton(), 300);
    });
  }

  addEyesButton() {
    const obj = window.objectViewer?.currentObject;
    if (!obj) return;

    // Remove existing button if any
    const existing = document.getElementById('btn-fly-eyes');
    if (existing) existing.remove();

    const eyesUrl = this.getEyesUrl(obj);
    if (!eyesUrl) return;

    const stageControls = document.querySelector('.stage-control-panel .stage-view-toggles');
    if (!stageControls) return;

    const btn = document.createElement('button');
    btn.id = 'btn-fly-eyes';
    btn.className = 'stage-toggle-btn';
    btn.title = 'Open NASA Eyes on the Solar System view';
    btn.setAttribute('aria-label', `Fly to ${obj.name} in NASA Eyes on the Solar System`);
    btn.innerHTML = '<span>🪐</span> Fly to It';
    btn.addEventListener('click', () => {
      window.open(eyesUrl, '_blank', 'noopener,noreferrer');
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast(`Opening NASA Eyes on the Solar System...`, '🪐', 3000);
      }
    });
    stageControls.appendChild(btn);
  }

  getEyesUrl(obj) {
    const body = (obj.body || '').toLowerCase();
    if (body === 'mars') {
      return 'https://eyes.nasa.gov/apps/solar-system/#/mars';
    }
    if (body === 'moon') {
      return 'https://eyes.nasa.gov/apps/solar-system/#/earth/moon';
    }
    return null;
  }

  /* ===================== BEFORE/AFTER IMAGE SLIDER ===================== */
  static createSlider(containerId, beforeSrc, afterSrc, beforeLabel, afterLabel) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.className = 'ba-slider-container';
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `Before and after comparison: ${beforeLabel} vs ${afterLabel}`);
    container.innerHTML = `
      <div class="ba-slider-wrapper">
        <img class="ba-img ba-after" src="${afterSrc}" alt="${afterLabel}" loading="lazy">
        <div class="ba-reveal" style="width:50%">
          <img class="ba-img ba-before" src="${beforeSrc}" alt="${beforeLabel}" loading="lazy">
        </div>
        <div class="ba-handle" role="slider" aria-label="Comparison slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" tabindex="0">
          <div class="ba-handle-line"></div>
          <div class="ba-handle-circle">⇔</div>
          <div class="ba-handle-line"></div>
        </div>
        <span class="ba-label ba-label-before">${beforeLabel}</span>
        <span class="ba-label ba-label-after">${afterLabel}</span>
      </div>
    `;

    const wrapper = container.querySelector('.ba-slider-wrapper');
    const reveal = container.querySelector('.ba-reveal');
    const handle = container.querySelector('.ba-handle');
    let isDragging = false;

    const updatePosition = (clientX) => {
      const rect = wrapper.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      reveal.style.width = pct + '%';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    };

    handle.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
    wrapper.addEventListener('mousemove', (e) => { if (isDragging) updatePosition(e.clientX); });
    window.addEventListener('mouseup', () => { isDragging = false; });

    handle.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); }, { passive: false });
    wrapper.addEventListener('touchmove', (e) => { if (isDragging && e.touches[0]) updatePosition(e.touches[0].clientX); });
    window.addEventListener('touchend', () => { isDragging = false; });

    // Keyboard support
    handle.addEventListener('keydown', (e) => {
      const current = parseFloat(handle.getAttribute('aria-valuenow') || 50);
      let next = current;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, current - 2);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(100, current + 2);
      else return;
      e.preventDefault();
      reveal.style.width = next + '%';
      handle.style.left = next + '%';
      handle.setAttribute('aria-valuenow', Math.round(next));
    });
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  window.mediaPanel = new MediaPanelController();
});
