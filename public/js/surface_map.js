/**
 * Space Archaeologists - Surface Map Controller
 * Integrates Leaflet.js with NASA Moon Trek and Mars Trek tile services,
 * complete with:
 *  - Chronological Timeline Slider starting synchronously at 1966
 *  - Strict body-only filtering and milestones (Bug a fix)
 *  - Synchronous slider handle and year label matching (Bug b fix)
 *  - Site Pin Grouping (e.g. Apollo 15, Jezero Crater) with multi-relic popups
 *  - MarkerClusterGroup zoom clustering
 *  - Category pill filter & real-time search box
 *  - Full offline localStorage caching
 */

class SurfaceMapController {
  constructor() {
    this.map = null;
    this.currentBody = null; // 'Moon' or 'Mars'
    this.clusterGroup = null;
    this.tileLayer = null;
    this.objects = []; // All objects for the current body
    this.siteGroups = {}; // Keyed by site name -> { siteName, lat, lon, objects: [], marker: null }

    // Timeline state (Bug b: starts strictly at 1966)
    this.currentYear = 1966;
    this.minYear = 1966;
    this.maxYear = 2026;
    this.isPlaying = false;
    this.playInterval = null;

    // Filter & Search state
    this.selectedCategory = 'all';
    this.searchQuery = '';

    // Relic Tray Persistent Cache
    this.trayRenderedBody = null;
    this.trayCardsMap = new Map();

    this.tileConfigs = {
      'Moon': {
        name: 'The Moon (Luna)',
        url: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/1.0.0//default/default028mm/{z}/{y}/{x}.jpg',
        attribution: '&copy; NASA / GSFC / Arizona State University (LROC)',
        defaultCenter: [13.4, 13.5], // Centered nicely between Apollo 11 & Apollo 15
        defaultZoom: 3,
        minZoom: 1,
        maxZoom: 7,
        accentColor: '#cbd5e1'
      },
      'Mars': {
        name: 'Mars (The Red Planet)',
        url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg',
        attribution: '&copy; NASA / JPL / USGS (Viking MDIM21 Color Mosaic)',
        defaultCenter: [10.0, 40.0], // Centered between Jezero Crater and Meridiani
        defaultZoom: 3,
        minZoom: 1,
        maxZoom: 7,
        accentColor: '#ff5722'
      }
    };

    this.bodyMilestones = {
      'Moon': [
        { year: 1966, label: "'66 Surveyor 1", title: 'Surveyor 1 Soft Landing (1966)' },
        { year: 1969, label: "'69 Apollo 11", title: 'Apollo 11 First Human Landing (1969)' },
        { year: 1971, label: "'71 Apollo 15 LRV", title: 'Apollo 15 Lunar Rover Deployed (1971)' },
        { year: 1972, label: "'72 Apollo 17", title: 'Apollo 17 Final Human Mission (1972)' },
        { year: 2009, label: "'09 LCROSS", title: 'LCROSS Water Discovery Impact (2009)' },
        { year: 2012, label: "'12 GRAIL", title: 'GRAIL Twin Probes Impact (2012)' },
        { year: 2014, label: "'14 LADEE", title: 'LADEE Dust Probe Impact (2014)' }
      ],
      'Mars': [
        { year: 1976, label: "'76 Viking 1", title: 'Viking 1 First US Landing (1976)' },
        { year: 1997, label: "'97 Pathfinder", title: 'Pathfinder & Sojourner (1997)' },
        { year: 2004, label: "'04 Spirit & Opp", title: 'Spirit & Opportunity Rovers (2004)' },
        { year: 2008, label: "'08 Phoenix", title: 'Phoenix Mars Lander (2008)' },
        { year: 2012, label: "'12 Curiosity EDL", title: 'Curiosity Entry Hardware (2012)' },
        { year: 2018, label: "'18 InSight", title: 'InSight Lander (2018)' },
        { year: 2021, label: "'21 Jezero EDL", title: 'Perseverance EDL & Ingenuity (2021)' }
      ]
    };

    this.init();
  }

  init() {
    this.setupViewElements();
    this.bindEvents();
    this.bindTimelineEvents();
    this.bindSearchAndCategoryEvents();
  }

