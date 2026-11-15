/**
 * Space Archaeologists - 3D Inspection Deck Landing Page Controller
 * Handles the tactile landing experience:
 *  - 3D Model Viewer with orbit controls
 *  - Relic selector pills (Apollo LM, Perseverance, Ingenuity, Viking, Opportunity)
 *  - Big 3D Red Button ("ENTER THE SPACE MAP") with sound & warp transition
 *  - Seamless navigation between Landing Deck and Space Map
 */

class LandingPageController {
  constructor() {
    this.screen = document.getElementById('landing-screen');
    this.enterBtn = document.getElementById('btn-enter-space-map');
    this.skipLink = document.getElementById('landing-skip-link');
    this.modelViewer = document.getElementById('landing-model-viewer');
    this.modelCaption = document.getElementById('landing-active-model-name');
    this.selectorPills = document.querySelectorAll('.model-select-pill');
    this.audioCtx = null;
    this.isOpen = true;

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
    this.exposeGlobalAPI();
  }

  bindEvents() {
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        this.playEnterSound();
        this.close();
      });
    }

    if (this.skipLink) {
      this.skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    }

    // Keyboard support: pressing Enter or Space when on landing screen launches the map
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      // If modal or other dialog is active, ignore
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

    // 3D Relic Selector Pills
    this.selectorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const modelUrl = pill.getAttribute('data-model');
        const modelName = pill.getAttribute('data-name');
        this.switchModel(modelUrl, modelName, pill);
      });
    });
  }

  switchModel(modelUrl, modelName, activePill) {
    if (!this.modelViewer) return;

    this.selectorPills.forEach(p => p.classList.remove('active'));
    if (activePill) activePill.classList.add('active');

    // Smoothly update model viewer
    this.modelViewer.setAttribute('src', modelUrl);
    if (this.modelCaption) {
      this.modelCaption.textContent = `Featured: ${modelName}`;
    }

    // Subtle audio feedback on switch
    this.playBlipSound(580);
  }

  exposeGlobalAPI() {
    window.openLandingPage = () => this.open();
    window.closeLandingPage = () => this.close();
    window.landingPage = this;
  }

  open() {
    if (!this.screen) return;
    this.isOpen = true;
    this.screen.style.display = 'flex';
    // Force reflow
    void this.screen.offsetWidth;
    this.screen.classList.remove('dismissing');
    this.screen.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update URL hash
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

    // Trigger warp overlay or toast
    setTimeout(() => {
      this.screen.classList.remove('active');
      this.screen.style.display = 'none';
      document.body.style.overflow = '';

      // Welcome toast
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🚀 Welcome to the Space Map! Click Moon or Mars to discover relics.', '🧭', 4500);
      }
    }, 650);

    // Update URL hash
    if (window.history.replaceState) {
      window.history.replaceState(null, null, '#map');
    }
  }

  /**
   * Generates a rich, cinematic sci-fi warp airlock sound via Web Audio API.
   * Works across all modern browsers without requiring external audio files.
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

      // 1. Bass Power Pulse (Thump)
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

      // 2. High-Tech Shimmer Harmonic (Chime)
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

    } catch (e) {
      // Audio autoplay policy catch, fail silently
    }
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
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.landingPage = new LandingPageController();
});
