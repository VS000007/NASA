/**
 * Space Archaeologists - Forgotten Explorers vs Still Working For Us View
 * Implements:
 *  - Left: Silent, lost, and crashed hardware with last-contact dates, power specs, & "what it taught us"
 *  - Right: Still working for us (reflectors, active rovers, helicopter telemetry)
 *  - Big Comparison Matrix: Interactive head-to-head table comparing Lifespan Multipliers, Power Architecture, Mobility, and Heritage
 *  - Smooth Hardware-Accelerated Scrolling with custom space scrollbars and zero lag
 *  - Body Filter: All / Moon / Mars
 *  - Custom Hardware-Accelerated Space Scrollbars (Zero white bar jank)
 */

class ForgottenExplorersController {
  constructor() {
    this.modal = null;
    this.currentView = 'cards'; // 'cards' | 'matrix'
    this.currentFilter = 'all';  // 'all' | 'Moon' | 'Mars'

    this.silentHeroes = [
      {
        id: 'opportunity-rover',
        heroId: 'opportunity',
        name: 'Opportunity Rover (MER-B)',
        body: 'Mars',
        site: 'Perseverance Valley (Endeavour Crater)',
        launchDate: 'July 7, 2003',
        landingDate: 'Jan 25, 2004',
        lastContact: 'June 10, 2018 (Sol 5,111)',
        status: 'Silent in Perseverance Valley',
        statusType: 'silent',
        plannedLife: '90 Sols (3 Months)',
        actualLife: '5,111 Sols (14.5 Earth Years)',
        longevityPct: '5,678%',
        powerSystem: 'Triple-Junction Solar Arrays (140W Peak)',
        mobility: '45.16 km (28.06 mi) — Off-World Marathon Record',
        fateReason: 'Catastrophic 2018 global dust storm (Tau > 10.8) choked solar arrays; final message: "My battery is low and it\'s getting dark."',
        whatItTaughtUs: 'Discovered hematite blueberries and sulfate rock beds, proving ancient Mars had warm, standing liquid water lakes that lasted millions of years.',
        heritageStatus: 'Protected Off-World Archaeological Monument',
        has3D: true,
        hasStory: true,
        image: 'https://images-assets.nasa.gov/image/PIA18593/PIA18593~medium.jpg'
      },
      {
        id: 'spirit-rover',
        heroId: null,
        name: 'Spirit Rover (MER-A)',
        body: 'Mars',
        site: 'Troy Sand Trap (Columbia Hills, Gusev)',
        launchDate: 'June 10, 2003',
        landingDate: 'Jan 4, 2004',
        lastContact: 'March 22, 2010 (Sol 2,210)',
        status: 'Silent in Troy Sand Trap',
        statusType: 'silent',
        plannedLife: '90 Sols (3 Months)',
        actualLife: '2,210 Sols (6.2 Earth Years)',
        longevityPct: '2,455%',
        powerSystem: 'Solar Arrays with Martian Wind Cleaning',
        mobility: '7.73 km (4.80 mi) Across Columbia Hills',
        fateReason: 'Right-front drive wheel failed; trapped in soft sulfate sand at Troy; unable to angle solar panels toward the low winter sun.',
        whatItTaughtUs: 'Its stuck wheel dragged backwards, accidentally scraping open 90% pure silica deposits—irrefutable evidence of past volcanic hot springs and hydrothermal vents!',
        heritageStatus: 'Protected Historic Exploration Site',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA04443/PIA04443~medium.jpg'
      },
      {
        id: 'insight-lander',
        heroId: null,
        name: 'InSight Mars Lander',
        body: 'Mars',
        site: 'Elysium Planitia',
        launchDate: 'May 5, 2018',
        landingDate: 'Nov 26, 2018',
        lastContact: 'December 15, 2022 (Sol 1,440)',
        status: 'Silent in Elysium Planitia',
        statusType: 'silent',
        plannedLife: '709 Sols (1 Martian Year)',
        actualLife: '1,440 Sols (4 Earth Years)',
        longevityPct: '203%',
        powerSystem: 'Twin 2.15-meter UltraFlex Solar Arrays',
        mobility: 'Stationary Geophysical Observatory',
        fateReason: 'Persistent dust deposition reduced power generation from 5,000 Wh/day down to under 400 Wh/day, silencing its SEIS seismometer.',
        whatItTaughtUs: 'Detected 1,319+ marsquakes and mapped the interior layers of Mars for the first time, discovering a molten liquid core with an 1,830 km radius.',
        heritageStatus: 'NASA Planetary Science Landmark',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA22874/PIA22874~medium.jpg'
      },
      {
        id: 'phoenix-lander',
        heroId: null,
        name: 'Phoenix Mars Lander',
        body: 'Mars',
        site: 'Vastitas Borealis (Green Valley Arctic)',
        launchDate: 'Aug 4, 2007',
        landingDate: 'May 25, 2008',
        lastContact: 'November 2, 2008 (Sol 157)',
        status: 'Silent in Martian Arctic',
        statusType: 'silent',
        plannedLife: '90 Sols',
        actualLife: '157 Sols',
        longevityPct: '174%',
        powerSystem: 'Dual Circular Gallium Arsenide Solar Arrays',
        mobility: 'Stationary Arctic Trencher',
        fateReason: 'Sub-zero polar winter darkness and heavy carbon-dioxide ice (dry ice) buildup crushed the fragile solar arrays.',
        whatItTaughtUs: 'Scraped topsoil and directly photographed chunks of pure subsurface water ice that sublimated in daylight, proving shallow ice caps the Martian sub-surface.',
        heritageStatus: 'First Polar Landing Site',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA10745/PIA10745~medium.jpg'
      },
      {
        id: 'viking-1-lander',
        heroId: null,
        name: 'Viking 1 Lander (Thomas Mutch Station)',
        body: 'Mars',
        site: 'Chryse Planitia ("Plains of Gold")',
        launchDate: 'Aug 20, 1975',
        landingDate: 'July 20, 1976',
        lastContact: 'November 11, 1982',
        status: 'Silent in Chryse Planitia',
        statusType: 'silent',
        plannedLife: '90 Days',
        actualLife: '2,307 Days (6.3 Earth Years)',
        longevityPct: '2,563%',
        powerSystem: 'Dual SNAP-19 Radioisotope Generators (RTG)',
        mobility: 'Stationary Surface Laboratory',
        fateReason: 'Accidental software command uploaded from Earth overwrote antenna pointing software, permanently cutting communications.',
        whatItTaughtUs: 'Transmitted the first clear color panoramas from the Martian surface, analyzed atmospheric composition, and performed the first soil biology tests.',
        heritageStatus: 'First Successful Long-Term Mars Lander',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA00563/PIA00563~medium.jpg'
      },
      {
        id: 'sojourner-rover',
        heroId: null,
        name: 'Sojourner Micro-Rover (Mars Pathfinder)',
        body: 'Mars',
        site: 'Ares Vallis (Carl Sagan Memorial Station)',
        launchDate: 'Dec 4, 1996',
        landingDate: 'July 4, 1997',
        lastContact: 'Sept 27, 1997 (Sol 83)',
        status: 'Silent in Ares Vallis',
        statusType: 'silent',
        plannedLife: '7 Sols',
        actualLife: '83 Sols',
        longevityPct: '1,185%',
        powerSystem: '16W GaAs Solar Array & Non-Rechargeable D-cells',
        mobility: '100 Meters Total Traversed',
        fateReason: 'Pathfinder base station battery failure terminated communication relay with Earth.',
        whatItTaughtUs: 'The pioneering first mobile robot on another planet; proved the Rocker-Bogie mobility system and analyzed "Barnacle Bill" and "Yogi" rocks.',
        heritageStatus: 'First Extraterrestrial Mobile Scout',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA01122/PIA01122~medium.jpg'
      },
      {
        id: 'ranger-7-impact',
        heroId: null,
        name: 'Ranger 7 Impactor',
        body: 'Moon',
        site: 'Mare Cognitum ("Sea that is Known")',
        launchDate: 'July 28, 1964',
        landingDate: 'July 31, 1964 (Terminal Impact)',
        lastContact: 'July 31, 1964',
        status: 'Impact Crater in Mare Cognitum',
        statusType: 'crashed',
        plannedLife: '68.6 Hours (Transit to Impact)',
        actualLife: '68.6 Hours (100% Target Met)',
        longevityPct: '100%',
        powerSystem: 'Solar Panels & Silver-Zinc Battery',
        mobility: '2.62 km/s Terminal Ballistic Impact',
        fateReason: 'Planned intentional impact to capture rapid sequence photographs right down to the lunar regolith.',
        whatItTaughtUs: 'Transmitted 4,308 ultra-sharp photos in its final 17 minutes before impact, proving the lunar surface was solid enough for human astronauts to land without sinking.',
        heritageStatus: 'First Successful US Lunar Surface Reconnaissance',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA00074/PIA00074~medium.jpg'
      },
      {
        id: 'surveyor-1',
        heroId: null,
        name: 'Surveyor 1 Lander',
        body: 'Moon',
        site: 'Oceanus Procellarum (Flamsteed Crater)',
        launchDate: 'May 30, 1966',
        landingDate: 'June 2, 1966',
        lastContact: 'January 7, 1967',
        status: 'Intact in Oceanus Procellarum',
        statusType: 'silent',
        plannedLife: '14 Days (1 Lunar Day)',
        actualLife: '219 Days (Through Multiple Lunar Nights)',
        longevityPct: '1,564%',
        powerSystem: '85W Solar Array & Rechargeable Battery',
        mobility: 'Stationary Soft-Lander',
        fateReason: 'Extreme thermal cycling (-170°C to +120°C) across consecutive 14-day lunar nights depleted battery chemistry.',
        whatItTaughtUs: 'Proved soft robotic landing on the Moon was possible; verified radar altimeter descent braking and measured lunar bearing strength.',
        heritageStatus: 'First US Soft-Landing on the Moon',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA00032/PIA00032~medium.jpg'
      },
      {
        id: 'apollo-11-descent-stage',
        heroId: 'apollo11',
        name: 'Apollo 11 Lunar Module Eagle (Descent Stage)',
        body: 'Moon',
        site: 'Tranquility Base (0.67408° N, 23.47297° E)',
        launchDate: 'July 16, 1969',
        landingDate: 'July 20, 1969',
        lastContact: 'July 21, 1969 (Ascent Stage Lift-Off)',
        status: 'Permanent Monument at Tranquility Base',
        statusType: 'monument',
        plannedLife: '48 Hours Active Telemetry',
        actualLife: 'Permanent Extraterrestrial Monument',
        longevityPct: 'Permanent',
        powerSystem: '4 Silver-Zinc Descent Batteries (Depleted)',
        mobility: 'Human Lunar Landing Base Pad',
        fateReason: 'Jettisoned intentionally as launch platform for Neil Armstrong and Buzz Aldrin to return to orbit.',
        whatItTaughtUs: 'Monument to humanity\'s first extraterrestrial landing. Houses the stainless steel peace plaque: "Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind."',
        heritageStatus: 'UNESCO / NASA Protected World Heritage Site',
        has3D: true,
        hasStory: true,
        image: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg'
      }
    ];

    this.workingHeroes = [
      {
        id: 'apollo-11-easep',
        heroId: 'apollo11',
        name: 'Apollo 11, 14, 15 Laser Retroreflectors (LRRR)',
        body: 'Moon',
        site: 'Mare Tranquillitatis, Fra Mauro & Hadley-Apennine',
        launchDate: 'July 16, 1969 (Apollo 11)',
        landingDate: 'July 20, 1969',
        lastContact: '100% OPERATIONAL TODAY (55+ Years)',
        status: 'Active Daily via Global Observatories',
        statusType: 'active',
        plannedLife: 'Indefinite Optical Target',
        actualLife: '55+ Years Continuous Ranging (>20,000 Days)',
        longevityPct: 'Permanent (55+ Years)',
        powerSystem: '0 Watts (Zero electricity or batteries required!)',
        mobility: 'Stationary Corner-Cube Optical Prisms',
        fateReason: 'Still 100% operational! Fused quartz corner cubes bounce laser photons straight back to Earth observatories with zero power.',
        whatItTaughtUs: 'Measures Moon distance down to picoseconds (millimeter precision); proved the Moon recedes by 3.8 cm/year; proved the Moon has a fluid core and validated Einstein\'s General Relativity.',
        heritageStatus: 'Longest Continuous Scientific Experiment in Human History',
        has3D: true,
        hasStory: true,
        image: 'https://images-assets.nasa.gov/image/AS11-40-5952/AS11-40-5952~medium.jpg'
      },
      {
        id: 'perseverance-rover',
        heroId: 'perseverance',
        name: 'Perseverance Rover (Mars 2020)',
        body: 'Mars',
        site: 'Jezero Crater (Crater Rim Campaign)',
        launchDate: 'July 30, 2020',
        landingDate: 'Feb 18, 2021',
        lastContact: 'Active Today (Jezero Crater Rim)',
        status: 'Active & Driving Daily (1,300+ Sols)',
        statusType: 'active',
        plannedLife: '1 Martian Year (687 Earth Days)',
        actualLife: '4+ Earth Years (1,300+ Sols and Counting)',
        longevityPct: '200%+',
        powerSystem: 'MMRTG Plutonium-238 Nuclear Generator (Immune to Dust)',
        mobility: '32.4+ km Driven Across Jezero Delta',
        fateReason: 'Fully active! Powered by a 110W nuclear generator unaffected by dust storms, currently climbing the western rim of Jezero Crater.',
        whatItTaughtUs: 'Collected and sealed rock cores for Mars Sample Return; extracted 122 grams of breathable O2 via MOXIE; proven autonomous self-driving AI.',
        heritageStatus: 'Flagship Astrobiology & Sample Caching Mission',
        has3D: true,
        hasStory: true,
        image: 'https://images-assets.nasa.gov/image/PIA24542/PIA24542~medium.jpg'
      },
      {
        id: 'curiosity-rover',
        heroId: null,
        name: 'Curiosity Rover (Mars Science Laboratory)',
        body: 'Mars',
        site: 'Gale Crater (Mount Sharp Sulfate Ascent)',
        launchDate: 'Nov 26, 2011',
        landingDate: 'Aug 6, 2012',
        lastContact: 'Active Today (Mount Sharp Sulfate Unit)',
        status: 'Active & Climbing Daily (4,300+ Sols)',
        statusType: 'active',
        plannedLife: '1 Martian Year (687 Earth Days)',
        actualLife: '12+ Earth Years (4,300+ Sols)',
        longevityPct: '600%',
        powerSystem: 'MMRTG Plutonium-238 Nuclear Generator',
        mobility: '33.1+ km Driven, 1,000+ Vertical Meters Climbed',
        fateReason: 'Fully active! Ascending the sulfate layers of Mount Sharp, drilling ancient rocks and broadcasting weather telemetry daily.',
        whatItTaughtUs: 'Discovered ancient Gale Crater was a habitable freshwater lake; identified sulfur, nitrogen, oxygen, phosphorus, and organic carbon molecules.',
        heritageStatus: 'Longest-Lived Mobile Robot in Martian History',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~medium.jpg'
      },
      {
        id: 'ingenuity-helicopter',
        heroId: null,
        name: 'Ingenuity Mars Helicopter',
        body: 'Mars',
        site: 'Valinor Hills (Jezero Crater)',
        launchDate: 'July 30, 2020',
        landingDate: 'Feb 18, 2021 (Final Flight Jan 18, 2024)',
        lastContact: 'Active Telemetry Station (Daily Broadcasts)',
        status: 'Retired Stationary Avionics & Weather Station',
        statusType: 'active',
        plannedLife: '5 Technology Demonstration Flights',
        actualLife: '72 Successful Flights (14x Mission Goal!)',
        longevityPct: '1,440%',
        powerSystem: 'Solar Array & 6 Sony Li-ion Cells (Broadcasting Daily)',
        mobility: '17.0 km Flown Across 128.8 Airborne Minutes',
        fateReason: 'Rotor blade tip damaged on Flight 72; now acts as a permanent stationary weather, avionics, and telemetry relay station broadcasting daily.',
        whatItTaughtUs: 'Proved powered aerodynamic flight is possible in Mars\' ultra-thin 1% atmosphere; pioneered aerial scouting for ground rovers.',
        heritageStatus: 'The Wright Brothers Monument of Alien Worlds',
        has3D: true,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA24653/PIA24653~medium.jpg'
      },
      {
        id: 'apollo-11-descent-stage',
        heroId: null,
        name: 'Lunar Reconnaissance Orbiter (LRO) Ground Laser Target',
        body: 'Moon',
        site: '50 km Lunar Mapping Orbit',
        launchDate: 'June 18, 2009',
        landingDate: 'June 23, 2009 (Orbit Insertion)',
        lastContact: 'Active Daily High-Res Mapping',
        status: 'Active Daily Planetary Archaeology',
        statusType: 'active',
        plannedLife: '1 Year Primary Mission',
        actualLife: '15+ Years Active Daily Operations',
        longevityPct: '1,500%',
        powerSystem: '1,850W Solar Array & Li-ion Batteries',
        mobility: 'Orbital Reconnaissance at 1.6 km/s',
        fateReason: 'Active! LROC Narrow Angle Cameras image Apollo descent stages, rover tracks, and crash sites from 50 km orbit at 0.5m/pixel resolution.',
        whatItTaughtUs: 'Provides definitive orbital verification of all historic Moon landing sites, discovering new meteorite impact craters and mapping polar water ice.',
        heritageStatus: 'Planetary Archaeology Sentinel of the Moon',
        has3D: false,
        hasStory: false,
        image: 'https://images-assets.nasa.gov/image/PIA13518/PIA13518~medium.jpg'
      }
    ];

    this.init();
  }

