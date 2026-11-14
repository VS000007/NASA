/**
 * Space Archaeologists - "How It Worked" Interactive Lab
 * Implements interactive playable physical simulators for Part 7.4 Hero Missions:
 *  1. Opportunity Solar Power & Dust Storm Simulator (Dust Tau vs Watts vs Battery)
 *  2. Sky Crane 4-Stage Entry Sequence (Heatshield -> Chute -> Thrusters -> Tether Lowering)
 *  3. Apollo Lunar Retroreflector Laser Ranging Simulator (Nanosecond speed-of-light timing)
 *  4. Ingenuity Thin-Air Aerodynamics Lab (Martian 1% atmospheric pressure vs 2,400 RPM)
 */

class InteractiveLabController {
  constructor() {
    this.modal = null;
    this.currentLabId = 'solar'; // 'solar', 'skycrane', 'laser', 'ingenuity'
    this.init();
  }

  init() {
    this.injectModal();
    this.bindGlobalTriggers();
  }

  bindGlobalTriggers() {
    window.openInteractiveLab = (labId = 'solar') => {
      this.open(labId);
    };

    window.addEventListener('open-interactive-lab', (e) => {
      const labId = e.detail?.labId || 'solar';
      this.open(labId);
    });
  }

  injectModal() {
    let modal = document.getElementById('interactive-lab-modal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'interactive-lab-modal';
    modal.className = 'interactive-lab-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Interactive How It Worked Physics Lab');

    modal.innerHTML = `
      <div class="interactive-lab-backdrop"></div>
      <div class="interactive-lab-container">
        <!-- Header -->
        <header class="lab-header">
          <div class="lab-header-left">
            <span class="lab-brand-pill">🔬 "How It Worked" Interactive Lab</span>
            <h2>Interactive Engineering Demonstrations</h2>
          </div>
          <div class="lab-header-right">
            <div class="lab-tabs" id="lab-tabs">
              <button class="lab-tab-btn active" data-lab="solar">☀️ Opportunity Solar & Dust</button>
              <button class="lab-tab-btn" data-lab="skycrane">🪂 Sky Crane Sequence</button>
              <button class="lab-tab-btn" data-lab="laser">🪞 Lunar Laser Ranging</button>
              <button class="lab-tab-btn" data-lab="ingenuity">🚁 Thin Air Aerodynamics</button>
            </div>
            <button class="lab-close-btn" id="btn-close-lab" aria-label="Close Lab">&times;</button>
          </div>
        </header>

        <!-- Dynamic Lab Screen Area -->
        <main class="lab-stage-container" id="lab-stage-content">
          <!-- Dynamically populated per active lab -->
        </main>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    this.bindEvents();
  }

  bindEvents() {
    const m = this.modal;
    if (!m) return;

    m.querySelector('#btn-close-lab').addEventListener('click', () => this.close());
    m.querySelector('.interactive-lab-backdrop').addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && m.classList.contains('active')) {
        this.close();
      }
    });

    m.querySelectorAll('.lab-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        m.querySelectorAll('.lab-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLabId = btn.getAttribute('data-lab');
        this.renderActiveLab();
      });
    });
  }

  open(labId = 'solar') {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.currentLabId = labId;
    const tabs = this.modal.querySelectorAll('.lab-tab-btn');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-lab') === labId));

    this.renderActiveLab();
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  renderActiveLab() {
    const stage = this.modal?.querySelector('#lab-stage-content');
    if (!stage) return;

    if (this.currentLabId === 'solar') {
      this.renderSolarLab(stage);
    } else if (this.currentLabId === 'skycrane') {
      this.renderSkyCraneLab(stage);
    } else if (this.currentLabId === 'laser') {
      this.renderLaserLab(stage);
    } else if (this.currentLabId === 'ingenuity') {
      this.renderIngenuityLab(stage);
    }
  }

  /* ===================== SIMULATION 1: OPPORTUNITY SOLAR & DUST ===================== */
  renderSolarLab(container) {
    container.innerHTML = `
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="sky-viewport" id="solar-sky-viewport">
            <div class="sun-orb" id="solar-sun"></div>
            <div class="dust-overlay-layer" id="dust-layer"></div>
            <div class="mars-horizon">
              <div class="rover-silhouette">
                <span class="rover-emoji">🤖</span>
                <div class="solar-panel-glow" id="panel-glow"></div>
              </div>
            </div>
            <div class="telemetry-hud-overlay">
              <div class="telemetry-stat">
                <span class="stat-name">Atmospheric Opacity (Tau):</span>
                <span class="stat-val" id="val-tau">0.6 (Clear Sky)</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-name">Solar Panel Power Output:</span>
                <span class="stat-val stat-power" id="val-power">920 Watt-Hours</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-name">Battery Temperature:</span>
                <span class="stat-val" id="val-temp">-15°C (Nominal)</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-name">Rover Status:</span>
                <span class="stat-val stat-status" id="val-rover-status">● FULLY OPERATIONAL (SOL 5000)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <h3>☀️ Opportunity Solar Power Simulator</h3>
          <p class="sim-desc">
            Drag the slider to unleash a Martian global dust storm and discover why solar-powered rovers are vulnerable to the elements.
          </p>

          <div class="control-group">
            <label for="slider-dust"><strong>Martian Dust Storm Intensity (Tau):</strong></label>
            <input type="range" id="slider-dust" min="0.5" max="10.8" step="0.1" value="0.6">
            <div class="slider-ticks">
              <span>Tau 0.5 (Clear)</span>
              <span>Tau 2.5 (Haze)</span>
              <span>Tau 6.0 (Storm)</span>
              <span>Tau 10.8 (Sol 5111 Blackout)</span>
            </div>
          </div>

          <div class="sim-actions-row">
            <button class="sim-btn" id="btn-wind-clean">💨 Trigger Wind Cleaning Event (+400 Wh)</button>
            <button class="sim-btn btn-danger" id="btn-sol-5111">⚠️ Jump to Sol 5,111 (Final Dust Storm)</button>
          </div>

          <div class="sim-did-you-know">
            <strong>💡 Did You Know?</strong>
            NASA engineers originally predicted Opportunity would die in 2004 from dust build-up. Instead, natural Martian wind gusts repeatedly swept the solar panels clean—extending the mission from 90 days to 15 years!
          </div>
        </div>
      </div>
    `;

    const slider = container.querySelector('#slider-dust');
    const sky = container.querySelector('#solar-sky-viewport');
    const dust = container.querySelector('#dust-layer');
    const sun = container.querySelector('#solar-sun');
    const valTau = container.querySelector('#val-tau');
    const valPower = container.querySelector('#val-power');
    const valTemp = container.querySelector('#val-temp');
    const valStatus = container.querySelector('#val-rover-status');
    const panelGlow = container.querySelector('#panel-glow');

    const updateSolarSim = (tauVal) => {
      const tau = parseFloat(tauVal);
      // Normalized opacity 0 to 1
      const opacity = Math.min((tau - 0.5) / 10.3, 1.0);
      dust.style.backgroundColor = `rgba(180, 83, 9, ${opacity * 0.96})`;
      sun.style.opacity = `${Math.max(0.05, 1 - opacity * 1.1)}`;

      // Calculate power curve: P = 940 * exp(-0.45 * tau)
      const power = Math.max(22, Math.round(960 * Math.exp(-0.35 * tau)));
      valTau.textContent = `${tau.toFixed(1)} ${tau < 1.5 ? '(Clear Sky)' : tau < 4.0 ? '(Regional Dust)' : tau < 8.0 ? '(Major Storm)' : '(Global Blackout)'}`;
      valPower.textContent = `${power} Watt-Hours`;

      if (power > 600) {
        valStatus.textContent = '● FULLY OPERATIONAL (Driving & Science)';
        valStatus.style.color = '#34d399';
        valTemp.textContent = '-15°C (Nominal)';
        panelGlow.style.opacity = '1';
      } else if (power > 250) {
        valStatus.textContent = '● CAUTION: Driving Suspended (Survival Heaters On)';
        valStatus.style.color = '#fbbf24';
        valTemp.textContent = '-35°C (Cooling)';
        panelGlow.style.opacity = '0.5';
      } else if (power > 50) {
        valStatus.textContent = '● CRITICAL: Low Power Sleep Mode (No Radio)';
        valStatus.style.color = '#f97316';
        valTemp.textContent = '-65°C (Heaters Failing)';
        panelGlow.style.opacity = '0.1';
      } else {
        valStatus.textContent = '● SILENT: Sol 5,111 Battery Depleted (Master Clock Frozen)';
        valStatus.style.color = '#ef4444';
        valTemp.textContent = '-95°C (Frozen)';
        panelGlow.style.opacity = '0';
      }
    };

    slider.addEventListener('input', (e) => updateSolarSim(e.target.value));

    container.querySelector('#btn-wind-clean').addEventListener('click', () => {
      slider.value = 0.6;
      updateSolarSim(0.6);
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('💨 A Martian dust devil just swept the solar panels clean! Power restored to 920 Wh!', '☀️', 3500);
      }
    });

    container.querySelector('#btn-sol-5111').addEventListener('click', () => {
      slider.value = 10.8;
      updateSolarSim(10.8);
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('Sol 5,111: Global dust storm blocks the Sun. Last telemetry: "My battery is low and it is getting dark."', '🌑', 4500);
      }
    });
  }

  /* ===================== SIMULATION 2: SKY CRANE SEQUENCE ===================== */
  renderSkyCraneLab(container) {
    container.innerHTML = `
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="skycrane-viewport" id="skycrane-viewport">
            <div class="skycrane-art" id="skycrane-graphic">
              <!-- Animated sequence elements -->
              <div class="sc-capsule" id="sc-capsule">
                <div class="sc-chute" id="sc-chute">🪂</div>
                <div class="sc-heatshield" id="sc-heatshield">🛡️</div>
                <div class="sc-descent-stage" id="sc-descent-stage">🚀</div>
                <div class="sc-tether" id="sc-tether"></div>
                <div class="sc-rover" id="sc-rover">🤖</div>
              </div>
            </div>
            <div class="crane-telemetry-badge">
              <span id="crane-altitude-text">Altitude: 125 km (Atmospheric Entry)</span>
              <span id="crane-speed-text">Speed: 13,000 mph (Mach 17)</span>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <h3>🪂 Curiosity & Perseverance Sky Crane</h3>
          <p class="sim-desc">
            Because car-sized rovers weigh over 2,000 pounds, airbags would pop! NASA invented the Sky Crane: a rocket jetpack that lowers the rover on nylon ropes.
          </p>

          <div class="stepper-buttons-row" id="crane-steps">
            <button class="step-card-btn active" data-step="1">
              <strong>1. Heat Shield</strong>
              <span>13,000 mph entry</span>
            </button>
            <button class="step-card-btn" data-step="2">
              <strong>2. Supersonic Chute</strong>
              <span>Mach 2 parachute deploy</span>
            </button>
            <button class="step-card-btn" data-step="3">
              <strong>3. Powered Descent</strong>
              <span>8 Hydrazine rockets fire</span>
            </button>
            <button class="step-card-btn" data-step="4">
              <strong>4. Sky Crane Lowering</strong>
              <span>25ft nylon ropes descend</span>
            </button>
          </div>

          <div class="crane-explainer-card" id="crane-explainer">
            <h4>Stage 1: Hypersonic Atmospheric Entry</h4>
            <p>The spacecraft hits the upper Martian atmosphere travelling 13,000 miles per hour. The heat shield glows at 2,700°F (1,500°C), absorbing the intense friction heat while slowing the craft down by 90%.</p>
          </div>

          <div class="sim-did-you-know">
            <strong>💡 Why wasn't the sky crane recovered?</strong>
            After lowering the rover gently onto its wheels, the pyrotechnic blade severed the cables and the rocket jetpack fired its engines at 100% thrust to fly 2,000 feet away and crash safely, protecting the rover from flying debris!
          </div>
        </div>
      </div>
    `;

    const steps = [
      {
        num: 1,
        title: 'Stage 1: Hypersonic Atmospheric Entry',
        alt: 'Altitude: 125 km (Atmospheric Entry)',
        spd: 'Speed: 13,000 mph (Mach 17)',
        text: 'The spacecraft hits the upper Martian atmosphere travelling 13,000 miles per hour. The heat shield glows at 2,700°F (1,500°C), absorbing the intense friction heat while slowing the craft down by 90% in just four minutes.'
      },
      {
        num: 2,
        title: 'Stage 2: Supersonic Parachute Deployment',
        alt: 'Altitude: 11 km (Supersonic Descent)',
        spd: 'Speed: 950 mph (Mach 1.7)',
        text: 'At Mach 1.7, a mortar cannons the largest supersonic parachute ever built into the sky. It opens in 0.4 seconds under 65,000 pounds of drag force! The heat shield drops away, allowing radar and cameras to see the ground.'
      },
      {
        num: 3,
        title: 'Stage 3: Powered Descent Rocket Braking',
        alt: 'Altitude: 1.6 km (Terminal Rockets Active)',
        spd: 'Speed: 180 mph → 1.7 mph',
        text: 'The backshell and parachute disconnect. Eight throttleable hydrazine rocket engines ignite on the descent stage, decelerating the falling rover until it is hovering motionless just 60 feet above the Martian dirt.'
      },
      {
        num: 4,
        title: 'Stage 4: Sky Crane Tether Lowering & Touchdown',
        alt: 'Altitude: 0 m (Touchdown in Jezero Crater!)',
        spd: 'Speed: 1.5 mph (Gentle Touchdown)',
        text: 'The descent stage hovers in mid-air while three nylon bridles lower the rover 25 feet beneath it. As soon as the wheels touch the dirt, explosive pyrotechnic guillotines slice the ropes. The descent stage throttles up and flies 2,000 feet away to crash safely!'
      }
    ];

    const explainer = container.querySelector('#crane-explainer');
    const altText = container.querySelector('#crane-altitude-text');
    const spdText = container.querySelector('#crane-speed-text');
    const stepBtns = container.querySelectorAll('.step-card-btn');
    const chute = container.querySelector('#sc-chute');
    const heatshield = container.querySelector('#sc-heatshield');
    const tether = container.querySelector('#sc-tether');
    const descentStage = container.querySelector('#sc-descent-stage');
    const rover = container.querySelector('#sc-rover');

    const updateStage = (stepNum) => {
      const data = steps[stepNum - 1];
      explainer.innerHTML = `<h4>${data.title}</h4><p>${data.text}</p>`;
      altText.textContent = data.alt;
      spdText.textContent = data.spd;

      stepBtns.forEach((b, idx) => b.classList.toggle('active', idx === stepNum - 1));

      // Visual animations
      if (stepNum === 1) {
        chute.style.display = 'none';
        heatshield.style.display = 'block';
        tether.style.height = '0px';
        rover.style.transform = 'translateY(0px)';
      } else if (stepNum === 2) {
        chute.style.display = 'block';
        heatshield.style.display = 'none';
        tether.style.height = '0px';
      } else if (stepNum === 3) {
        chute.style.display = 'none';
        tether.style.height = '0px';
        rover.style.transform = 'translateY(0px)';
      } else if (stepNum === 4) {
        chute.style.display = 'none';
        tether.style.height = '60px';
        rover.style.transform = 'translateY(60px)';
      }
    };

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.getAttribute('data-step'), 10);
        updateStage(stepNum);
      });
    });

    updateStage(1);
  }

  /* ===================== SIMULATION 3: LUNAR LASER RANGING ===================== */
  renderLaserLab(container) {
    container.innerHTML = `
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="laser-viewport" id="laser-viewport">
            <div class="laser-earth-base">
              <span class="laser-node-icon">🌍</span>
              <span class="laser-node-label">Earth Telescope (Apache Point)</span>
            </div>
            <div class="laser-beam-track">
              <div class="laser-photon" id="laser-photon"></div>
            </div>
            <div class="laser-moon-base">
              <span class="laser-node-icon">🌕</span>
              <span class="laser-node-label">Apollo 11 Retroreflector</span>
            </div>
          </div>
          <div class="laser-readout-hud">
            <div class="readout-box">
              <span class="readout-label">Light Travel Time:</span>
              <span class="readout-val" id="laser-timer">0.00000000 s</span>
            </div>
            <div class="readout-box">
              <span class="readout-label">Measured Distance:</span>
              <span class="readout-val readout-cyan" id="laser-distance">384,402,142.6 mm</span>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <h3>🪞 Apollo Lunar Laser Ranging Simulator</h3>
          <p class="sim-desc">
            Apollo 11, 14, and 15 astronauts left suitcase-sized panels of quartz corner-cube prisms on the Moon. Today, scientists fire powerful lasers at them to measure the Moon's distance to millimeter accuracy!
          </p>

          <button class="btn-fire-laser" id="btn-fire-laser">
            <span>⚡ Fire 532nm Green Laser Pulse</span>
          </button>

          <div class="laser-facts-list">
            <div class="fact-item">
              <strong>🔬 Speed of Light (c):</strong> 299,792.458 kilometers per second
            </div>
            <div class="fact-item">
              <strong>⏱️ Round-Trip Time:</strong> Approximately 2.564 seconds
            </div>
            <div class="fact-item">
              <strong>📏 The Big Discovery:</strong> The Moon is spiraling away from Earth by <strong>3.8 centimeters (1.5 inches)</strong> every single year due to ocean tides!
            </div>
          </div>

          <div class="sim-did-you-know">
            <strong>💡 How does the mirror work without electricity?</strong>
            Corner-cube prisms have three mirrors set at exact 90-degree angles to each other. No matter what angle a laser beam strikes it from Earth, the light reflects three times and shoots straight back to the telescope!
          </div>
        </div>
      </div>
    `;

    const fireBtn = container.querySelector('#btn-fire-laser');
    const photon = container.querySelector('#laser-photon');
    const timerEl = container.querySelector('#laser-timer');
    const distEl = container.querySelector('#laser-distance');

    let isFiring = false;

    fireBtn.addEventListener('click', () => {
      if (isFiring) return;
      isFiring = true;
      fireBtn.disabled = true;
      fireBtn.textContent = '⚡ Laser Beam Traveling (2.56 Seconds)...';

      photon.style.display = 'block';
      photon.className = 'laser-photon out-bound';

      let startTime = performance.now();
      const targetDuration = 2564; // ms

      const timerInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        timerEl.textContent = `${elapsed.toFixed(8)} s`;
      }, 30);

      // Halfway: hits Moon retroreflector
      setTimeout(() => {
        photon.className = 'laser-photon in-bound';
      }, targetDuration / 2);

      // Return to Earth
      setTimeout(() => {
        clearInterval(timerInterval);
        timerEl.textContent = '2.56441920 s';
        const randomMm = (384402140 + Math.random() * 8).toFixed(1);
        distEl.textContent = `${Number(randomMm).toLocaleString()} mm`;

        isFiring = false;
        fireBtn.disabled = false;
        fireBtn.innerHTML = '<span>⚡ Fire Another Laser Pulse</span>';
        photon.style.display = 'none';

        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(`🎯 Photon detected! Lunar distance calculated: ${randomMm} mm!`, '🌕', 4000);
        }
      }, targetDuration);
    });
  }

  /* ===================== SIMULATION 4: INGENUITY AERODYNAMICS ===================== */
  renderIngenuityLab(container) {
    container.innerHTML = `
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="rotor-viewport" id="rotor-viewport">
            <div class="rotor-mast">
              <div class="rotor-blade blade-top" id="blade-top"></div>
              <div class="rotor-fuselage">🚁</div>
              <div class="rotor-blade blade-bottom" id="blade-bottom"></div>
            </div>
            <div class="lift-indicator" id="lift-indicator">
              <span id="lift-arrow">⬆️</span>
              <span id="lift-val">Lift: 0.0 N</span>
            </div>
          </div>
          <div class="rotor-readout-hud">
            <div class="readout-box">
              <span class="readout-label">Atmosphere Density:</span>
              <span class="readout-val" id="val-atmo-density">0.02 kg/m³ (Mars)</span>
            </div>
            <div class="readout-box">
              <span class="readout-label">Rotor Speed:</span>
              <span class="readout-val readout-gold" id="val-rotor-rpm">2,400 RPM</span>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <h3>🚁 Ingenuity Thin-Air Aerodynamics Lab</h3>
          <p class="sim-desc">
            Mars has only 1% of Earth's atmospheric pressure! That means there are barely any air molecules for helicopter blades to push against. Slide between planets to see how fast Ingenuity must spin to fly!
          </p>

          <div class="control-group">
            <label for="slider-planet-atmo"><strong>Planetary Atmosphere Density:</strong></label>
            <input type="range" id="slider-planet-atmo" min="1" max="100" value="1">
            <div class="slider-ticks">
              <span>Mars (1% Air)</span>
              <span>100,000 ft Earth (10%)</span>
              <span>Earth Sea Level (100%)</span>
            </div>
          </div>

          <div class="rotor-status-card" id="rotor-status-card">
            <h4>Mars Flight Mode (2,400 RPM Required)</h4>
            <p>Because Martian air is thinner than at the top of Mount Everest, Ingenuity's carbon-fiber blades must spin 5x faster than a regular Earth helicopter to generate 4 Newtons of lift—enough to lift its 4-pound body off the ground!</p>
          </div>

          <div class="sim-did-you-know">
            <strong>💡 Did You Know?</strong>
            Ingenuity carried a postage-stamp-sized piece of fabric from the 1903 Wright Flyer's wing taped under its solar panel, connecting humanity's first airplane flight on Earth to its first helicopter flight on Mars!
          </div>
        </div>
      </div>
    `;

    const slider = container.querySelector('#slider-planet-atmo');
    const atmoVal = container.querySelector('#val-atmo-density');
    const rpmVal = container.querySelector('#val-rotor-rpm');
    const liftVal = container.querySelector('#lift-val');
    const statusCard = container.querySelector('#rotor-status-card');
    const topBlade = container.querySelector('#blade-top');
    const bottomBlade = container.querySelector('#blade-bottom');

    const updateRotorSim = (val) => {
      const atmoPct = parseInt(val, 10);
      if (atmoPct < 15) {
        atmoVal.textContent = '0.02 kg/m³ (Mars)';
        rpmVal.textContent = '2,400 RPM (Supersonic Tip Speed)';
        liftVal.textContent = 'Lift: 4.1 N (Takeoff Achieved!)';
        statusCard.innerHTML = `
          <h4>🔴 Mars Flight Mode (2,400 RPM Required)</h4>
          <p>Because Martian air is thinner than at the top of Mount Everest, Ingenuity's counter-rotating blades spin at 2,400 RPM to bite into the sparse CO₂ atmosphere and achieve powered flight.</p>
        `;
        topBlade.style.animationDuration = '0.08s';
        bottomBlade.style.animationDuration = '0.08s';
      } else if (atmoPct < 70) {
        atmoVal.textContent = '0.45 kg/m³ (Stratosphere)';
        rpmVal.textContent = '1,100 RPM';
        liftVal.textContent = 'Lift: 6.8 N (Excess Lift)';
        statusCard.innerHTML = `
          <h4>☁️ Earth High-Altitude Mode (1,100 RPM)</h4>
          <p>In medium atmospheric pressure, blades can rotate at moderate speeds to produce lift without overloading the electric motors.</p>
        `;
        topBlade.style.animationDuration = '0.18s';
        bottomBlade.style.animationDuration = '0.18s';
      } else {
        atmoVal.textContent = '1.22 kg/m³ (Earth Sea Level)';
        rpmVal.textContent = '450 RPM (Standard Helicopter)';
        liftVal.textContent = 'Lift: 18.5 N (Massive Lift)';
        statusCard.innerHTML = `
          <h4>🌍 Earth Sea Level Flight (450 RPM)</h4>
          <p>In dense Earth air, a helicopter only needs 450 RPM to generate ample lift. If Ingenuity spun at 2,400 RPM on Earth, the aerodynamic drag would rip its motors apart!</p>
        `;
        topBlade.style.animationDuration = '0.35s';
        bottomBlade.style.animationDuration = '0.35s';
      }
    };

    slider.addEventListener('input', (e) => updateRotorSim(e.target.value));
    updateRotorSim(1);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.interactiveLab = new InteractiveLabController();
});
