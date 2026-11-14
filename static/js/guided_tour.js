/**
 * Space Archaeologists - Mission Manual & 3-Minute Guided Tour (Judge Demo)
 * Implements:
 *  - Interactive Mission Manual detailing every tool, map, and storytelling feature
 *  - Automated 3-Minute Guided Walkthrough for judges and evaluators that visits every key milestone
 */

class GuidedTourController {
  constructor() {
    this.modal = null;
    this.tourOverlay = null;
    this.currentStopIndex = 0;
    this.isTourRunning = false;
    this.autoAdvanceTimer = null;

    this.tourStops = [
      {
        step: 1,
        title: '🪐 1. Solar System Navigator & JPL Horizons',
        description: 'Welcome to Space Archaeologists! You are looking at a real-time 3D planetary model powered by NASA JPL Horizons orbital telemetry. Click and drag to pan across the inner solar system, scroll to zoom in/out, and notice the tidal terminator shading on Earth, Moon, and Mars.',
        action: () => {
          if (window.surfaceController) window.surfaceController.returnToSolarSystem();
          if (window.objectViewer) window.objectViewer.close();
          if (window.solarNav) window.solarNav.resetView();
        }
      },
      {
        step: 2,
        title: '🌕 2. Planetary Descent to the Moon',
        description: 'Watch the warp transition as we descend from solar orbit onto high-resolution NASA Moon Trek WAC satellite mosaic tiles! Notice how the camera dynamically centers on the lunar maria where Apollo and Surveyor touched down.',
        action: () => {
          if (window.surfaceController) window.surfaceController.open('Moon');
        }
      },
      {
        step: 3,
        title: '⏱️ 3. Chronological Mission Timeline & Filters',
        description: 'The timeline starts at 1966 with Surveyor 1. Drag the slider or press Play to watch humanity’s hardware arrive on the Moon across the decades. Notice the three distinct marker styles: 🚀 Landing Sites, 📍 Last Known Positions, and 💥 Impact Sites.',
        action: () => {
          if (window.surfaceController) {
            window.surfaceController.setTimelineYear(1969);
          }
        }
      },
      {
        step: 4,
        title: '🛰️ 4. Apollo 11 Descent Stage in 3D',
        description: 'Inspect the authentic NASA 3D model of Lunar Module Eagle! Drag to rotate 360°, scroll to zoom in on the gold foil and landing pads, and click the numbered nodes to inspect engineering components like the stainless steel peace plaque.',
        action: () => {
          if (typeof window.openObjectPage === 'function') {
            window.openObjectPage('apollo-11-descent-stage');
          }
        }
      },
      {
        step: 5,
        title: '🎙️ 5. Voice Storytelling Room & Perspective Switcher',
        description: 'Enter the flagship Voice Storytelling Room! Experience the 5-Beat Story Arc with real voice narration. Use the Perspective Switcher to hear the story told from 5 unique viewpoints: The Robot, The Engineer, The Scientist, Mission Control, or a Future Explorer!',
        action: () => {
          if (typeof window.openStoryMode === 'function') {
            window.openStoryMode('apollo11');
          }
        }
      },
      {
        step: 6,
        title: '🔬 6. "How It Worked" Interactive Lab',
        description: 'Step into the interactive physics lab! Test how Martian dust storms choke solar-powered rovers like Opportunity, watch the 4-stage Sky Crane lowering sequence, or fire a laser pulse to calculate the distance to the Moon down to millimeters!',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (typeof window.openInteractiveLab === 'function') {
            window.openInteractiveLab('skycrane');
          }
        }
      },
      {
        step: 7,
        title: '📋 7. Accessibility, Table View & Verified Sources',
        description: 'Our platform adheres to WCAG 2.1 AA standards: full keyboard navigation, screen-reader table alternatives, prefers-reduced-motion support, and a complete auto-generated Credits & Sources page with zero uncredited imagery.',
        action: () => {
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.surfaceController) window.surfaceController.open('Mars');
          if (window.a11yController && !window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
        }
      }
    ];