  init() {
    this.injectModal();
    this.bindGlobalTriggers();
  }

  bindGlobalTriggers() {
    window.openForgottenExplorers = () => this.open();
    window.addEventListener('open-forgotten-explorers', () => this.open());
  }

  injectModal() {
    let modal = document.getElementById('forgotten-explorers-modal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'forgotten-explorers-modal';
    modal.className = 'forgotten-explorers-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Forgotten Explorers and Still Working Artifacts');

    modal.innerHTML = `
      <div class="forgotten-backdrop"></div>
      <div class="forgotten-container">
        <!-- Header -->
        <header class="forgotten-header">
          <div class="forgotten-header-left">
            <span class="forgotten-badge">🏛️ Planetary Archaeological Ledger</span>
            <h2>Forgotten Explorers vs. Still Working For Us</h2>
            <p>Every piece of hardware left behind was someone's best idea. Discover the silent machines of yesterday and the enduring instruments that still serve humanity today.</p>
          </div>
          <button class="forgotten-close-btn" id="btn-close-forgotten" aria-label="Close">&times;</button>
        </header>

        <!-- Interactive Toolbar: View Switcher & Filter Pills -->
        <div class="forgotten-toolbar">
          <div class="toolbar-left-group">
            <div class="view-toggle-pills" role="radiogroup" aria-label="Comparison View Mode">
              <button class="toggle-pill-btn active" id="btn-view-cards" data-view="cards">
                <span>🃏</span> Side-by-Side Cards
              </button>
              <button class="toggle-pill-btn" id="btn-view-matrix" data-view="matrix">
                <span>📊</span> Big Comparison Matrix
              </button>
            </div>

            <div class="body-filter-pills" role="group" aria-label="Filter by Planetary Body">
              <button class="filter-pill-btn active" data-body="all">All Bodies (14)</button>
              <button class="filter-pill-btn" data-body="Moon">🌕 Moon (5)</button>
              <button class="filter-pill-btn" data-body="Mars">🔴 Mars (9)</button>
            </div>
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
                <span class="col-count-badge" id="silent-count-badge">(9 Relics)</span>
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
                <span class="col-count-badge" id="working-count-badge">(5 Systems)</span>
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
                  <th scope="col">End Reason / Ongoing State</th>
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
    `;

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

  render() {
    if (this.currentView === 'cards') {
      this.renderCards();
    } else {
      this.renderMatrix();
    }
  }

  filterList(list) {
    if (this.currentFilter === 'all') return list;
    return list.filter(item => item.body === this.currentFilter);
  }

  renderCards() {
    const listSilent = this.modal?.querySelector('#list-forgotten-explorers');
    const listWorking = this.modal?.querySelector('#list-working-explorers');
    const silentBadge = this.modal?.querySelector('#silent-count-badge');
    const workingBadge = this.modal?.querySelector('#working-count-badge');
    if (!listSilent || !listWorking) return;

    const filteredSilent = this.filterList(this.silentHeroes);
    const filteredWorking = this.filterList(this.workingHeroes);

    if (silentBadge) silentBadge.textContent = `(${filteredSilent.length} Relics)`;
    if (workingBadge) workingBadge.textContent = `(${filteredWorking.length} Systems)`;

    // Render Silent Column
    listSilent.innerHTML = filteredSilent.map(item => `
      <article class="explorer-card card-silent" data-id="${item.id}">
        <div class="card-top-row">
          <img src="${item.image}" alt="${item.name}" class="explorer-thumb" loading="lazy" decoding="async" onerror="this.src='/favicon.ico'">
          <div class="card-titles">
            <h4>${item.name}</h4>
            <div class="badge-row">
              <span class="explorer-body-tag">${item.body === 'Moon' ? '🌕 Moon' : '🔴 Mars'}</span>
              <span class="status-pill-subtle tag-silent">🌑 Silent Relic</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Spec Matrix -->
        <div class="card-spec-grid">
          <div class="spec-cell">
            <span class="spec-lbl">📅 Timeline:</span>
            <span class="spec-val">${item.launchDate} → ${item.landingDate}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⏳ Lifespan:</span>
            <span class="spec-val font-accent-amber">${item.plannedLife} planned → <strong class="badge-lifespan">${item.longevityPct}</strong></span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⚡ Power Architecture:</span>
            <span class="spec-val">${item.powerSystem}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">🚀 Mobility / Site:</span>
            <span class="spec-val">${item.mobility}</span>
          </div>
        </div>

        <!-- Human Fate Box -->
        <div class="explorer-fate-box">
          <span class="box-tag tag-fate">⚠️ Fatal Challenge & End Reason:</span>
          <p>${item.fateReason}</p>
        </div>

        <!-- Lesson Box -->
        <div class="explorer-lesson-box">
          <span class="box-tag tag-lesson">📜 What It Taught Us:</span>
          <p>${item.whatItTaughtUs}</p>
        </div>

        <!-- Action Buttons -->
        <div class="explorer-card-actions">
          <button class="btn-inspect-explorer" onclick="window.viewRelicOnMap('${item.id}', '${item.body}')" title="Center on Map">
            <span>📍 View on ${item.body}</span>
          </button>
          <button class="btn-inspect-explorer btn-inspect-stage" onclick="window.openObjectPageFromLedger('${item.id}')" title="Inspect 3D Stage">
            <span>🔍 3D Model</span>
          </button>
          ${item.heroId ? `
            <button class="btn-inspect-explorer btn-inspect-story" onclick="window.openStoryModeForHero('${item.heroId}')" title="Open Voice Story">
              <span>🎙️ Voice Story</span>
            </button>
          ` : ''}
        </div>
      </article>
    `).join('');

    // Render Working Column
    listWorking.innerHTML = filteredWorking.map(item => `
      <article class="explorer-card card-working" data-id="${item.id}">
        <div class="card-top-row">
          <img src="${item.image}" alt="${item.name}" class="explorer-thumb" loading="lazy" decoding="async" onerror="this.src='/favicon.ico'">
          <div class="card-titles">
            <h4>${item.name}</h4>
            <div class="badge-row">
              <span class="explorer-body-tag tag-green">${item.body === 'Moon' ? '🌕 Moon' : '🔴 Mars'}</span>
              <span class="status-pill-subtle tag-working">✨ Active Heritage</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Spec Matrix -->
        <div class="card-spec-grid">
          <div class="spec-cell">
            <span class="spec-lbl">📅 Deployed / Active:</span>
            <span class="spec-val">${item.lastContact}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⏳ Lifespan Multiplier:</span>
            <span class="spec-val font-accent-green">${item.plannedLife} → <strong class="badge-lifespan-green">${item.longevityPct}</strong></span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">⚡ Power Architecture:</span>
            <span class="spec-val">${item.powerSystem}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-lbl">🚀 Operational Mobility:</span>
            <span class="spec-val">${item.mobility}</span>
          </div>
        </div>

        <!-- Ongoing State Box -->
        <div class="explorer-fate-box fate-working">
          <span class="box-tag tag-active">⚡ Active Operational State:</span>
          <p>${item.fateReason}</p>
        </div>

        <!-- Legacy Box -->
        <div class="explorer-lesson-box lesson-working">
          <span class="box-tag tag-legacy">🌟 Ongoing Scientific Legacy:</span>
          <p>${item.whatItTaughtUs}</p>
        </div>

        <!-- Action Buttons -->
        <div class="explorer-card-actions">
          <button class="btn-inspect-explorer btn-inspect-working" onclick="window.viewRelicOnMap('${item.id}', '${item.body}')" title="Center on Map">
            <span>📍 View on ${item.body}</span>
          </button>
          <button class="btn-inspect-explorer btn-inspect-stage" onclick="window.openObjectPageFromLedger('${item.id}')" title="Inspect 3D Stage">
            <span>🔍 3D Model</span>
          </button>
          ${item.heroId ? `
            <button class="btn-inspect-explorer btn-inspect-story" onclick="window.openStoryModeForHero('${item.heroId}')" title="Open Voice Story">
              <span>🎙️ Voice Story</span>
            </button>
          ` : ''}
        </div>
      </article>
    `).join('');
  }

  renderMatrix() {
    const tbody = this.modal?.querySelector('#big-comparison-tbody');
    if (!tbody) return;

    const allCombined = [
      ...this.silentHeroes.map(x => ({ ...x, group: 'Silent / Discarded' })),
      ...this.workingHeroes.map(x => ({ ...x, group: 'Still Working' }))
    ];

    const filtered = this.filterList(allCombined);

    tbody.innerHTML = filtered.map(item => `
      <tr class="${item.group === 'Still Working' ? 'row-working' : 'row-silent'}">
        <td class="td-sticky">
          <div class="td-flex-name">
            <img src="${item.image}" alt="${item.name}" class="matrix-thumb" loading="lazy" decoding="async" onerror="this.src='/favicon.ico'">
            <div>
              <strong>${item.name}</strong>
              <div class="matrix-sub">${item.group}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="status-pill-table ${item.group === 'Still Working' ? 'pill-green' : 'pill-red'}">
            ${item.group === 'Still Working' ? '✨ Active' : '🌑 Silent'}
          </span>
        </td>
        <td>
          <strong>${item.body === 'Moon' ? '🌕 Moon' : '🔴 Mars'}</strong>
          <div class="matrix-sub">${item.site}</div>
        </td>
        <td>
          <div class="lifespan-ratio-box">
            <span class="badge-ratio ${item.group === 'Still Working' ? 'ratio-green' : 'ratio-amber'}">${item.longevityPct}</span>
            <div class="matrix-sub">${item.plannedLife} planned</div>
          </div>
        </td>
        <td>
          <span class="power-badge">${item.powerSystem}</span>
        </td>
        <td>
          <span class="mobility-txt">${item.mobility}</span>
        </td>
        <td class="td-wide">
          <p class="td-desc">${item.fateReason}</p>
        </td>
        <td class="td-wide">
          <p class="td-desc">${item.whatItTaughtUs}</p>
        </td>
        <td class="td-actions">
          <div class="matrix-action-stack">
            <button class="btn-matrix-action btn-map" onclick="window.viewRelicOnMap('${item.id}', '${item.body}')" title="Fly to Map Site">
              <span>📍 Map</span>
            </button>
            <button class="btn-matrix-action btn-3d" onclick="window.openObjectPageFromLedger('${item.id}')" title="Open 3D Stage">
              <span>🔍 3D</span>
            </button>
            ${item.heroId ? `
              <button class="btn-matrix-action btn-story" onclick="window.openStoryModeForHero('${item.heroId}')" title="Voice Story">
                <span>🎙️ Story</span>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
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
