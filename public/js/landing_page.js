/**
 * Space Archaeologists - 3-Stage Mission Flow Controller
 * Seamlessly chains:
 *  - STAGE 1: QUANTA_CAT Mission Storytelling Guide (Netlify App)
 *             Automatic timed transition + interactive chapters + manual advance / pause
 *  - STAGE 2: 3D Inspection Deck Landing Page
 *             "QUANTA_CAT presents ......" corner banner & interactive chime
 *             3D Model Viewer with orbit controls & preset camera angles (Orbit, Front, Top, Macro)
 *             Dynamic Telemetry Specs HUD (coordinates, epoch, archaeological role)
 *             Big 3D Red Button ("ENTER THE SPACE MAP") with sound & warp transition
 *             Team QUANTA_CAT dossier featuring Varnit Sharma (Lead Dev)
 *  - STAGE 3: Main Space Map (Solar System Navigator & Lunar/Martian Trek surfaces)
 */

class LandingPageController {
  constructor() {
    // Stage 1: Netlify Storytelling Guide elements
    this.guideStage = document.getElementById('netlify-guide-stage');
    this.btnProceedDeck = document.getElementById('btn-proceed-to-deck');
    this.btnSkipMapDirect = document.getElementById('btn-skip-to-map-direct');
    this.guideProgressBar = document.getElementById('guide-progress-bar');
    this.guideCountdownSecs = document.getElementById('guide-countdown-seconds');
    this.btnGuideToggleTimer = document.getElementById('btn-guide-toggle-timer');
    this.guideTimerIcon = document.getElementById('guide-timer-icon');
    this.btnTopStoryGuide = document.getElementById('btn-top-story-guide');
    this.btnOpenStoryGuide = document.getElementById('btn-open-story-guide');
    this.guideIframe = document.getElementById('netlify-story-iframe');

    // Stage 1 Auto-advance Timer State
    this.timerDuration = 14; // seconds for mission storytelling intro
    this.timerRemaining = 14;
    this.timerInterval = null;
    this.isTimerPaused = false;
    this.isGuideActive = true;

    // Stage 2: 3D Inspection Deck elements
    this.screen = document.getElementById('landing-screen');
    this.enterBtn = document.getElementById('btn-enter-space-map');
    this.skipLink = document.getElementById('landing-skip-link');
    this.modelViewer = document.getElementById('landing-model-viewer');
    this.modelCaption = document.getElementById('landing-active-model-name');
    this.selectorPills = document.querySelectorAll('.model-select-pill');
    this.camPresetBtns = document.querySelectorAll('.cam-preset-btn');
    this.autoRotateBtn = document.getElementById('btn-landing-autorotate');
    this.quantaBanner = document.getElementById('landing-quanta-banner');
    this.nebulaGlow = document.querySelector('.landing-nebula-glow');
    this.starsBg = document.querySelector('.landing-stars');

    // Telemetry HUD elements
    this.telTitle = document.getElementById('telemetry-relic-title');
    this.telStatus = document.getElementById('telemetry-relic-status');
    this.telLocation = document.getElementById('tel-location');
    this.telEpoch = document.getElementById('tel-epoch');
    this.telRole = document.getElementById('tel-role');

    this.audioCtx = null;
    this.isOpen = false;
    this.isAutoRotating = true;

    // Relic Telemetry Metadata Matrix
    this.relicTelemetry = {
      'apollo11': {
        title: 'Apollo 11 Lunar Module (Eagle)',
        status: 'Historic Monument',
        location: 'Mare Tranquillitatis, Moon (0.674° N, 23.473° E)',
        epoch: 'July 20, 1969 • 20:17:40 UTC',
        role: "Humanity's first crewed extraterrestrial landing site & scientific package"
      },
      'perseverance': {
        title: 'Perseverance Rover (Mars 2020)',
        status: 'Active Field Scout',
        location: 'Jezero Crater, Mars (18.38° N, 77.58° E)',
        epoch: 'February 18, 2021 • 20:55:00 UTC',
        role: 'Rock core sample caching for Mars Sample Return & MOXIE oxygen generation'
      },
      'ingenuity': {
        title: 'Ingenuity Mars Helicopter',
        status: 'Retired Aerial Legend',
        location: 'Airfield Valinor, Jezero Crater (18.44° N, 77.45° E)',
        epoch: 'April 19, 2021 • 72 Completed Flights',
        role: 'First powered extraterrestrial atmospheric flight in planetary history'
      },
      'viking': {
        title: 'Viking 1 Lander',
        status: 'Silent Sentinel',
        location: 'Chryse Planitia, Mars (22.27° N, 47.95° W)',
        epoch: 'July 20, 1976 • 11:53:06 UTC',
        role: 'First successful American Mars soft landing & in-situ biology analysis'
      },
      'opportunity': {
        title: 'Opportunity Rover (MER-B)',
        status: 'Silent Marathoner',
        location: 'Endeavour Crater, Mars (1.95° S, 354.47° E)',
        epoch: 'January 25, 2004 • 5,111 Sols Traverse',
        role: 'Off-world distance marathon record (45.16 km) & water minerals verification'
      }
    };

    this.init();
  }