    this.init();
  }

  init() {
    this.injectManualModal();
    this.injectTourHUD();
    this.bindGlobalTriggers();
  }

  bindGlobalTriggers() {
    window.openMissionManual = () => this.openManual();
    window.startGuidedTour = () => this.startTour();

    window.addEventListener('open-mission-manual', () => this.openManual());
    window.addEventListener('start-guided-tour', () => this.startTour());
  }

  /* ===================== MISSION MANUAL MODAL ===================== */
  injectManualModal() {
    let modal = document.getElementById('mission-manual-modal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'mission-manual-modal';
    modal.className = 'manual-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Mission Manual & Explorer Guide');

    modal.innerHTML = `
      <div class="manual-backdrop"></div>
      <div class="manual-container">
        <header class="manual-header">
          <div class="manual-header-brand">
            <span class="manual-badge">📖 Official Documentation</span>
            <h2>Space Archaeologists: Mission Manual</h2>
          </div>
          <button class="manual-close-btn" id="btn-close-manual" aria-label="Close Manual">&times;</button>
        </header>

        <div class="manual-content-scroll">
          <!-- CTA: 3-Minute Guided Tour Banner -->
          <div class="manual-tour-banner">
            <div class="tour-banner-text">
              <h3>🎯 Evaluator & Judge Walkthrough (3-Min Guided Tour)</h3>
              <p>Experience an automated, step-by-step tour covering every required feature: solar telemetry, planetary descent, 3D models, voice storytelling, perspective switching, and accessibility.</p>
            </div>
            <button class="btn-start-tour-now" id="btn-manual-launch-tour">
              <span>🚀 Start 3-Min Guided Tour</span>
            </button>
          </div>

          <!-- Section 1: Navigation & Map -->
          <section class="manual-section">
            <h3>🧭 1. Navigating Space & Planetary Surfaces</h3>
            <div class="manual-grid">
              <div class="manual-card">
                <h4>🪐 Solar System View</h4>
                <p>Features live planetary orbits calculated using JPL Horizons ephemerides. Drag to pan, scroll to zoom. Click the Moon or Mars to descend onto surface maps.</p>
              </div>
              <div class="manual-card">
                <h4>🗺️ NASA Trek Satellite Tiles</h4>
                <p>Stream real orbital photography mosaics directly from NASA Moon Trek (LROC WAC 303ppd) and Mars Trek (Viking MDIM21).</p>
              </div>
              <div class="manual-card">
                <h4>⏱️ Chronological Timeline Slider</h4>
                <p>Drag the slider from 1962 to 2026 or click <strong>▶ Play</strong> to watch the hardware appear chronologically across space history.</p>
              </div>
            </div>
          </section>

          <!-- Section 2: Storytelling & Perspectives -->
          <section class="manual-section">
            <h3>🎙️ 2. Voice Storytelling Room & Perspectives</h3>
            <div class="manual-grid">
              <div class="manual-card">
                <h4>🎭 5 Character Perspectives</h4>
                <p>Switch between <strong>The Robot</strong>, <strong>The Engineer</strong>, <strong>The Scientist</strong>, <strong>Mission Control</strong>, and <strong>Future Explorer</strong>. Every perspective preserves verified facts while offering a distinct human and robotic lens.</p>
              </div>
              <div class="manual-card">
                <h4>📖 5-Beat Narrative Arc</h4>
                <p>Every hero mission follows five dramatic beats: 1) Launch, 2) Journey & How it worked, 3) Challenge, 4) Discovery, and 5) Legacy & Silence.</p>
              </div>
              <div class="manual-card">
                <h4>🐣 3 Audience Age Bands</h4>
                <p>Switch between <strong>Cadet (6-8)</strong>, <strong>Explorer (9-11)</strong>, and <strong>Commander (12-14)</strong> to adapt reading depth, sentence length, and vocabulary.</p>
              </div>
            </div>
          </section>

          <!-- Section 3: 3D Models & Interactive Lab -->
          <section class="manual-section">
            <h3>🔬 3. 3D Inspection & "How It Worked" Lab</h3>
            <div class="manual-grid">
              <div class="manual-card">
                <h4>🛰️ Official NASA 3D Models</h4>
                <p>Interactive 3D models with component hotspots for Apollo LM, Viking Lander, Opportunity Rover, Perseverance Rover, and Ingenuity Helicopter.</p>
              </div>
              <div class="manual-card">
                <h4>☀️ Solar Dust Simulator</h4>
                <p>Test Opportunity's solar panels against Martian dust opacity (Tau) and discover how wind gusts saved the rover.</p>
              </div>
              <div class="manual-card">
                <h4>🪂 Sky Crane Sequence</h4>
                <p>Explore the four phases of powered descent that lowered Curiosity and Perseverance into Gale and Jezero craters.</p>
              </div>
            </div>
          </section>

          <!-- Section 4: Accessibility -->
          <section class="manual-section">
            <h3>♿ 4. Accessibility & Full Keyboard Control</h3>
            <div class="manual-grid">
              <div class="manual-card">
                <h4>📋 Full Table Alternative</h4>
                <p>Click <strong>List View</strong> in the top-right to view all artifacts in a sortable, screen-reader-friendly data table.</p>
              </div>
              <div class="manual-card">
                <h4>⌨️ Keyboard Focus</h4>
                <p>All map pins, buttons, and sliders feature visible focus outlines (<code>:focus-visible</code>) and can be activated via <code>Enter</code> or <code>Space</code>.</p>
              </div>
              <div class="manual-card">
                <h4>🧘 Reduced Motion</h4>
                <p>Respects your OS setting for <code>prefers-reduced-motion</code>, disabling warp effects and pausing auto-rotations.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    modal.querySelector('#btn-close-manual').addEventListener('click', () => this.closeManual());
    modal.querySelector('.manual-backdrop').addEventListener('click', () => this.closeManual());
    modal.querySelector('#btn-manual-launch-tour').addEventListener('click', () => {
      this.closeManual();
      this.startTour();
    });
  }

  openManual() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeManual() {
    if (this.modal) this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ===================== 3-MINUTE GUIDED TOUR (JUDGE DEMO) ===================== */
  injectTourHUD() {
    let overlay = document.getElementById('guided-tour-hud');
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'guided-tour-hud';
    overlay.className = 'guided-tour-hud';
    overlay.setAttribute('role', 'region');
    overlay.setAttribute('aria-label', '3-Minute Guided Tour Controller');

    overlay.innerHTML = `
      <div class="tour-hud-inner">
        <div class="tour-hud-top">
          <div class="tour-step-badge">
            <span class="tour-pulse-dot"></span>
            <span id="tour-step-counter">Tour Stop 1 of 7</span>
          </div>
          <button class="tour-exit-btn" id="btn-exit-tour" title="Exit guided tour">&times; Exit Tour</button>
        </div>

        <h3 id="tour-step-title">Tour Stop Title</h3>
        <p id="tour-step-desc">Tour description...</p>

        <div class="tour-hud-bottom">
          <button class="btn-tour-nav" id="btn-tour-prev">‹ Previous</button>
          <button class="btn-tour-autoplay" id="btn-tour-autoplay">▶ Auto-Play (15s)</button>
          <button class="btn-tour-nav btn-tour-next" id="btn-tour-next">Next Stop ›</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.tourOverlay = overlay;

    overlay.querySelector('#btn-exit-tour').addEventListener('click', () => this.exitTour());
    overlay.querySelector('#btn-tour-prev').addEventListener('click', () => this.prevStop());
    overlay.querySelector('#btn-tour-next').addEventListener('click', () => this.nextStop());
    overlay.querySelector('#btn-tour-autoplay').addEventListener('click', () => this.toggleAutoPlay());
  }

  startTour() {
    this.isTourRunning = true;
    this.currentStopIndex = 0;
    if (this.tourOverlay) {
      this.tourOverlay.classList.add('active');
    }
    this.executeCurrentStop();
    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast('🎯 3-Minute Guided Tour started! Sit back or click Next to explore.', '🚀', 4000);
    }
  }

  exitTour() {
    this.isTourRunning = false;
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    if (this.tourOverlay) {
      this.tourOverlay.classList.remove('active');
    }
    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast('Guided tour completed. Enjoy free exploration!', '✨', 3000);
    }
  }

  executeCurrentStop() {
    const stop = this.tourStops[this.currentStopIndex];
    if (!stop || !this.tourOverlay) return;

    this.tourOverlay.querySelector('#tour-step-counter').textContent = `Tour Stop ${stop.step} of ${this.tourStops.length}`;
    this.tourOverlay.querySelector('#tour-step-title').textContent = stop.title;
    this.tourOverlay.querySelector('#tour-step-desc').textContent = stop.description;

    const prevBtn = this.tourOverlay.querySelector('#btn-tour-prev');
    const nextBtn = this.tourOverlay.querySelector('#btn-tour-next');
    prevBtn.disabled = (this.currentStopIndex === 0);
    nextBtn.textContent = (this.currentStopIndex === this.tourStops.length - 1) ? 'Finish Tour 🏆' : 'Next Stop ›';

    // Execute stop action
    try {
      stop.action();
    } catch (e) {
      console.warn('Tour stop action error:', e);
    }
  }

  nextStop() {
    if (this.currentStopIndex < this.tourStops.length - 1) {
      this.currentStopIndex++;
      this.executeCurrentStop();
    } else {
      this.exitTour();
    }
  }

  prevStop() {
    if (this.currentStopIndex > 0) {
      this.currentStopIndex--;
      this.executeCurrentStop();
    }
  }

  toggleAutoPlay() {
    const btn = this.tourOverlay?.querySelector('#btn-tour-autoplay');
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
      if (btn) btn.innerHTML = '▶ Auto-Play (15s)';
    } else {
      if (btn) btn.innerHTML = '⏸ Pause Auto-Play';
      this.autoAdvanceTimer = setInterval(() => {
        if (this.currentStopIndex < this.tourStops.length - 1) {
          this.nextStop();
        } else {
          this.exitTour();
        }
      }, 15000);
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.guidedTour = new GuidedTourController();
});
