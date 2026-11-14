/**
 * Space Archaeologists - 3D Object Viewer & Story Card Controller
 * Manages:
 *  - Google <model-viewer> with realistic lighting and hotspots
 *  - Clean archival photography hero fallback when model_file is null (no non-NASA models)
 *  - Unverified warning alert badge when verified === false (TODO: verify)
 *  - Sources & NASA Archives section from source_names
 *  - Dual-reading-level story cards (Explorer 7-10 vs Commander 11-16)
 *  - Interactive Web Speech Voice Narration
 *  - Full offline localStorage fallback support
 */

class ObjectViewerController {
  constructor() {
    this.screen = document.getElementById('object-screen');
    this.viewer = document.getElementById('nasa-model-viewer');
    this.readingLevel = 'simple'; // 'simple' (7-10) or 'advanced' (11-16)
    this.currentObject = null;
    this.isSpeaking = false;
    this.synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    this.currentUtterance = null;

    this.init();
  }

  init() {
    this.setupDOMElements();
    this.bindEvents();
  }

  setupDOMElements() {
    this.backBtn = document.getElementById('btn-back-to-map');
    this.solarBackBtn = document.getElementById('btn-obj-to-solar');
    this.readingToggleBtn = document.getElementById('btn-reading-toggle');
    this.readingLabel = document.getElementById('reading-level-label');
    this.narrateBtn = document.getElementById('btn-narrate-story');

    // 3D stage and fallback elements
    this.modelSourceBadge = document.getElementById('model-source-badge');
    this.modelLoader = document.getElementById('model-loader');
    this.modelInstructions = document.getElementById('model-instructions-badge');
    this.hotspotInfoBox = document.getElementById('hotspot-active-info');
    this.photoFallbackHero = document.getElementById('photo-fallback-hero');
    this.photoFallbackImg = document.getElementById('photo-fallback-img');
    this.btnToggle3D = document.getElementById('btn-toggle-3d');
    this.btnTogglePhoto = document.getElementById('btn-toggle-photo');
    this.btnResetCamera = document.getElementById('btn-reset-camera');

    // Story fields
    this.unverifiedBadge = document.getElementById('obj-unverified-badge');
    this.badgeMission = document.getElementById('obj-badge-mission');
    this.badgeYear = document.getElementById('obj-badge-year');
    this.badgeCategory = document.getElementById('obj-badge-category');
    this.badgeStatus = document.getElementById('obj-badge-status');

    this.objTitle = document.getElementById('obj-title');
    this.objHeadline = document.getElementById('obj-headline');
    this.objStoryText = document.getElementById('obj-story-text');
    
    // Who, What, When, Where, How, Why Left
    this.fieldWho = document.getElementById('field-who');
    this.fieldWhat = document.getElementById('field-what');
    this.fieldWhen = document.getElementById('field-when');
    this.fieldWhere = document.getElementById('field-where');
    this.fieldHow = document.getElementById('field-how');
    this.fieldWhyLeft = document.getElementById('field-why-left');
    this.fieldEnigma = document.getElementById('field-enigma');
    this.sourcesList = document.getElementById('obj-sources-list');
    this.objPhoto = document.getElementById('obj-archive-photo');
  }

