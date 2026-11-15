/**
 * Space Archaeologists - 3D Inspection Deck Landing Page Controller
 * Handles the tactile, animated landing experience:
 *  - QUANTA_CAT Presents corner banner & interactive chime
 *  - 3D Model Viewer with orbit controls & preset camera angles (Orbit, Front, Top, Macro)
 *  - Dynamic Telemetry Specs HUD (coordinates, touchdown epoch, archaeological role)
 *  - Relic selector pills (Apollo LM, Perseverance, Ingenuity, Viking, Opportunity)
 *  - Big 3D Red Button ("ENTER THE SPACE MAP") with sound & warp transition
 *  - Interactive mouse parallax on starfield and cosmic grid
 *  - Smooth navigation to Manifesto & QUANTA_CAT Mission Crew sections
 */

class LandingPageController {
  constructor() {
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
    this.isOpen = true;
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
    if (!this.screen) return;

    // Check URL parameters or hash
    const hash = window.location.hash.toLowerCase();
    if (hash === '#map' || hash === '#solar' || hash === '#moon' || hash === '#mars') {
      this.close(true); // immediate close without transition
    }

    this.bindEvents();
    this.initParallax();
    this.exposeGlobalAPI();
  }

  bindEvents() {
    // 1. Enter Space Map Action
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

    // 2. Keyboard shortcut: Enter or Space launches map
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (document.getElementById('story-mode-modal')?.classList.contains('active') ||
          document.getElementById('interactive-lab-modal')?.classList.contains('active') ||
          document.getElementById('forgotten-explorers-modal')?.classList.contains('active')) {
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

    // Escape closes team modal if active
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

    // Subtle 3D mouse parallax on landing cosmic background
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
