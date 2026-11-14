/**
 * Space Archaeologists - Mission Manual & 3-Minute Guided Tour (Judge Demo)
 * Implements:
 *  - Interactive Mission Manual detailing every tool, map, and storytelling feature
 *  - Automated 3-Minute Guided Walkthrough for judges and evaluators that visits every key milestone
 *  - Flawless transitions between Solar Orbit, Lunar Descent, 1969 Timeline, 3D Object Stage, Voice Storytelling Room, Physics Lab, and Accessibility Ledger
 *  - Live 15s auto-play progress bar with pause/resume and female voice audio guide
 *  - Minimized floating HUD toggle so evaluators can inspect features freely
 */

class GuidedTourController {
  constructor() {
    this.modal = null;
    this.tourOverlay = null;
    this.currentStopIndex = 0;
    this.isTourRunning = false;
    this.autoPlayActive = false;
    this.autoPlayInterval = null;
    this.autoPlayDuration = 15000; // 15 seconds per stop
    this.autoPlayStartTime = 0;
    this.isMinimized = false;
    this.voiceEnabled = true; // Natural female voice narration of tour stops

    this.tourStops = [
      {
        step: 1,
        title: '🪐 1. Solar System Navigator & JPL Horizons',
        description: 'Welcome to Space Archaeologists! You are looking at a real-time 3D planetary model powered by NASA JPL Horizons orbital telemetry. Click and drag to pan across the inner solar system, scroll to zoom in/out, and notice the tidal terminator shading on Earth, Moon, and Mars.',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.objectViewer) window.objectViewer.close();
          if (window.a11yController && window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
          if (window.surfaceController) window.surfaceController.returnToSolarSystem();
          if (window.solarNav) window.solarNav.resetView();
        }
      },
      {
        step: 2,
        title: '🌕 2. Planetary Descent to the Moon',
        description: 'Watch the warp transition as we descend from solar orbit onto high-resolution NASA Moon Trek WAC satellite mosaic tiles! Notice how the camera dynamically centers on the lunar maria where Apollo and Surveyor touched down.',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.objectViewer) window.objectViewer.close();
          if (window.a11yController && window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
          if (window.surfaceController) {
            window.surfaceController.open('Moon');
          }
        }
      },
      {
        step: 3,
        title: '⏱️ 3. Chronological Mission Timeline & Filters',
        description: 'The timeline starts at 1966 with Surveyor 1. Watch humanity’s hardware arrive on the Moon across the decades. Notice the three distinct marker styles: 🚀 Landing Sites, 📍 Last Known Positions, and 💥 Impact Sites—now focused on Apollo 11 in 1969!',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.objectViewer) window.objectViewer.close();
          if (window.a11yController && window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
          if (window.surfaceController) {
            if (window.surfaceController.currentBody !== 'Moon') {
              window.surfaceController.open('Moon');
            }
            setTimeout(() => {
              window.surfaceController.jumpToYear(1969, 'Apollo 11');
            }, 300);
          }
        }
      },
      {
        step: 4,
        title: '🛰️ 4. Apollo 11 Descent Stage in 3D',
        description: 'Inspect the authentic NASA 3D model of Lunar Module Eagle! Drag to rotate 360°, scroll to zoom in on the gold foil and landing pads, and click the numbered nodes to inspect engineering components like the stainless steel peace plaque.',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.a11yController && window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
          if (typeof window.openObjectPage === 'function') {
            window.openObjectPage('apollo-11-descent-stage');
          }
        }
      },
      {
        step: 5,
        title: '🎙️ 5. Voice Storytelling Room & Perspective Switcher',
        description: 'Enter the flagship Voice Storytelling Room! Experience the 5-Beat Story Arc with natural female voice narration, interactive mission soundboard, and 5 distinct viewpoints: The Robot, The Engineer, The Scientist, Mission Control, or Future Explorer!',
        action: () => {
          if (window.objectViewer) window.objectViewer.close();
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.a11yController && window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
          if (typeof window.openStoryMode === 'function') {
            window.openStoryMode('apollo11');
          }
        }
      },
      {
        step: 6,
        title: '🔬 6. "How It Worked" Interactive Lab',
        description: 'Step into the interactive physics lab! Test the 4-stage Sky Crane lowering sequence, simulate Martian dust choking Opportunity\'s solar panels, or fire a laser pulse to calculate the distance to the Moon down to picoseconds!',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (window.objectViewer) window.objectViewer.close();
          if (window.a11yController && window.a11yController.tableViewActive) {
            window.a11yController.toggleTableView();
          }
          if (typeof window.openInteractiveLab === 'function') {
            window.openInteractiveLab('skycrane');
          }
        }
      },
      {
        step: 7,
        title: '📋 7. Accessibility, Table View & Verified Sources',
        description: 'Our platform adheres to WCAG 2.1 AA standards: full keyboard navigation, screen-reader table alternatives, prefers-reduced-motion support, and a complete auto-generated Credits & Sources ledger with 66 verified planetary relics!',
        action: () => {
          if (window.storyMode) window.storyMode.close();
          if (window.interactiveLab) window.interactiveLab.close();
          if (window.objectViewer) window.objectViewer.close();
          if (window.surfaceController) {
            window.surfaceController.open('Mars');
          }
          if (window.a11yController && !window.a11yController.tableViewActive) {
            setTimeout(() => window.a11yController.toggleTableView(), 350);
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
                <h4>🌕 High-Res Trek Satellite Tiles</h4>
                <p>Powered by NASA Moon Trek LROC WAC and Mars Viking MDIM2 mosaic tiles, providing zoomable 0.5m surface detail with zero CORS blocks.</p>
              </div>
              <div class="manual-card">
                <h4>⏱️ Chronological Slider</h4>
                <p>Spans from 1966 to 2026. Watch hardware land in real time, or scrub to specific milestone eras with marker clustering.</p>
              </div>
              <div class="manual-card">
                <h4>🛰️ Three Marker Archetypes</h4>
                <p>Pins differentiate between 🚀 Landing Sites, 📍 Last Known Positions (Spirit & Opportunity rovers), and 💥 Impact Sites (Rangers, Lunar Orbiters, S-IVB boosters).</p>
              </div>
            </div>
          </section>

          <!-- Section 2: 3D Object Viewer & Storytelling -->
          <section class="manual-section">
            <h3>🛰️ 2. 3D Inspection & Storytelling Engine</h3>
            <div class="manual-grid">
              <div class="manual-card">
                <h4>🔍 Interactive 3D Stages</h4>
                <p>WebGL GLB models with orbital orbit-controls, 360-degree rotation, pinch zoom, and interactive Hotspot nodes with engineering deep-dives.</p>
              </div>
              <div class="manual-card">
                <h4>🎙️ 5-Beat Voice Storytelling</h4>
                <p>Hero missions feature five narrative beats: Launch, Journey, Challenge, Discovery, and Legacy, with speech synthesis, audio waveforms, and teleprompter karaoke.</p>
              </div>
              <div class="manual-card">
                <h4>🎭 5 Voice Perspectives</h4>
                <p>Hear history from The Robot, The Engineer, The Scientist, Mission Control, or a Future Astronaut standing beside the relic.</p>
              </div>
              <div class="manual-card">
                <h4>🔬 Physics Simulator Labs</h4>
                <p>Four interactive simulators: Opportunity Dust Storm Tau, Sky Crane 4-Stage Descent, Lunar Laser Ranging picosecond timer, and Ingenuity Thin-Air Aerodynamics.</p>
              </div>
            </div>
          </section>

          <!-- Section 3: Provenance & Accessibility -->
          <section class="manual-section">
            <h3>⚖️ 3. Provenance & WCAG Accessibility</h3>
            <div class="manual-grid">
              <div class="manual-card">
                <h4>🏛️ 100% NASA Public Domain</h4>
                <p>Zero copyrighted logos. Every image links to official NASA Image and Video Library IDs with clear provenance lines.</p>
              </div>
              <div class="manual-card">
                <h4>♿ WCAG 2.1 AA Compliant</h4>
                <p>Skip-to-content links, full keyboard tab order, ARIA dialog landmarks, screen-reader table alternatives, and prefers-reduced-motion compatibility.</p>
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
      <div class="tour-progress-bar">
        <div class="tour-progress-fill" id="tour-progress-fill"></div>
      </div>
      <div class="tour-hud-inner">
        <div class="tour-hud-top">
          <div class="tour-step-badge">
            <span class="tour-pulse-dot"></span>
            <span id="tour-step-counter">Tour Stop 1 of 7</span>
          </div>
          <div class="tour-hud-actions-group">
            <button class="tour-hud-btn-mini active-voice" id="btn-tour-voice" title="Toggle Female Voice Audio Guide">🔊 Voice ON</button>
            <button class="tour-hud-btn-mini" id="btn-tour-minimize" title="Minimize / Expand tour HUD">_</button>
            <button class="tour-exit-btn" id="btn-exit-tour" title="Exit guided tour">&times; Exit Tour</button>
          </div>
        </div>

        <h3 id="tour-step-title">Tour Stop Title</h3>
        <p id="tour-step-desc" class="tour-hud-desc">Tour description...</p>

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
    overlay.querySelector('#btn-tour-minimize').addEventListener('click', () => this.toggleMinimize());
    overlay.querySelector('#btn-tour-voice').addEventListener('click', () => this.toggleVoice());
  }

  startTour() {
    this.isTourRunning = true;
    this.currentStopIndex = 0;
    this.isMinimized = false;
    if (this.tourOverlay) {
      this.tourOverlay.classList.remove('minimized');
      this.tourOverlay.classList.add('active');
    }
    this.executeCurrentStop();
    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast('🎯 3-Minute Guided Tour started! Sit back or click Next to explore.', '🚀', 4000);
    }
  }

  exitTour() {
    this.isTourRunning = false;
    this.stopAutoPlay();
    this.stopVoice();
    if (this.tourOverlay) {
      this.tourOverlay.classList.remove('active', 'minimized');
    }
    // Clean up any open demo overlays
    if (window.objectViewer) window.objectViewer.close();
    if (window.storyMode) window.storyMode.close();
    if (window.interactiveLab) window.interactiveLab.close();
    if (window.a11yController && window.a11yController.tableViewActive) {
      window.a11yController.toggleTableView();
    }
    if (typeof window.showSpaceToast === 'function') {
      window.showSpaceToast('Guided tour completed. You are now in free exploration mode!', '✨', 3000);
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

    // Speak description if voice enabled
    if (this.voiceEnabled) {
      this.speakStopDescription(`${stop.title}. ${stop.description}`);
    }

    // Execute stop action
    try {
      stop.action();
    } catch (e) {
      console.warn('Tour stop action error:', e);
    }

    // Reset auto-play timer if running
    if (this.autoPlayActive) {
      this.startAutoPlayTimer();
    }
  }

  nextStop() {
    this.stopVoice();
    if (this.currentStopIndex < this.tourStops.length - 1) {
      this.currentStopIndex++;
      this.executeCurrentStop();
    } else {
      this.exitTour();
    }
  }

  prevStop() {
    this.stopVoice();
    if (this.currentStopIndex > 0) {
      this.currentStopIndex--;
      this.executeCurrentStop();
    }
  }

  startAutoPlayTimer() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }

    this.autoPlayStartTime = Date.now();
    const duration = this.autoPlayDuration;
    const progressFill = this.tourOverlay?.querySelector('#tour-progress-fill');

    this.autoPlayInterval = setInterval(() => {
      const elapsed = Date.now() - this.autoPlayStartTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;

      if (elapsed >= duration) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
        if (this.currentStopIndex < this.tourStops.length - 1) {
          this.nextStop();
        } else {
          this.exitTour();
        }
      }
    }, 100);
  }

  stopAutoPlay() {
    this.autoPlayActive = false;
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    const btn = this.tourOverlay?.querySelector('#btn-tour-autoplay');
    if (btn) {
      btn.innerHTML = '▶ Auto-Play (15s)';
      btn.classList.remove('playing');
    }
    const progressFill = this.tourOverlay?.querySelector('#tour-progress-fill');
    if (progressFill) progressFill.style.width = '0%';
  }

  toggleAutoPlay() {
    const btn = this.tourOverlay?.querySelector('#btn-tour-autoplay');
    if (this.autoPlayActive) {
      this.stopAutoPlay();
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('⏸ Auto-Play Paused. Click Next Stop whenever ready!', '⏱️', 2500);
      }
    } else {
      this.autoPlayActive = true;
      if (btn) {
        btn.innerHTML = '⏸ Pause Auto-Play';
        btn.classList.add('playing');
      }
      this.startAutoPlayTimer();
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('▶ Auto-Play Active: Auto-advancing every 15 seconds.', '🚀', 2500);
      }
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (this.tourOverlay) {
      this.tourOverlay.classList.toggle('minimized', this.isMinimized);
      const minBtn = this.tourOverlay.querySelector('#btn-tour-minimize');
      if (minBtn) minBtn.textContent = this.isMinimized ? '□ Expand' : '_';
    }
  }

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    const btn = this.tourOverlay?.querySelector('#btn-tour-voice');
    if (btn) {
      btn.classList.toggle('active-voice', this.voiceEnabled);
      btn.textContent = this.voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF';
    }
    if (!this.voiceEnabled) {
      this.stopVoice();
    } else {
      const stop = this.tourStops[this.currentStopIndex];
      if (stop) this.speakStopDescription(`${stop.title}. ${stop.description}`);
    }
  }

  speakStopDescription(text) {
    if (!('speechSynthesis' in window)) return;
    this.stopVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.18; // Warm feminine pitch

    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const femaleKeywords = ['zira', 'jenny', 'aria', 'samantha', 'victoria', 'karen', 'moira', 'fiona', 'female'];
    let best = null;
    for (const kw of femaleKeywords) {
      best = enVoices.find(v => v.name.toLowerCase().includes(kw));
      if (best) break;
    }
    if (best) utterance.voice = best;

    window.speechSynthesis.speak(utterance);
  }

  stopVoice() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.guidedTour = new GuidedTourController();
});
