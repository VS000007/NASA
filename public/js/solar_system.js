/**
 * Space Archaeologists - Realistic Solar System Engine
 * Features:
 * - Physically shaded 3D planets with realistic sunlight illumination & terminator shadows
 * - Earth with oceans, continents, and glowing blue atmospheric limb
 * - Moon with cratered maria and realistic tidal phase shading (properly spaced from Earth)
 * - Mars with rust-red topography, polar ice caps, and thin atmosphere glow
 * - Dynamic coronal Sun with pulsating solar flares and volumetric light rays
 * - Multi-layer nebula dust clouds and Hubble-style diffraction spike stars
 * - Holographic archaeologist targeting reticle
 */

class SolarSystemNavigator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = document.getElementById('planet-tooltip');

    // Viewport transform
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.hoveredBody = null;

    // Simulation
    this.planets = {};
    this.stars = [];
    this.nebulaClouds = [];
    this.animationId = null;
    this.lastTimestamp = 0;
    this.timeSpeed = 0.0002;
    this.isWarping = false;

    this.artifactCounts = {
      'Moon': { count: 47, label: 'Apollo 11, Lunar Rovers, Surveyors & ALSEPs' },
      'Mars': { count: 19, label: 'Viking, Pathfinder, Opportunity, Curiosity & Jezero Hardware' }
    };

    this.init();
  }

  async init() {
    this.resize();
    this.generateStarfield();
    this.generateNebula();
    this.setupEvents();
    await this.fetchPlanetaryData();
    await this.fetchArtifactCounts();
    this.animate(0);
  }

  async fetchArtifactCounts() {
    try {
      const res = await fetch('/api/objects');
      if (res.ok) {
        const allObjects = await res.json();
        try {
          localStorage.setItem('nasa_objects_all', JSON.stringify(allObjects));
        } catch (e) {}

        const moonCount = allObjects.filter(o => o.body === 'Moon').length;
        const marsCount = allObjects.filter(o => o.body === 'Mars').length;

        if (moonCount > 0) this.artifactCounts['Moon'].count = moonCount;
        if (marsCount > 0) this.artifactCounts['Mars'].count = marsCount;

        const moonEl = document.getElementById('header-moon-count');
        const marsEl = document.getElementById('header-mars-count');
        if (moonEl) moonEl.textContent = `(${this.artifactCounts['Moon'].count} Relics)`;
        if (marsEl) marsEl.textContent = `(${this.artifactCounts['Mars'].count} Relics)`;
      }
    } catch (e) {
      console.warn('Could not fetch global object counts:', e);
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  generateStarfield() {
    this.stars = [];
    const count = 350;
    for (let i = 0; i < count; i++) {
      const isBright = Math.random() < 0.08;
      this.stars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 3200,
        radius: isBright ? Math.random() * 1.6 + 1.2 : Math.random() * 1.0 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        hasSpikes: isBright,
        color: ['#ffffff', '#e0f2fe', '#fed7aa', '#fbcfe8', '#bfdbfe'][Math.floor(Math.random() * 5)]
      });
    }
  }

  generateNebula() {
    this.nebulaClouds = [
      { x: -300, y: -200, r: 450, color: 'rgba(56, 189, 248, 0.04)' },
      { x: 350, y: 150, r: 500, color: 'rgba(236, 72, 153, 0.03)' },
      { x: -100, y: 300, r: 420, color: 'rgba(139, 92, 246, 0.035)' },
      { x: 200, y: -320, r: 380, color: 'rgba(249, 115, 22, 0.025)' }
    ];
  }

  async fetchPlanetaryData() {
    try {
      const res = await fetch('/api/planets');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.planets = data.planets || {};
      this.enrichPlanetaryVisuals();
      
      const badge = document.getElementById('telemetry-badge');
      if (badge) {
        badge.innerHTML = '<span class="telemetry-dot"></span> JPL Link Active';
        badge.classList.remove('offline');
      }
    } catch (err) {
      console.warn('Failed to load live JPL data, using built-in defaults:', err);
      this.planets = this.getDefaultPlanets();
      this.enrichPlanetaryVisuals();
      
      const badge = document.getElementById('telemetry-badge');
      if (badge) {
        badge.innerHTML = '<span class="telemetry-dot offline"></span> NASA Cache Active';
        badge.classList.add('offline');
      }
      if (typeof window.showSpaceToast === 'function') {
        window.showSpaceToast('Mission Control: NASA archival orbital data active for smooth exploration!', '🛰️');
      }
    }
  }

  getDefaultPlanets() {
    return {
      "Mercury": { name: "Mercury", radius: 8, color: "#9ca3af", orbit_radius: 95, angle_rad: 0.8, period_days: 87.97 },
      "Venus": { name: "Venus", radius: 14, color: "#fef08a", orbit_radius: 155, angle_rad: 2.1, period_days: 224.7 },
      "Earth": { name: "Earth", radius: 18, color: "#38bdf8", orbit_radius: 235, angle_rad: 3.6, period_days: 365.25 },
      "Moon": { name: "Moon", radius: 8, color: "#e2e8f0", orbit_radius: 48, angle_rad: 1.2, period_days: 27.3, orbit_parent: "Earth" },
      "Mars": { name: "Mars", radius: 14, color: "#f97316", orbit_radius: 335, angle_rad: 4.8, period_days: 687.0 },
      "Jupiter": { name: "Jupiter", radius: 28, color: "#fdba74", orbit_radius: 450, angle_rad: 5.9, period_days: 4333 }
    };
  }

  enrichPlanetaryVisuals() {
    // Calibrate radii and orbit spacing for rich aesthetic realism and prevent label overlap
    if (this.planets['Earth']) {
      this.planets['Earth'].radius = 18;
      this.planets['Earth'].orbit_radius = 235;
    }
    if (this.planets['Moon']) {
      this.planets['Moon'].radius = 8;
      this.planets['Moon'].orbit_radius = 48; // Clear separation from Earth
    }
    if (this.planets['Mars']) {
      this.planets['Mars'].radius = 14;
      this.planets['Mars'].orbit_radius = 335;
    }
    if (this.planets['Jupiter']) {
      this.planets['Jupiter'].radius = 28;
      this.planets['Jupiter'].orbit_radius = 450;
    }
    if (this.planets['Venus']) {
      this.planets['Venus'].radius = 14;
      this.planets['Venus'].orbit_radius = 155;
    }
    if (this.planets['Mercury']) {
      this.planets['Mercury'].radius = 8;
      this.planets['Mercury'].orbit_radius = 95;
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.generateStarfield();
    });

    // Mouse drag
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.isWarping) return;
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.panX += dx;
        this.panY += dy;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
      this.handleHover(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Zoom via wheel with smooth damping
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.applyZoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Click handler
    this.canvas.addEventListener('click', () => {
      if (this.isWarping) return;
      if (this.hoveredBody) {
        if (this.hoveredBody.name === 'Moon' || this.hoveredBody.name === 'Mars') {
          this.warpToBody(this.hoveredBody.name);
        }
      }
    });

    // Touch support for tablets and mobile
    let touchStartDist = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.lastMouse.x;
        const dy = e.touches[0].clientY - this.lastMouse.y;
        this.panX += dx;
        this.panY += dy;
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.handleHover(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchStartDist;
        if (factor > 0.85 && factor < 1.2) {
          this.applyZoom(factor, (e.touches[0].clientX + e.touches[1].clientX)/2, (e.touches[0].clientY + e.touches[1].clientY)/2);
        }
        touchStartDist = dist;
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      touchStartDist = 0;
    });
  }

  applyZoom(factor, clientX, clientY) {
    const newZoom = Math.min(Math.max(this.zoom * factor, 0.45), 3.0);
    const mouseX = clientX - this.centerX - this.panX;
    const mouseY = clientY - this.centerY - this.panY;
    this.panX -= mouseX * (newZoom / this.zoom - 1);
    this.panY -= mouseY * (newZoom / this.zoom - 1);
    this.zoom = newZoom;
  }

  resetView() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  handleHover(clientX, clientY) {
    const mouseWorldX = (clientX - this.centerX - this.panX) / this.zoom;
    const mouseWorldY = (clientY - this.centerY - this.panY) / this.zoom;

    let found = null;
    for (const [key, planet] of Object.entries(this.planets)) {
      if (planet.computedX === undefined) continue;
      const dist = Math.hypot(mouseWorldX - planet.computedX, mouseWorldY - planet.computedY);
      const hitRadius = Math.max(planet.radius * 2.5, 20);
      if (dist <= hitRadius) {
        found = planet;
        break;
      }
    }

    this.hoveredBody = found;
    this.updateTooltip(clientX, clientY, found);
    this.canvas.style.cursor = (found && (found.name === 'Moon' || found.name === 'Mars')) 
      ? 'pointer' 
      : (this.isDragging ? 'grabbing' : 'grab');
  }

  updateTooltip(clientX, clientY, body) {
    if (!this.tooltip) return;
    if (!body) {
      this.tooltip.classList.remove('visible');
      return;
    }

    this.tooltip.style.left = `${clientX}px`;
    this.tooltip.style.top = `${clientY}px`;

    const titleEl = this.tooltip.querySelector('.tooltip-title');
    const subtitleEl = this.tooltip.querySelector('.tooltip-subtitle');
    const badgeEl = this.tooltip.querySelector('.tooltip-badge');

    titleEl.textContent = body.name;
    
    if (body.name === 'Moon' || body.name === 'Mars') {
      const art = this.artifactCounts[body.name];
      subtitleEl.textContent = `Click to descend to ${art.count} abandoned relics`;
      badgeEl.textContent = `${art.count} Historic Relics`;
      badgeEl.className = `tooltip-badge ${body.name === 'Moon' ? 'badge-moon' : 'badge-mars'}`;
      badgeEl.style.display = 'inline-block';
    } else {
      subtitleEl.textContent = body.distance_au ? `${body.distance_au} AU from Sun` : `Orbital Period: ${body.period_days} days`;
      badgeEl.style.display = 'none';
    }

    this.tooltip.classList.add('visible');
  }

  warpToBody(bodyName) {
    if (this.isWarping) return;
    this.isWarping = true;
    const target = this.planets[bodyName];
    if (!target) return;

    const overlay = document.getElementById('warp-overlay');
    if (overlay) {
      overlay.querySelector('h2').textContent = `Approaching ${bodyName.toUpperCase()}...`;
      overlay.querySelector('p').textContent = `Descending to NASA ${bodyName} Trek coordinates`;
      overlay.classList.add('active');
    }

    const startZoom = this.zoom;
    const startPanX = this.panX;
    const startPanY = this.panY;
    const destZoom = 2.4;
    const destPanX = -target.computedX * destZoom;
    const destPanY = -target.computedY * destZoom;

    const duration = 1200;
    const startTime = performance.now();

    const warpStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.zoom = startZoom + (destZoom - startZoom) * ease;
      this.panX = startPanX + (destPanX - startPanX) * ease;
      this.panY = startPanY + (destPanY - startPanY) * ease;

      if (progress < 1.0) {
        requestAnimationFrame(warpStep);
      } else {
        setTimeout(() => {
          if (overlay) overlay.classList.remove('active');
          this.isWarping = false;
          if (typeof window.openSurfaceMap === 'function') {
            window.openSurfaceMap(bodyName);
          }
        }, 300);
      }
    };

    requestAnimationFrame(warpStep);
  }

  animate(timestamp) {
    const delta = this.lastTimestamp ? (timestamp - this.lastTimestamp) : 16;
    this.lastTimestamp = timestamp;

    this.render(delta);
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }

  render(delta) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.centerX + this.panX, this.centerY + this.panY);
    ctx.scale(this.zoom, this.zoom);

    // 1. Nebula Dust Clouds
    this.renderNebula(ctx);

    // 2. Stars & Diffraction Spikes
    this.renderStars(ctx);

    // 3. Central Realistic Glowing Sun
    this.renderSun(ctx);

    // 4. Update planetary motion
    this.updatePlanets(delta);

    // 5. Orbital paths
    this.renderOrbits(ctx);

    // 6. Realistic 3D Shaded Planets
    this.renderPlanets(ctx);

    ctx.restore();
  }

  renderNebula(ctx) {
    for (const cloud of this.nebulaClouds) {
      const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
      grad.addColorStop(0, cloud.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderStars(ctx) {
    const time = Date.now() * 0.001;
    for (const star of this.stars) {
      const twinkle = Math.sin(time * 2 + star.twinkleOffset) * 0.25;
      const alpha = Math.max(0.1, Math.min(1.0, star.baseAlpha + twinkle));
      
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // James Webb / Hubble 4-point cross diffraction spikes on bright stars
      if (star.hasSpikes && alpha > 0.5) {
        const spikeLen = star.radius * 3.5;
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        // Horizontal spike
        ctx.moveTo(star.x - spikeLen, star.y);
        ctx.lineTo(star.x + spikeLen, star.y);
        // Vertical spike
        ctx.moveTo(star.x, star.y - spikeLen);
        ctx.lineTo(star.x, star.y + spikeLen);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  renderSun(ctx) {
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 1.5) * 3;
    const coreRadius = 34;

    // 1. Deep outer corona haze reaching deep into space
    const outerCorona = ctx.createRadialGradient(0, 0, coreRadius * 0.7, 0, 0, 145 + pulse);
    outerCorona.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    outerCorona.addColorStop(0.18, 'rgba(245, 158, 11, 0.55)');
    outerCorona.addColorStop(0.4, 'rgba(234, 88, 12, 0.22)');
    outerCorona.addColorStop(0.7, 'rgba(220, 38, 38, 0.06)');
    outerCorona.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = outerCorona;
    ctx.beginPath();
    ctx.arc(0, 0, 145 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. Dynamic looping magnetic solar prominences (Hydrogen-alpha arcs)
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const baseAngle = (i * Math.PI * 2 / 7) + time * 0.08;
      const arcHeight = 12 + Math.sin(time * 2.5 + i * 1.7) * 5;
      const span = 0.32;
      
      const x1 = Math.cos(baseAngle) * coreRadius;
      const y1 = Math.sin(baseAngle) * coreRadius;
      const x2 = Math.cos(baseAngle + span) * coreRadius;
      const y2 = Math.sin(baseAngle + span) * coreRadius;
      const midAngle = baseAngle + span / 2;
      const cpx = Math.cos(midAngle) * (coreRadius + arcHeight);
      const cpy = Math.sin(midAngle) * (coreRadius + arcHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.45 + Math.sin(time * 3 + i) * 0.25})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Volumetric Solar Rays (Sunbeams)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4) + time * 0.12;
      const flareLen = 52 + Math.sin(time * 2.8 + i) * 8;
      const fx = Math.cos(angle) * flareLen;
      const fy = Math.sin(angle) * flareLen;
      
      const flareGrad = ctx.createRadialGradient(fx * 0.6, fy * 0.6, 0, fx, fy, 28);
      flareGrad.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
      flareGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Photosphere Core with dynamic convective granulation
    const coreGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, coreRadius);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.25, '#fef08a');
    coreGrad.addColorStop(0.65, '#f59e0b');
    coreGrad.addColorStop(0.92, '#ea580c');
    coreGrad.addColorStop(1, '#c2410c');

    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 45;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Granular boiling convection speckles
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius - 1, 0, Math.PI * 2);
    ctx.clip();
    for (let g = 0; g < 14; g++) {
      const gx = Math.sin(time * 0.8 + g * 1.5) * (coreRadius * 0.7);
      const gy = Math.cos(time * 0.9 + g * 2.1) * (coreRadius * 0.7);
      const gr = 3.5 + Math.sin(time * 2 + g) * 1.5;
      ctx.fillStyle = 'rgba(254, 243, 199, 0.22)';
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  updatePlanets(delta) {
    for (const [name, planet] of Object.entries(this.planets)) {
      if (planet.orbit_parent === 'Earth') {
        const speed = (360.0 / planet.period_days) * (this.timeSpeed * 10);
        planet.angle_rad = (planet.angle_rad || 0) + speed;
        const earth = this.planets['Earth'];
        if (earth && earth.computedX !== undefined) {
          planet.computedX = earth.computedX + Math.cos(planet.angle_rad) * planet.orbit_radius;
          planet.computedY = earth.computedY + Math.sin(planet.angle_rad) * planet.orbit_radius;
        }
      } else {
        const speed = (360.0 / (planet.period_days || 365)) * this.timeSpeed;
        planet.angle_rad = (planet.angle_rad || 0) + speed;
        planet.computedX = Math.cos(planet.angle_rad) * planet.orbit_radius;
        planet.computedY = Math.sin(planet.angle_rad) * planet.orbit_radius;
      }
    }
  }

  renderOrbits(ctx) {
    for (const [name, planet] of Object.entries(this.planets)) {
      if (planet.orbit_parent === 'Earth') {
        const earth = this.planets['Earth'];
        if (earth && earth.computedX !== undefined) {
          ctx.beginPath();
          ctx.arc(earth.computedX, earth.computedY, planet.orbit_radius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, planet.orbit_radius, 0, Math.PI * 2);
        if (name === 'Mars') {
          ctx.strokeStyle = 'rgba(255, 87, 34, 0.32)';
        } else if (name === 'Earth') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        }
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  renderPlanets(ctx) {
    const time = Date.now() * 0.001;

    for (const [name, planet] of Object.entries(this.planets)) {
      const px = planet.computedX;
      const py = planet.computedY;
      const isHovered = (this.hoveredBody && this.hoveredBody.name === name);
      // Smooth scale-up on hover for kids to clearly inspect realistic details
      const pr = isHovered ? (planet.radius * 1.25) : planet.radius;
      const isTarget = (name === 'Moon' || name === 'Mars');

      // Light vector from the central Sun (0, 0)
      const sunAngle = Math.atan2(py, px);
      const lightDirX = -Math.cos(sunAngle);
      const lightDirY = -Math.sin(sunAngle);

      // Archaeologist Hologram Targeting Bracket for Moon and Mars
      if (isTarget) {
        const pulse = (Math.sin(time * 3) + 1) * 0.5;
        const ringR = pr + 10 + pulse * 4;
        
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(time * (isHovered ? 1.0 : 0.4));
        ctx.strokeStyle = (name === 'Moon') 
          ? `rgba(226, 232, 240, ${0.65 + pulse * 0.35})` 
          : `rgba(255, 87, 34, ${0.75 + pulse * 0.25})`;
        ctx.lineWidth = 2;

        // 4 corner reticles
        const bSize = 8;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(ringR - bSize, ringR);
          ctx.lineTo(ringR, ringR);
          ctx.lineTo(ringR, ringR - bSize);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Hover aura glow
      if (isHovered) {
        const glow = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr + 22);
        glow.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, pr + 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // ================= REALISTIC 3D SHADED PLANET SPHERE =================
      this.drawRealisticSphere(ctx, name, px, py, pr, lightDirX, lightDirY);

      // ================= LARGE READABLE LABELS FOR KIDS =================
      // Offset Earth and Moon labels gracefully so they never collide
      let labelOffsetY = pr + 18;
      let labelOffsetX = 0;

      if (name === 'Moon') {
        labelOffsetX = (px > (this.planets['Earth']?.computedX || 0)) ? 20 : -20;
        labelOffsetY = pr + 14;
      } else if (name === 'Earth') {
        labelOffsetY = pr + 18;
      }

      ctx.font = isTarget 
        ? 'bold 13px "Space Grotesk", sans-serif' 
        : 'bold 12px "Outfit", sans-serif';
      ctx.fillStyle = isTarget ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(planet.name, px + labelOffsetX, py + labelOffsetY);
      ctx.shadowBlur = 0;

      if (isTarget) {
        const count = this.artifactCounts[name]?.count || (name === 'Moon' ? 45 : 17);
        const badgeText = `${count} Historic Relics`;
        ctx.font = 'bold 11px "Outfit", sans-serif';
        ctx.fillStyle = name === 'Moon' ? '#cbd5e1' : '#ff8a65';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText(badgeText, px + labelOffsetX, py + labelOffsetY + 15);
        ctx.shadowBlur = 0;
      }
    }
  }

  drawRealisticSphere(ctx, name, px, py, pr, lx, ly) {
    ctx.save();

    // Clip to circular planet disk
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.clip();

    // Base surface texture
    switch (name) {
      case 'Earth':
        // Deep sapphire ocean
        ctx.fillStyle = '#0a2540';
        ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

        // Continental coastal shelf shallow turquoise
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(px - pr * 0.15, py - pr * 0.15, pr * 0.55, pr * 0.45, 0.4, 0, Math.PI * 2);
        ctx.ellipse(px + pr * 0.25, py + pr * 0.1, pr * 0.45, pr * 0.48, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Continental landmasses (vibrant vegetation green & savannah)
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(px - pr * 0.2, py - pr * 0.2, pr * 0.46, pr * 0.36, 0.4, 0, Math.PI * 2);
        ctx.ellipse(px + pr * 0.28, py + pr * 0.12, pr * 0.38, pr * 0.42, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Arid deserts (Sahara / Arabian golden sands)
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(px - pr * 0.08, py + pr * 0.12, pr * 0.24, 0, Math.PI * 2);
        ctx.fill();

        // Realistic swirling weather systems & cloud formations
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(px - pr * 0.3, py - pr * 0.35, pr * 0.65, pr * 0.18, -0.25, 0, Math.PI * 2);
        ctx.ellipse(px + pr * 0.22, py - pr * 0.1, pr * 0.55, pr * 0.16, 0.35, 0, Math.PI * 2);
        ctx.ellipse(px - pr * 0.05, py + pr * 0.38, pr * 0.6, pr * 0.22, 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'Mars':
        // Rusty terracotta iron oxide soil
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

        // Dark volcanic basalt patches (Syrtis Major & Acidalia Planitia)
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.ellipse(px - pr * 0.1, py + pr * 0.08, pr * 0.5, pr * 0.38, 0.3, 0, Math.PI * 2);
        ctx.ellipse(px + pr * 0.28, py - pr * 0.22, pr * 0.35, pr * 0.28, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Valles Marineris canyon cut
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(px - pr * 0.45, py + pr * 0.05);
        ctx.lineTo(px + pr * 0.15, py + pr * 0.12);
        ctx.stroke();

        // Brilliant white northern polar ice cap with icy fringe
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(px, py - pr * 0.82, pr * 0.38, pr * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(191, 219, 254, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case 'Moon':
        // Silvery regolith crust
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

        // Dark basaltic maria (Sea of Tranquility & Ocean of Storms)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(px - pr * 0.25, py - pr * 0.15, pr * 0.4, 0, Math.PI * 2);
        ctx.arc(px + pr * 0.22, py + pr * 0.22, pr * 0.32, 0, Math.PI * 2);
        ctx.arc(px + pr * 0.12, py - pr * 0.3, pr * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Bright crater ray systems (Tycho & Copernicus ejecta rays)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(px - pr * 0.35, py + pr * 0.32, 1.8, 0, Math.PI * 2);
        ctx.arc(px + pr * 0.35, py - pr * 0.12, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(248, 250, 252, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px - pr * 0.35, py + pr * 0.32);
        ctx.lineTo(px - pr * 0.1, py + pr * 0.1);
        ctx.moveTo(px - pr * 0.35, py + pr * 0.32);
        ctx.lineTo(px - pr * 0.6, py + pr * 0.5);
        ctx.stroke();
        break;

      case 'Jupiter':
        // Alternating warm gaseous cloud belts & zones
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

        // Cream zones
        ctx.fillStyle = '#ffedd5';
        ctx.fillRect(px - pr, py - pr * 0.65, pr * 2, pr * 0.32);
        ctx.fillRect(px - pr, py - pr * 0.12, pr * 2, pr * 0.26);
        ctx.fillRect(px - pr, py + pr * 0.35, pr * 2, pr * 0.28);

        // Amber stripes
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(px - pr, py - pr * 0.35, pr * 2, pr * 0.2);
        ctx.fillRect(px - pr, py + pr * 0.14, pr * 2, pr * 0.2);

        // Great Red Spot with swirl shading
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(px + pr * 0.28, py + pr * 0.22, pr * 0.32, pr * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(px + pr * 0.28, py + pr * 0.22, pr * 0.18, pr * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'Venus':
        // Dense yellowish-cream cloud haze
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 0.85, pr * 0.45, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'Mercury':
      default:
        ctx.fillStyle = '#64748b';
        ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(px - pr * 0.2, py + pr * 0.1, pr * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // ================= 3D SPHERICAL SHADING & TERMINATOR LINE =================
    // Realistic illumination gradient: Light from Sun on one side, pitch darkness on opposite side
    const lightSourceX = px + lx * (pr * 0.7);
    const lightSourceY = py + ly * (pr * 0.7);
    const shadowSourceX = px - lx * (pr * 0.7);
    const shadowSourceY = py - ly * (pr * 0.7);

    const shadeGrad = ctx.createRadialGradient(lightSourceX, lightSourceY, pr * 0.08, shadowSourceX, shadowSourceY, pr * 1.75);
    shadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.48)'); // Specular highlight
    shadeGrad.addColorStop(0.38, 'rgba(0, 0, 0, 0)');
    shadeGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0.72)');    // Terminator shadow
    shadeGrad.addColorStop(1, 'rgba(3, 7, 18, 0.96)');      // Night hemisphere

    ctx.fillStyle = shadeGrad;
    ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

    ctx.restore();

    // ================= ATMOSPHERIC RAYLEIGH LIMB GLOW =================
    if (name === 'Earth') {
      const atmo = ctx.createRadialGradient(px, py, pr * 0.9, px, py, pr * 1.38);
      atmo.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      atmo.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
      atmo.addColorStop(1, 'transparent');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(px, py, pr * 1.38, 0, Math.PI * 2);
      ctx.fill();
    } else if (name === 'Mars') {
      const atmo = ctx.createRadialGradient(px, py, pr * 0.9, px, py, pr * 1.32);
      atmo.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
      atmo.addColorStop(0.6, 'rgba(249, 115, 22, 0.15)');
      atmo.addColorStop(1, 'transparent');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(px, py, pr * 1.32, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const solarNav = new SolarSystemNavigator('space-canvas');
  window.solarNav = solarNav;

  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomOutBtn = document.getElementById('btn-zoom-out');
  const resetBtn = document.getElementById('btn-zoom-reset');

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => solarNav.applyZoom(1.2, window.innerWidth/2, window.innerHeight/2));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => solarNav.applyZoom(0.85, window.innerWidth/2, window.innerHeight/2));
  if (resetBtn) resetBtn.addEventListener('click', () => solarNav.resetView());

  const moonBtn = document.getElementById('btn-explore-moon');
  const marsBtn = document.getElementById('btn-explore-mars');

  if (moonBtn) moonBtn.addEventListener('click', () => solarNav.warpToBody('Moon'));
  if (marsBtn) marsBtn.addEventListener('click', () => solarNav.warpToBody('Mars'));

  window.openSurfaceMap = (bodyName) => {
    window.dispatchEvent(new CustomEvent('open-surface-map', { detail: { body: bodyName } }));
  };
});

// Global friendly toast notification helper for kids & space archaeologists
window.showSpaceToast = function(message, icon = '🚀', duration = 3800) {
  const toast = document.getElementById('space-toast');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;
  const iconEl = toast.querySelector('.toast-icon');
  if (iconEl) iconEl.textContent = icon;
  msgEl.textContent = message;
  toast.classList.add('visible');
  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
};
