const fs = require('fs');
const path = require('path');

const publicHtmlPath = path.join(__dirname, '../public/index.html');
const staticHtmlPath = path.join(__dirname, '../static/index.html');
const publicCssPath = path.join(__dirname, '../public/css/style.css');
const staticCssPath = path.join(__dirname, '../static/css/style.css');

const landingHtml = `  <!-- ================= VIEW 0: 3D INSPECTION DECK LANDING PAGE ================= -->
  <section id="landing-screen" class="landing-screen active" aria-label="Space Archaeologists Inspection Deck Landing Page">
    <!-- Starfield & Cosmic Grid Backdrop -->
    <div class="landing-cosmic-bg">
      <div class="landing-grid-overlay"></div>
      <div class="landing-nebula-glow"></div>
      <div class="landing-stars"></div>
    </div>

    <!-- Top Floating Meta Header -->
    <header class="landing-top-bar">
      <div class="landing-brand-tag">
        <span class="nasa-meatball-mini">NASA</span>
        <span class="challenge-title">2026 Space Apps Challenge</span>
      </div>
      <div class="landing-top-actions">
        <a href="#map" id="landing-skip-link" class="landing-ghost-btn" title="Skip directly to the Interactive Solar System Map">
          Skip to Space Map &rarr;
        </a>
      </div>
    </header>

    <!-- Main Hero Container -->
    <div class="landing-content-container">
      
      <!-- 3D Model Stage Area -->
      <div class="landing-model-stage">
        <!-- Status Pill Badge -->
        <div class="landing-status-badge">
          <span class="landing-pulse-dot"></span>
          <span>INSPECTION DECK &bull; ORBIT CONTROLS ACTIVE</span>
        </div>

        <!-- Interactive 3D Model Viewer -->
        <div class="landing-model-viewport">
          <model-viewer
            id="landing-model-viewer"
            src="/models/apollo_lunar_module.glb"
            alt="Apollo 11 Lunar Module Descent Stage"
            camera-controls
            touch-action="pan-y"
            auto-rotate
            auto-rotate-delay="400"
            rotation-per-second="14deg"
            shadow-intensity="1.8"
            shadow-softness="0.5"
            exposure="1.2"
            environment-image="neutral"
            bounds="tight"
            interaction-prompt="none"
            ar>
          </model-viewer>

          <!-- Floating Orbit Hint -->
          <div class="landing-drag-hint">
            <span>&olarr; Drag to spin the lander 360&deg; &bull; Scroll to zoom</span>
          </div>
        </div>

        <!-- 3D Relic Selector Pills -->
        <div class="landing-model-selector" role="group" aria-label="Select 3D Relic to Inspect">
          <button class="model-select-pill active" data-model="/models/apollo_lunar_module.glb" data-name="Apollo 11 Lunar Module (Moon &bull; 1969)">
            <span>🌕</span> Apollo 11 Lander
          </button>
          <button class="model-select-pill" data-model="/models/perseverance_rover.glb" data-name="Perseverance Rover (Mars &bull; 2021)">
            <span>🔴</span> Perseverance Rover
          </button>
          <button class="model-select-pill" data-model="/models/ingenuity_helicopter.glb" data-name="Ingenuity Helicopter (Mars &bull; 2021)">
            <span>🚁</span> Ingenuity Helicopter
          </button>
          <button class="model-select-pill" data-model="/models/viking_lander.glb" data-name="Viking 1 Lander (Mars &bull; 1976)">
            <span>🛰️</span> Viking 1 Lander
          </button>
          <button class="model-select-pill" data-model="/models/opportunity_rover.glb" data-name="Opportunity Rover (Mars &bull; 2004)">
            <span>☀️</span> Opportunity Rover
          </button>
        </div>
        <div id="landing-active-model-name" class="landing-active-model-caption">
          Featured: Apollo 11 Lunar Module Descent Stage (Mare Tranquillitatis, 1969)
        </div>
      </div>

      <!-- Hero Copy & The Big Red Action Button -->
      <div class="landing-cta-section">
        <h1 class="landing-title">Every machine has a story. Ready to find them?</h1>
        <p class="landing-description">
          Built for the 2026 NASA Space Apps Challenge. Drag to spin the lander or enter the Space Map.
        </p>

        <!-- The Big Red 3D Button -->
        <button id="btn-enter-space-map" class="btn-enter-space-map" aria-label="Enter the Space Map">
          <span class="btn-red-icon">🧭</span>
          <span class="btn-red-text">ENTER THE SPACE MAP</span>
          <div class="btn-red-shine"></div>
        </button>

        <p class="landing-subtext">Built for the 2026 NASA Space Apps Challenge.</p>

        <!-- Key Platform Metrics Bar -->
        <div class="landing-stats-row">
          <div class="stat-badge">
            <span class="stat-num">66</span>
            <span class="stat-lbl">Relics Cataloged</span>
          </div>
          <div class="stat-badge">
            <span class="stat-num">47</span>
            <span class="stat-lbl">Moon Artifacts</span>
          </div>
          <div class="stat-badge">
            <span class="stat-num">19</span>
            <span class="stat-lbl">Mars Explorers</span>
          </div>
          <div class="stat-badge">
            <span class="stat-num">100%</span>
            <span class="stat-lbl">NASA JPL Telemetry</span>
          </div>
        </div>
      </div>

    </div>
  </section>
`;

function updateHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Check if landing screen already exists
  if (!html.includes('id="landing-screen"')) {
    html = html.replace('<body>\n', '<body>\n\n' + landingHtml + '\n');
  }

  // Add Deck button to HUD if not present
  if (!html.includes('id="btn-open-landing"')) {
    const deckButton = `      <button id="btn-open-landing" class="btn-glass btn-deck-glow" onclick="window.openLandingPage()" title="Return to 3D Inspection Deck & Landing Page">
        <span>🛰️</span> Inspection Deck
      </button>\n`;
    html = html.replace('<div class="hud-actions">\n', '<div class="hud-actions">\n' + deckButton);
  }

  // Add script tag if not present
  if (!html.includes('src="/js/landing_page.js"')) {
    html = html.replace(
      '<script src="/js/forgotten_explorers.js"></script>',
      '<script src="/js/forgotten_explorers.js"></script>\n  <script src="/js/landing_page.js"></script>'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Updated HTML:', filePath);
}

updateHtml(publicHtmlPath);
updateHtml(staticHtmlPath);

// CSS Content
const landingCss = `
/* ==========================================================================
   VIEW 0: 3D INSPECTION DECK LANDING PAGE
   ========================================================================== */

.landing-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  background: #030712;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-screen.dismissing {
  opacity: 0;
  visibility: hidden;
  transform: scale(1.08);
  filter: blur(12px);
  pointer-events: none;
}

/* Starfield & Cosmic Grid Backdrop */
.landing-cosmic-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.landing-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.6;
}

.landing-nebula-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 500px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(225, 29, 72, 0.06) 45%, transparent 70%);
  filter: blur(60px);
}

.landing-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(1.5px 1.5px at 15% 20%, #ffffff, transparent),
    radial-gradient(1.5px 1.5px at 35% 65%, rgba(255,255,255,0.8), transparent),
    radial-gradient(1.5px 1.5px at 70% 25%, rgba(255,255,255,0.7), transparent),
    radial-gradient(2px 2px at 85% 75%, #38bdf8, transparent),
    radial-gradient(1px 1px at 50% 40%, rgba(255,255,255,0.9), transparent),
    radial-gradient(1.5px 1.5px at 90% 15%, #ffffff, transparent),
    radial-gradient(1px 1px at 10% 85%, rgba(255,255,255,0.6), transparent);
  background-size: 550px 550px;
  opacity: 0.85;
}

/* Top Meta Bar */
.landing-top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2.5rem;
}

.landing-brand-tag {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nasa-meatball-mini {
  background: #0b3d91;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.challenge-title {
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.landing-ghost-btn {
  color: #38bdf8;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  background: rgba(14, 165, 233, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  transition: all 0.2s ease;
}

.landing-ghost-btn:hover {
  background: rgba(14, 165, 233, 0.22);
  color: #fff;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.35);
  transform: translateX(2px);
}

/* Main Content Container */
.landing-content-container {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 2.5rem;
  text-align: center;
  gap: 1.2rem;
}

/* 3D Model Stage */
.landing-model-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.landing-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 5px 14px;
  border-radius: 20px;
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.landing-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8, 0 0 18px #38bdf8;
  animation: pulseDot 1.8s infinite;
}

@keyframes pulseDot {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.landing-model-viewport {
  position: relative;
  width: 100%;
  max-width: 720px;
  height: 330px;
  background: radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, rgba(3, 7, 18, 0) 70%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#landing-model-viewer {
  width: 100%;
  height: 100%;
  --poster-color: transparent;
  outline: none;
}

.landing-drag-hint {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(3, 7, 18, 0.75);
  border: 1px solid var(--border-glass);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.72rem;
  color: var(--text-secondary);
  pointer-events: none;
  backdrop-filter: blur(4px);
}

/* Model Selector Pills */
.landing-model-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 900px;
}

.model-select-pill {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid var(--border-glass);
  color: #cbd5e1;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
}

.model-select-pill:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #fff;
  transform: translateY(-1px);
}

.model-select-pill.active {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
  color: #fff;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
}

.landing-active-model-caption {
  font-size: 0.78rem;
  color: #94a3b8;
  font-style: italic;
}

/* Hero Copy & Big Red Button */
.landing-cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  max-width: 820px;
}

.landing-title {
  font-family: var(--font-title);
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.landing-description {
  font-size: clamp(0.95rem, 1.8vw, 1.15rem);
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
  max-width: 680px;
}

/* ==========================================================================
   THE BIG RED BUTTON: ENTER THE SPACE MAP
   ========================================================================== */
.btn-enter-space-map {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(180deg, #ff4d40 0%, #ef4444 48%, #dc2626 100%);
  color: #ffffff;
  font-family: var(--font-title);
  font-size: 1.18rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 18px 42px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  cursor: pointer;
  outline: none;
  text-decoration: none;
  box-shadow: 
    0 6px 0 #991b1b,
    0 12px 28px rgba(239, 68, 68, 0.5),
    0 0 35px rgba(239, 68, 68, 0.3);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  margin-top: 6px;
  user-select: none;
}

.btn-enter-space-map:hover {
  background: linear-gradient(180deg, #ff6357 0%, #f43f5e 48%, #e11d48 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 0 #991b1b,
    0 16px 36px rgba(239, 68, 68, 0.65),
    0 0 45px rgba(239, 68, 68, 0.45);
}

.btn-enter-space-map:active {
  transform: translateY(4px);
  box-shadow: 
    0 2px 0 #991b1b,
    0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-red-icon {
  font-size: 1.35rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.btn-enter-space-map:hover .btn-red-icon {
  transform: rotate(45deg);
}

.btn-red-text {
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.btn-red-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-25deg);
  animation: redBtnShine 3.6s infinite;
}

@keyframes redBtnShine {
  0% { left: -100%; }
  35% { left: 160%; }
  100% { left: 160%; }
}

.landing-subtext {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Key Platform Metrics Bar */
.landing-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.stat-badge {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-glass);
  padding: 8px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
}

.stat-num {
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--accent-cyan);
}

.stat-lbl {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 500;
}

/* Inspection Deck Button in HUD */
.btn-deck-glow {
  border-color: rgba(239, 68, 68, 0.4) !important;
  color: #fca5a5 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

.btn-deck-glow:hover {
  background: rgba(239, 68, 68, 0.25) !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5) !important;
  color: #fff !important;
}

/* Mobile Responsiveness for Landing Page */
@media (max-width: 768px) {
  .landing-top-bar {
    padding: 1rem 1.2rem;
  }
  .landing-model-viewport {
    height: 250px;
  }
  .btn-enter-space-map {
    width: 100%;
    padding: 16px 24px;
    font-size: 1.05rem;
  }
  .landing-stats-row {
    gap: 8px;
  }
  .stat-badge {
    padding: 6px 12px;
  }
}
`;

function updateCss(filePath) {
  let css = fs.readFileSync(filePath, 'utf8');
  if (!css.includes('.landing-screen')) {
    css += landingCss;
    fs.writeFileSync(filePath, css, 'utf8');
    console.log('Updated CSS:', filePath);
  }
}

updateCss(publicCssPath);
updateCss(staticCssPath);
console.log('Landing page build completed successfully!');
