const fs = require('fs');
const path = require('path');

const jsContent = `/**
 * Space Archaeologists - "How It Worked" Interactive Engineering Lab
 * Multi-Tiered Interactive Physics & Engineering Simulators for:
 *  1. Opportunity Solar Power & Dust Storm Simulator (Dust Tau vs Watts vs Battery)
 *  2. Sky Crane 4-Stage Entry Sequence (Heatshield -> Chute -> Thrusters -> Tether Lowering)
 *  3. Apollo Lunar Retroreflector Laser Ranging Simulator (Nanosecond speed-of-light timing)
 *  4. Ingenuity Thin-Air Aerodynamics Lab (Martian 1% atmospheric pressure vs 2,400 RPM)
 *
 * Audience Modes:
 *  - 'cadet': Junior Cadets (Ages 6-10) - Gamified analogies, fun visual challenges, simple metrics.
 *  - 'explorer': General Explorers (Ages 11-16 / Public) - Practical engineering principles, real mission telemetry, step-by-step physics.
 *  - 'scientist': Chief Scientists (University & Research) - Rigorous mathematical formulas, JPL telemetry tables, thermodynamics, photon budgets.
 */

class InteractiveLabController {
  constructor() {
    this.modal = null;
    this.currentLabId = 'solar'; // 'solar', 'skycrane', 'laser', 'ingenuity'
    this.audienceLevel = 'explorer'; // 'cadet', 'explorer', 'scientist'
    this.activeAnimId = null;
    this.activeSimState = {};
    this.speechSynth = window.speechSynthesis || null;
    this.currentUtterance = null;
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
    if (modal) {
      this.modal = modal;
      this.bindEvents();
      return;
    }

    modal = document.createElement('div');
    modal.id = 'interactive-lab-modal';
    modal.className = 'interactive-lab-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Interactive How It Worked Physics Lab');

    modal.innerHTML = \`
      <div class="interactive-lab-backdrop"></div>
      <div class="interactive-lab-container">
        <!-- Header -->
        <header class="lab-header">
          <div class="lab-header-left">
            <div class="lab-title-row">
              <span class="lab-brand-pill">🔬 "HOW IT WORKED" INTERACTIVE LAB</span>
              <div class="lab-audience-selector" id="lab-audience-selector" role="group" aria-label="Audience Depth Selector">
                <span class="audience-label">Audience:</span>
                <button class="lab-audience-pill" data-level="cadet" title="Gamified, fun analogies & visual experiments for young learners">👶 Cadet (6-10)</button>
                <button class="lab-audience-pill active" data-level="explorer" title="Clear engineering principles & mission milestones for everyone">🧭 Explorer (11+)</button>
                <button class="lab-audience-pill" data-level="scientist" title="Rigorous physics formulas, telemetry math & JPL specifications">🔬 Scientist (Research)</button>
              </div>
            </div>
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
    \`;

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
        this.stopActiveAnimation();
        this.stopSpeech();
        this.renderActiveLab();
      });
    });

    m.querySelectorAll('.lab-audience-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        m.querySelectorAll('.lab-audience-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.audienceLevel = pill.getAttribute('data-level');
        this.stopSpeech();
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

    const audiencePills = this.modal.querySelectorAll('.lab-audience-pill');
    audiencePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-level') === this.audienceLevel));

    this.renderActiveLab();
  }

  close() {
    this.stopActiveAnimation();
    this.stopSpeech();
    if (this.modal) {
      this.modal.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  stopActiveAnimation() {
    if (this.activeAnimId) {
      cancelAnimationFrame(this.activeAnimId);
      this.activeAnimId = null;
    }
  }

  stopSpeech() {
    if (this.speechSynth && this.speechSynth.speaking) {
      this.speechSynth.cancel();
    }
  }

  speakNarration(text) {
    if (!this.speechSynth) return;
    this.stopSpeech();

    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[\$\*\#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Prefer high quality female voices if available
    const voices = this.speechSynth.getVoices();
    const femaleVoice = voices.find(v => 
      /female|natural|samantha|zira|victoria|karen|moira|fiona|google us english/i.test(v.name)
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    if (this.audienceLevel === 'cadet') {
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
    } else if (this.audienceLevel === 'scientist') {
      utterance.rate = 0.95;
      utterance.pitch = 0.95;
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }

    this.currentUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  setupHiDPICanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.parentElement?.clientWidth || 540;
    const height = rect.height || canvas.parentElement?.clientHeight || 480;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = \`\${width}px\`;
    canvas.style.height = \`\${height}px\`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
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
    const lvl = this.audienceLevel;

    container.innerHTML = \`
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="canvas-viewport-wrap" id="solar-viewport-wrap">
            <canvas id="solar-canvas" class="lab-canvas"></canvas>
            
            <div class="telemetry-hud-overlay">
              <div class="telemetry-stat">
                <span class="stat-name">Atmospheric Dust Opacity (Tau &tau;):</span>
                <span class="stat-val" id="val-tau">0.60 (Clear Sky)</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-name">Solar Array Power Generation:</span>
                <span class="stat-val stat-power" id="val-power">920 Watt-Hours</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-name">Battery Temp & Critical State:</span>
                <span class="stat-val" id="val-temp">-15&deg;C (Nominal Heaters)</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-name">Mission Status:</span>
                <span class="stat-val stat-status" id="val-rover-status">&bull; FULLY OPERATIONAL (Driving & Science)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <div class="sim-title-group">
            <div class="title-with-voice">
              <h3>☀️ Opportunity Solar & Dust Storm Simulator</h3>
              <button class="btn-voice-narrate" id="btn-solar-voice" title="Listen to audio explanation">
                <span class="voice-icon">🔊</span> Listen
              </button>
            </div>
            <p class="sim-desc" id="solar-sim-desc"></p>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label for="slider-dust"><strong>Martian Dust Storm Intensity (Tau &tau;):</strong></label>
              <span class="control-current-val" id="dust-slider-val">&tau; = 0.6</span>
            </div>
            <input type="range" id="slider-dust" min="0.5" max="10.8" step="0.1" value="0.6">
            <div class="slider-ticks">
              <span>Tau 0.5 (Clear)</span>
              <span>Tau 2.5 (Regional Haze)</span>
              <span>Tau 6.0 (Major Storm)</span>
              <span>Tau 10.8 (Sol 5111 Blackout)</span>
            </div>
          </div>

          <div class="sim-actions-row">
            <button class="sim-btn" id="btn-wind-clean">💨 Trigger Wind Cleaning Event (+400 Wh)</button>
            <button class="sim-btn btn-danger" id="btn-sol-5111">⚠️ Jump to Sol 5,111 (Final Dust Storm)</button>
          </div>

          <!-- Audience Specific Educational Box -->
          <div class="audience-dynamic-box" id="solar-audience-box"></div>
        </div>
      </div>
    \`;

    const canvas = container.querySelector('#solar-canvas');
    const { ctx, width, height } = this.setupHiDPICanvas(canvas);

    const slider = container.querySelector('#slider-dust');
    const dustSliderVal = container.querySelector('#dust-slider-val');
    const valTau = container.querySelector('#val-tau');
    const valPower = container.querySelector('#val-power');
    const valTemp = container.querySelector('#val-temp');
    const valStatus = container.querySelector('#val-rover-status');
    const descEl = container.querySelector('#solar-sim-desc');
    const audienceBox = container.querySelector('#solar-audience-box');
    const voiceBtn = container.querySelector('#btn-solar-voice');

    // Populate audience descriptions
    let narrationText = '';
    if (lvl === 'cadet') {
      descEl.textContent = 'Drag the slider to unleash a Martian sandstorm! See why robots need sunlight to live and click the Wind Devil button to blow dust away!';
      audienceBox.innerHTML = \`
        <div class="cadet-challenge-box">
          <div class="cadet-badge">🎯 CADET MISSION CHALLENGE</div>
          <h4>Can you keep Oppy alive?</h4>
          <p>Opportunity ("Oppy") was a friendly robot explorer powered by sunshine. When dust storms cover the sky, Oppy goes to sleep. Use the <strong>Wind Cleaning</strong> button to send a Martian dust devil to save Oppy!</p>
          <div class="cadet-fun-fact">
            🌟 <strong>Fun Fact:</strong> NASA hoped Oppy would survive 90 days. But Martian winds kept blowing the dust off its solar wings, so Oppy explored for <strong>15 whole years</strong>!
          </div>
        </div>
      \`;
      narrationText = 'Welcome Cadet! Opportunity was a solar powered rover on Mars. When giant dust storms blanketed the planet, sunlight could not reach its solar panels. Slide the dust slider to see the sky turn dark, and trigger a wind event to save the robot!';
    } else if (lvl === 'scientist') {
      descEl.textContent = 'Explore Beer-Lambert atmospheric optical depth attenuation, triple-junction photovoltaic degradation, and sub-zero thermal equilibrium limits.';
      audienceBox.innerHTML = \`
        <div class="science-formula-box">
          <div class="formula-header">🔬 ATMOSPHERIC RADIATIVE TRANSFER & BEER-LAMBERT ATTENUATION</div>
          <div class="formula-math">
            I(&tau;) = I_0 &sdot; exp(-&tau; / cos &theta;_z)
          </div>
          <div class="formula-breakdown">
            <div class="param-row"><span class="p-symbol">&tau;</span> <span class="p-desc">Atmospheric dust optical depth (tau measured by Mastcam solar extinction)</span></div>
            <div class="param-row"><span class="p-symbol">I_0</span> <span class="p-desc">Martian top-of-atmosphere insolation &approx; 590 W/m&sup2; at 1.52 AU</span></div>
            <div class="param-row"><span class="p-symbol">&eta;</span> <span class="p-desc">Triple-junction GaInP/GaAs/Ge cell conversion efficiency &approx; 27.5%</span></div>
            <div class="param-row"><span class="p-symbol">P_crit</span> <span class="p-desc">Thermal boundary: &lt; 180 Wh/sol triggers battery freeze-out at T_crit = -40&deg;C</span></div>
          </div>
        </div>
        <div class="telemetry-table-mini">
          <table>
            <thead><tr><th>Parameter</th><th>Nominal (Clear)</th><th>Global Storm (Sol 5111)</th></tr></thead>
            <tbody>
              <tr><td>Direct Solar Flux</td><td>480 W/m&sup2;</td><td>&lt; 0.05 W/m&sup2; (99.9% blocked)</td></tr>
              <tr><td>Solar Array Output</td><td>940 Wh / sol</td><td>22 Wh / sol</td></tr>
              <tr><td>Survival Radio Drain</td><td>120 Wh / window</td><td>Depleted (Bus brownout)</td></tr>
            </tbody>
          </table>
        </div>
      \`;
      narrationText = 'Chief Scientist mode active. Radiative transfer through the Martian troposphere follows Beer-Lambert attenuation where transmitted solar flux decreases exponentially with optical depth tau. At tau 10.8, available insolation falls below critical heater thresholds, triggering irreversible master clock freezeout.';
    } else {
      // explorer
      descEl.textContent = 'Slide between clear skies and global dust storms to understand how optical opacity (Tau) directly starved Opportunity of power on Sol 5,111.';
      audienceBox.innerHTML = \`
        <div class="explorer-card">
          <h4>The 15-Year Solar Marathon</h4>
          <p>Opportunity was designed to survive 1,000 meters across 90 Martian Sols. Instead, it drove 45.16 kilometers (28 miles)—a full marathon off Earth! Its twin solar panels produced up to 900 Watt-hours per day in sunlight.</p>
          <div class="sim-did-you-know">
            <strong>💡 Sol 5,111 - The Final Transmission:</strong>
            In June 2018, a catastrophic global dust storm choked the sky for months. With atmospheric Tau exceeding 10.8, the sun was completely blotted out. Opportunity's final telemetry was poetically summarized as: <em>"My battery is low and it's getting dark."</em>
          </div>
        </div>
      \`;
      narrationText = 'Welcome Explorer! Opportunity drove across Mars for fifteen years using solar power. In June 2018, a planetary dust storm blocked out the sun, reducing its power generation from 900 watt hours down to just 22 watt hours, ending the greatest rover mission in history.';
    }

    voiceBtn.onclick = () => this.speakNarration(narrationText);

    // Canvas particle system for Martian dust storm
    const particles = [];
    const numParticles = 120;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * (height - 60),
        vx: 1.5 + Math.random() * 4.0,
        vy: (Math.random() - 0.5) * 1.0,
        size: 1 + Math.random() * 2.5,
        alpha: 0.1 + Math.random() * 0.5
      });
    }

    let currentTau = 0.6;
    let cleaningAnimation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Dynamic Martian Sky Gradient based on Tau
      const tauFactor = Math.min(1, Math.max(0, (currentTau - 0.5) / 10.3));
      
      // Interpolate colors: clear orange-peach -> dark bronze -> near pitch black
      const r1 = Math.round(245 * (1 - tauFactor) + 20 * tauFactor);
      const g1 = Math.round(158 * (1 - tauFactor) + 10 * tauFactor);
      const b1 = Math.round(11 * (1 - tauFactor) + 5 * tauFactor);

      const r2 = Math.round(124 * (1 - tauFactor) + 15 * tauFactor);
      const g2 = Math.round(45 * (1 - tauFactor) + 6 * tauFactor);
      const b2 = Math.round(18 * (1 - tauFactor) + 3 * tauFactor);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, \`rgb(\${r1},\${g1},\${b1})\`);
      skyGrad.addColorStop(0.7, \`rgb(\${r2},\${g2},\${b2})\`);
      skyGrad.addColorStop(1, '#2b1006');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. The Sun (Dimmed exponentially by Tau)
      const sunAlpha = Math.max(0.01, Math.exp(-0.45 * currentTau));
      const sunX = width * 0.22;
      const sunY = height * 0.25;
      const sunR = 32;

      // Sun halo
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 90);
      sunGlow.addColorStop(0, \`rgba(254, 240, 138, \${sunAlpha * 0.9})\`);
      sunGlow.addColorStop(0.4, \`rgba(251, 191, 36, \${sunAlpha * 0.5})\`);
      sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      ctx.fillStyle = \`rgba(255, 255, 255, \${sunAlpha})\`;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // 3. Distant Martian Crater Rim Dunes
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(0, height - 70);
      ctx.quadraticCurveTo(width * 0.25, height - 105, width * 0.5, height - 80);
      ctx.quadraticCurveTo(width * 0.75, height - 55, width, height - 75);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Foreground terrain
      ctx.fillStyle = '#2d0f04';
      ctx.beginPath();
      ctx.moveTo(0, height - 50);
      ctx.quadraticCurveTo(width * 0.4, height - 65, width, height - 45);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Small Martian Rocks on terrain
      ctx.fillStyle = '#1c0a02';
      ctx.fillRect(width * 0.15, height - 42, 12, 6);
      ctx.fillRect(width * 0.72, height - 38, 18, 9);
      ctx.fillRect(width * 0.85, height - 32, 8, 4);

      // 4. Draw Opportunity Rover Vector Model
      const roverX = width * 0.5;
      const roverY = height - 55;

      ctx.save();
      ctx.translate(roverX, roverY);

      // Wheels (Rocker-Bogie 6 wheels)
      ctx.fillStyle = '#111827';
      [-36, -20, 0, 20, 36].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, 26, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.arc(wx, 26, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111827';
      });

      // Rocker-bogie titanium struts
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-36, 26);
      ctx.lineTo(-18, 14);
      ctx.lineTo(0, 26);
      ctx.lineTo(20, 14);
      ctx.lineTo(36, 26);
      ctx.stroke();

      // Rover main gold/warm electronics body
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-28, 4, 56, 14);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-26, 6, 52, 10);

      // Mastcam Camera Mast
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, 4);
      ctx.lineTo(14, -28);
      ctx.stroke();

      // Stereo camera head
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(8, -34, 16, 7);
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(11, -30, 2, 0, Math.PI * 2);
      ctx.arc(21, -30, 2, 0, Math.PI * 2);
      ctx.fill();

      // High Gain Antenna Dish
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-16, -10, 9, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.lineTo(-16, -10);
      ctx.stroke();

      // Solar Array Wings (Twin wings spread horizontally)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-52, -2, 104, 6);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.strokeRect(-52, -2, 104, 6);

      // Solar Cells Grid Lines
      ctx.strokeStyle = '#60a5fa';
      for (let sx = -48; sx <= 48; sx += 8) {
        ctx.beginPath();
        ctx.moveTo(sx, -2);
        ctx.lineTo(sx, 4);
        ctx.stroke();
      }

      // Dust build-up layer on solar array
      const dustCoverAlpha = Math.min(0.95, tauFactor * 1.1);
      ctx.fillStyle = \`rgba(180, 83, 9, \${dustCoverAlpha})\`;
      ctx.fillRect(-52, -2, 104, 6);

      // If active power generation, draw glowing energy aura around solar cells
      const power = Math.max(22, Math.round(960 * Math.exp(-0.35 * currentTau)));
      if (power > 300) {
        const glowAlpha = (power / 960) * 0.4;
        ctx.fillStyle = \`rgba(0, 229, 255, \${glowAlpha})\`;
        ctx.fillRect(-54, -4, 108, 10);
      }

      ctx.restore();

      // 5. Dust Storm Flying Particles
      const stormSpeedMultiplier = 1 + tauFactor * 4;
      const stormParticleCount = Math.floor(10 + tauFactor * 110);

      ctx.fillStyle = \`rgba(217, 119, 6, \${0.2 + tauFactor * 0.6})\`;
      for (let i = 0; i < stormParticleCount; i++) {
        const p = particles[i];
        p.x += p.vx * stormSpeedMultiplier;
        p.y += p.vy;

        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height - 50;
        if (p.y > height - 50) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Dust Devil / Cleaning Wind Vortex Animation
      if (cleaningAnimation > 0) {
        ctx.save();
        const vortexX = (1 - cleaningAnimation / 100) * (width + 100) - 50;
        const vGrad = ctx.createRadialGradient(vortexX, height * 0.6, 10, vortexX, height * 0.6, 90);
        vGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        vGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
        vGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(vortexX, height * 0.6, 90, 0, Math.PI * 2);
        ctx.fill();

        // Wind swirl lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2.5;
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          ctx.arc(vortexX, height * 0.6, 20 + s * 16, s, s + Math.PI);
          ctx.stroke();
        }
        ctx.restore();

        cleaningAnimation -= 2;
      }

      this.activeAnimId = requestAnimationFrame(render);
    };

    render();

    // Handler for dust slider updates
    const updateSolarSim = (tauVal) => {
      currentTau = parseFloat(tauVal);
      dustSliderVal.textContent = \`&tau; = \${currentTau.toFixed(1)}\`;

      const power = Math.max(22, Math.round(960 * Math.exp(-0.35 * currentTau)));
      valTau.innerHTML = \`\${currentTau.toFixed(1)} \${currentTau < 1.5 ? '(Clear Sky)' : currentTau < 4.0 ? '(Regional Dust)' : currentTau < 8.0 ? '(Major Storm)' : '(Global Blackout)'}\`;
      valPower.innerHTML = \`\${power} Watt-Hours\`;

      if (power > 600) {
        valStatus.innerHTML = '&bull; FULLY OPERATIONAL (Driving & Science)';
        valStatus.style.color = '#34d399';
        valTemp.innerHTML = '-15&deg;C (Nominal Heaters)';
      } else if (power > 250) {
        valStatus.innerHTML = '&bull; CAUTION: Driving Suspended (Survival Heaters Only)';
        valStatus.style.color = '#fbbf24';
        valTemp.innerHTML = '-35&deg;C (Cold Threshold)';
      } else if (power > 50) {
        valStatus.innerHTML = '&bull; CRITICAL: Low Power Sleep (Radio Off / Waiting)';
        valStatus.style.color = '#f97316';
        valTemp.innerHTML = '-65&deg;C (Battery Degrading)';
      } else {
        valStatus.innerHTML = '&bull; SILENT: Sol 5,111 Battery Depleted (Clock Frozen)';
        valStatus.style.color = '#ef4444';
        valTemp.innerHTML = '-95&deg;C (Critical Freeze)';
      }
    };

    slider.addEventListener('input', (e) => updateSolarSim(e.target.value));

    container.querySelector('#btn-wind-clean').addEventListener('click', () => {
      cleaningAnimation = 100;
      slider.value = 0.6;
      updateSolarSim(0.6);
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('💨 A Martian dust devil swept the solar panels clean! Power restored to 920 Wh!', '☀️', 3500);
      }
    });

    container.querySelector('#btn-sol-5111').addEventListener('click', () => {
      slider.value = 10.8;
      updateSolarSim(10.8);
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('Sol 5,111: Global dust storm blocks the Sun. Last telemetry: "My battery is low and it is getting dark."', '🌑', 4500);
      }
    });

    updateSolarSim(0.6);
  }

  /* ===================== SIMULATION 2: SKY CRANE SEQUENCE ===================== */
  renderSkyCraneLab(container) {
    const lvl = this.audienceLevel;

    container.innerHTML = \`
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="canvas-viewport-wrap" id="skycrane-viewport-wrap">
            <canvas id="skycrane-canvas" class="lab-canvas"></canvas>
            
            <div class="crane-telemetry-badge">
              <span id="crane-stage-badge" class="badge-stage-pill">STAGE 1 / 4</span>
              <span id="crane-altitude-text">Altitude: 125 km (Atmospheric Entry)</span>
              <span id="crane-speed-text">Velocity: 13,000 mph (Mach 17.1)</span>
              <span id="crane-dyn-press">Dynamic Pressure (q): 0 kPa</span>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <div class="sim-title-group">
            <div class="title-with-voice">
              <h3>🪂 Curiosity & Perseverance Sky Crane</h3>
              <button class="btn-voice-narrate" id="btn-crane-voice" title="Listen to stage explanation">
                <span class="voice-icon">🔊</span> Listen
              </button>
            </div>
            <p class="sim-desc" id="crane-sim-desc">
              Car-sized rovers weigh over 2,200 pounds—far too heavy for bounce airbags! NASA invented the Sky Crane: a rocket jetpack that lowers the rover on nylon cables.
            </p>
          </div>

          <div class="stepper-buttons-row" id="crane-steps">
            <button class="step-card-btn active" data-step="1">
              <strong>1. Heat Shield</strong>
              <span>13,000 mph entry</span>
            </button>
            <button class="step-card-btn" data-step="2">
              <strong>2. Supersonic Chute</strong>
              <span>Mach 1.7 parachute</span>
            </button>
            <button class="step-card-btn" data-step="3">
              <strong>3. Powered Descent</strong>
              <span>8 Hydrazine rockets</span>
            </button>
            <button class="step-card-btn" data-step="4">
              <strong>4. Sky Crane Lowering</strong>
              <span>25ft nylon bridles</span>
            </button>
          </div>

          <div class="crane-explainer-card" id="crane-explainer"></div>

          <!-- Audience Specific Box -->
          <div class="audience-dynamic-box" id="crane-audience-box"></div>
        </div>
      </div>
    \`;

    const canvas = container.querySelector('#skycrane-canvas');
    const { ctx, width, height } = this.setupHiDPICanvas(canvas);

    const stageBadge = container.querySelector('#crane-stage-badge');
    const altText = container.querySelector('#crane-altitude-text');
    const spdText = container.querySelector('#crane-speed-text');
    const dynText = container.querySelector('#crane-dyn-press');
    const explainer = container.querySelector('#crane-explainer');
    const audienceBox = container.querySelector('#crane-audience-box');
    const voiceBtn = container.querySelector('#btn-crane-voice');
    const stepBtns = container.querySelectorAll('.step-card-btn');

    let currentStep = 1;
    let animTime = 0;

    const stagesData = [
      {
        num: 1,
        title: 'Stage 1: Hypersonic Entry & Plasma Shockwave',
        alt: 'Altitude: 125 km &rarr; 11 km',
        spd: 'Velocity: 13,000 mph (Mach 17.5)',
        dyn: 'Dynamic Pressure (q): 12.8 kPa',
        cadetText: 'Imagine slamming into a brick wall made of air! The heat shield gets as hot as a volcano lava flow (2,700&deg;F) and slows the robot down by 90% in just four minutes without using any gas!',
        explorerText: 'The spacecraft hits the upper Martian atmosphere at 13,000 mph. The PICA-X ablative heat shield glows at 2,700&deg;F (1,500&deg;C), absorbing friction and compressing the thin air into a glowing plasma bow shock.',
        scientistText: 'Atmospheric hypersonic deceleration. Shock layer stagnation enthalpy: h_0 = h_&infin; + 0.5 v_&infin;&sup2;. Peak heat flux q_dot &approx; 350 W/cm&sup2; dissipated via phenolic-impregnated carbon ablator (PICA). Aerodynamic drag F_D = 0.5 &rho; v&sup2; C_D A dissipates 99% of kinetic energy.',
        formula: 'F_D = \\frac{1}{2}\\rho(z) v^2 C_D A, \\quad T_{\\text{shock}} \\approx T_\\infty \\left(1 + \\frac{\\gamma-1}{2} M^2\\right)'
      },
      {
        num: 2,
        title: 'Stage 2: Supersonic Parachute Deployment',
        alt: 'Altitude: 11 km &rarr; 1.6 km',
        spd: 'Velocity: 950 mph (Mach 1.7)',
        dyn: 'Dynamic Pressure (q): 450 Pa',
        cadetText: 'A giant cannon shoots out the biggest parachute in space history! It pops open in less than half a second under 65,000 pounds of pull. Then the heat shield drops off so cameras can see the ground.',
        explorerText: 'At Mach 1.7, a mortar cannons the 70-foot Disk-Gap-Band supersonic parachute. It inflates in 0.4 seconds under 65,000 lbs of tension. The heat shield drops away, enabling ground-tracking radar lock.',
        scientistText: 'Disk-Gap-Band (DGB) mortar deployment at Mach 1.7 with dynamic pressure q = 450 Pa. Terminal aerodynamic load: 289 kN. Terminal Descent Sensor (Ka-band radar) and Terrain-Relative Navigation (TRN) camera achieve surface terrain correlation.',
        formula: 'L_{\\text{chute}} = \\frac{1}{2}\\rho v_{\\text{dep}}^2 C_D A_{\\text{chute}} \\approx 290\\text{ kN}'
      },
      {
        num: 3,
        title: 'Stage 3: Powered Descent Rocket Braking',
        alt: 'Altitude: 1.6 km &rarr; 20 m',
        spd: 'Velocity: 180 mph &rarr; 1.7 mph',
        dyn: 'Dynamic Pressure (q): 30 Pa',
        cadetText: 'The parachute lets go and eight rocket engines roar to life on the jetpack! The rocket backpack steers itself to avoid boulders and slows the heavy rover to a super gentle crawl.',
        explorerText: 'The backshell disconnects. Eight throttleable hydrazine rocket engines ignite, decelerating the falling rover until it is hovering motionless just 60 feet above the Martian dirt.',
        scientistText: 'Powered Descent Stage separation. 8x throttleable C-GRAV Mars Landing Engines (MLE) pulse-width modulated hydrazine monopropellant thrusters (I_sp = 225 s, T = 3.1 kN each). Decelerates descent velocity to vertical v_z = -0.75 m/s.',
        formula: 'T = \\dot{m} v_e = \\dot{m} I_{\\text{sp}} g_0, \\quad a_z = \\frac{\\sum T_i \\cos\\theta - m g_{\\text{Mars}}}{m}'
      },
      {
        num: 4,
        title: 'Stage 4: Sky Crane Bridle Lowering & Flyaway',
        alt: 'Altitude: 20 m &rarr; 0 m (Touchdown!)',
        spd: 'Velocity: 1.5 mph &rarr; 0 mph',
        dyn: 'Dynamic Pressure (q): Ground Contact',
        cadetText: 'Like a crane on strings! The rocket jetpack hovers in the air and lowers the rover on three super strong ropes. When the wheels touch the dirt, mini blades cut the ropes and the jetpack flies away to crash safely!',
        explorerText: 'Hovering 60 feet up, three nylon bridles and an umbilical data cable lower the rover 25 feet. On wheel contact, pyrotechnic blades slice the cords and the descent stage throttles to 100% to crash 2,000 feet away.',
        scientistText: 'Tether touchdown event. 3-point Bridle and Umbilical Cord (BUC) deploy rover rocker-bogie at 0.75 m/s. Weight transfer detection triggers pyrotechnic cable cutters. Flyaway burn: 100% throttle delta-v burn vectors descent stage 650 m away.',
        formula: 'T_{\\text{bridle}} = \\frac{m_{\\text{rover}}(g_{\\text{Mars}} + a_z)}{3}, \\quad \\Delta v_{\\text{flyaway}} \\ge 250\\text{ m/s}'
      }
    ];

    const updateStageUI = (stepNum) => {
      currentStep = stepNum;
      const data = stagesData[stepNum - 1];

      stepBtns.forEach((b, idx) => b.classList.toggle('active', idx === stepNum - 1));

      stageBadge.textContent = \`STAGE \${data.num} / 4\`;
      altText.innerHTML = data.alt;
      spdText.innerHTML = data.spd;
      dynText.innerHTML = data.dyn;

      let explanationBody = '';
      let narration = '';

      if (lvl === 'cadet') {
        explanationBody = \`<h4>\${data.title}</h4><p>\${data.cadetText}</p>\`;
        narration = data.cadetText;
        audienceBox.innerHTML = \`
          <div class="cadet-challenge-box">
            <div class="cadet-badge">🚀 DID YOU KNOW?</div>
            <p>Because Curiosity and Perseverance weigh more than an elephant cub, ordinary balloons would pop on impact! The Sky Crane is the only machine ever built to lower a car onto another planet!</p>
          </div>
        \`;
      } else if (lvl === 'scientist') {
        explanationBody = \`<h4>\${data.title}</h4><p>\${data.scientistText}</p>\`;
        narration = data.scientistText;
        audienceBox.innerHTML = \`
          <div class="science-formula-box">
            <div class="formula-header">🔬 EDL GOVERNING EQUATION</div>
            <div class="formula-math">\${data.formula}</div>
            <div class="formula-breakdown">
              <div class="param-row"><span class="p-symbol">MLE Thrusters:</span> <span class="p-desc">8x 3.1 kN Hydrazine Pulse-Width Modulated (PWM)</span></div>
              <div class="param-row"><span class="p-symbol">Tether:</span> <span class="p-desc">3x Vectran-core high-modulus aramid bridles</span></div>
            </div>
          </div>
        \`;
      } else {
        explanationBody = \`<h4>\${data.title}</h4><p>\${data.explorerText}</p>\`;
        narration = data.explorerText;
        audienceBox.innerHTML = \`
          <div class="sim-did-you-know">
            <strong>💡 Why wasn't the sky crane recovered?</strong>
            After lowering the rover gently onto its wheels, pyrotechnic guillotines severed the cables. The descent stage throttled its engines to 100% to fly 2,000 feet away and crash safely, protecting the rover's scientific cameras from flying debris!
          </div>
        \`;
      }

      explainer.innerHTML = explanationBody;
      voiceBtn.onclick = () => this.speakNarration(narration);
    };

    // Make selectSkyCraneStage available globally and on instance
    this.selectSkyCraneStage = (num) => updateStageUI(num);

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.getAttribute('data-step'), 10);
        updateStageUI(stepNum);
      });
    });

    // Canvas Visual Simulation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      animTime += 0.04;

      // Martian Sky Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (currentStep === 1) {
        bgGrad.addColorStop(0, '#030712'); // Upper black space
        bgGrad.addColorStop(0.7, '#1e0802');
        bgGrad.addColorStop(1, '#451a03');
      } else {
        bgGrad.addColorStop(0, '#451a03');
        bgGrad.addColorStop(0.6, '#7c2d12');
        bgGrad.addColorStop(1, '#9a3412');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Starfield during Stage 1
      if (currentStep === 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let s = 0; s < 25; s++) {
          const sx = (s * 47) % width;
          const sy = (s * 31) % (height * 0.4);
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }

      // Ground Terrain (visible in stages 3 and 4)
      if (currentStep >= 3) {
        ctx.fillStyle = '#2d0f04';
        ctx.fillRect(0, height - 35, width, 35);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(0, height - 42, width, 7);
      }

      const centerX = width * 0.5;

      if (currentStep === 1) {
        // --- STAGE 1: HYPERSONIC ENTRY PLASMA SHOCK ---
        const capsuleY = height * 0.45;

        // Plasma Bow Shock wave arc
        const shockOsc = Math.sin(animTime * 15) * 3;
        const shockGrad = ctx.createRadialGradient(centerX, capsuleY + 35, 10, centerX, capsuleY + 35, 75);
        shockGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        shockGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.8)');
        shockGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.5)');
        shockGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = shockGrad;
        ctx.beginPath();
        ctx.arc(centerX, capsuleY + 28, 65 + shockOsc, 0, Math.PI);
        ctx.fill();

        // Ionized ablation sparks
        for (let sp = 0; sp < 12; sp++) {
          const sparkX = centerX + (Math.sin(animTime * 20 + sp) * 45);
          const sparkY = capsuleY + 30 - ((animTime * 60 + sp * 25) % 110);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
          ctx.fillRect(sparkX, sparkY, 3, 3);
        }

        // Aeroshell Conical Backshell
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(centerX, capsuleY - 45);
        ctx.lineTo(centerX - 42, capsuleY + 18);
        ctx.lineTo(centerX + 42, capsuleY + 18);
        ctx.closePath();
        ctx.fill();

        // PICA-X Heat Shield (glowing bottom curved disc)
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(centerX, capsuleY + 20, 44, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(centerX, capsuleY + 22, 36, 6, 0, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentStep === 2) {
        // --- STAGE 2: SUPERSONIC PARACHUTE ---
        const craftY = height * 0.62;
        const chuteY = height * 0.16;

        // Parachute Canopy (Disk-Gap-Band)
        const ripple = Math.sin(animTime * 12) * 4;
        ctx.fillStyle = '#ea580c'; // Orange-white patterns
        ctx.beginPath();
        ctx.ellipse(centerX, chuteY, 68 + ripple, 30, 0, Math.PI, 0);
        ctx.fill();

        // Chute white bands
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(centerX, chuteY - 8, 48 + ripple * 0.7, 18, 0, Math.PI, 0);
        ctx.fill();

        // Suspension lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        for (let l = -4; l <= 4; l++) {
          ctx.beginPath();
          ctx.moveTo(centerX + l * 14, chuteY);
          ctx.lineTo(centerX, craftY - 25);
          ctx.stroke();
        }

        // Backshell hanging
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(centerX, craftY - 25);
        ctx.lineTo(centerX - 30, craftY + 15);
        ctx.lineTo(centerX + 30, craftY + 15);
        ctx.closePath();
        ctx.fill();

        // Separated Heat Shield falling below
        const fallDist = (animTime * 40) % 90;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(centerX + 15, craftY + 45 + fallDist, 24, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentStep === 3) {
        // --- STAGE 3: POWERED DESCENT THRUSTERS ---
        const descentY = height * 0.42;

        // Descent Stage (Flyer Body)
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(centerX - 42, descentY - 14, 84, 20);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(centerX - 36, descentY - 22, 72, 8);

        // Rover docked underneath
        ctx.fillStyle = '#d97706';
        ctx.fillRect(centerX - 28, descentY + 6, 56, 18);
        ctx.fillStyle = '#111827';
        [-20, 0, 20].forEach(wx => {
          ctx.beginPath();
          ctx.arc(centerX + wx, descentY + 28, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        // 4 Hydrazine Rocket Thruster Plumes
        const flameLength = 35 + Math.sin(animTime * 30) * 8;
        const thrusterOffsets = [-40, -22, 22, 40];
        thrusterOffsets.forEach(tx => {
          const fGrad = ctx.createLinearGradient(centerX + tx, descentY + 6, centerX + tx, descentY + 6 + flameLength);
          fGrad.addColorStop(0, '#ffffff');
          fGrad.addColorStop(0.3, '#38bdf8');
          fGrad.addColorStop(0.7, '#ea580c');
          fGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.moveTo(centerX + tx - 5, descentY + 6);
          ctx.lineTo(centerX + tx + 5, descentY + 6);
          ctx.lineTo(centerX + tx, descentY + 6 + flameLength);
          ctx.closePath();
          ctx.fill();
        });

        // Terrain Relative Navigation (TRN) Green Radar Cone
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, descentY + 10);
        ctx.lineTo(centerX - 120, height - 35);
        ctx.moveTo(centerX, descentY + 10);
        ctx.lineTo(centerX + 120, height - 35);
        ctx.stroke();

        // Scan radar grid lines
        const scanY = descentY + ((animTime * 50) % (height - 35 - descentY));
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.strokeRect(centerX - (scanY - descentY) * 0.7, scanY, (scanY - descentY) * 1.4, 2);

      } else if (currentStep === 4) {
        // --- STAGE 4: SKY CRANE TETHER LOWERING ---
        const hoverY = height * 0.28;
        const roverTargetY = height - 60;

        // Descent Stage hovering
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(centerX - 46, hoverY - 14, 92, 20);

        // Thrusters firing sideways/canted
        [-44, 44].forEach(tx => {
          const fGrad = ctx.createLinearGradient(centerX + tx, hoverY + 6, centerX + tx * 1.3, hoverY + 35);
          fGrad.addColorStop(0, '#ffffff');
          fGrad.addColorStop(0.5, '#38bdf8');
          fGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.moveTo(centerX + tx - 6, hoverY + 6);
          ctx.lineTo(centerX + tx + 6, hoverY + 6);
          ctx.lineTo(centerX + tx * 1.3, hoverY + 35);
          ctx.closePath();
          ctx.fill();
        });

        // 3 High-Tensile Bridles (Nylon ropes)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        [-20, 0, 20].forEach(bx => {
          ctx.beginPath();
          ctx.moveTo(centerX + bx * 1.5, hoverY + 6);
          ctx.lineTo(centerX + bx, roverTargetY);
          ctx.stroke();
        });

        // Umbilical data cable (coiled yellow cord)
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX + 8, hoverY + 6);
        ctx.quadraticCurveTo(centerX + 18, (hoverY + roverTargetY) * 0.5, centerX + 10, roverTargetY);
        ctx.stroke();

        // Lowered Rover (Wheels touched down!)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(centerX - 32, roverTargetY, 64, 16);

        // MastCam
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX + 16, roverTargetY);
        ctx.lineTo(centerX + 16, roverTargetY - 18);
        ctx.stroke();

        // 6 Deployed Rocker-Bogie Wheels
        ctx.fillStyle = '#111827';
        [-26, -14, 0, 14, 26].forEach(wx => {
          ctx.beginPath();
          ctx.arc(centerX + wx, roverTargetY + 22, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        // Regolith Dust Blast on touchdown
        const dustOsc = Math.sin(animTime * 20) * 8;
        ctx.fillStyle = 'rgba(217, 119, 6, 0.45)';
        ctx.beginPath();
        ctx.ellipse(centerX - 45, height - 38, 25 + dustOsc, 10, 0, 0, Math.PI * 2);
        ctx.ellipse(centerX + 45, height - 38, 25 + dustOsc, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      this.activeAnimId = requestAnimationFrame(render);
    };

    render();
    updateStageUI(1);
  }

  /* ===================== SIMULATION 3: LUNAR LASER RANGING ===================== */
  renderLaserLab(container) {
    const lvl = this.audienceLevel;

    container.innerHTML = \`
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="canvas-viewport-wrap" id="laser-viewport-wrap">
            <canvas id="laser-canvas" class="lab-canvas"></canvas>
            
            <div class="laser-readout-hud">
              <div class="readout-box">
                <span class="readout-label">Light Round-Trip Time (&Delta;t):</span>
                <span class="readout-val" id="laser-timer">0.00000000 s</span>
              </div>
              <div class="readout-box">
                <span class="readout-label">Measured Moon Distance:</span>
                <span class="readout-val readout-cyan" id="laser-distance">384,402,142.6 mm</span>
              </div>
              <div class="readout-box">
                <span class="readout-label">Single-Photon Detector:</span>
                <span class="readout-val readout-gold" id="laser-photon-count">STANDBY</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <div class="sim-title-group">
            <div class="title-with-voice">
              <h3>🪞 Apollo Lunar Laser Ranging Simulator</h3>
              <button class="btn-voice-narrate" id="btn-laser-voice" title="Listen to laser experiment explanation">
                <span class="voice-icon">🔊</span> Listen
              </button>
            </div>
            <p class="sim-desc" id="laser-sim-desc">
              Apollo 11, 14, and 15 astronauts left quartz corner-cube prism reflectors on the Moon. Scientists fire pulsed lasers at them to measure the Moon's distance to millimeter accuracy!
            </p>
          </div>

          <button class="btn-fire-laser" id="btn-fire-laser">
            <span>⚡ Fire 532nm Green Laser Pulse</span>
          </button>

          <div class="laser-facts-list">
            <div class="fact-item">
              <strong>🔬 Speed of Light (c):</strong> 299,792.458 km/s (in vacuo)
            </div>
            <div class="fact-item">
              <strong>⏱️ Round-Trip Travel Time:</strong> Approximately 2.564 seconds
            </div>
            <div class="fact-item">
              <strong>📏 The Groundbreaking Discovery:</strong> The Moon recedes by <strong>3.82 cm (1.5 inches)</strong> per year due to Earth ocean tidal friction!
            </div>
          </div>

          <!-- Audience Specific Box -->
          <div class="audience-dynamic-box" id="laser-audience-box"></div>
        </div>
      </div>
    \`;

    const canvas = container.querySelector('#laser-canvas');
    const { ctx, width, height } = this.setupHiDPICanvas(canvas);

    const fireBtn = container.querySelector('#btn-fire-laser');
    const timerEl = container.querySelector('#laser-timer');
    const distEl = container.querySelector('#laser-distance');
    const photonCountEl = container.querySelector('#laser-photon-count');
    const descEl = container.querySelector('#laser-sim-desc');
    const audienceBox = container.querySelector('#laser-audience-box');
    const voiceBtn = container.querySelector('#btn-laser-voice');

    let narrationText = '';
    if (lvl === 'cadet') {
      descEl.textContent = 'Hit the big green button! Watch laser beams shoot all the way to the Moon, bounce off astronaut mirrors, and race back to Earth in 2.5 seconds!';
      audienceBox.innerHTML = \`
        <div class="cadet-challenge-box">
          <div class="cadet-badge">🌕 MAGIC CORNER-CUBE MIRRORS</div>
          <h4>How do mirrors work without electricity?</h4>
          <p>Imagine three mirrors glued into the corner of a cardboard box. No matter what crazy angle you throw a ball into the corner, it bounces three times and flies right back to your hand! That is how Apollo mirrors shoot lasers straight back to Earth!</p>
        </div>
      \`;
      narrationText = 'Welcome Cadet! Fire the laser button to bounce green light off the Moon! The retroreflectors left by Apollo 11 need zero electricity to reflect light straight back to Earth. Light travels so fast it visits the Moon and comes back in just two and a half seconds!';
    } else if (lvl === 'scientist') {
      descEl.textContent = 'Explore picosecond photon time-of-flight, lunar secular orbital expansion, and Strong Equivalence Principle tests.';
      audienceBox.innerHTML = \`
        <div class="science-formula-box">
          <div class="formula-header">🔬 LLR RADAR LINK EQUATION & TIDAL DISSIPATION</div>
          <div class="formula-math">
            N_{\\text{rx}} = N_{\\text{tx}} \\cdot \\eta_{\\text{tx}} \\cdot \\left[\\frac{A_{\\text{retro}}}{\\pi (d \\theta_{\\text{div}}/2)^2}\\right] \\cdot \\left[\\frac{A_{\\text{tel}}}{\\pi (d \\theta_{\\text{diff}}/2)^2}\\right] \\cdot T_{\\text{atm}}^2 \\approx 10^{-17}
          </div>
          <div class="formula-breakdown">
            <div class="param-row"><span class="p-symbol">&Delta;t:</span> <span class="p-desc">Time of flight: &Delta;t = 2d/c + &Delta;t_rel (Shapiro delay) + &Delta;t_tropo</span></div>
            <div class="param-row"><span class="p-symbol">da/dt:</span> <span class="p-desc">Lunar semi-major axis expansion = +3.82 &plusmn; 0.07 cm/yr (tidal torque)</span></div>
            <div class="param-row"><span class="p-symbol">Nordtvedt &eta;:</span> <span class="p-desc">Strong Equivalence Principle: |4&beta; - &gamma; - 3| &le; 10&oline;&sup4;</span></div>
          </div>
        </div>
      \`;
      narrationText = 'Chief Scientist mode active. Lunar Laser Ranging provides the most stringent validation of General Relativity and the Strong Equivalence Principle. Out of ten to the seventeenth photons transmitted per pulse at 532 nanometers, on average one single photon is returned to the avalanche detector, yielding sub-centimeter orbital precision.';
    } else {
      descEl.textContent = 'Fire the 532nm green laser to measure light travel time across 384,400 km and explore the retroreflector array still working today.';
      audienceBox.innerHTML = \`
        <div class="sim-did-you-know">
          <strong>💡 Corner-Cube Prism Optics:</strong>
          Corner cubes utilize total internal reflection between three mutually orthogonal 90&deg; quartz faces. The reflected light beam travels in an exact anti-parallel direction back to the emitter, regardless of the angle of incidence.
        </div>
      \`;
      narrationText = 'Welcome Explorer! Apollo astronauts left suitcase-sized retroreflector panels on the Moon. Today, observatories on Earth fire green laser pulses at them. By timing how long the pulse takes to bounce back, we discover the Moon is drifting 3.8 centimeters further away every year!';
    }

    voiceBtn.onclick = () => this.speakNarration(narrationText);

    // Laser firing simulation state
    let laserProgress = -1; // -1: idle, 0 to 1: outbound, 1 to 2: inbound
    let isFiring = false;

    fireBtn.addEventListener('click', () => {
      if (isFiring) return;
      isFiring = true;
      fireBtn.disabled = true;
      fireBtn.textContent = '⚡ Laser Pulse Traveling Across Space...';
      photonCountEl.textContent = 'PHOTON IN FLIGHT...';
      laserProgress = 0;

      const startTime = performance.now();
      const flightDuration = 2564; // ms round-trip

      const timerInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        timerEl.textContent = \`\${elapsed.toFixed(8)} s\`;
      }, 25);

      setTimeout(() => {
        clearInterval(timerInterval);
        timerEl.textContent = '2.56441920 s';
        const randomMm = (384402140 + Math.random() * 8).toFixed(1);
        distEl.textContent = \`\${Number(randomMm).toLocaleString()} mm\`;
        photonCountEl.textContent = '1 PHOTON DETECTED (532nm)';
        photonCountEl.style.color = '#22c55e';

        isFiring = false;
        laserProgress = -1;
        fireBtn.disabled = false;
        fireBtn.innerHTML = '<span>⚡ Fire Another Laser Pulse</span>';

        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(\`🎯 Single photon detected at SPAD receiver! Lunar distance: \${randomMm} mm!\`, '🌕', 4000);
        }
      }, flightDuration);
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space starfield
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Background stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let s = 0; s < 30; s++) {
        const sx = (s * 41) % width;
        const sy = (s * 29) % (height - 60);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      const earthX = width * 0.16;
      const earthY = height * 0.42;
      const earthR = 40;

      const moonX = width * 0.84;
      const moonY = height * 0.42;
      const moonR = 28;

      // 1. Draw Earth
      const earthGrad = ctx.createRadialGradient(earthX - 10, earthY - 10, 5, earthX, earthY, earthR);
      earthGrad.addColorStop(0, '#60a5fa');
      earthGrad.addColorStop(0.6, '#2563eb');
      earthGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Earth atmosphere glow
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR + 2, 0, Math.PI * 2);
      ctx.stroke();

      // Observatory Telescope dome on Earth
      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.arc(earthX + earthR * 0.9, earthY - 8, 8, Math.PI * 1.5, Math.PI * 0.5);
      ctx.fill();

      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌍 Earth (Apache Point)', earthX, earthY + earthR + 22);

      // 2. Draw Moon
      const moonGrad = ctx.createRadialGradient(moonX - 6, moonY - 6, 4, moonX, moonY, moonR);
      moonGrad.addColorStop(0, '#f3f4f6');
      moonGrad.addColorStop(0.7, '#9ca3af');
      moonGrad.addColorStop(1, '#4b5563');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Craters on Moon
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(moonX - 8, moonY - 6, 5, 0, Math.PI * 2);
      ctx.arc(moonX + 10, moonY + 4, 4, 0, Math.PI * 2);
      ctx.arc(moonX - 2, moonY + 12, 3, 0, Math.PI * 2);
      ctx.fill();

      // Apollo 11 Retroreflector Target marker on Moon
      ctx.fillStyle = '#facc15';
      ctx.fillRect(moonX - earthR * 0.6, moonY - 4, 8, 8);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(moonX - earthR * 0.6, moonY - 4, 8, 8);

      ctx.fillStyle = '#9ca3af';
      ctx.fillText('🌕 Moon (Apollo 11 LRRR)', moonX, moonY + moonR + 22);

      // 3. Laser Beam Track & Animated Pulse
      const startX = earthX + earthR * 0.9 + 8;
      const startY = earthY - 8;
      const targetX = moonX - earthR * 0.6;
      const targetY = moonY;

      // Track line (faint guideline)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (isFiring) {
        laserProgress += 0.012; // Advance progress

        if (laserProgress <= 1.0) {
          // Outbound pulse (expanding cone from Earth to Moon)
          const px = startX + (targetX - startX) * laserProgress;
          const py = startY + (targetY - startY) * laserProgress;

          // Beam divergence cone
          ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(px, py - laserProgress * 12);
          ctx.lineTo(px, py + laserProgress * 12);
          ctx.closePath();
          ctx.fill();

          // Green photon pulse head
          const photonGlow = ctx.createRadialGradient(px, py, 2, px, py, 14);
          photonGlow.addColorStop(0, '#ffffff');
          photonGlow.addColorStop(0.4, '#22c55e');
          photonGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
          ctx.fillStyle = photonGlow;
          ctx.beginPath();
          ctx.arc(px, py, 14, 0, Math.PI * 2);
          ctx.fill();

        } else if (laserProgress <= 2.0) {
          // Inbound return photon (tiny 1-photon return packet!)
          const inboundP = laserProgress - 1.0;
          const px = targetX - (targetX - startX) * inboundP;
          const py = targetY - (targetY - startY) * inboundP;

          // Green return photon
          const photonGlow = ctx.createRadialGradient(px, py, 1, px, py, 8);
          photonGlow.addColorStop(0, '#ffffff');
          photonGlow.addColorStop(0.5, '#4ade80');
          photonGlow.addColorStop(1, 'rgba(74, 222, 128, 0)');
          ctx.fillStyle = photonGlow;
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();

          // Flash retroreflector hit at Moon
          if (inboundP < 0.15) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Inset Corner Cube Optical Ray Diagram (Bottom Center)
      const insetW = 160;
      const insetH = 80;
      const insetX = (width - insetW) * 0.5;
      const insetY = height - insetH - 8;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'var(--border-glass)';
      ctx.lineWidth = 1;
      ctx.fillRect(insetX, insetY, insetW, insetH);
      ctx.strokeRect(insetX, insetY, insetW, insetH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('90° CORNER-CUBE RAY OPTICS', insetX + 8, insetY + 14);

      // Draw 90° corner prism walls
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(insetX + 25, insetY + 25);
      ctx.lineTo(insetX + 80, insetY + 70);
      ctx.lineTo(insetX + 135, insetY + 25);
      ctx.stroke();

      // Draw ray entering, hitting wall 1, hitting wall 2, leaving parallel
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(insetX + 35, insetY + 20); // incident
      ctx.lineTo(insetX + 60, insetY + 54); // bounce 1
      ctx.lineTo(insetX + 100, insetY + 54); // bounce 2
      ctx.lineTo(insetX + 125, insetY + 20); // reflected parallel
      ctx.stroke();

      this.activeAnimId = requestAnimationFrame(render);
    };

    render();
  }

  /* ===================== SIMULATION 4: INGENUITY AERODYNAMICS ===================== */
  renderIngenuityLab(container) {
    const lvl = this.audienceLevel;

    container.innerHTML = \`
      <div class="sim-grid">
        <div class="sim-display-panel">
          <div class="canvas-viewport-wrap" id="rotor-viewport-wrap">
            <canvas id="ingenuity-canvas" class="lab-canvas"></canvas>
            
            <div class="rotor-readout-hud">
              <div class="readout-box">
                <span class="readout-label">Atmospheric Density (&rho;):</span>
                <span class="readout-val" id="val-atmo-density">0.020 kg/m&sup3; (Mars)</span>
              </div>
              <div class="readout-box">
                <span class="readout-label">Coaxial Rotor Speed:</span>
                <span class="readout-val readout-gold" id="val-rotor-rpm">2,400 RPM</span>
              </div>
              <div class="readout-box">
                <span class="readout-label">Blade Tip Speed:</span>
                <span class="readout-val" id="val-tip-mach">Mach 0.72 (Subsonic)</span>
              </div>
              <div class="readout-box">
                <span class="readout-label">Generated Lift vs Gravity:</span>
                <span class="readout-val readout-cyan" id="val-rotor-lift">4.8 N &gt; 3.7 N (HOVERING)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sim-controls-panel">
          <div class="sim-title-group">
            <div class="title-with-voice">
              <h3>🚁 Ingenuity Thin-Air Aerodynamics Lab</h3>
              <button class="btn-voice-narrate" id="btn-rotor-voice" title="Listen to aerodynamics explanation">
                <span class="voice-icon">🔊</span> Listen
              </button>
            </div>
            <p class="sim-desc" id="rotor-sim-desc">
              Mars has less than 1% of Earth's atmospheric pressure! That means there are barely any gas molecules for helicopter blades to push against. Slide density and RPM to achieve flight!
            </p>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label for="slider-planet-atmo"><strong>Atmospheric Density (&rho;):</strong></label>
              <span class="control-current-val" id="density-display-val">0.020 kg/m&sup3; (Mars Surface)</span>
            </div>
            <input type="range" id="slider-planet-atmo" min="1" max="100" value="1">
            <div class="slider-ticks">
              <span>Mars (1% Air)</span>
              <span>100,000 ft Earth (5%)</span>
              <span>Mount Everest (33%)</span>
              <span>Earth Sea Level (100%)</span>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label-row">
              <label for="slider-rotor-rpm"><strong>Rotor RPM (Revolutions Per Minute):</strong></label>
              <span class="control-current-val" id="rpm-display-val">2,400 RPM</span>
            </div>
            <input type="range" id="slider-rotor-rpm" min="300" max="2800" step="50" value="2400">
            <div class="slider-ticks">
              <span>300 RPM (Toy Heli)</span>
              <span>1,200 RPM</span>
              <span>2,400 RPM (Ingenuity Flight)</span>
              <span>2,800 RPM (Overspeed Limit)</span>
            </div>
          </div>

          <!-- Audience Specific Box -->
          <div class="audience-dynamic-box" id="rotor-audience-box"></div>
        </div>
      </div>
    \`;

    const canvas = container.querySelector('#ingenuity-canvas');
    const { ctx, width, height } = this.setupHiDPICanvas(canvas);

    const sliderAtmo = container.querySelector('#slider-planet-atmo');
    const sliderRpm = container.querySelector('#slider-rotor-rpm');
    const densityValDisplay = container.querySelector('#density-display-val');
    const rpmValDisplay = container.querySelector('#rpm-display-val');

    const valAtmo = container.querySelector('#val-atmo-density');
    const valRpm = container.querySelector('#val-rotor-rpm');
    const valMach = container.querySelector('#val-tip-mach');
    const valLift = container.querySelector('#val-rotor-lift');
    const descEl = container.querySelector('#rotor-sim-desc');
    const audienceBox = container.querySelector('#rotor-audience-box');
    const voiceBtn = container.querySelector('#btn-rotor-voice');

    let currentAtmoPct = 1;
    let currentRpm = 2400;
    let animTime = 0;

    let narrationText = '';
    if (lvl === 'cadet') {
      descEl.textContent = 'Can you fly a helicopter where air is as thin as a ghost? Spin the blades fast to lift off, but watch out: spin too fast and you break the sound barrier!';
      audienceBox.innerHTML = \`
        <div class="cadet-challenge-box">
          <div class="cadet-badge">🚁 JUNIOR PILOT CHALLENGE</div>
          <h4>Why does Ingenuity have TWO sets of blades?</h4>
          <p>On Earth, a helicopter has a tiny tail rotor to keep it from spinning in circles like a crazy top. But Mars air is too thin for a tail rotor! So Ingenuity has <strong>two giant sets of blades</strong> that spin in opposite directions to cancel each other out!</p>
        </div>
      \`;
      narrationText = 'Welcome Cadet! Ingenuity made history as the first helicopter to fly on another planet. Because Mars air is super thin, its carbon fiber blades have to spin five times faster than an Earth helicopter at twenty-four hundred RPM!';
    } else if (lvl === 'scientist') {
      descEl.textContent = 'Analyze actuator disk momentum theory, tip Mach limitations in cold CO2, and counter-rotating torque cancellation.';
      audienceBox.innerHTML = \`
        <div class="science-formula-box">
          <div class="formula-header">🔬 BLADE ELEMENT & ACTUATOR DISK MOMENTUM FLUX</div>
          <div class="formula-math">
            L = \\frac{1}{2} \\rho v_{\\text{tip}}^2 A C_L = 2 \\rho A v_i^2, \\quad M_{\\text{tip}} = \\frac{\\omega R}{\\sqrt{\\gamma R_{\\text{spec}} T}}
          </div>
          <div class="formula-breakdown">
            <div class="param-row"><span class="p-symbol">&rho;_Mars:</span> <span class="p-desc">Density &approx; 0.018 - 0.020 kg/m&sup3; (&lt; 1% Earth sea-level 1.225 kg/m&sup3;)</span></div>
            <div class="param-row"><span class="p-symbol">a_Mars:</span> <span class="p-desc">Speed of sound &approx; 240 m/s in cold 210K CO&sup2; (&rarr; M_tip &approx; 0.72 at 2,400 RPM)</span></div>
            <div class="param-row"><span class="p-symbol">Q_net:</span> <span class="p-desc">Coaxial counter-rotation cancels reactive torque: Q_1 - Q_2 = 0</span></div>
          </div>
        </div>
      \`;
      narrationText = 'Chief Scientist mode active. Operating in low Reynolds number regime of approximately ten to the fourth, Ingenuity requires high tip speeds. However, the speed of sound in Martian carbon dioxide is only two hundred forty meters per second, capping rotor velocity at Mach 0.75 to prevent transonic shock wave stall.';
    } else {
      descEl.textContent = 'Slide between planetary densities and rotor RPMs to see why Ingenuity required supersonic blade-tip speeds and counter-rotating coaxial carbon-fiber rotors.';
      audienceBox.innerHTML = \`
        <div class="explorer-card">
          <h4>The Wright Brothers on Mars</h4>
          <p>Ingenuity was meant to be a 30-day technology demonstration with 5 flights. Instead, it completed <strong>72 historic flights</strong> across 3 years, serving as an aerial scout for Perseverance!</p>
          <div class="sim-did-you-know">
            <strong>💡 Piece of History:</strong>
            Taped beneath Ingenuity's solar panel was a tiny postage-stamp swatch of unbleached muslin fabric from the 1903 Wright Flyer's lower wing, connecting the first flight on Earth to the first flight on Mars!
          </div>
        </div>
      \`;
      narrationText = 'Welcome Explorer! Flying on Mars was thought impossible because the atmosphere is less than one percent as dense as Earth. Ingenuity proved it could be done, spinning its carbon fiber blades at twenty-four hundred RPM and flying 72 times across Jezero Crater!';
    }

    voiceBtn.onclick = () => this.speakNarration(narrationText);

    // Dynamic state update for rotor lab
    const updateRotorMetrics = () => {
      // Density calculation
      const rho = (0.020 + (currentAtmoPct - 1) * (1.205 / 99)).toFixed(3);
      valAtmo.innerHTML = \`\${rho} kg/m&sup3; (\${currentAtmoPct === 1 ? 'Mars' : currentAtmoPct + '% Earth'})\`;
      densityValDisplay.textContent = \`\${rho} kg/m&sup3; (\${currentAtmoPct === 1 ? 'Mars Surface' : currentAtmoPct + '% Earth'})\`;

      // RPM
      valRpm.textContent = \`\${currentRpm.toLocaleString()} RPM\`;
      rpmValDisplay.textContent = \`\${currentRpm.toLocaleString()} RPM\`;

      // Tip Speed Mach calculation (Rotor radius R = 0.605m, sound speed a = 240 m/s Mars, 343 m/s Earth)
      const omega = (currentRpm * 2 * Math.PI) / 60;
      const vTip = omega * 0.605; // m/s
      const aSound = currentAtmoPct === 1 ? 240 : 343;
      const mach = (vTip / aSound).toFixed(2);

      if (mach > 0.85) {
        valMach.innerHTML = \`Mach \${mach} (TRANSONIC STALL WARNING)\`;
        valMach.style.color = '#ef4444';
      } else if (mach > 0.70) {
        valMach.innerHTML = \`Mach \${mach} (Optimal High-Speed)\`;
        valMach.style.color = '#fbbf24';
      } else {
        valMach.innerHTML = \`Mach \${mach} (Subsonic)\`;
        valMach.style.color = '#34d399';
      }

      // Lift calculation (L = 0.5 * rho * vTip^2 * A * CL)
      // On Mars, Weight = 1.8 kg * 3.72 m/s^2 = 6.7 N
      // Earth Weight = 1.8 kg * 9.81 m/s^2 = 17.6 N
      const gravity = currentAtmoPct === 1 ? 3.72 : 9.81;
      const weight = (1.8 * gravity).toFixed(1);
      const lift = Math.min(45, (0.5 * parseFloat(rho) * Math.pow(vTip, 1.8) * 0.0035)).toFixed(1);

      if (parseFloat(lift) >= parseFloat(weight)) {
        valLift.innerHTML = \`\${lift} N &gt; \${weight} N (HOVERING!)\`;
        valLift.style.color = '#34d399';
      } else {
        valLift.innerHTML = \`\${lift} N &lt; \${weight} N (GROUNDED)\`;
        valLift.style.color = '#f87171';
      }
    };

    sliderAtmo.addEventListener('input', (e) => {
      currentAtmoPct = parseInt(e.target.value, 10);
      updateRotorMetrics();
    });

    sliderRpm.addEventListener('input', (e) => {
      currentRpm = parseInt(e.target.value, 10);
      updateRotorMetrics();
    });

    updateRotorMetrics();

    // Canvas Visual Simulation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      animTime += 0.05;

      // Mars / Earth Sky Gradient
      const isMars = currentAtmoPct < 15;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isMars) {
        skyGrad.addColorStop(0, '#7c2d12');
        skyGrad.addColorStop(0.7, '#b45309');
        skyGrad.addColorStop(1, '#451a03');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.7, '#38bdf8');
        skyGrad.addColorStop(1, '#15803d');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Ground Surface
      ctx.fillStyle = isMars ? '#2d0f04' : '#14532d';
      ctx.fillRect(0, height - 35, width, 35);

      const centerX = width * 0.5;

      // Determine hover altitude based on Lift vs Weight
      const gravity = currentAtmoPct === 1 ? 3.72 : 9.81;
      const weight = 1.8 * gravity;
      const vTip = ((currentRpm * 2 * Math.PI) / 60) * 0.605;
      const rho = 0.020 + (currentAtmoPct - 1) * (1.205 / 99);
      const lift = 0.5 * rho * Math.pow(vTip, 1.8) * 0.0035;

      let heliY = height - 58;
      if (lift >= weight) {
        // Airborne! Hovering at mid height with gentle bob
        const hoverOffset = Math.sin(animTime * 3) * 6;
        heliY = height * 0.42 + hoverOffset;
      }

      // Air Streamlines (Downwash particles)
      const streamlineSpeed = (currentRpm / 2400) * 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      for (let sl = -3; sl <= 3; sl++) {
        const sx = centerX + sl * 24;
        const downY = heliY + ((animTime * 40 * streamlineSpeed + Math.abs(sl) * 15) % 110);
        ctx.beginPath();
        ctx.moveTo(sx, downY);
        ctx.lineTo(sx + sl * 4, downY + 16);
        ctx.stroke();
      }

      // Draw Ingenuity Helicopter
      ctx.save();
      ctx.translate(centerX, heliY);

      // 4 Carbon-Fiber Landing Legs
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 15);
      ctx.lineTo(-34, 40); // left rear
      ctx.moveTo(10, 15);
      ctx.lineTo(34, 40); // right rear
      ctx.moveTo(-6, 15);
      ctx.lineTo(-24, 42); // left front
      ctx.moveTo(6, 15);
      ctx.lineTo(24, 42); // right front
      ctx.stroke();

      // Avionics Box Fuselage (Warm cube with gold foil)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-14, 0, 28, 22);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-12, 2, 24, 18);

      // Camera lens on bottom of fuselage
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(0, 22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Rotor Mast
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -42);
      ctx.stroke();

      // Solar Panel on top of mast
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-18, -48, 36, 6);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.strokeRect(-18, -48, 36, 6);

      // Dynamic Counter-Rotating Rotor Blades
      const bladeSpeed = (currentRpm / 2400) * 20;

      // Top Rotor (Clockwise)
      const topScale = Math.cos(animTime * bladeSpeed);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, -32, Math.abs(topScale) * 75 + 10, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top blade tip trail glow
      if (currentRpm > 1800) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(topScale * 80, -32, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom Rotor (Counter-Clockwise)
      const bottomScale = Math.sin(animTime * bladeSpeed);
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -16, Math.abs(bottomScale) * 75 + 10, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bottom blade tip trail glow
      if (currentRpm > 1800) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(bottomScale * 80, -16, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lift Vector Arrow (Green arrow pushing UP)
      const arrowLength = Math.min(80, lift * 4);
      if (arrowLength > 5) {
        ctx.strokeStyle = '#34d399';
        ctx.fillStyle = '#34d399';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, -52);
        ctx.lineTo(0, -52 - arrowLength);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(0, -56 - arrowLength);
        ctx.lineTo(-7, -46 - arrowLength);
        ctx.lineTo(7, -46 - arrowLength);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      this.activeAnimId = requestAnimationFrame(render);
    };

    render();
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.interactiveLab = new InteractiveLabController();
});
`;

fs.writeFileSync(path.join(__dirname, '../public/js/interactive_lab.js'), jsContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../static/js/interactive_lab.js'), jsContent, 'utf8');
console.log('Successfully wrote public/js/interactive_lab.js and static/js/interactive_lab.js');
