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
    this.btnTopStoryGuide = document.getElementById('btn-top-story-guide');
    this.btnOpenStoryGuide = document.getElementById('btn-open-story-guide');
    this.guideIframe = document.getElementById('netlify-story-iframe');

    // Stage 1 Automatic Narration & Story Presentation Flow
    // The storytelling presentation contains 6 chapters.
    // As soon as the story narration presentation completes (6/6 slides reached or ~46s elapsed),
    // it automatically transitions the user directly to Stage 2 (3D Inspection Deck).
    this.storyNarrationDuration = 46000; // 46 seconds for the complete 6/6 chapters presentation
    this.storyNarrationTimer = null;
    this.isGuideActive = true;

    // Stage 2: 3D Inspection Deck elements
    this.screen = document.getElementById('landing-screen');
    this.enterBtn = document.getElementById('btn-enter-space-map');
    this.skipLink = document.getElementById('landing-skip-link');
    this.modelViewer = document.getElementById('landing-model-viewer');
    this.modelCaption = document.getElementById('landing-model-name');
    this.quantaBanner = document.getElementById('landing-quanta-banner');
    this.nebulaGlow = document.querySelector('.landing-nebula-glow');
    this.starsBg = document.querySelector('.landing-stars');

    // 3 Primary Models for Automatic Slow 4s Slide Transition
    this.modelsList = [
      {
        name: '🌕 Apollo 11 Lunar Module (Moon \u2022 1969)',
        src: '/models/apollo_lunar_module.glb',
        alt: 'Apollo 11 Lunar Module Descent Stage'
      },
      {
        name: '🔴 Perseverance Rover (Mars \u2022 2021)',
        src: '/models/perseverance_rover.glb',
        alt: 'Perseverance Rover'
      },
      {
        name: '🚁 Ingenuity Helicopter (Mars \u2022 2021)',
        src: '/models/ingenuity_helicopter.glb',
        alt: 'Ingenuity Mars Helicopter'
      }
    ];
    this.currentModelIndex = 0;
    this.modelSlideTimer = null;
    this.isUserInteractingWithModel = false;

    this.audioCtx = null;
    this.isOpen = false;

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
        this.startStoryNarrationFlow();
      } else {
        this.open();
      }
    }

    this.bindEvents();
    this.initParallax();
    this.exposeGlobalAPI();
  }

  /* ---------------- STAGE 1: NETLIFY STORY GUIDE METHODS ---------------- */

  startStoryNarrationFlow() {
    this.stopStoryNarrationFlow();

    // Trigger video/narration playback inside the Netlify app
    this.triggerIframeNarration();

    // When the full 6/6 slides narration presentation concludes,
    // automatically transition the user directly to the 3D Inspection Deck.
    this.storyNarrationTimer = setTimeout(() => {
      if (this.isGuideActive) {
        console.log('[QUANTA_CAT] Story narration 6/6 finished. Auto-advancing to Stage 2: 3D Inspection Deck...');
        this.advanceToDeck();
      }
    }, this.storyNarrationDuration);
  }

  stopStoryNarrationFlow() {
    if (this.storyNarrationTimer) {
      clearTimeout(this.storyNarrationTimer);
      this.storyNarrationTimer = null;
    }
  }

  triggerIframeNarration() {
    const tryDirectTrigger = () => {
      try {
        if (this.guideIframe) {
          // If same-origin (/story/index.html), directly click the button inside the iframe DOM
          try {
            const doc = this.guideIframe.contentDocument || this.guideIframe.contentWindow?.document;
            if (doc) {
              const listenBtn = doc.querySelector('.listen-button');
              if (listenBtn && !listenBtn.classList.contains('auto-started')) {
                listenBtn.classList.add('auto-started');
                listenBtn.click();
                console.log('[QUANTA_CAT] Triggered .listen-button directly in story iframe');
              }
              const narrationBtn = doc.querySelector('button[aria-label="Enable narration"]');
              if (narrationBtn && narrationBtn.getAttribute('aria-pressed') === 'false') {
                narrationBtn.click();
              }
            }
          } catch (domErr) {}

          // Also send cross-origin / postMessage notification
          if (this.guideIframe.contentWindow) {
            const msg = {
              action: 'play',
              type: 'play',
              command: 'play',
              narration: true,
              start: true,
              autoplay: true
            };
            this.guideIframe.contentWindow.postMessage(msg, '*');
          }
        }
      } catch (err) {}
    };

    // Attempt immediately and across intervals as React mounts
    tryDirectTrigger();
    [80, 200, 450, 900, 1600, 2500].forEach(ms => setTimeout(tryDirectTrigger, ms));

    // Attempt upon iframe load
    if (this.guideIframe) {
      this.guideIframe.addEventListener('load', () => {
        tryDirectTrigger();
        setTimeout(tryDirectTrigger, 200);
        setTimeout(tryDirectTrigger, 800);
      });
      // Fallback to Netlify if /story/ fails
      this.guideIframe.addEventListener('error', () => {
        if (this.guideIframe.src.includes('/story/')) {
          console.warn('[QUANTA_CAT] Story local endpoint error, switching to Netlify fallback...');
          this.guideIframe.src = 'https://storytelling-app-a344bb.netlify.app/?autoplay=1&play=1&narration=1&start=true&audio=1';
        }
      });
    }

    // Modern browsers require a user gesture for audio context unblock.
    // On the first user tap/click anywhere, re-issue playback command to guarantee voice narration starts.
    const userGestureHandler = () => {
      tryDirectTrigger();
      window.removeEventListener('pointerdown', userGestureHandler);
      window.removeEventListener('click', userGestureHandler);
      window.removeEventListener('keydown', userGestureHandler);
    };
    window.addEventListener('pointerdown', userGestureHandler, { passive: true });
    window.addEventListener('click', userGestureHandler, { passive: true });
    window.addEventListener('keydown', userGestureHandler, { passive: true });
  }

  advanceToDeck() {
    this.stopStoryNarrationFlow();
    this.playQuantaChime();

    if (this.guideStage) {
      this.guideStage.classList.add('dismissing');
      setTimeout(() => {
        this.guideStage.classList.remove('active', 'dismissing');
        this.guideStage.style.display = 'none';
        this.isGuideActive = false;
        this.open();
      }, 320);
    } else {
      this.open();
    }
  }

  closeStoryGuide(immediate = false) {
    this.stopStoryNarrationFlow();
    if (!this.guideStage) return;
    this.isGuideActive = false;
    this.guideStage.classList.remove('active', 'dismissing');
    this.guideStage.style.display = 'none';
  }

  openStoryGuide() {
    if (!this.guideStage) return;

    this.stopStoryNarrationFlow();

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

    this.startStoryNarrationFlow();
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
    if (this.btnTopStoryGuide) {
      this.btnTopStoryGuide.addEventListener('click', () => this.openStoryGuide());
    }
    if (this.btnOpenStoryGuide) {
      this.btnOpenStoryGuide.addEventListener('click', () => this.openStoryGuide());
    }

    // Cross-origin safe message listener from Netlify storytelling iframe
    // When 6/6 slides narration presentation ends, advance directly to 3D Inspection Deck
    window.addEventListener('message', (event) => {
      try {
        if (!event.data) return;
        const d = event.data;
        if (
          d === 'finish' ||
          d === 'complete' ||
          d === 'story_complete' ||
          d.action === 'finish' ||
          d.action === 'complete' ||
          d.action === 'end' ||
          d.action === 'explore' ||
          d.action === 'story_complete' ||
          d.type === 'finish' ||
          d.type === 'complete' ||
          d.type === 'story_complete' ||
          d.slide === 6 ||
          d.chapter === 6 ||
          d.currentSlide === 6 ||
          d.currentChapter === 6 ||
          d.currentIndex === 5 ||
          d.finished === true
        ) {
          console.log('[QUANTA_CAT] Received story finish event from Netlify iframe. Advancing to 3D deck...');
          this.advanceToDeck();
        }
      } catch (e) {}
    });

    // 1. Enter Space Map Action (Big Red Button - Manual user interaction)
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

    // 3. 3D Model Auto-Slide Indicator Dots Click & User Interaction Pause
    const slideDots = document.querySelectorAll('.slide-dot');
    slideDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          this.transitionToModel(idx);
          this.playBlipSound(580);
          // Reset 4s auto timer
          this.startModelAutoSlide();
        }
      });
    });

    // Pause auto-slide while user inspects 3D model, resume 4s after interaction
    if (this.modelViewer) {
      let pauseTimeout = null;
      const onInteractionStart = () => {
        this.isUserInteractingWithModel = true;
        clearTimeout(pauseTimeout);
      };
      const onInteractionEnd = () => {
        clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(() => {
          this.isUserInteractingWithModel = false;
        }, 4000);
      };

      this.modelViewer.addEventListener('pointerdown', onInteractionStart, { passive: true });
      this.modelViewer.addEventListener('pointerup', onInteractionEnd, { passive: true });
      this.modelViewer.addEventListener('touchstart', onInteractionStart, { passive: true });
      this.modelViewer.addEventListener('touchend', onInteractionEnd, { passive: true });
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

  /* ---------------- 3D MODEL AUTO-SLIDESHOW (4S SLOW TRANSITION) ---------------- */

  startModelAutoSlide() {
    this.stopModelAutoSlide();
    this.modelSlideTimer = setInterval(() => {
      if (this.isUserInteractingWithModel) return;
      this.nextModelSlide();
    }, 4000);
  }

  stopModelAutoSlide() {
    if (this.modelSlideTimer) {
      clearInterval(this.modelSlideTimer);
      this.modelSlideTimer = null;
    }
  }

  nextModelSlide() {
    const nextIdx = (this.currentModelIndex + 1) % this.modelsList.length;
    this.transitionToModel(nextIdx);
  }

  transitionToModel(index) {
    if (!this.modelViewer || index < 0 || index >= this.modelsList.length) return;
    this.currentModelIndex = index;
    const model = this.modelsList[index];

    // Slow cinematic slide out (0.4s)
    this.modelViewer.classList.add('model-slide-out');

    setTimeout(() => {
      this.modelViewer.setAttribute('src', model.src);
      this.modelViewer.setAttribute('alt', model.alt);

      const nameEl = document.getElementById('landing-model-name');
      if (nameEl) nameEl.textContent = model.name;

      const dots = document.querySelectorAll('.slide-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      this.modelViewer.classList.remove('model-slide-out');
      this.modelViewer.classList.add('model-slide-in');

      setTimeout(() => {
        this.modelViewer.classList.remove('model-slide-in');
      }, 800);
    }, 400);
  }

  exposeGlobalAPI() {
    window.openLandingPage = () => this.open();
    window.closeLandingPage = () => this.close();
    window.openStoryGuide = () => this.openStoryGuide();
    window.advanceToDeck = () => this.advanceToDeck();
    window.transitionToModel = (idx) => this.transitionToModel(idx);
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

    // Start 4s automatic 3D model slideshow
    this.startModelAutoSlide();

    if (window.history.replaceState) {
      window.history.replaceState(null, null, '#deck');
    }
  }

  close(immediate = false) {
    if (!this.screen) return;
    this.isOpen = false;
    this.stopModelAutoSlide();

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
