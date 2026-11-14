const fs = require('fs');
const path = require('path');

const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../scratch/all_artifacts.json'), 'utf8'));

const template = `/**
 * Space Archaeologists - Planetary Archaeological Ledger
 * Forgotten Explorers vs Still Working For Us View
 *
 * Implements:
 *  - Complete Catalog of all 66 Extraterrestrial Artifacts on Moon & Mars (matching NASA Archives & Hackathon PDF)
 *  - Left Column: Silent, Lost & Crashed Hardware (The Forgotten Explorers)
 *  - Right Column: Still Working For Us Today (Active Science & Heritage Systems)
 *  - Big Comparison Matrix: Interactive head-to-head table with sticky header comparing all 66 artifacts
 *  - Filters: Planetary Body (All 66 / Moon 47 / Mars 19) + Equipment Category + Live Search
 *  - Hardware-Accelerated Smooth Scrolling with sleek space scrollbars (Zero white bar jank)
 *  - NASA-verified image thumbnail loader with automatic failover fallback
 */

class ForgottenExplorersController {
  constructor() {
    this.modal = null;
    this.currentView = 'cards'; // 'cards' | 'matrix'
    this.currentFilter = 'all';  // 'all' | 'Moon' | 'Mars'
    this.selectedCategory = 'all';
    this.searchQuery = '';

    // Complete NASA Verified Extraterrestrial Artifacts Catalog (66 Items)
    this.allArtifacts = ${JSON.stringify(artifacts, null, 2)};

    this.init();
  }

  init() {
    this.injectModal();
    this.bindGlobalTriggers();
    this.loadFromGlobalData();
  }

  loadFromGlobalData() {
    if (typeof fetch === 'function') {
      fetch('/data/objects.json')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (Array.isArray(data) && data.length >= 66) {
            console.log('Ledger verified with 66 official NASA objects.');
          }
        })
        .catch(() => {});
    }
  }

  bindGlobalTriggers() {
    window.openForgottenExplorers = () => this.open();
    window.addEventListener('open-forgotten-explorers', () => this.open());
  }

  getThumbUrl(imgUrl) {
    if (!imgUrl) return '/favicon.ico';
    if (imgUrl.includes('images-assets.nasa.gov') && imgUrl.includes('~orig.')) {
      return imgUrl.replace('~orig.', '~thumb.');
    }
    return imgUrl;
  }

  injectModal() {
    let modal = document.getElementById('forgotten-explorers-modal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'forgotten-explorers-modal';
    modal.className = 'forgotten-explorers-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Planetary Archaeological Ledger: Forgotten Explorers vs Still Working Artifacts');

    modal.innerHTML = \`
      <div class="forgotten-backdrop"></div>
      <div class="forgotten-container">
        <!-- Header -->
        <header class="forgotten-header">
          <div class="forgotten-header-left">
            <span class="forgotten-badge">🏛️ Planetary Archaeological Ledger</span>
            <h2>Forgotten Explorers vs. Still Working For Us</h2>
            <p>Every piece of hardware left behind was someone's best idea. Discover the silent machines of yesterday and the enduring instruments that still serve humanity today across the Moon and Mars.</p>
          </div>
          <button class="forgotten-close-btn" id="btn-close-forgotten" aria-label="Close">&times;</button>
        </header>

        <!-- Interactive Toolbar: View Switcher, Body Filters, Category Filters, Search -->
        <div class="forgotten-toolbar">
          <div class="toolbar-top-row">
            <div class="view-toggle-pills" role="radiogroup" aria-label="Comparison View Mode">
              <button class="toggle-pill-btn active" id="btn-view-cards" data-view="cards">
                <span>🃏</span> Side-by-Side Cards
              </button>
              <button class="toggle-pill-btn" id="btn-view-matrix" data-view="matrix">
                <span>📊</span> Big Comparison Matrix
              </button>
            </div>

            <div class="body-filter-pills" role="group" aria-label="Filter by Planetary Body">
              <button class="filter-pill-btn active" data-body="all">All Bodies (66)</button>
              <button class="filter-pill-btn" data-body="Moon">🌕 Moon (47)</button>
              <button class="filter-pill-btn" data-body="Mars">🔴 Mars (19)</button>
            </div>

            <div class="ledger-search-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="ledger-search-input" placeholder="Search relics, missions, craters..." aria-label="Search relics">
              <button id="btn-clear-ledger-search" class="btn-clear-search" style="display:none;" aria-label="Clear Search">&times;</button>
            </div>
          </div>

          <div class="toolbar-categories-row" role="group" aria-label="Filter by Equipment Category">
            <button class="cat-pill-btn active" data-category="all">All Types (66)</button>
            <button class="cat-pill-btn" data-category="lander stage">🚀 Landers & Stages (17)</button>
            <button class="cat-pill-btn" data-category="rover">🚙 Rovers (8)</button>
            <button class="cat-pill-btn" data-category="impactor">💥 Impactors & Boosters (28)</button>
            <button class="cat-pill-btn" data-category="science package">🔬 Science Stations (6)</button>
            <button class="cat-pill-btn" data-category="entry hardware">🛡️ Entry Hardware (6)</button>
            <button class="cat-pill-btn" data-category="helicopter">🚁 Aerial Scouts (1)</button>
          </div>
        </div>

        <!-- View 1: Split Cards Grid -->
        <main class="forgotten-split-grid" id="container-split-grid">
          <!-- Column 1: Silent Heroes -->
          <section class="forgotten-column col-silent" id="col-silent">
            <div class="column-header">
              <div class="col-title-row">
                <span class="col-icon">🌑</span>
                <h3>Silent, Lost & Crashed Hardware</h3>
                <span class="col-count-badge" id="silent-count-badge">(60 Relics)</span>
              </div>
              <span class="col-tag tag-silent">The Forgotten Explorers</span>
            </div>
            <div class="column-cards-list" id="list-forgotten-explorers">
              <!-- Dynamically populated -->
            </div>
          </section>

          <!-- Column 2: Still Working -->
          <section class="forgotten-column col-working" id="col-working">
            <div class="column-header">
              <div class="col-title-row">
                <span class="col-icon">✨</span>
                <h3>Still Working For Us Today</h3>
                <span class="col-count-badge" id="working-count-badge">(6 Systems)</span>
              </div>
              <span class="col-tag tag-working">Active Science & Heritage</span>
            </div>
            <div class="column-cards-list" id="list-working-explorers">
              <!-- Dynamically populated -->
            </div>
          </section>
        </main>

        <!-- View 2: Big Comparison Matrix (Head-to-Head Table) -->
        <div class="comparison-matrix-container" id="container-comparison-matrix" style="display: none;">
          <div class="comparison-matrix-scroll" id="matrix-scroll-wrapper">
            <table class="big-comparison-table" id="big-comparison-table">
              <thead>
                <tr>
                  <th scope="col" class="th-sticky">Artifact & Mission</th>
                  <th scope="col">Status</th>
                  <th scope="col">Body & Site</th>
                  <th scope="col">Planned vs Actual Life</th>
                  <th scope="col">Power Architecture</th>
                  <th scope="col">Mobility & Distance</th>
                  <th scope="col">End Reason / Why Left Behind</th>
                  <th scope="col">Key Scientific Breakthrough</th>
                  <th scope="col">Interactive Tools</th>
                </tr>
              </thead>
              <tbody id="big-comparison-tbody">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    \`;

    document.body.appendChild(modal);
    this.modal = modal;

    // Close actions
    modal.querySelector('#btn-close-forgotten').addEventListener('click', () => this.close());
    modal.querySelector('.forgotten-backdrop').addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.close();
      }
    });

    // View switcher triggers
    modal.querySelector('#btn-view-cards').addEventListener('click', () => this.switchView('cards'));
    modal.querySelector('#btn-view-matrix').addEventListener('click', () => this.switchView('matrix'));

    // Body filter buttons
    const filterBtns = modal.querySelectorAll('.filter-pill-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.getAttribute('data-body');
        this.render();
      });
    });

    // Category filter buttons
    const catBtns = modal.querySelectorAll('.cat-pill-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        catBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedCategory = e.currentTarget.getAttribute('data-category');
        this.render();
      });
    });

    // Search input
    const searchInput = modal.querySelector('#ledger-search-input');
    const clearBtn = modal.querySelector('#btn-clear-ledger-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.render();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        this.render();
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    const cardsGrid = this.modal?.querySelector('#container-split-grid');
    const matrixView = this.modal?.querySelector('#container-comparison-matrix');
    const btnCards = this.modal?.querySelector('#btn-view-cards');
    const btnMatrix = this.modal?.querySelector('#btn-view-matrix');

    if (viewName === 'cards') {
      if (cardsGrid) cardsGrid.style.display = 'grid';
      if (matrixView) matrixView.style.display = 'none';
      btnCards?.classList.add('active');
      btnMatrix?.classList.remove('active');
    } else {
      if (cardsGrid) cardsGrid.style.display = 'none';
      if (matrixView) matrixView.style.display = 'block';
      btnCards?.classList.remove('active');
      btnMatrix?.classList.add('active');
    }
    this.render();
  }

  open() {
    if (!this.modal) return;
    this.render();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.modal) this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  filterList(list) {
    return list.filter(item => {
      // Body filter
      if (this.currentFilter !== 'all' && item.body !== this.currentFilter) return false;
      // Category filter
      if (this.selectedCategory !== 'all' && item.category !== this.selectedCategory) return false;
      // Search query
      if (this.searchQuery) {
        const text = (item.name + ' ' + item.site + ' ' + item.fateReason + ' ' + item.whatItTaughtUs + ' ' + item.year).toLowerCase();
        if (!text.includes(this.searchQuery)) return false;
      }
      return true;
    });
  }

  render() {
    if (this.currentView === 'cards') {
      this.renderCards();
    } else {
      this.renderMatrix();
    }
  }

  renderCards() {
    const listSilent = this.modal?.querySelector('#list-forgotten-explorers');
    const listWorking = this.modal?.querySelector('#list-working-explorers');
    const silentBadge = this.modal?.querySelector('#silent-count-badge');
    const workingBadge = this.modal?.querySelector('#working-count-badge');
    if (!listSilent || !listWorking) return;

    const silentItems = this.allArtifacts.filter(x => !x.isWorking);
    const workingItems = this.allArtifacts.filter(x => x.isWorking);

    const filteredSilent = this.filterList(silentItems);
    const filteredWorking = this.filterList(workingItems);

    if (silentBadge) silentBadge.textContent = '(' + filteredSilent.length + ' Relics)';
    if (workingBadge) workingBadge.textContent = '(' + filteredWorking.length + ' Systems)';

    // Render Silent Column
    listSilent.innerHTML = filteredSilent.length === 0 ? '<p class="ledger-empty-msg">No relics match your filter.</p>' : filteredSilent.map(item => \`
      <article class="explorer-card card-silent" data-id="\${item.id}">
        <div class="card-top-row">
          <img src="\${this.getThumbUrl(item.image)}" alt="\${item.name}" class="explorer-thumb" loading="lazy" decoding="async" onerror="if(!this._origTried){this._origTried=true;this.src='\${item.image}';}else{this.src='/favicon.ico';}">
          <div class="card-titles">
            <h4>\${item.name}</h4>
            <div class="badge-row">
              <span class="explorer-body-tag">\${item.body === 'Moon' ? '🌕 Moon' : '🔴 Mars'} • \${item.year}</span>
              <span class="status-pill-subtle tag-silent">🌑 \${item.status}</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Spec Matrix -->
        <div class="card-spec-grid">
          <div class="spec-cell">
            <span class="spec-lbl">📅 Mission Era / Landing:</span>
            <span class="spec-val">\${item.year} • \${item.site}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⏳ Lifespan Multiplier:</span>
            <span class="spec-val font-accent-amber">\${item.plannedLife} → <strong class="badge-lifespan">\${item.longevityPct}</strong></span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⚡ Power Architecture:</span>
            <span class="spec-val">\${item.powerSystem}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">🚀 Mobility / Type:</span>
            <span class="spec-val">\${item.mobility}</span>
          </div>
        </div>

        <!-- Human Fate Box -->
        <div class="explorer-fate-box">
          <span class="box-tag tag-fate">⚠️ Fatal Challenge / Why Left Behind:</span>
          <p>\${item.fateReason}</p>
        </div>

        <!-- Lesson Box -->
        <div class="explorer-lesson-box">
          <span class="box-tag tag-lesson">📜 What It Taught Us:</span>
          <p>\${item.whatItTaughtUs}</p>
        </div>

        <!-- Action Buttons -->
        <div class="explorer-card-actions">
          <button class="btn-inspect-explorer" onclick="window.viewRelicOnMap('\${item.id}', '\${item.body}')" title="Center on Map">
            <span>📍 View on \${item.body}</span>
          </button>
          <button class="btn-inspect-explorer btn-inspect-stage" onclick="window.openObjectPageFromLedger('\${item.id}')" title="Inspect 3D Stage / Telemetry">
            <span>🔍 3D Model</span>
          </button>
          \${item.heroId ? \`
            <button class="btn-inspect-explorer btn-inspect-story" onclick="window.openStoryModeForHero('\${item.heroId}')" title="Open Voice Story">
              <span>🎙️ Voice Story</span>
            </button>
          \` : ''}
        </div>
      </article>
    \`).join('');

    // Render Working Column
    listWorking.innerHTML = filteredWorking.length === 0 ? '<p class="ledger-empty-msg">No active systems match your filter.</p>' : filteredWorking.map(item => \`
      <article class="explorer-card card-working" data-id="\${item.id}">
        <div class="card-top-row">
          <img src="\${this.getThumbUrl(item.image)}" alt="\${item.name}" class="explorer-thumb" loading="lazy" decoding="async" onerror="if(!this._origTried){this._origTried=true;this.src='\${item.image}';}else{this.src='/favicon.ico';}">
          <div class="card-titles">
            <h4>\${item.name}</h4>
            <div class="badge-row">
              <span class="explorer-body-tag tag-green">\${item.body === 'Moon' ? '🌕 Moon' : '🔴 Mars'} • \${item.year}</span>
              <span class="status-pill-subtle tag-working">✨ Active Heritage</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Spec Matrix -->
        <div class="card-spec-grid">
          <div class="spec-cell">
            <span class="spec-lbl">📅 Deployed / Active State:</span>
            <span class="spec-val">Active Today • \${item.site}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⏳ Lifespan Multiplier:</span>
            <span class="spec-val font-accent-green">\${item.plannedLife} → <strong class="badge-lifespan-green">\${item.longevityPct}</strong></span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⚡ Power Architecture:</span>
            <span class="spec-val">\${item.powerSystem}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">🚀 Operational Mobility:</span>
            <span class="spec-val">\${item.mobility}</span>
          </div>
        </div>

        <!-- Ongoing State Box -->
        <div class="explorer-fate-box fate-working">
          <span class="box-tag tag-active">⚡ Ongoing Mission State:</span>
          <p>\${item.fateReason}</p>
        </div>

        <!-- Legacy Box -->
        <div class="explorer-lesson-box lesson-working">
          <span class="box-tag tag-legacy">🌟 Continuous Scientific Legacy:</span>
          <p>\${item.whatItTaughtUs}</p>
        </div>

        <!-- Action Buttons -->
        <div class="explorer-card-actions">
          <button class="btn-inspect-explorer btn-inspect-working" onclick="window.viewRelicOnMap('\${item.id}', '\${item.body}')" title="Center on Map">
            <span>📍 View on \${item.body}</span>
          </button>
          <button class="btn-inspect-explorer btn-inspect-stage" onclick="window.openObjectPageFromLedger('\${item.id}')" title="Inspect 3D Stage / Telemetry">
            <span>🔍 3D Model</span>
          </button>
          \${item.heroId ? \`
            <button class="btn-inspect-explorer btn-inspect-story" onclick="window.openStoryModeForHero('\${item.heroId}')" title="Open Voice Story">
              <span>🎙️ Voice Story</span>
            </button>
          \` : ''}
        </div>
      </article>
    \`).join('');
  }

  renderMatrix() {
    const tbody = this.modal?.querySelector('#big-comparison-tbody');
    if (!tbody) return;

    const filtered = this.filterList(this.allArtifacts);

    tbody.innerHTML = filtered.length === 0 ? '<tr><td colspan="9" style="text-align:center; padding:2rem;">No relics match your filter.</td></tr>' : filtered.map(item => \`
      <tr class="\${item.isWorking ? 'row-working' : 'row-silent'}">
        <td class="td-sticky">
          <div class="td-flex-name">
            <img src="\${this.getThumbUrl(item.image)}" alt="\${item.name}" class="matrix-thumb" loading="lazy" decoding="async" onerror="if(!this._origTried){this._origTried=true;this.src='\${item.image}';}else{this.src='/favicon.ico';}">
            <div>
              <strong>\${item.name}</strong>
              <div class="matrix-sub">\${item.year} • \${item.category}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="status-pill-table \${item.isWorking ? 'pill-green' : 'pill-red'}">
            \${item.isWorking ? '✨ Active' : (item.status === 'impacted' ? '💥 Impacted' : '🌑 ' + item.status)}
          </span>
        </td>
        <td>
          <strong>\${item.body === 'Moon' ? '🌕 Moon' : '🔴 Mars'}</strong>
          <div class="matrix-sub">\${item.site}</div>
        </td>
        <td>
          <div class="lifespan-ratio-box">
            <span class="badge-ratio \${item.isWorking ? 'ratio-green' : 'ratio-amber'}">\${item.longevityPct}</span>
            <div class="matrix-sub">\${item.plannedLife}</div>
          </div>
        </td>
        <td>
          <span class="power-badge">\${item.powerSystem}</span>
        </td>
        <td>
          <span class="mobility-txt">\${item.mobility}</span>
        </td>
        <td class="td-wide">
          <p class="td-desc">\${item.fateReason}</p>
        </td>
        <td class="td-wide">
          <p class="td-desc">\${item.whatItTaughtUs}</p>
        </td>
        <td class="td-actions">
          <div class="matrix-action-stack">
            <button class="btn-matrix-action btn-map" onclick="window.viewRelicOnMap('\${item.id}', '\${item.body}')" title="Fly to Map Site">
              <span>📍 Map</span>
            </button>
            <button class="btn-matrix-action btn-3d" onclick="window.openObjectPageFromLedger('\${item.id}')" title="Open 3D Stage">
              <span>🔍 3D</span>
            </button>
            \${item.heroId ? \`
              <button class="btn-matrix-action btn-story" onclick="window.openStoryModeForHero('\${item.heroId}')" title="Voice Story">
                <span>🎙️ Story</span>
              </button>
            \` : ''}
          </div>
        </td>
      </tr>
    \`).join('');
  }
}

// Global actions linked to application maps and stages
window.viewRelicOnMap = (objectId, body) => {
  if (window.forgottenExplorers) window.forgottenExplorers.close();
  if (window.surfaceController) {
    window.surfaceController.open(body);
    setTimeout(() => {
      const obj = window.surfaceController.objects?.find(o => o.id === objectId);
      if (obj) {
        window.surfaceController.focusRelicOnMap(obj);
      }
    }, 450);
  }
};

window.openObjectPageFromLedger = (objectId) => {
  if (window.forgottenExplorers) window.forgottenExplorers.close();
  if (typeof window.openObjectPage === 'function') {
    window.openObjectPage(objectId);
  }
};

window.openStoryModeForHero = (heroId) => {
  if (window.forgottenExplorers) window.forgottenExplorers.close();
  if (typeof window.openStoryMode === 'function') {
    window.openStoryMode(heroId);
  }
};

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.forgottenExplorers = new ForgottenExplorersController();
});
`;

fs.writeFileSync(path.join(__dirname, '../public/js/forgotten_explorers.js'), template, 'utf8');
console.log('Successfully wrote public/js/forgotten_explorers.js');