  bindEvents() {
    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => this.close());
    }

    if (this.solarBackBtn) {
      this.solarBackBtn.addEventListener('click', () => {
        this.close();
        if (window.surfaceController) {
          window.surfaceController.returnToSolarSystem();
        }
      });
    }

    if (this.readingToggleBtn) {
      this.readingToggleBtn.addEventListener('click', () => {
        this.stopVoice();
        this.readingLevel = (this.readingLevel === 'simple') ? 'advanced' : 'simple';
        this.updateReadingLevelUI();
        if (this.currentObject) {
          this.renderStory(this.currentObject);
        }
      });
    }

    // Voice narration button
    if (this.narrateBtn) {
      this.narrateBtn.addEventListener('click', () => {
        if (this.isSpeaking) {
          this.stopVoice();
        } else {
          this.readFullStory();
        }
      });
    }

    // Interactive clickable cards to speak individual fields
    this.setupInteractiveSpeechSection('matrix-who', () => `Who explored this mission: ${this.currentObject?.who}`);
    this.setupInteractiveSpeechSection('matrix-what', () => `What is this object: ${this.currentObject?.what}`);
    this.setupInteractiveSpeechSection('matrix-when', () => `When did it land: ${this.currentObject?.when}`);
    this.setupInteractiveSpeechSection('matrix-where', () => `Where it rests: ${this.currentObject?.where}`);
    this.setupInteractiveSpeechSection('matrix-how', () => `How it arrived: ${this.currentObject?.how}`);
    this.setupInteractiveSpeechSection('matrix-why-left', () => `Why was it left behind: ${this.currentObject?.why_left}`);
    this.setupInteractiveSpeechSection('field-enigma', () => {
      const content = (this.readingLevel === 'simple') ? this.currentObject?.reading_level_simple : this.currentObject?.reading_level_advanced;
      const fact = content?.did_you_know || this.currentObject?.fun_fact;
      return `Enigma fact: ${fact}`;
    });

    // Stage View Toggles & Camera Controls
    if (this.btnToggle3D) {
      this.btnToggle3D.addEventListener('click', () => {
        if (this.currentObject?.model_file) {
          this.switchTo3DView();
        } else if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast('No official 3D mesh model released for this artifact. Displaying archival photography.', '📷');
        }
      });
    }

    if (this.btnTogglePhoto) {
      this.btnTogglePhoto.addEventListener('click', () => {
        this.switchToPhotoView();
      });
    }

    if (this.btnResetCamera) {
      this.btnResetCamera.addEventListener('click', () => {
        if (this.viewer) {
          this.viewer.cameraOrbit = '0deg 75deg 105%';
          this.viewer.fieldOfView = 'auto';
          if (typeof window.showSpaceToast === 'function') {
            window.showSpaceToast('Camera view reset to default orbit.', '⟲', 1500);
          }
        }
      });
    }

    // Listen for global open-object-page event
    window.addEventListener('open-object-page', async (e) => {
      if (e.detail && e.detail.id) {
        await this.loadObject(e.detail.id);
      }
    });
  }

  setupInteractiveSpeechSection(elementId, textGetter) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.cursor = 'pointer';
    el.title = 'Click to listen to this fact read aloud!';
    el.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      const text = textGetter();
      if (text) {
        this.speakText(text);
      }
    });
  }

  updateReadingLevelUI() {
    if (this.readingLabel) {
      this.readingLabel.textContent = (this.readingLevel === 'simple') 
        ? 'Reading Level: Explorer (Ages 7–10)' 
        : 'Reading Level: Commander (Ages 11–16)';
    }
    if (this.readingToggleBtn) {
      this.readingToggleBtn.textContent = (this.readingLevel === 'simple')
        ? 'Switch to Commander (11–16)'
        : 'Switch to Explorer (7–10)';
      this.readingToggleBtn.classList.toggle('active', this.readingLevel === 'advanced');
    }
  }

  async loadObject(objectId) {
    // 1. Instant recovery from active surfaceController in memory
    if (window.surfaceController && Array.isArray(window.surfaceController.objects)) {
      const inMemory = window.surfaceController.objects.find(o => o.id === objectId);
      if (inMemory) {
        this.currentObject = inMemory;
        this.open(inMemory);
        return;
      }
    }

    // 2. Try primary API endpoint
    try {
      const res = await fetch(`/api/objects/${encodeURIComponent(objectId)}`);
      if (res.ok) {
        const data = await res.json();
        this.currentObject = data;
        this.open(data);
        return;
      }
    } catch (err) {
      console.warn(`Online fetch failed for object ${objectId}, attempting static fallback:`, err);
    }

    // 3. Try static fallback dataset file
    try {
      const staticRes = await fetch('/data/objects.json');
      if (staticRes.ok) {
        const allData = await staticRes.json();
        const found = allData.find(o => o.id === objectId);
        if (found) {
          this.currentObject = found;
          this.open(found);
          return;
        }
      }
    } catch (staticErr) {}

    // 4. Try localStorage offline cache
    let found = null;
    try {
      const bodies = ['Moon', 'Mars', 'all'];
      for (const b of bodies) {
        const raw = localStorage.getItem(`nasa_objects_${b}`);
        if (raw) {
          const list = JSON.parse(raw);
          found = list.find(o => o.id === objectId);
          if (found) break;
        }
      }
    } catch (cacheErr) {}

    if (found) {
      this.currentObject = found;
      this.open(found);
    } else {
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('Mission Control: Searching planetary deep archives...', '📦');
      }
    }
  }

  open(obj) {
    if (!this.screen) return;
    this.stopVoice();
    this.screen.classList.add('active');
    this.currentObject = obj;

    if (this.modelLoadSafetyTimer) {
      clearTimeout(this.modelLoadSafetyTimer);
      this.modelLoadSafetyTimer = null;
    }

    const has3DModel = !!obj.model_file && obj.model_file.trim() !== '';

    if (this.btnToggle3D) {
      this.btnToggle3D.style.display = has3DModel ? 'inline-flex' : 'none';
      this.btnToggle3D.classList.toggle('active', has3DModel);
    }
    if (this.btnTogglePhoto) {
      this.btnTogglePhoto.classList.toggle('active', !has3DModel);
    }
    if (this.btnResetCamera) {
      this.btnResetCamera.style.display = has3DModel ? 'inline-flex' : 'none';
    }

    if (has3DModel) {
      this.switchTo3DView(true);
    } else {
      this.switchToPhotoView();
    }

    // 2. Render Story & Archival Facts
    this.renderStory(obj);

    // Reset scroll smoothly to top
    const mainLayout = document.querySelector('.object-main-layout');
    if (mainLayout) mainLayout.scrollTop = 0;
  }

  switchTo3DView(isInitial = false) {
    const obj = this.currentObject;
    if (!obj || !obj.model_file) return;

    if (this.photoFallbackHero) this.photoFallbackHero.style.display = 'none';
    if (this.btnToggle3D) this.btnToggle3D.classList.add('active');
    if (this.btnTogglePhoto) this.btnTogglePhoto.classList.remove('active');
    if (this.modelInstructions) this.modelInstructions.style.display = 'flex';
    if (this.hotspotInfoBox) this.hotspotInfoBox.style.display = 'block';
    if (this.modelSourceBadge) this.modelSourceBadge.textContent = 'Official NASA 3D Resource';

    if (this.viewer) {
      this.viewer.style.display = 'block';
      if (this.modelLoader) this.modelLoader.classList.remove('hide');

      // Set poster to show immediate visual preview and prevent blank screen
      if (obj.image) {
        this.viewer.setAttribute('poster', obj.image);
      } else {
        this.viewer.removeAttribute('poster');
      }

      // Cleanup prior listeners
      if (this._onModelLoad) this.viewer.removeEventListener('load', this._onModelLoad);
      if (this._onModelError) this.viewer.removeEventListener('error', this._onModelError);

      this._onModelLoad = () => {
        if (this.modelLoader) this.modelLoader.classList.add('hide');
        if (this.modelLoadSafetyTimer) clearTimeout(this.modelLoadSafetyTimer);
        if (typeof window.showSpaceToast === 'function') {
          window.showSpaceToast(`✦ 3D telemetry rendered! Drag to rotate, click nodes for part details.`, '🛰️', 3000);
        }
      };

      this._onModelError = (err) => {
        console.warn('3D Model failed to render, switching to archival photo:', err);
        if (this.modelLoader) this.modelLoader.classList.add('hide');
        if (this.modelLoadSafetyTimer) clearTimeout(this.modelLoadSafetyTimer);
        this.switchToPhotoView('3D model mesh telemetry unavailable. Showing official high-resolution archival photo.');
      };

      this.viewer.addEventListener('load', this._onModelLoad, { once: true });
      this.viewer.addEventListener('error', this._onModelError, { once: true });

      // Safety timeout: 8 seconds maximum
      this.modelLoadSafetyTimer = setTimeout(() => {
        if (this.modelLoader) this.modelLoader.classList.add('hide');
      }, 8000);

      this.viewer.setAttribute('src', obj.model_file);
      this.viewer.setAttribute('alt', `NASA 3D Model of ${obj.name}`);
      this.renderHotspots(obj.hotspots || []);
    }
  }

  switchToPhotoView(reasonText = null) {
    const obj = this.currentObject;
    if (!obj) return;

    if (this.viewer) {
      this.viewer.style.display = 'none';
    }
    if (this.modelLoader) this.modelLoader.classList.add('hide');
    if (this.modelInstructions) this.modelInstructions.style.display = 'none';
    if (this.hotspotInfoBox) this.hotspotInfoBox.style.display = 'none';

    if (this.btnToggle3D) this.btnToggle3D.classList.remove('active');
    if (this.btnTogglePhoto) this.btnTogglePhoto.classList.add('active');
    if (this.modelSourceBadge) this.modelSourceBadge.textContent = 'Official NASA Photographic Record';

    if (this.photoFallbackHero && this.photoFallbackImg) {
      this.photoFallbackImg.src = obj.image || '/favicon.ico';
      this.photoFallbackHero.style.display = 'flex';
    }

    if (reasonText && typeof window.showSpaceToast === 'function') {
      window.showSpaceToast(reasonText, '📷', 4000);
    }
  }

  close() {
    this.stopVoice();
    if (this.screen) {
      this.screen.classList.remove('active');
    }
    if (this.viewer) {
      this.viewer.removeAttribute('src');
      const existing = this.viewer.querySelectorAll('.hotspot');
      existing.forEach(h => h.remove());
    }
  }

  renderHotspots(hotspots) {
    if (!this.viewer) return;
    const oldHotspots = this.viewer.querySelectorAll('.hotspot');
    oldHotspots.forEach(el => el.remove());

    if (this.hotspotInfoBox) {
      this.hotspotInfoBox.innerHTML = '<span class="hotspot-prompt">💡 Click any numbered node on the 3D model to inspect equipment parts.</span>';
    }

    hotspots.forEach((hs, idx) => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      btn.slot = `hotspot-${idx}`;
      btn.setAttribute('data-position', hs.position);
      btn.setAttribute('data-normal', hs.normal || '0 1 0');

      btn.innerHTML = `
        <div class="hotspot-pulse"></div>
        <div class="hotspot-dot">${idx + 1}</div>
      `;

      btn.addEventListener('click', () => {
        if (this.hotspotInfoBox) {
          this.hotspotInfoBox.innerHTML = `
            <div class="hotspot-detail-card">
              <span class="hotspot-tag">Component #${idx + 1}</span>
              <h4>${hs.title}</h4>
              <p>${hs.text}</p>
              <button class="btn-hotspot-speak" title="Listen to this explanation">🔊 Speak</button>
            </div>
          `;
          const speakBtn = this.hotspotInfoBox.querySelector('.btn-hotspot-speak');
          if (speakBtn) {
            speakBtn.addEventListener('click', () => {
              this.speakText(`${hs.title}: ${hs.text}`);
            });
          }
        }
      });

      this.viewer.appendChild(btn);
    });
  }

  renderStory(obj) {
    const isSimple = (this.readingLevel === 'simple');
    const content = isSimple ? obj.reading_level_simple : obj.reading_level_advanced;

    // Badges
    if (this.badgeMission) this.badgeMission.textContent = obj.mission;
    if (this.badgeYear) this.badgeYear.textContent = `Year: ${obj.year}`;
    if (this.badgeCategory) this.badgeCategory.textContent = obj.category || 'Relic';
    if (this.badgeStatus) this.badgeStatus.textContent = obj.status || 'Abandoned';

    // Unverified warning badge
    if (this.unverifiedBadge) {
      if (obj.verified === false) {
        this.unverifiedBadge.style.display = 'flex';
      } else {
        this.unverifiedBadge.style.display = 'none';
      }
    }

    // Title & narrative
    if (this.objTitle) this.objTitle.textContent = obj.name;

    if (content) {
      if (this.objHeadline) this.objHeadline.textContent = content.title;
      if (this.objStoryText) {
        this.objStoryText.innerHTML = `
          <p class="story-lead">${content.summary}</p>
          <p class="story-body">${content.story}</p>
        `;
      }
    }

    // Historical Investigation Matrix (Who, What, When, Where, How, Why Left)
    if (this.fieldWho) this.fieldWho.textContent = obj.who;
    if (this.fieldWhat) this.fieldWhat.textContent = obj.what;
    if (this.fieldWhen) this.fieldWhen.textContent = obj.when;
    if (this.fieldWhere) this.fieldWhere.textContent = obj.where;
    if (this.fieldHow) this.fieldHow.textContent = obj.how;
    if (this.fieldWhyLeft) this.fieldWhyLeft.textContent = obj.why_left;
    
    // Enigma fact
    if (this.fieldEnigma) {
      const didYouKnow = (content && content.did_you_know) ? content.did_you_know : obj.fun_fact;
      this.fieldEnigma.innerHTML = `
        <div class="enigma-icon">✨</div>
        <div class="enigma-content">
          <div class="enigma-header-line">
            <strong>Enigma Fact:</strong>
            <span class="tap-voice-hint">🔊 Tap to listen</span>
          </div>
          <span>${didYouKnow}</span>
        </div>
      `;
    }

    // Sources & NASA Archives List
    if (this.sourcesList) {
      this.sourcesList.innerHTML = '';
      const sources = obj.source_names && obj.source_names.length > 0
        ? obj.source_names
        : ['NASA Planetary Data System (PDS)', 'NASA NSSDCA Archive'];

      sources.forEach(src => {
        const span = document.createElement('span');
        span.className = 'source-pill';
        span.textContent = src;
        this.sourcesList.appendChild(span);
      });
    }

    // Archive photo
    if (this.objPhoto) {
      this.objPhoto.src = obj.image;
      this.objPhoto.alt = `Archival photograph of ${obj.name}`;
      this.objPhoto.parentElement.style.display = 'block';
    }
  }

  /* ================= VOICE NARRATION (Speech Synthesis) ================= */
  readFullStory() {
    if (!this.currentObject) return;
    const isSimple = (this.readingLevel === 'simple');
    const content = isSimple ? this.currentObject.reading_level_simple : this.currentObject.reading_level_advanced;
    
    const narrative = [
      this.currentObject.name,
      content ? content.title : '',
      content ? content.summary : '',
      content ? content.story : '',
      `Why was it left behind? ${this.currentObject.why_left}`,
      `Enigma fact: ${content?.did_you_know || this.currentObject.fun_fact}`
    ].filter(Boolean).join('. ');

    this.speakText(narrative);
  }

  speakText(text) {
    if (!this.synth) {
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('🧑‍🚀 Radio check: Audio narration is not supported in this browser. You can read the mission notes below!', '📢', 4500);
      }
      return;
    }

    this.stopVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = (this.readingLevel === 'simple') ? 0.95 : 1.0;
    utterance.pitch = 1.05;

    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')))) || voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.narrateBtn) {
        this.narrateBtn.classList.add('speaking');
        const textSpan = this.narrateBtn.querySelector('.voice-text');
        if (textSpan) textSpan.textContent = 'Pause Narration';
      }
    };

    utterance.onend = () => {
      this.stopVoice();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.stopVoice();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopVoice() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    if (this.narrateBtn) {
      this.narrateBtn.classList.remove('speaking');
      const textSpan = this.narrateBtn.querySelector('.voice-text');
      if (textSpan) textSpan.textContent = 'Listen to Story';
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const objectViewer = new ObjectViewerController();
  window.objectViewer = objectViewer;
});
