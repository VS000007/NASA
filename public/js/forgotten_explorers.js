/**
 * Space Archaeologists - Forgotten Explorers vs Still Working For Us View
 * Implements Part 8 requirement:
 *  - Left: Silent, lost, and crashed hardware with last-contact dates & "what it taught us"
 *  - Right: Still working for us (reflectors, active rovers, LRO)
 */

class ForgottenExplorersController {
  constructor() {
    this.modal = null;
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
        <header class="forgotten-header">
          <div class="forgotten-header-left">
            <span class="forgotten-badge">🏛️ Planetary Archaeological Ledger</span>
            <h2>Forgotten Explorers vs. Still Working For Us</h2>
            <p>Every piece of hardware left behind was someone's best idea. Discover the silent machines of yesterday and the enduring instruments that still serve humanity today.</p>
          </div>
          <button class="forgotten-close-btn" id="btn-close-forgotten" aria-label="Close">&times;</button>
        </header>

        <main class="forgotten-split-grid">
          <!-- Column 1: Forgotten Explorers (Silent, Lost & Crashed) -->
          <section class="forgotten-column col-silent">
            <div class="column-header">
              <div class="col-title-row">
                <span class="col-icon">🌑</span>
                <h3>Silent, Lost & Crashed Hardware</h3>
              </div>
              <span class="col-tag tag-silent">The Forgotten Explorers</span>
            </div>
            <div class="column-cards-list" id="list-forgotten-explorers">
              <!-- Dynamically populated -->
            </div>
          </section>

          <!-- Column 2: Still Working For Us (Active & Passive Targets) -->
          <section class="forgotten-column col-working">
            <div class="column-header">
              <div class="col-title-row">
                <span class="col-icon">✨</span>
                <h3>Still Working For Us Today</h3>
              </div>
              <span class="col-tag tag-working">Active Science & Heritage</span>
            </div>
            <div class="column-cards-list" id="list-working-explorers">
              <!-- Dynamically populated -->
            </div>
          </section>
        </main>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    modal.querySelector('#btn-close-forgotten').addEventListener('click', () => this.close());
    modal.querySelector('.forgotten-backdrop').addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open() {
    if (!this.modal) return;
    this.populateColumns();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.modal) this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  populateColumns() {
    const listSilent = this.modal?.querySelector('#list-forgotten-explorers');
    const listWorking = this.modal?.querySelector('#list-working-explorers');
    if (!listSilent || !listWorking) return;

    const silentHeroes = [
      {
        name: 'Opportunity Rover (MER-B)',
        body: 'Mars',
        lastContact: 'June 10, 2018 (Sol 5,111)',
        status: 'Silent in Perseverance Valley',
        whatItTaughtUs: 'Discovered hematite blueberries and sulfate rock beds, definitively proving that ancient Mars held standing liquid water that lasted for millions of years.',
        image: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~orig.jpg',
        objectId: 'opportunity-rover'
      },
      {
        name: 'Spirit Rover (MER-A)',
        body: 'Mars',
        lastContact: 'March 22, 2010 (Sol 2,210)',
        status: 'Silent in Troy Sand Trap',
        whatItTaughtUs: 'A jammed front wheel dragged backwards and accidentally scraped away topsoil to reveal 90% pure silica—the fingerprint of ancient volcanic hot springs or hydrothermal vents!',
        image: 'https://images-assets.nasa.gov/image/PIA05541/PIA05541~orig.jpg',
        objectId: 'spirit-rover'
      },
      {
        name: 'InSight Lander',
        body: 'Mars',
        lastContact: 'December 15, 2022',
        status: 'Silent in Elysium Planitia',
        whatItTaughtUs: 'Recorded over 1,300 marsquakes and mapped the interior layers of Mars for the first time, discovering a molten liquid core with a radius of approximately 1,830 km.',
        image: 'https://images-assets.nasa.gov/image/PIA22228/PIA22228~orig.jpg',
        objectId: 'insight-lander'
      },
      {
        name: 'Phoenix Mars Lander',
        body: 'Mars',
        lastContact: 'November 2, 2008',
        status: 'Silent in Vastitas Borealis',
        whatItTaughtUs: 'Scraped through arctic soil and uncovered pure subsurface water ice chunks that sublimated under the camera, proving shallow water ice blankets the Martian poles.',
        image: 'https://images-assets.nasa.gov/image/PIA10729/PIA10729~orig.jpg',
        objectId: 'phoenix-lander'
      },
      {
        name: 'Viking 1 Lander',
        body: 'Mars',
        lastContact: 'November 11, 1982',
        status: 'Silent in Chryse Planitia',
        whatItTaughtUs: 'Sent the first clear color photographs from the surface of Mars, sampled the atmosphere, and conducted biology experiments whose intriguing results are still analyzed today.',
        image: 'https://images-assets.nasa.gov/image/PIA00007/PIA00007~orig.jpg',
        objectId: 'viking-1-lander'
      },
      {
        name: 'Ranger 7 Impactor',
        body: 'Moon',
        lastContact: 'July 31, 1964 (Terminal Impact)',
        status: 'Impact Crater in Mare Cognitum',
        whatItTaughtUs: 'Transmitted 4,308 high-resolution photos in its final 17 minutes before impact, proving the lunar regolith was solid enough for human astronauts and spacecraft to land without sinking.',
        image: 'https://images-assets.nasa.gov/image/PIA00074/PIA00074~orig.jpg',
        objectId: 'ranger-7-impact'
      }
    ];

    const workingHeroes = [
      {
        name: 'Apollo 11, 14, 15 Laser Retroreflectors',
        body: 'Moon',
        status: '100% Active (Continuous Ranging)',
        lastContact: 'Active Daily via Earth Observatories',
        whatItTaughtUs: 'Zero electricity required! These quartz corner-cube mirrors still bounce laser pulses back to Earth, proving the Moon recedes by 3.8 cm/year and validating General Relativity.',
        image: 'https://images-assets.nasa.gov/image/AS11-40-5952/AS11-40-5952~orig.jpg',
        objectId: 'apollo-11-easep'
      },
      {
        name: 'Perseverance Rover',
        body: 'Mars',
        status: 'Active (Crater Rim Campaign)',
        lastContact: 'Active Today (Jezero Crater)',
        whatItTaughtUs: 'Collected and cached sealed rock cores for Mars Sample Return, demonstrated MOXIE oxygen generation, and set the off-world distance driving record.',
        image: 'https://images-assets.nasa.gov/image/PIA24542/PIA24542~orig.jpg',
        objectId: 'perseverance-rover'
      },
      {
        name: 'Curiosity Rover (MSL)',
        body: 'Mars',
        status: 'Active (Mount Sharp Ascent)',
        lastContact: 'Active Today (Gale Crater)',
        whatItTaughtUs: 'Ascended over 1 km into the sulfate layers of Mount Sharp, discovered long-chain organic molecules in ancient mudstones, and proved Gale Crater hosted a freshwater lake.',
        image: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~orig.jpg',
        objectId: 'curiosity-rover'
      },
      {
        name: 'Ingenuity Mars Helicopter',
        body: 'Mars',
        status: 'Retired Stationary Weather Station',
        lastContact: 'Active Telemetry via Perseverance',
        whatItTaughtUs: 'Flew 72 times across three years, proving powered aerodynamic flight is possible in thin alien atmospheres and serving as a pathfinding scout for ground rovers.',
        image: 'https://images-assets.nasa.gov/image/PIA24496/PIA24496~orig.jpg',
        objectId: 'ingenuity-helicopter'
      }
    ];

    listSilent.innerHTML = silentHeroes.map(item => `
      <div class="explorer-card card-silent">
        <div class="card-top-row">
          <img src="${item.image}" alt="${item.name}" class="explorer-thumb" onerror="this.src='/favicon.ico'">
          <div class="card-titles">
            <h4>${item.name}</h4>
            <span class="explorer-body-tag">${item.body} • ${item.status}</span>
          </div>
        </div>
        <div class="explorer-meta-line">
          <strong>Last Contact:</strong> <span>${item.lastContact}</span>
        </div>
        <div class="explorer-lesson-box">
          <strong>📜 What It Taught Us:</strong>
          <p>${item.whatItTaughtUs}</p>
        </div>
        <button class="btn-inspect-explorer" onclick="window.openObjectPage('${item.objectId}')">
          <span>🔍 Inspect Hardware & Story</span>
        </button>
      </div>
    `).join('');

    listWorking.innerHTML = workingHeroes.map(item => `
      <div class="explorer-card card-working">
        <div class="card-top-row">
          <img src="${item.image}" alt="${item.name}" class="explorer-thumb" onerror="this.src='/favicon.ico'">
          <div class="card-titles">
            <h4>${item.name}</h4>
            <span class="explorer-body-tag tag-green">${item.body} • ${item.status}</span>
          </div>
        </div>
        <div class="explorer-meta-line">
          <strong>Mission State:</strong> <span>${item.lastContact}</span>
        </div>
        <div class="explorer-lesson-box">
          <strong>⚡ Ongoing Legacy:</strong>
          <p>${item.whatItTaughtUs}</p>
        </div>
        <button class="btn-inspect-explorer btn-inspect-working" onclick="window.openObjectPage('${item.objectId}')">
          <span>🔍 Inspect Active Science</span>
        </button>
      </div>
    `).join('');
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.forgottenExplorers = new ForgottenExplorersController();
});
