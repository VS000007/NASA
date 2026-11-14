/**
 * Space Archaeologists — Accessibility Controller
 * Provides:
 *  - Skip-nav link
 *  - Keyboard-navigable map markers
 *  - List/Table alternative view for maps
 *  - prefers-reduced-motion support
 *  - Focus-visible management
 *  - ARIA live-region announcements
 */

class AccessibilityController {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.tableViewActive = false;
    this.init();
  }

  init() {
    this.injectSkipNav();
    this.injectARIALandmarks();
    this.setupReducedMotion();
    this.injectTableToggle();
    this.injectLiveRegion();
    this.fixUserSelect();
    this.addAriaToButtons();
  }

  /* ===================== SKIP NAV ===================== */
  injectSkipNav() {
    const skip = document.createElement('a');
    skip.href = '#leaflet-map';
    skip.className = 'skip-nav-link';
    skip.textContent = 'Skip to main content';
    skip.addEventListener('focus', () => skip.classList.add('visible'));
    skip.addEventListener('blur', () => skip.classList.remove('visible'));
    document.body.insertBefore(skip, document.body.firstChild);
  }

  /* ===================== ARIA LANDMARKS ===================== */
  injectARIALandmarks() {
    const header = document.querySelector('.hud-header');
    if (header) {
      header.setAttribute('role', 'banner');
      header.querySelector('.hud-brand')?.setAttribute('role', 'heading');
    }

    const surfaceScreen = document.getElementById('surface-screen');
    if (surfaceScreen) surfaceScreen.setAttribute('role', 'main');

    const objectScreen = document.getElementById('object-screen');
    if (objectScreen) objectScreen.setAttribute('role', 'region');
    if (objectScreen) objectScreen.setAttribute('aria-label', 'Artifact detail view');

    const hudActions = document.querySelector('.hud-actions');
    if (hudActions) hudActions.setAttribute('role', 'navigation');
    if (hudActions) hudActions.setAttribute('aria-label', 'Body navigation');
  }

  /* ===================== REDUCED MOTION ===================== */
  setupReducedMotion() {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (reduced) => {
      this.reducedMotion = reduced;
      document.documentElement.classList.toggle('reduced-motion', reduced);

      // Disable model-viewer auto-rotate
      const mv = document.getElementById('nasa-model-viewer');
      if (mv) {
        if (reduced) {
          mv.removeAttribute('auto-rotate');
          mv.setAttribute('rotation-per-second', '0deg');
        } else {
          mv.setAttribute('auto-rotate', '');
          mv.setAttribute('rotation-per-second', '14deg');
        }
      }

      // Announce to SolarNav
      if (window.solarNav) {
        window.solarNav.timeSpeed = reduced ? 0 : 0.0002;
      }
    };

    apply(mql.matches);
    mql.addEventListener('change', (e) => apply(e.matches));
  }

  /* ===================== TABLE ALTERNATIVE ===================== */
  injectTableToggle() {
    const surfaceHud = document.querySelector('.surface-hud-right');
    if (!surfaceHud) return;

    const btn = document.createElement('button');
    btn.className = 'btn-glass table-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle list view of all artifacts');
    btn.innerHTML = '<span>📋</span> List View';
    btn.addEventListener('click', () => this.toggleTableView());
    surfaceHud.appendChild(btn);
    this.tableToggleBtn = btn;
  }

  toggleTableView() {
    this.tableViewActive = !this.tableViewActive;
    let tableContainer = document.getElementById('a11y-table-view');

    if (!tableContainer) {
      tableContainer = document.createElement('div');
      tableContainer.id = 'a11y-table-view';
      tableContainer.className = 'a11y-table-view';
      tableContainer.setAttribute('role', 'region');
      tableContainer.setAttribute('aria-label', 'Artifacts list view');
      const surfaceScreen = document.getElementById('surface-screen');
      if (surfaceScreen) surfaceScreen.appendChild(tableContainer);
    }

    if (this.tableViewActive) {
      this.buildTable(tableContainer);
      tableContainer.style.display = 'block';
      if (this.tableToggleBtn) this.tableToggleBtn.innerHTML = '<span>🗺️</span> Map View';
      this.announce('Switched to list view. Showing all artifacts in a table.');
    } else {
      tableContainer.style.display = 'none';
      if (this.tableToggleBtn) this.tableToggleBtn.innerHTML = '<span>📋</span> List View';
      this.announce('Switched back to map view.');
    }
  }

  buildTable(container) {
    const objects = window.surfaceController?.objects || [];
    if (!objects.length) {
      container.innerHTML = '<p class="table-empty">No artifacts loaded yet.</p>';
      return;
    }

    const body = window.surfaceController?.currentBody || 'Moon';
    let html = `
      <div class="a11y-table-header">
        <h3>All ${body} Artifacts (${objects.length})</h3>
        <p>Complete list of abandoned equipment. Click any row to view details.</p>
      </div>
      <div class="a11y-table-scroll">
        <table role="grid" aria-label="${body} artifacts table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Mission</th>
              <th scope="col">Year</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Latitude</th>
              <th scope="col">Longitude</th>
              <th scope="col">Verified</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>`;

    objects.forEach(obj => {
      const verifiedIcon = obj.verified ? '✅' : '⚠️';
      html += `
            <tr tabindex="0" data-object-id="${obj.id}" role="row">
              <td>${obj.name}</td>
              <td>${obj.mission}</td>
              <td>${obj.year}</td>
              <td>${obj.category || '—'}</td>
              <td>${obj.status || '—'}</td>
              <td>${obj.lat?.toFixed(3) || '—'}</td>
              <td>${obj.lon?.toFixed(3) || '—'}</td>
              <td>${verifiedIcon}</td>
              <td><button class="btn-inspect-table" onclick="window.openObjectPage('${obj.id}')" aria-label="View ${obj.name}">🔍 View</button></td>
            </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Keyboard: Enter on row opens object
    container.querySelectorAll('tr[data-object-id]').forEach(row => {
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.openObjectPage(row.dataset.objectId);
        }
      });
    });
  }

  /* ===================== LIVE REGION ===================== */
  injectLiveRegion() {
    let region = document.getElementById('a11y-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'a11y-live-region';
      region.className = 'sr-only';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.setAttribute('role', 'status');
      document.body.appendChild(region);
    }
    this.liveRegion = region;
  }

  announce(text) {
    if (this.liveRegion) {
      this.liveRegion.textContent = '';
      setTimeout(() => { this.liveRegion.textContent = text; }, 100);
    }
  }

  /* ===================== FIX USER-SELECT ===================== */
  fixUserSelect() {
    // Remove blanket user-select: none from story content areas
    const style = document.createElement('style');
    style.textContent = `
      .kid-narrative-box, .matrix-value, .enigma-content,
      .story-title, .story-headline, .sources-list,
      .a11y-table-view, .site-popup-card,
      .photo-fallback-caption, #obj-story-text {
        user-select: text !important;
        -webkit-user-select: text !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ===================== ARIA ON BUTTONS ===================== */
  addAriaToButtons() {
    const mappings = {
      'btn-zoom-in': 'Zoom in',
      'btn-zoom-out': 'Zoom out',
      'btn-zoom-reset': 'Reset view',
      'btn-explore-moon': 'Navigate to Moon surface map',
      'btn-explore-mars': 'Navigate to Mars surface map',
      'btn-back-to-solar': 'Return to Solar System view',
      'btn-back-to-map': 'Return to surface map',
      'btn-timeline-play': 'Play or pause timeline animation',
      'btn-narrate-story': 'Read story aloud',
      'btn-reading-toggle': 'Switch reading level',
    };

    for (const [id, label] of Object.entries(mappings)) {
      const el = document.getElementById(id);
      if (el) el.setAttribute('aria-label', label);
    }
  }

  /* ===================== KEYBOARD MAP MARKERS ===================== */
  makeMarkersKeyboardAccessible() {
    // Called after markers are rendered on map
    setTimeout(() => {
      const pins = document.querySelectorAll('.site-group-pin');
      pins.forEach((pin, idx) => {
        pin.setAttribute('tabindex', '0');
        pin.setAttribute('role', 'button');

        const nameEl = pin.querySelector('.site-preview-name');
        const name = nameEl?.textContent || `Site ${idx + 1}`;
        pin.setAttribute('aria-label', `${name} — press Enter to inspect`);

        pin.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pin.click();
          }
        });
      });
    }, 500);
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  window.a11yController = new AccessibilityController();
});

// Re-run marker accessibility after map loads
window.addEventListener('open-surface-map', () => {
  setTimeout(() => {
    window.a11yController?.makeMarkersKeyboardAccessible();
  }, 1200);
});