  init() {
    const hash = window.location.hash.toLowerCase();

    // Check entry route
    if (hash === '#map' || hash === '#solar' || hash === '#moon' || hash === '#mars') {
      // Direct jump to Space Map
      this.closeStoryGuide(true);
      this.close(true);
    } else if (hash === '#deck' || hash === '#inspection') {
      // Direct jump to 3D Inspection Deck
      this.closeStoryGuide(true);
      this.open();
    } else {
      // Default: Start in Stage 1 (Netlify Storytelling Guide)
      if (this.guideStage) {
        this.guideStage.classList.add('active');
        this.guideStage.style.display = 'flex';
        this.startGuideTimer();
      } else {
        this.open();
      }
    }

    this.bindEvents();
    this.initParallax();
    this.exposeGlobalAPI();
  }

  /* ---------------- STAGE 1: NETLIFY STORY GUIDE METHODS ---------------- */

  startGuideTimer() {
    this.stopGuideTimer();
    this.timerRemaining = this.timerDuration;
    this.isTimerPaused = false;
    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      if (this.isTimerPaused) return;

      this.timerRemaining -= 0.1;
      if (this.timerRemaining <= 0) {
        this.timerRemaining = 0;
        this.updateTimerUI();
        this.stopGuideTimer();
        this.advanceToDeck();
      } else {
        this.updateTimerUI();
      }
    }, 100);
  }

  stopGuideTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  toggleGuideTimer() {
    this.isTimerPaused = !this.isTimerPaused;
    if (this.guideTimerIcon) {
      this.guideTimerIcon.textContent = this.isTimerPaused ? '▶️' : '⏸️';
    }
    const label = document.getElementById('guide-timer-label');
    if (label && this.isTimerPaused) {
      label.innerHTML = `<span>Timer paused</span>`;
    } else {
      this.updateTimerUI();
    }
    this.playBlipSound(480);
  }

  updateTimerUI() {
    if (this.guideCountdownSecs) {
      this.guideCountdownSecs.textContent = Math.ceil(this.timerRemaining);
    }
    if (this.guideProgressBar) {
      const pct = Math.min(100, Math.max(0, ((this.timerDuration - this.timerRemaining) / this.timerDuration) * 100));
      this.guideProgressBar.style.width = `${pct}%`;
    }
    const label = document.getElementById('guide-timer-label');
    if (label && !this.isTimerPaused) {
      label.innerHTML = `Auto-advancing to 3D Deck in <strong>${Math.ceil(this.timerRemaining)}</strong>s`;
    }
  }

  advanceToDeck() {
    this.stopGuideTimer();
    this.playQuantaChime();

    if (this.guideStage) {
      this.guideStage.classList.add('dismissing');
      setTimeout(() => {
        this.guideStage.classList.remove('active', 'dismissing');
        this.guideStage.style.display = 'none';
        this.isGuideActive = false;
        this.open();
      }, 550);
    } else {
      this.open();
    }
  }

  advanceToMap() {
    this.stopGuideTimer();
    this.playEnterSound();

    if (this.guideStage) {
      this.guideStage.classList.add('dismissing');
      setTimeout(() => {
        this.guideStage.classList.remove('active', 'dismissing');
        this.guideStage.style.display = 'none';
        this.isGuideActive = false;
      }, 500);
    }
    this.close(true);
  }

  closeStoryGuide(immediate = false) {
    this.stopGuideTimer();
    if (!this.guideStage) return;
    this.isGuideActive = false;
    this.guideStage.classList.remove('active', 'dismissing');
    this.guideStage.style.display = 'none';
  }

  openStoryGuide() {
    if (!this.guideStage) return;

    // Pause timer so user can browse stories without rush
    this.stopGuideTimer();
    this.isTimerPaused = true;
    if (this.guideTimerIcon) this.guideTimerIcon.textContent = '▶️';
    const label = document.getElementById('guide-timer-label');
    if (label) label.innerHTML = `<span>Interactive Mode Active</span>`;
    if (this.guideProgressBar) this.guideProgressBar.style.width = '100%';

    // Hide stage 2 if open
    if (this.screen) {
      this.screen.classList.remove('active', 'dismissing');
      this.screen.style.display = 'none';
      this.isOpen = false;
    }

    this.guideStage.style.display = 'flex';
    void this.guideStage.offsetWidth;
    this.guideStage.classList.remove('dismissing');
    this.guideStage.classList.add('active');
    this.isGuideActive = true;
    document.body.style.overflow = 'hidden';

    this.playBlipSound(600);

    if (window.history.replaceState) {
      window.history.replaceState(null, null, '#story');
    }
  }

  /* ---------------- STAGE 2: 3D INSPECTION DECK METHODS ---------------- */

  bindEvents() {
    // 0. Stage 1 Guide Actions
    if (this.btnProceedDeck) {
      this.btnProceedDeck.addEventListener('click', () => this.advanceToDeck());
    }
    if (this.btnSkipMapDirect) {
      this.btnSkipMapDirect.addEventListener('click', () => this.advanceToMap());
    }
    if (this.btnGuideToggleTimer) {
      this.btnGuideToggleTimer.addEventListener('click', () => this.toggleGuideTimer());
    }
    if (this.btnTopStoryGuide) {
      this.btnTopStoryGuide.addEventListener('click', () => this.openStoryGuide());
    }
    if (this.btnOpenStoryGuide) {
      this.btnOpenStoryGuide.addEventListener('click', () => this.openStoryGuide());
    }

    // Cross-origin safe message listener from Netlify storytelling iframe
    window.addEventListener('message', (event) => {
      try {
        if (!event.data) return;
        const d = event.data;
        if (d.action === 'finish' || d.action === 'complete' || d.action === 'explore' || d.type === 'story_complete') {
          this.advanceToDeck();
        }
      } catch (e) {}
    });

    // 1. Enter Space Map Action (Big Red Button)
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        this.playEnterSound();
        this.close();
      });
    }

    if (this.skipLink) {
      this.skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.playEnterSound();
        this.close();
      });
    }

    // 2. Keyboard shortcut: Enter launches map from Deck
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (document.getElementById('story-mode-modal')?.classList.contains('active') ||
          document.getElementById('interactive-lab-modal')?.classList.contains('active') ||
          document.getElementById('forgotten-explorers-modal')?.classList.contains('active') ||
          document.getElementById('quanta-team-modal')?.classList.contains('active')) {
        return;
      }

      if (e.key === 'Enter' && !e.target.matches('button, input, textarea, a')) {
        this.playEnterSound();
        this.close();
      }
    });

    // 3. 3D Relic Selector Pills
    this.selectorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const modelUrl = pill.getAttribute('data-model');
        const relicKey = pill.getAttribute('data-relic');
        const modelName = pill.getAttribute('data-name');
        this.switchModel(modelUrl, modelName, relicKey, pill);
      });
    });

    // 4. Interactive 3D Camera Toolbar Presets
    this.camPresetBtns.forEach(btn => {
      if (btn.id === 'btn-landing-autorotate') return;
      btn.addEventListener('click', () => {
        const orbit = btn.getAttribute('data-orbit');
        if (orbit && this.modelViewer) {
          this.modelViewer.cameraOrbit = orbit;
          this.camPresetBtns.forEach(b => {
            if (b.id !== 'btn-landing-autorotate') b.classList.remove('active');
          });
          btn.classList.add('active');
          this.playBlipSound(640);
        }
      });
    });

    // 5. Auto-rotation toggle
    if (this.autoRotateBtn && this.modelViewer) {
      this.autoRotateBtn.addEventListener('click', () => {
        this.isAutoRotating = !this.isAutoRotating;
        if (this.isAutoRotating) {
          this.modelViewer.setAttribute('auto-rotate', '');
          this.autoRotateBtn.classList.add('active');
        } else {
          this.modelViewer.removeAttribute('auto-rotate');
          this.autoRotateBtn.classList.remove('active');
        }
        this.playBlipSound(this.isAutoRotating ? 720 : 420);
      });
    }

    // 6. QUANTA_CAT Corner Badge & Team Openers Click
    const openTeamDossier = () => {
      this.playQuantaChime();
      this.openTeamModal();
    };

    if (this.quantaBanner) {
      this.quantaBanner.addEventListener('click', openTeamDossier);
    }

    const headerTeamPill = document.getElementById('header-team-pill');
    if (headerTeamPill) {
      headerTeamPill.addEventListener('click', openTeamDossier);
    }

    const btnTopTeamModal = document.getElementById('btn-top-team-modal');
    if (btnTopTeamModal) {
      btnTopTeamModal.addEventListener('click', openTeamDossier);
    }

    const heroTeamStrip = document.getElementById('landing-team-hero-card');
    if (heroTeamStrip) {
      heroTeamStrip.addEventListener('click', openTeamDossier);
    }

    // Escape closes modals or guides
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('quanta-team-modal');
        if (modal && modal.classList.contains('active')) {
          this.closeTeamModal();
        }
      }
    });

    // 7. In-Page Smooth Scroll Navigation
    const btnManifesto = document.getElementById('btn-scroll-manifesto');
    if (btnManifesto) {
      btnManifesto.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('landing-manifesto')?.scrollIntoView({ behavior: 'smooth' });
        this.playBlipSound(480);
      });
    }

    const btnCrew = document.getElementById('btn-scroll-crew');
    if (btnCrew) {
      btnCrew.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('landing-team-section')?.scrollIntoView({ behavior: 'smooth' });
        this.playBlipSound(520);
      });
    }
  }

  initParallax() {
    if (!this.screen || !this.nebulaGlow || !this.starsBg) return;

    this.screen.addEventListener('mousemove', (e) => {
      const xNorm = (e.clientX / window.innerWidth) - 0.5;
      const yNorm = (e.clientY / window.innerHeight) - 0.5;

      const nebulaX = xNorm * -35;
      const nebulaY = yNorm * -25;
      this.nebulaGlow.style.transform = `translate(calc(-50% + ${nebulaX}px), calc(-50% + ${nebulaY}px))`;

      const starsX = xNorm * -15;
      const starsY = yNorm * -10;
      this.starsBg.style.transform = `translate(${starsX}px, ${starsY}px)`;
    }, { passive: true });
  }

  switchModel(modelUrl, modelName, relicKey, activePill) {
    if (!this.modelViewer) return;

    this.selectorPills.forEach(p => p.classList.remove('active'));
    if (activePill) activePill.classList.add('active');

    // Update 3D model viewer
    this.modelViewer.setAttribute('src', modelUrl);
    if (this.modelCaption) {
      this.modelCaption.textContent = `Featured: ${modelName}`;
    }

    // Update Telemetry Specs HUD
    const meta = this.relicTelemetry[relicKey];
    if (meta) {
      if (this.telTitle) this.telTitle.textContent = meta.title;
      if (this.telStatus) this.telStatus.textContent = meta.status;
      if (this.telLocation) this.telLocation.textContent = meta.location;
      if (this.telEpoch) this.telEpoch.textContent = meta.epoch;
      if (this.telRole) this.telRole.textContent = meta.role;
    }

    // High-tech switch sound
    this.playBlipSound(580);
  }

  exposeGlobalAPI() {
    window.openLandingPage = () => this.open();
    window.closeLandingPage = () => this.close();
    window.openStoryGuide = () => this.openStoryGuide();
    window.advanceToDeck = () => this.advanceToDeck();
    window.landingPage = this;
  }

  openTeamModal() {
    const modal = document.getElementById('quanta-team-modal');
    if (modal) {
      modal.classList.add('active');
      this.playBlipSound(680);
    }
  }

  closeTeamModal() {
    const modal = document.getElementById('quanta-team-modal');
    if (modal) {
      modal.classList.remove('active');
      this.playBlipSound(440);
    }
  }

  open() {
    if (!this.screen) return;
    this.isOpen = true;
    this.screen.style.display = 'flex';
    void this.screen.offsetWidth;
    this.screen.classList.remove('dismissing');
    this.screen.classList.add('active');
    this.screen.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    if (window.history.replaceState) {
      window.history.replaceState(null, null, '#deck');
    }
  }

  close(immediate = false) {
    if (!this.screen) return;
    this.isOpen = false;

    if (immediate) {
      this.screen.classList.remove('active', 'dismissing');
      this.screen.style.display = 'none';
      document.body.style.overflow = '';
      return;
    }

    this.screen.classList.add('dismissing');

    setTimeout(() => {
      this.screen.classList.remove('active');
      this.screen.style.display = 'none';
      document.body.style.overflow = '';

      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🚀 Welcome to the Space Map! Click Moon or Mars to discover relics.', '🧭', 4500);
      }
    }, 650);

    if (window.history.replaceState) {
      window.history.replaceState(null, null, '#map');
    }
  }

  /**
   * Generates a cinematic sci-fi warp airlock sound via Web Audio API.
   */
  playEnterSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // 1. Bass Power Pulse
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(42, now + 0.55);

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // 2. High-Tech Shimmer Harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.4);

      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.45);

    } catch (e) {}
  }

  playBlipSound(freq = 520) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playQuantaChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // 3-note quantum chime: 523Hz (C5) -> 659Hz (E5) -> 784Hz (G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + (i * 0.1));

        gain.gain.setValueAtTime(0.15, now + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (i * 0.1));
        osc.stop(now + (i * 0.1) + 0.35);
      });
    } catch (e) {}
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.landingPage = new LandingPageController();
});
