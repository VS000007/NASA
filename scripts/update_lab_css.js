const fs = require('fs');
const path = require('path');

const publicCssPath = path.join(__dirname, '../public/css/style.css');
const staticCssPath = path.join(__dirname, '../static/css/style.css');

let css = fs.readFileSync(publicCssPath, 'utf8');

const targetStart = '.interactive-lab-overlay {';
const targetEnd = '/* ===================== 3. MISSION MANUAL & 3-MINUTE GUIDED TOUR ===================== */';

const startIndex = css.indexOf(targetStart);
const endIndex = css.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Target region not found in style.css');
  process.exit(1);
}

const replacement = `.interactive-lab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
}
.interactive-lab-overlay.active {
  display: flex;
}
.interactive-lab-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(3, 7, 18, 0.88);
  backdrop-filter: blur(20px);
}
.interactive-lab-container {
  position: relative;
  z-index: 2;
  width: 95vw;
  max-width: 1240px;
  height: 88vh;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.lab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.4rem;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid var(--border-glass);
  gap: 1rem;
}
.lab-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lab-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.lab-brand-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-cyan);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.lab-audience-selector {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(3, 7, 18, 0.6);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
}
.audience-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-right: 4px;
}
.lab-audience-pill {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.lab-audience-pill:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}
.lab-audience-pill.active {
  background: rgba(0, 229, 255, 0.22);
  border-color: var(--accent-cyan);
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.25);
}
.lab-header h2 {
  font-family: var(--font-title);
  font-size: 1.25rem;
  color: #fff;
  margin: 0;
}
.lab-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.lab-tabs {
  display: flex;
  gap: 0.35rem;
  background: rgba(3, 7, 18, 0.6);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-glass);
}
.lab-tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 6px 11px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.lab-tab-btn:hover {
  color: #fff;
}
.lab-tab-btn.active {
  background: rgba(0, 229, 255, 0.25);
  color: #fff;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.2);
}
.lab-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-glass);
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.lab-close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

.lab-stage-container {
  flex: 1;
  padding: 1.2rem 1.4rem;
  overflow-y: auto;
}
.sim-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
  height: 100%;
}
.sim-display-panel {
  background: #030712;
  border: 1px solid var(--border-glass);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.canvas-viewport-wrap {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #030712;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lab-canvas {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}
.sim-controls-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 4px;
}
.sim-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.title-with-voice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}
.sim-controls-panel h3 {
  font-family: var(--font-title);
  font-size: 1.2rem;
  color: var(--accent-cyan);
  margin: 0;
}
.btn-voice-narrate {
  background: rgba(0, 229, 255, 0.12);
  border: 1px solid var(--accent-cyan);
  color: var(--accent-cyan);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}
.btn-voice-narrate:hover {
  background: var(--accent-cyan);
  color: #030712;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}
.sim-desc {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Telemetry HUD overlays */
.telemetry-hud-overlay {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  background: rgba(3, 7, 18, 0.88);
  border: 1px solid var(--border-glass);
  padding: 8px 12px;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  backdrop-filter: blur(8px);
}
.telemetry-stat {
  display: flex;
  flex-direction: column;
}
.stat-name {
  font-size: 0.68rem;
  color: var(--text-secondary);
}
.stat-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
}
.stat-power {
  color: var(--accent-gold);
}
.stat-status {
  grid-column: span 2;
  font-size: 0.78rem;
}

/* Control groups */
.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.control-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control-current-val {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-cyan);
}
.control-group input[type="range"] {
  width: 100%;
  accent-color: var(--accent-cyan);
}
.slider-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--text-secondary);
}
.sim-actions-row {
  display: flex;
  gap: 0.65rem;
}
.sim-btn {
  flex: 1;
  background: rgba(0, 229, 255, 0.12);
  border: 1px solid var(--accent-cyan);
  color: var(--accent-cyan);
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}
.sim-btn:hover {
  background: rgba(0, 229, 255, 0.25);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}
.sim-btn.btn-danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  color: #ef4444;
}
.sim-btn.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

/* Audience Dynamic Callouts */
.audience-dynamic-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Cadet (Kids) */
.cadet-challenge-box {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cadet-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.68rem;
  font-weight: 800;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}
.cadet-challenge-box h4 {
  color: #fef08a;
  font-size: 0.95rem;
  margin: 0;
}
.cadet-challenge-box p {
  font-size: 0.84rem;
  color: #fde68a;
  line-height: 1.45;
  margin: 0;
}
.cadet-fun-fact {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #cbd5e1;
  background: rgba(3, 7, 18, 0.5);
  padding: 6px 10px;
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
}

/* Scientist */
.science-formula-box {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.formula-header {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--accent-cyan);
  letter-spacing: 0.5px;
}
.formula-math {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(3, 7, 18, 0.8);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  overflow-x: auto;
  white-space: pre-wrap;
}
.formula-breakdown {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.75rem;
}
.param-row {
  display: flex;
  gap: 8px;
  color: #cbd5e1;
}
.p-symbol {
  font-family: monospace;
  font-weight: 700;
  color: var(--accent-gold);
  min-width: 55px;
}
.p-desc {
  color: #94a3b8;
}
.telemetry-table-mini {
  background: rgba(3, 7, 18, 0.6);
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  overflow: hidden;
  font-size: 0.74rem;
}
.telemetry-table-mini table {
  width: 100%;
  border-collapse: collapse;
}
.telemetry-table-mini th {
  background: rgba(15, 23, 42, 0.85);
  color: var(--accent-cyan);
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--border-glass);
}
.telemetry-table-mini td {
  padding: 5px 8px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Explorer */
.explorer-card {
  background: rgba(3, 7, 18, 0.4);
  border: 1px solid var(--border-glass);
  padding: 12px 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.explorer-card h4 {
  color: var(--accent-cyan);
  font-size: 0.95rem;
  margin: 0;
}
.explorer-card p {
  font-size: 0.84rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
}
.sim-did-you-know {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.25);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.45;
}
.sim-did-you-know strong {
  color: var(--accent-gold);
  display: block;
  margin-bottom: 3px;
}

/* Sky Crane HUD and Steps */
.crane-telemetry-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(3, 7, 18, 0.88);
  border: 1px solid var(--border-glass);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.78rem;
  color: var(--accent-cyan);
  backdrop-filter: blur(8px);
}
.badge-stage-pill {
  display: inline-block;
  align-self: flex-start;
  background: rgba(0, 229, 255, 0.2);
  color: var(--accent-cyan);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 800;
  margin-bottom: 2px;
}
.stepper-buttons-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.step-card-btn {
  background: rgba(3, 7, 18, 0.5);
  border: 1px solid var(--border-glass);
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.step-card-btn strong {
  display: block;
  font-size: 0.82rem;
  color: #fff;
}
.step-card-btn span {
  display: block;
  font-size: 0.68rem;
  color: var(--text-secondary);
}
.step-card-btn.active {
  background: rgba(0, 229, 255, 0.2);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
}
.step-card-btn.active strong {
  color: var(--accent-cyan);
}
.crane-explainer-card {
  background: rgba(3, 7, 18, 0.4);
  border: 1px solid var(--border-glass);
  padding: 12px;
  border-radius: 8px;
}
.crane-explainer-card h4 {
  color: var(--accent-gold);
  margin-bottom: 4px;
  font-size: 0.92rem;
}
.crane-explainer-card p {
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.45;
  margin: 0;
}

/* Laser Ranging */
.laser-readout-hud {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 10px 14px;
  background: rgba(3, 7, 18, 0.88);
  border-top: 1px solid var(--border-glass);
  backdrop-filter: blur(8px);
}
.readout-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.readout-label {
  font-size: 0.68rem;
  color: var(--text-secondary);
}
.readout-val {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #22c55e;
}
.readout-cyan { color: var(--accent-cyan); }
.readout-gold { color: var(--accent-gold); }

.btn-fire-laser {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #030712;
  border: none;
  font-weight: 700;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-fire-laser:hover {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  transform: translateY(-1px);
}
.laser-facts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fact-item {
  font-size: 0.8rem;
  color: #cbd5e1;
  background: rgba(3, 7, 18, 0.4);
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-glass);
}

/* Rotor Aerodynamics */
.rotor-readout-hud {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(3, 7, 18, 0.88);
  border-top: 1px solid var(--border-glass);
  backdrop-filter: blur(8px);
}

`;

const newCss = css.slice(0, startIndex) + replacement + css.slice(endIndex);
fs.writeFileSync(publicCssPath, newCss, 'utf8');
fs.writeFileSync(staticCssPath, newCss, 'utf8');
console.log('Successfully updated public/css/style.css and static/css/style.css');