  setupViewElements() {
    this.surfaceScreen = document.getElementById('surface-screen');
    this.backBtn = document.getElementById('btn-back-to-solar');
    this.bodyTitle = document.getElementById('surface-body-title');
    this.bodySubtitle = document.getElementById('surface-body-subtitle');
    this.relicCountBadge = document.getElementById('surface-relic-count');
    this.switchMoonBtn = document.getElementById('btn-switch-moon');
    this.switchMarsBtn = document.getElementById('btn-switch-mars');

    // Timeline Elements
    this.timelineSlider = document.getElementById('timeline-slider');
    this.timelineYearVal = document.getElementById('timeline-year-val');
    this.timelineEraText = document.getElementById('timeline-era-text');
    this.timelinePlayBtn = document.getElementById('btn-timeline-play');
    this.milestonesContainer = document.getElementById('timeline-milestones');

    // Search and Category Elements
    this.searchInput = document.getElementById('surface-search');
    this.clearSearchBtn = document.getElementById('btn-clear-search');
    this.categoryPills = document.querySelectorAll('#category-pills .cat-pill');
  }

  bindEvents() {
    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => this.returnToSolarSystem());
    }

    if (this.switchMoonBtn) {
      this.switchMoonBtn.addEventListener('click', () => this.loadBody('Moon'));
    }

    if (this.switchMarsBtn) {
      this.switchMarsBtn.addEventListener('click', () => this.loadBody('Mars'));
    }

    // Listen to solar system navigation events
    window.addEventListener('open-surface-map', (e) => {
      if (e.detail && e.detail.body) {
        this.open(e.detail.body);
      }
    });
  }

  bindTimelineEvents() {
    if (this.timelineSlider) {
      // Synchronous update on both input (dragging) and change
      const updateFromSlider = (e) => {
        this.pauseTimeline();
        const yr = parseInt(e.target.value, 10);
        this.setTimelineYear(yr);
      };
      this.timelineSlider.addEventListener('input', updateFromSlider);
      this.timelineSlider.addEventListener('change', updateFromSlider);
    }

    if (this.timelinePlayBtn) {
      this.timelinePlayBtn.addEventListener('click', () => {
        this.toggleTimelinePlay();
      });
    }
  }

  bindSearchAndCategoryEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        if (this.clearSearchBtn) {
          this.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.filterSites();
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        if (this.searchInput) this.searchInput.value = '';
        this.searchQuery = '';
        this.clearSearchBtn.style.display = 'none';
        this.filterSites();
      });
    }

    if (this.categoryPills) {
      this.categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
          this.categoryPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.selectedCategory = pill.getAttribute('data-category') || 'all';
          this.filterSites();
        });
      });
    }
  }

  renderMilestones(bodyName) {
    if (!this.milestonesContainer) return;
    this.milestonesContainer.innerHTML = '';

    const list = this.bodyMilestones[bodyName] || [];
    list.forEach(m => {
      const btn = document.createElement('span');
      btn.className = 'milestone-dot';
      btn.setAttribute('data-year', m.year);
      btn.title = m.title;
      btn.textContent = m.label;
      btn.addEventListener('click', () => {
        this.pauseTimeline();
        this.setTimelineYear(m.year);
      });
      this.milestonesContainer.appendChild(btn);
    });
  }

  async open(bodyName) {
    if (!this.surfaceScreen) return;
    this.surfaceScreen.classList.add('active');

    // Hide solar system canvas from interaction while surface map is open
    const spaceCanvas = document.getElementById('space-canvas');
    if (spaceCanvas) spaceCanvas.style.pointerEvents = 'none';

    await this.loadBody(bodyName);
  }

  returnToSolarSystem() {
    this.pauseTimeline();
    if (this.surfaceScreen) {
      this.surfaceScreen.classList.remove('active');
    }
    const spaceCanvas = document.getElementById('space-canvas');
    if (spaceCanvas) spaceCanvas.style.pointerEvents = 'auto';

    if (window.solarNav) {
      window.solarNav.resetView();
    }
  }

  async loadBody(bodyName) {
    this.pauseTimeline();
    this.currentBody = bodyName;
    const config = this.tileConfigs[bodyName];
    if (!config) return;

    // Reset Search & Category
    this.selectedCategory = 'all';
    this.searchQuery = '';
    if (this.searchInput) this.searchInput.value = '';
    if (this.clearSearchBtn) this.clearSearchBtn.style.display = 'none';
    if (this.categoryPills) {
      this.categoryPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-category') === 'all');
      });
    }

    // BUG B FIX: Reset timeline slider strictly to 1966 with handle at left
    this.currentYear = 1966;
    if (this.timelineSlider) this.timelineSlider.value = 1966;
    this.updateTimelineUI(1966);

    // BUG A FIX: Render body-only milestones
    this.renderMilestones(bodyName);

    // Update header UI
    if (this.bodyTitle) this.bodyTitle.textContent = config.name;
    if (this.switchMoonBtn && this.switchMarsBtn) {
      this.switchMoonBtn.classList.toggle('active', bodyName === 'Moon');
      this.switchMarsBtn.classList.toggle('active', bodyName === 'Mars');
    }

    // Initialize Leaflet map if not created yet
    if (!this.map) {
      this.map = L.map('leaflet-map', {
        center: config.defaultCenter,
        zoom: config.defaultZoom,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        attributionControl: true,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(this.map);

      // Create MarkerClusterGroup for clean zoom clustering
      if (typeof L.markerClusterGroup === 'function') {
        this.clusterGroup = L.markerClusterGroup({
          maxClusterRadius: 45,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        });
      } else {
        this.clusterGroup = L.layerGroup();
      }
      this.map.addLayer(this.clusterGroup);
    } else {
      this.map.setView(config.defaultCenter, config.defaultZoom);
    }

    // Update base tile layer
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    const tileStatusLabel = document.getElementById('tile-status-label');
    const tileStatusPill = document.getElementById('surface-tile-status');

    this.tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      noWrap: false,
      maxZoom: config.maxZoom,
      minZoom: config.minZoom,
      bounds: [[-90, -180], [90, 180]]
    });

    this.tileLayer.on('loading', () => {
      if (tileStatusLabel) tileStatusLabel.textContent = `Streaming NASA ${bodyName} Trek Tiles...`;
      if (tileStatusPill) tileStatusPill.classList.add('streaming');
    });

    this.tileLayer.on('load', () => {
      if (tileStatusLabel) tileStatusLabel.textContent = `NASA ${bodyName} Trek Active`;
      if (tileStatusPill) tileStatusPill.classList.remove('streaming');
    });

    this.tileLayer.addTo(this.map);

    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast(`Orbit reached! Streaming high-resolution NASA ${bodyName} Trek mosaic.`, '🛰️', 3000);
    }

    // Fetch artifacts for this body and group by site
    await this.fetchAndGroupArtifacts(bodyName);

    // Apply current filter (1966 initial state)
    this.filterSites();

    // Invalidate map size
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 200);
  }

  async fetchAndGroupArtifacts(bodyName) {
    if (!this.clusterGroup) return;
    this.clusterGroup.clearLayers();
    this.siteGroups = {};

    const cacheKey = `nasa_objects_${bodyName}`;
    let loadedObjects = null;

    try {
      const res = await fetch(`/api/objects?body=${encodeURIComponent(bodyName)}`);
      if (res.ok) {
        loadedObjects = await res.json();
      }
    } catch (err) {
      console.warn(`Primary API fetch failed for ${bodyName}:`, err);
    }

    // Fail-safe 1: Try local static dataset file
    if (!loadedObjects || loadedObjects.length === 0) {
      try {
        const staticRes = await fetch('/data/objects.json');
        if (staticRes.ok) {
          const allData = await staticRes.json();
          loadedObjects = allData.filter(o => (o.body || '').toLowerCase() === bodyName.toLowerCase());
          console.log(`Loaded ${loadedObjects.length} relics from static /data/objects.json fallback`);
        }
      } catch (staticErr) {
        console.warn('Static data fetch failed:', staticErr);
      }
    }

    // Fail-safe 2: Try localStorage
    if (!loadedObjects || loadedObjects.length === 0) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          loadedObjects = JSON.parse(cached);
        } else {
          const allCached = localStorage.getItem('nasa_objects_all');
          if (allCached) {
            const all = JSON.parse(allCached);
            loadedObjects = all.filter(o => (o.body || '').toLowerCase() === bodyName.toLowerCase());
          }
        }
      } catch (cacheErr) {
        console.error('Offline cache retrieval error:', cacheErr);
      }
    }

    // Cache locally if successfully retrieved
    if (loadedObjects && loadedObjects.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(loadedObjects));
      } catch (e) {}
    }

    this.objects = loadedObjects || [];

    // Group objects by landing site
    this.objects.forEach((obj) => {
      const siteKey = obj.site || `${obj.name} Site`;
      let lon = obj.lon;
      if (lon > 180) lon = lon - 360;
      const lat = obj.lat;

      if (!this.siteGroups[siteKey]) {
        this.siteGroups[siteKey] = {
          siteName: siteKey,
          lat: lat,
          lon: lon,
          objects: [],
          marker: null
        };
      }
      this.siteGroups[siteKey].objects.push(obj);
    });

    // Create a custom site pin marker for each unique site
    const bounds = [];
    Object.keys(this.siteGroups).forEach(siteKey => {
      const group = this.siteGroups[siteKey];
      bounds.push([group.lat, group.lon]);

      // Determine dominant position type for marker styling
      const posTypes = group.objects.map(o => o.position_type || 'landing_site');
      const dominantType = posTypes.includes('last_known_position') ? 'last_known' :
                           posTypes.includes('impact_site') ? 'impact_site' : 'landing_site';
      const pinTypeClass = `pin-${dominantType.replace('_', '-')}`;
      const markerIcon = dominantType === 'last_known' ? '📍' :
                         dominantType === 'impact_site' ? '💥' :
                         (bodyName === 'Moon' ? '🚀' : '🤖');
      const markerLabel = `${group.siteName}: ${group.objects.length} artifact${group.objects.length > 1 ? 's' : ''}, ${dominantType.replace(/_/g, ' ')}`;

      // Custom Site Marker Icon
      const siteIcon = L.divIcon({
        className: 'custom-relic-pin-container',
        html: `
          <div class="site-group-pin ${bodyName === 'Moon' ? 'pin-moon' : 'pin-mars'} ${pinTypeClass}" id="marker-site-${encodeURIComponent(siteKey)}"
               tabindex="0" role="button" aria-label="${markerLabel}">
            <div class="site-pulse"></div>
            <div class="site-core">
              <span class="site-icon">${markerIcon}</span>
            </div>
            <div class="site-count-badge" id="badge-site-${encodeURIComponent(siteKey)}">${group.objects.length}</div>
            <div class="site-label-preview">
              <span class="site-preview-name">${group.siteName}</span>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([group.lat, group.lon], { icon: siteIcon });

      // Group Marker Click: Opens Multi-Relic List Popup
      marker.on('click', () => {
        this.openSitePopup(group, marker);
      });

      marker.bindTooltip(`<b>${group.siteName}</b><br><span style="opacity:0.8; font-size:0.85em;">${group.objects.length} relic${group.objects.length > 1 ? 's' : ''} at site</span>`, {
        direction: 'top',
        offset: [0, -22],
        className: 'custom-pin-tooltip'
      });

      group.marker = marker;
    });

    if (bounds.length > 0) {
      if (bounds.length === 1) {
        this.map.setView(bounds[0], 5);
      } else {
        this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 5 });
      }
    }
  }

  openSitePopup(siteGroup, marker) {
    // Filter objects currently matching active timeline year, category, and search
    const matchingObjects = siteGroup.objects.filter(obj => this.isObjectActive(obj));
    if (matchingObjects.length === 0) return;

    let itemsHtml = '';
    matchingObjects.forEach(obj => {
      itemsHtml += `
        <div class="site-popup-item">
          <img src="${obj.image}" alt="${obj.name}" class="site-item-thumb" onerror="this.src='/favicon.ico'">
          <div class="site-item-info">
            <div class="site-item-meta">${obj.mission} • ${obj.year}</div>
            <div class="site-item-name" title="${obj.name}">${obj.name}</div>
          </div>
          <div class="site-item-btns">
            <button class="site-item-cta" onclick="window.openObjectPage('${obj.id}')" title="Inspect 3D model & archaeological story">
              <span>🔍 3D Inspect</span>
            </button>
            <button class="site-item-cta btn-popup-story" onclick="window.launchStoryForObject('${obj.id}')" title="Enter Voice Storytelling Room">
              <span>🎙️ Story</span>
            </button>
          </div>
        </div>
      `;
    });

    const popupHtml = `
      <div class="site-popup-card">
        <div class="site-popup-header">
          <span class="site-popup-tag">📍 Site Telemetry</span>
          <h3 class="site-popup-title">${siteGroup.siteName}</h3>
          <span style="font-size:0.75rem; color:#94a3b8;">${matchingObjects.length} relic${matchingObjects.length > 1 ? 's' : ''} currently discovered</span>
        </div>
        <div class="site-popup-list">
          ${itemsHtml}
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      className: 'custom-leaflet-popup',
      maxWidth: 340,
      closeButton: true
    }).openPopup();
  }

  isObjectActive(obj) {
    // 1. Timeline year check
    if (obj.year > this.currentYear) return false;

    // 2. Category check
    if (this.selectedCategory !== 'all') {
      const cat = (obj.category || '').toLowerCase();
      if (cat !== this.selectedCategory.toLowerCase()) return false;
    }

    // 3. Search query check
    if (this.searchQuery) {
      const q = this.searchQuery;
      const haystack = `${obj.name} ${obj.mission} ${obj.category} ${obj.what} ${obj.where} ${obj.site || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  }

  /* ================= TIMELINE SLIDER & PLAY ENGINE ================= */
  toggleTimelinePlay() {
    if (this.isPlaying) {
      this.pauseTimeline();
    } else {
      this.startTimelinePlay();
    }
  }

  startTimelinePlay() {
    this.isPlaying = true;
    if (this.timelinePlayBtn) {
      this.timelinePlayBtn.innerHTML = '<span class="play-icon">⏸</span> <span class="play-text">Pause</span>';
      this.timelinePlayBtn.classList.add('playing');
    }

    // If at end, restart from 1966
    if (this.currentYear >= this.maxYear) {
      this.currentYear = this.minYear;
      if (this.timelineSlider) this.timelineSlider.value = this.minYear;
      this.setTimelineYear(this.minYear);
    }

    // Step forward 1 year every 280ms
    this.playInterval = setInterval(() => {
      if (this.currentYear < this.maxYear) {
        this.currentYear += 1;
        // BUG B FIX: Keep slider value and year label always synchronized
        if (this.timelineSlider) this.timelineSlider.value = this.currentYear;
        this.setTimelineYear(this.currentYear);
      } else {
        this.pauseTimeline();
      }
    }, 280);
  }

  pauseTimeline() {
    this.isPlaying = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    if (this.timelinePlayBtn) {
      this.timelinePlayBtn.innerHTML = '<span class="play-icon">▶</span> <span class="play-text">Play</span>';
      this.timelinePlayBtn.classList.remove('playing');
    }
  }

  setTimelineYear(year) {
    this.currentYear = year;
    this.updateTimelineUI(year);
    this.filterSites();
  }

  updateTimelineUI(year) {
    // BUG B: Handle position and year label match
    if (this.timelineYearVal) this.timelineYearVal.textContent = year;
    if (this.timelineEraText) this.timelineEraText.textContent = this.getEraDescription(year);
  }

  getEraDescription(year) {
    if (this.currentBody === 'Moon') {
      if (year < 1969) return 'Surveyor & Lunar Robotic Probes';
      if (year === 1969) return 'Apollo 11: Humanity Lands on the Moon!';
      if (year <= 1972) return 'Apollo Lunar Expeditions & Rovers';
      if (year < 2009) return 'Apollo Lunar Archives Era';
      if (year < 2020) return 'LCROSS Water Discovery & LRO Mapping';
      return 'Artemis Program & Permanent Return to Moon';
    } else {
      if (year < 1976) return 'Pre-Landing Mariner Mars Flybys';
      if (year < 1997) return 'Viking 1 & 2 Landers in Chryse and Utopia';
      if (year < 2004) return 'Mars Pathfinder & Sojourner Exploration';
      if (year < 2012) return 'Spirit & Opportunity Mars Exploration Rovers';
      if (year < 2021) return 'Curiosity Rover Gale Crater Era';
      return 'Mars 2020: Perseverance & Ingenuity Helicopter';
    }
  }

  filterSites() {
    if (!this.clusterGroup) return;

    let activeRelicsCount = 0;
    const activeObjects = [];

    // Filter each site group
    Object.keys(this.siteGroups).forEach(siteKey => {
      const group = this.siteGroups[siteKey];
      const matchingObjects = group.objects.filter(obj => this.isObjectActive(obj));
      const hasMatchingRelics = matchingObjects.length > 0;
      const isCurrentlyOnMap = this.clusterGroup.hasLayer(group.marker);

      if (hasMatchingRelics) {
        activeRelicsCount += matchingObjects.length;
        activeObjects.push(...matchingObjects);

        // Update site badge number
        const markerEl = group.marker.getElement();
        if (markerEl) {
          const badge = markerEl.querySelector('.site-count-badge');
          if (badge) badge.textContent = matchingObjects.length;
        }

        if (!isCurrentlyOnMap) {
          this.clusterGroup.addLayer(group.marker);
        }
      } else {
        if (isCurrentlyOnMap) {
          this.clusterGroup.removeLayer(group.marker);
        }
      }
    });

    // BUG A FIX: The counter must read "X / N discarded relics" using only that body's objects
    const totalBodyCount = this.objects.length;
    if (this.relicCountBadge) {
      this.relicCountBadge.textContent = `${activeRelicsCount} / ${totalBodyCount} discarded relics`;
    }

    if (this.bodySubtitle) {
      if (activeRelicsCount === 0) {
        const firstArrivalYear = (this.currentBody === 'Moon') ? 1962 : 1976;
        const firstMission = (this.currentBody === 'Moon') ? 'Ranger 4 impacts in 1962 (Surveyor 1 in 1966)' : 'Viking 1 lands in 1976';
        this.bodySubtitle.textContent = `Year ${this.currentYear}: No hardware discarded on ${this.currentBody} yet! (${firstMission})`;
      } else {
        this.bodySubtitle.textContent = `Viewing ${activeRelicsCount} abandoned relic${activeRelicsCount === 1 ? '' : 's'} on ${this.currentBody} through ${this.currentYear}`;
      }
    }

    // Render bottom relic tray
    this.renderRelicTray(this.objects, this.currentYear);
  }

  jumpToYear(targetYear, relicName = '') {
    this.pauseTimeline();
    const yr = parseInt(targetYear, 10);
    if (this.timelineSlider) {
      this.timelineSlider.value = yr;
    }
    this.setTimelineYear(yr);
    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast(`⚡ Timeline advanced to ${yr}! ${relicName ? relicName + ' is now active on the map!' : 'Relics updated.'}`, '🚀', 3500);
    }
  }

  renderRelicTray(allObjects, currentYear) {
    let tray = document.getElementById('surface-relic-tray');
    if (!tray) {
      tray = document.createElement('div');
      tray.id = 'surface-relic-tray';
      tray.className = 'surface-relic-tray';
      if (this.surfaceScreen) {
        this.surfaceScreen.appendChild(tray);
      }
    }

    if (!tray) return;

    // Filter tray objects by category & search query
    const displayObjects = allObjects.filter(obj => {
      if (this.selectedCategory !== 'all') {
        const cat = (obj.category || '').toLowerCase();
        if (cat !== this.selectedCategory.toLowerCase()) return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery;
        const haystack = `${obj.name} ${obj.mission} ${obj.category} ${obj.what} ${obj.where} ${obj.site || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const activeCount = displayObjects.filter(o => o.year <= currentYear).length;
    const totalCount = displayObjects.length;

    // Safe SVG icon fallback for missing/slow imagery
    const fallbackSvgDataUri = 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2300e5ff%22%20stroke-width%3D%221.5%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%229%22%20stroke%3D%22%2338bdf8%22%20stroke-dasharray%3D%223%203%22%2F%3E%3Cpath%20d%3D%22M12%207v5l3%203%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%223%22%20fill%3D%22%2300e5ff%22%2F%3E%3Cpath%20d%3D%22M8%2017l-3%203m11-3l3%203%22%2F%3E%3C%2Fsvg%3E';

    // 1. Initial Build or Body Change: Construct DOM structure ONCE to preserve scroll & eliminate glitching
    if (this.trayRenderedBody !== this.currentBody || !tray.querySelector('.tray-cards')) {
      this.trayCardsMap = new Map();
      tray.innerHTML = '';

      const heading = document.createElement('div');
      heading.className = 'tray-header-row';
      heading.innerHTML = `
        <div class="tray-title-group">
          <span class="tray-title-icon">🛰️</span>
          <span class="tray-title-text">Discovered Relics on ${this.currentBody}</span>
          <span class="tray-year-pill" id="tray-year-pill">(${currentYear})</span>
          <span class="tray-count-pill" id="tray-count-pill">${activeCount} / ${totalCount} Discovered</span>
        </div>
        <div class="tray-nav-group">
          <span class="tray-scroll-hint">‹ Drag or Scroll Catalog ›</span>
          <button class="tray-nav-btn btn-tray-prev" title="Scroll Left" aria-label="Scroll left">‹</button>
          <button class="tray-nav-btn btn-tray-next" title="Scroll Right" aria-label="Scroll right">›</button>
        </div>
      `;
      tray.appendChild(heading);

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'tray-cards';

      allObjects.forEach((obj) => {
        const isLanded = (obj.year <= currentYear);
        const card = document.createElement('div');
        card.className = `tray-card ${isLanded ? 'active-relic' : 'locked-relic'}`;
        card.setAttribute('data-object-id', obj.id);

        const categoryTag = obj.category ? obj.category.toUpperCase() : 'RELIC';
        const modelBadge = obj.model_file ? '<span class="card-3d-badge">3D</span>' : '';

        card.innerHTML = `
          <div class="tray-card-top">
            <div class="tray-card-img">
              <img src="${obj.image}" alt="${obj.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvgDataUri}'">
              <div class="locked-overlay" style="display:${!isLanded ? 'flex' : 'none'};">
                <span class="lock-icon">🔒</span><span class="lock-year">${obj.year}</span>
              </div>
              ${modelBadge}
            </div>
            <div class="tray-card-info">
              <div class="tray-card-badge-row">
                <span class="tray-status-tag ${isLanded ? 'tag-active' : 'tag-locked'}">
                  ${isLanded ? '● ACTIVE' : '⏳ ' + obj.year}
                </span>
                <span class="tray-cat-tag">${categoryTag}</span>
              </div>
              <h4 class="tray-card-name" title="${obj.name}">${obj.name}</h4>
              <p class="tray-card-mission">${obj.mission || obj.site || obj.category}</p>
            </div>
          </div>
          <div class="tray-card-actions">
            ${isLanded 
              ? `<button class="tray-card-btn btn-inspect" title="Inspect 3D model, telemetry & mission stories">
                   <span>🔍 Inspect 3D Story</span>
                 </button>`
              : `<button class="tray-card-btn btn-fastforward" title="Jump timeline to ${obj.year} to land this relic">
                   <span>⚡ Jump to ${obj.year}</span>
                 </button>`
            }
          </div>
        `;

        // Card Click Handler with drag detection
        card.addEventListener('click', (e) => {
          if (cardsContainer._hasDragged && cardsContainer._hasDragged()) return;
          const isInspectBtn = e.target.closest('.btn-inspect');
          const isJumpBtn = e.target.closest('.btn-fastforward');

          if (isInspectBtn) {
            e.stopPropagation();
            if (typeof window.openObjectPage === 'function') {
              window.openObjectPage(obj.id);
            }
          } else if (isJumpBtn) {
            e.stopPropagation();
            this.jumpToYear(obj.year, obj.name);
          } else {
            // Clicking card body focuses and flies to relic on map!
            if (obj.year <= this.currentYear) {
              this.focusRelicOnMap(obj);
            } else {
              this.jumpToYear(obj.year, obj.name);
            }
          }
        });

        // Hover highlight on map marker
        card.addEventListener('mouseenter', () => this.highlightMarkerOnMap(obj, true));
        card.addEventListener('mouseleave', () => this.highlightMarkerOnMap(obj, false));

        this.trayCardsMap.set(obj.id, card);
        cardsContainer.appendChild(card);
      });

      // Kinetic Drag-to-Scroll support
      this.setupTrayDragScroll(cardsContainer);

      // Scroll navigation buttons
      const prevBtn = heading.querySelector('.btn-tray-prev');
      const nextBtn = heading.querySelector('.btn-tray-next');
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          cardsContainer.scrollBy({ left: -320, behavior: 'smooth' });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          cardsContainer.scrollBy({ left: 320, behavior: 'smooth' });
        });
      }

      // Mouse wheel horizontal scroll support
      cardsContainer.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          cardsContainer.scrollLeft += e.deltaY;
        }
      }, { passive: false });

      tray.appendChild(cardsContainer);
      this.trayRenderedBody = this.currentBody;
    }

    // 2. Incremental Smooth Update: Update status without DOM rebuild or scroll position reset
    const yearPill = tray.querySelector('#tray-year-pill');
    const countPill = tray.querySelector('#tray-count-pill');
    if (yearPill) yearPill.textContent = `(${currentYear})`;
    if (countPill) countPill.textContent = `${activeCount} / ${totalCount} Discovered`;

    allObjects.forEach(obj => {
      const card = this.trayCardsMap.get(obj.id);
      if (!card) return;

      // Filter check
      const matches = displayObjects.some(o => o.id === obj.id);
      card.style.display = matches ? 'flex' : 'none';

      // State check
      const isLanded = (obj.year <= currentYear);
      const wasLanded = card.classList.contains('active-relic');

      if (isLanded !== wasLanded) {
        card.classList.toggle('active-relic', isLanded);
        card.classList.toggle('locked-relic', !isLanded);

        const statusTag = card.querySelector('.tray-status-tag');
        if (statusTag) {
          statusTag.className = `tray-status-tag ${isLanded ? 'tag-active' : 'tag-locked'}`;
          statusTag.textContent = isLanded ? '● ACTIVE' : `⏳ ${obj.year}`;
        }

        const lockedOverlay = card.querySelector('.locked-overlay');
        if (lockedOverlay) {
          lockedOverlay.style.display = !isLanded ? 'flex' : 'none';
        }

        const actionsBox = card.querySelector('.tray-card-actions');
        if (actionsBox) {
          actionsBox.innerHTML = isLanded
            ? `<button class="tray-card-btn btn-inspect" title="Inspect 3D model, telemetry & mission stories">
                 <span>🔍 Inspect 3D Story</span>
               </button>`
            : `<button class="tray-card-btn btn-fastforward" title="Jump timeline to ${obj.year} to land this relic">
                 <span>⚡ Jump to ${obj.year}</span>
               </button>`;
        }
      }
    });
  }

  setupTrayDragScroll(container) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    container.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDown = true;
      hasDragged = false;
      container.classList.add('grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('grabbing');
      setTimeout(() => { hasDragged = false; }, 80);
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.6;
      if (Math.abs(walk) > 5) {
        hasDragged = true;
      }
      container.scrollLeft = scrollLeft - walk;
    });

    container._hasDragged = () => hasDragged;
  }

  focusRelicOnMap(obj) {
    if (!this.map) return;
    this.map.flyTo([obj.lat, obj.lon], Math.max(this.map.getZoom(), 4), { duration: 0.8 });

    // Open popup for this relic
    const siteKey = obj.site || `${obj.lat.toFixed(1)},${obj.lon.toFixed(1)}`;
    const group = this.siteGroups[siteKey] || Object.values(this.siteGroups).find(g => g.objects.some(o => o.id === obj.id));
    if (group && group.marker) {
      if (this.clusterGroup.hasLayer(group.marker)) {
        setTimeout(() => group.marker.openPopup(), 450);
      }
    }

    // Visual card pulse
    const card = this.trayCardsMap?.get(obj.id);
    if (card) {
      document.querySelectorAll('.tray-card').forEach(c => c.classList.remove('focused-relic'));
      card.classList.add('focused-relic');
    }

    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast(`📍 Focused on ${obj.name} in ${obj.site || obj.body}`, '🛰️', 2500);
    }
  }

  highlightMarkerOnMap(obj, isHover) {
    const siteKey = obj.site || `${obj.lat.toFixed(1)},${obj.lon.toFixed(1)}`;
    const group = this.siteGroups[siteKey] || Object.values(this.siteGroups).find(g => g.objects.some(o => o.id === obj.id));
    if (group && group.marker) {
      const el = group.marker.getElement();
      if (el) {
        el.classList.toggle('marker-tray-hover', isHover);
      }
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const surfaceController = new SurfaceMapController();
  window.surfaceController = surfaceController;

  window.openObjectPage = (objectId) => {
    console.log(`Opening object page for: ${objectId}`);
    window.dispatchEvent(new CustomEvent('open-object-page', { detail: { id: objectId } }));
  };

  window.launchStoryForObject = (objectId) => {
    let hero = 'opportunity';
    if (objectId.includes('apollo')) hero = 'apollo11';
    else if (objectId.includes('perseverance') || objectId.includes('ingenuity')) hero = 'perseverance';
    else if (objectId.includes('opportunity') || objectId.includes('spirit')) hero = 'opportunity';
    
    if (typeof window.openStoryMode === 'function') {
      window.openStoryMode(hero);
    }
  };

  // Support direct URL parameters for deep-linking (e.g. ?body=Moon or ?body=Mars or ?object=...)
  const params = new URLSearchParams(window.location.search);
  const bodyParam = params.get('body');
  if (bodyParam) {
    const formatted = bodyParam.charAt(0).toUpperCase() + bodyParam.slice(1).toLowerCase();
    if (formatted === 'Moon' || formatted === 'Mars') {
      setTimeout(() => surfaceController.open(formatted), 100);
    }
  }

  const objParam = params.get('object') || params.get('id');
  if (objParam) {
    setTimeout(() => window.openObjectPage(objParam), 300);
  }
});
