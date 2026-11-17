import React, { useEffect, useRef } from 'react';
import { COSMETIC_SKINS } from '../game/catalog';
import { BuildingId, GameScreenState, GameState } from '../game/types';

interface CyberCampusCanvasProps {
  gameState: GameState;
  screenState: GameScreenState;
  selectedBuilding: BuildingId;
  onSelectBuilding: (id: BuildingId) => void;
  onManualBoost: (screenX: number, screenY: number) => void;
  boostPulseTick: number;
}

interface BuildingPad {
  id: BuildingId;
  label: string;
  gx: number;
  gy: number;
}

const BUILDING_PADS: BuildingPad[] = [
  { id: 'office', label: 'Büro', gx: 0, gy: 0 },
  { id: 'serverRoom', label: 'Serverraum', gx: 2.3, gy: -0.4 },
  { id: 'researchLab', label: 'Forschungslabor', gx: -2.2, gy: 0.4 },
  { id: 'marketingDept', label: 'Marketing', gx: 0.4, gy: 2.3 },
  { id: 'aiCenter', label: 'KI-Zentrum', gx: -0.3, gy: -2.3 },
];

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const CyberCampusCanvas: React.FC<CyberCampusCanvasProps> = ({
  gameState,
  screenState,
  selectedBuilding,
  onSelectBuilding,
  onManualBoost,
  boostPulseTick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef(gameState);
  const screenRef = useRef(screenState);
  const selectedRef = useRef(selectedBuilding);
  const onSelectRef = useRef(onSelectBuilding);
  const onBoostRef = useRef(onManualBoost);

  stateRef.current = gameState;
  screenRef.current = screenState;
  selectedRef.current = selectedBuilding;
  onSelectRef.current = onSelectBuilding;
  onBoostRef.current = onManualBoost;

  const camRef = useRef({ x: 0, y: 0, zoom: 1, dragging: false, lastX: 0, lastY: 0, movedDist: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const particlesRef = useRef<FloatingParticle[]>([]);
  const lastPulseTickRef = useRef(boostPulseTick);

  useEffect(() => {
    if (boostPulseTick !== lastPulseTickRef.current) {
      lastPulseTickRef.current = boostPulseTick;
      const canvas = canvasRef.current;
      if (canvas) {
        const cx = canvas.clientWidth * 0.44;
        const cy = canvas.clientHeight * 0.48;
        const skin =
          COSMETIC_SKINS.find((s) => s.id === stateRef.current.activeSkin) ?? COSMETIC_SKINS[0];
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * (40 + Math.random() * 55),
            vy: Math.sin(angle) * (40 + Math.random() * 55) - 25,
            life: 0.65,
            maxLife: 0.65,
            color: i % 2 === 0 ? skin.primaryHex : skin.accentHex,
          });
        }
        if (particlesRef.current.length > 64) {
          particlesRef.current = particlesRef.current.slice(-64);
        }
      }
    }
  }, [boostPulseTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 1280;
    let height = container.clientHeight || 800;
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');
    let bgDirty = true;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(300, rect.width);
      height = Math.max(240, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgCanvas.width = Math.round(width);
      bgCanvas.height = Math.round(height);
      bgDirty = true;
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    const clearInputs = () => {
      keysRef.current.clear();
      camRef.current.dragging = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', clearInputs);

    const isoToScreen = (gx: number, gy: number, gz = 0) => {
      const isMobile = width < 768;
      const baseTile = isMobile ? 42 : 68;
      const tileW = baseTile * camRef.current.zoom;
      const tileH = (baseTile * 0.5) * camRef.current.zoom;
      const centerX =
        width * (screenRef.current === 'title' ? 0.64 : isMobile ? 0.5 : 0.42) +
        camRef.current.x;
      const centerY = height * (isMobile && screenRef.current === 'playing' ? 0.26 : 0.52) + camRef.current.y;
      return {
        x: centerX + (gx - gy) * tileW,
        y: centerY + (gx + gy) * tileH - gz * tileW * 0.85,
      };
    };

    const drawIsoPrism = (
      gx: number,
      gy: number,
      w: number,
      d: number,
      h: number,
      topColor: string,
      leftColor: string,
      rightColor: string,
      strokeColor: string,
      zBase = 0
    ) => {
      const hw = w / 2;
      const hd = d / 2;
      const p0 = isoToScreen(gx - hw, gy - hd, zBase + h);
      const p1 = isoToScreen(gx + hw, gy - hd, zBase + h);
      const p2 = isoToScreen(gx + hw, gy + hd, zBase + h);
      const p3 = isoToScreen(gx - hw, gy + hd, zBase + h);

      const b1 = isoToScreen(gx + hw, gy - hd, zBase);
      const b2 = isoToScreen(gx + hw, gy + hd, zBase);
      const b3 = isoToScreen(gx - hw, gy + hd, zBase);

      // Left face (p3 -> p2 -> b2 -> b3)
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b3.x, b3.y);
      ctx.closePath();
      ctx.fillStyle = leftColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right face (p1 -> p2 -> b2 -> b1)
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.closePath();
      ctx.fillStyle = rightColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      // Top face
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fillStyle = topColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    };

    const drawPadBase = (pad: BuildingPad, active: boolean, built: boolean, primaryHex: string, accentHex: string) => {
      const s = 0.88;
      const c0 = isoToScreen(pad.gx - s, pad.gy - s, 0);
      const c1 = isoToScreen(pad.gx + s, pad.gy - s, 0);
      const c2 = isoToScreen(pad.gx + s, pad.gy + s, 0);
      const c3 = isoToScreen(pad.gx - s, pad.gy + s, 0);

      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y);
      ctx.lineTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.closePath();
      ctx.fillStyle = built ? 'rgba(14, 28, 58, 0.9)' : 'rgba(10, 19, 40, 0.55)';
      ctx.fill();
      ctx.strokeStyle = active ? accentHex : built ? primaryHex : 'rgba(100, 140, 210, 0.28)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      camRef.current.dragging = true;
      camRef.current.lastX = e.clientX - rect.left;
      camRef.current.lastY = e.clientY - rect.top;
      camRef.current.movedDist = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!camRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - camRef.current.lastX;
      const dy = y - camRef.current.lastY;
      camRef.current.lastX = x;
      camRef.current.lastY = y;
      camRef.current.movedDist += Math.hypot(dx, dy);
      camRef.current.x = Math.max(-280, Math.min(280, camRef.current.x + dx));
      camRef.current.y = Math.max(-220, Math.min(220, camRef.current.y + dy));
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!camRef.current.dragging) return;
      camRef.current.dragging = false;
      if (camRef.current.movedDist < 6 && screenRef.current === 'playing') {
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        // Check building pad hit
        let closestPad: BuildingPad | null = null;
        let closestDist = 66 * camRef.current.zoom;
        for (const pad of BUILDING_PADS) {
          const sp = isoToScreen(pad.gx, pad.gy, 0.3);
          const dist = Math.hypot(px - sp.x, py - sp.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestPad = pad;
          }
        }
        if (closestPad) {
          onSelectRef.current(closestPad.id);
          if (closestPad.id === 'office') {
            onBoostRef.current(px, py);
          }
        } else {
          onBoostRef.current(px, py);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.07 : 0.07;
      camRef.current.zoom = Math.max(0.7, Math.min(1.45, camRef.current.zoom + delta));
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    let rafId = 0;
    let lastTime = performance.now();
    let lastDrawTime = 0;

    const renderFrame = (now: number) => {
      rafId = requestAnimationFrame(renderFrame);
      if (now - lastDrawTime < 32) return; // Pace to ~30fps for smooth CPU/compositor headroom
      lastDrawTime = now;

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const t = now / 1000;

      // Camera movement via WASD / Arrows when playing
      if (screenRef.current === 'playing') {
        const speed = 260 * dt;
        const keys = keysRef.current;
        if (keys.has('w') || keys.has('arrowup')) camRef.current.y += speed;
        if (keys.has('s') || keys.has('arrowdown')) camRef.current.y -= speed;
        if (keys.has('a') || keys.has('arrowleft')) camRef.current.x += speed;
        if (keys.has('d') || keys.has('arrowright')) camRef.current.x -= speed;
        camRef.current.x = Math.max(-280, Math.min(280, camRef.current.x));
        camRef.current.y = Math.max(-220, Math.min(220, camRef.current.y));
      } else if (screenRef.current === 'title') {
        // Gentle world camera orbit on Title screen
        camRef.current.x = Math.sin(t * 0.28) * 28;
        camRef.current.y = Math.cos(t * 0.22) * 14;
      }

      const gs = stateRef.current;
      const skin = COSMETIC_SKINS.find((s) => s.id === gs.activeSkin) ?? COSMETIC_SKINS[0];
      const primary = skin.primaryHex;
      const accent = skin.accentHex;

      // Cached deep dark-blue cyberpunk backdrop
      if (bgDirty && bgCtx) {
        const grad = bgCtx.createRadialGradient(
          width * 0.45,
          height * 0.45,
          40,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.78
        );
        grad.addColorStop(0, '#0E1C40');
        grad.addColorStop(0.55, '#070E24');
        grad.addColorStop(1, '#040812');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, width, height);
        bgDirty = false;
      }
      ctx.drawImage(bgCanvas, 0, 0, width, height);

      // Isometric Tron cyber grid
      ctx.strokeStyle =
        screenRef.current === 'title' ? 'rgba(0, 229, 255, 0.14)' : 'rgba(0, 229, 255, 0.09)';
      ctx.lineWidth = 1;
      for (let g = -5; g <= 5; g += 1) {
        const a = isoToScreen(g, -5, 0);
        const b = isoToScreen(g, 5, 0);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        const c = isoToScreen(-5, g, 0);
        const d = isoToScreen(5, g, 0);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }

      // On Title Screen, preview a vibrant midgame skyline so the world looks alive immediately
      const effectiveLevel = (id: BuildingId) => {
        const real = gs.buildings[id];
        if (screenRef.current === 'title') {
          if (id === 'office') return Math.max(4, real);
          if (id === 'serverRoom') return Math.max(3, real);
          if (id === 'researchLab') return Math.max(2, real);
          if (id === 'marketingDept') return Math.max(2, real);
          if (id === 'aiCenter') return Math.max(1, real);
        }
        return real;
      };

      // Fiber-optic conduit lines connecting pads to Office (0,0)
      const origin = isoToScreen(0, 0, 0.02);
      BUILDING_PADS.forEach((pad, idx) => {
        if (pad.id === 'office') return;
        const lv = effectiveLevel(pad.id);
        const target = isoToScreen(pad.gx, pad.gy, 0.02);
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = lv > 0 ? `${primary}66` : 'rgba(100,116,139,0.2)';
        ctx.lineWidth = lv > 0 ? 2 : 1;
        ctx.stroke();

        if (lv > 0) {
          const progress = (t * (0.45 + idx * 0.12)) % 1;
          const px = origin.x + (target.x - origin.x) * progress;
          const py = origin.y + (target.y - origin.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = idx % 2 === 0 ? primary : accent;
          ctx.fill();
        }
      });

      // Security perimeter shield ring (turns crimson during active incident, emerald/cyan when Auto-SOC active)
      if (gs.security?.activeIncident || gs.security?.autoSocEnabled) {
        const ringColor = gs.security.activeIncident
          ? 'rgba(244, 63, 94, 0.55)'
          : 'rgba(16, 185, 129, 0.32)';
        const r = 4.2;
        const c0 = isoToScreen(-r, -r, 0.01);
        const c1 = isoToScreen(r, -r, 0.01);
        const c2 = isoToScreen(r, r, 0.01);
        const c3 = isoToScreen(-r, r, 0.01);
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.closePath();
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = gs.security.activeIncident ? 2.2 : 1.3;
        ctx.stroke();
      }

      // Global datacenter uplink nodes on the outer perimeter
      const regionCoords: Array<{ id: keyof NonNullable<typeof gs.globalRegions>; gx: number; gy: number }> = [
        { id: 'frankfurt', gx: 4.1, gy: -3.5 },
        { id: 'reykjavik', gx: -4.1, gy: -3.5 },
        { id: 'virginia', gx: 4.1, gy: 3.5 },
        { id: 'tokyo', gx: -4.1, gy: 3.5 },
        { id: 'orbital', gx: 0, gy: -4.4 },
      ];
      regionCoords.forEach((rc, rIdx) => {
        const rState = gs.globalRegions?.[rc.id];
        if (!rState || rState.level <= 0) return;
        const nodePt = isoToScreen(rc.gx, rc.gy, rc.id === 'orbital' ? 1.55 + Math.sin(t * 2) * 0.08 : 0.12);
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(nodePt.x, nodePt.y);
        ctx.strokeStyle = `${accent}44`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nodePt.x, nodePt.y, 4.5 + Math.min(3, rState.level * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = rIdx % 2 === 0 ? primary : accent;
        ctx.fill();
      });

      // Sort pads back-to-front by (gx + gy)
      const sortedPads = [...BUILDING_PADS].sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

      for (const pad of sortedPads) {
        const level = effectiveLevel(pad.id);
        const isSelected = selectedRef.current === pad.id && screenRef.current === 'playing';
        drawPadBase(pad, isSelected, level > 0, primary, accent);

        if (pad.id === 'office') {
          const floors = Math.min(6, 1 + Math.floor(level / 3));
          const baseH = 0.45 + floors * 0.24;
          // Main office tower / garage
          drawIsoPrism(
            pad.gx,
            pad.gy,
            1.15,
            1.15,
            baseH,
            '#182B54',
            '#101D3D',
            '#0B142C',
            isSelected ? accent : primary
          );
          // Glowing floor strips
          for (let f = 0; f < floors; f += 1) {
            const zf = 0.22 + f * 0.24;
            const s0 = isoToScreen(pad.gx - 0.58, pad.gy + 0.58, zf);
            const s1 = isoToScreen(pad.gx + 0.58, pad.gy + 0.58, zf);
            const s2 = isoToScreen(pad.gx + 0.58, pad.gy - 0.58, zf);
            ctx.beginPath();
            ctx.moveTo(s0.x, s0.y);
            ctx.lineTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = f % 2 === 0 ? primary : accent;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
          // Roof antenna / hardware indicator
          drawIsoPrism(
            pad.gx,
            pad.gy,
            0.35,
            0.35,
            0.22,
            primary,
            '#0C4A6E',
            '#082F49',
            primary,
            baseH
          );
        } else if (pad.id === 'serverRoom') {
          if (level === 0) {
            drawIsoPrism(pad.gx, pad.gy, 0.9, 0.9, 0.08, '#13203E', '#0D172E', '#0A1224', 'rgba(148,163,184,0.35)');
          } else {
            const racks = Math.min(4, 1 + Math.floor(level / 2));
            for (let r = 0; r < racks; r += 1) {
              const ox = (r % 2 === 0 ? -0.28 : 0.28);
              const oy = (r < 2 ? -0.24 : 0.24);
              const rh = 0.55 + Math.min(0.7, level * 0.06);
              drawIsoPrism(
                pad.gx + ox,
                pad.gy + oy,
                0.38,
                0.38,
                rh,
                '#13294B',
                '#0B1933',
                '#081226',
                r % 2 === 0 ? primary : accent
              );
            }
          }
        } else if (pad.id === 'researchLab') {
          if (level === 0) {
            drawIsoPrism(pad.gx, pad.gy, 0.9, 0.9, 0.08, '#13203E', '#0D172E', '#0A1224', 'rgba(148,163,184,0.35)');
          } else {
            const h = 0.5 + Math.min(0.85, level * 0.08);
            drawIsoPrism(pad.gx, pad.gy, 1.0, 1.0, h * 0.65, '#192952', '#121E3E', '#0D1630', primary);
            // Floating rotating low-poly holo cube above lab
            const hoverZ = h * 0.65 + 0.35 + Math.sin(t * 2.4) * 0.08;
            drawIsoPrism(pad.gx, pad.gy, 0.36, 0.36, 0.36, `${primary}CC`, `${accent}AA`, '#1E3A8A', '#FFFFFF', hoverZ);
          }
        } else if (pad.id === 'marketingDept') {
          if (level === 0) {
            drawIsoPrism(pad.gx, pad.gy, 0.9, 0.9, 0.08, '#13203E', '#0D172E', '#0A1224', 'rgba(148,163,184,0.35)');
          } else {
            const h = 0.55 + Math.min(0.95, level * 0.09);
            drawIsoPrism(pad.gx, pad.gy, 0.95, 0.85, h, '#281A45', '#1C1233', '#130C24', accent);
            // Broadcast spire
            const baseSpire = isoToScreen(pad.gx, pad.gy, h);
            const tipSpire = isoToScreen(pad.gx, pad.gy, h + 0.65);
            ctx.beginPath();
            ctx.moveTo(baseSpire.x, baseSpire.y);
            ctx.lineTo(tipSpire.x, tipSpire.y);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            const pulseR = 6 + ((t * 18) % 18);
            ctx.beginPath();
            ctx.arc(tipSpire.x, tipSpire.y, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `${accent}66`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        } else if (pad.id === 'aiCenter') {
          if (level === 0) {
            drawIsoPrism(pad.gx, pad.gy, 0.9, 0.9, 0.08, '#13203E', '#0D172E', '#0A1224', 'rgba(148,163,184,0.3)');
          } else {
            // 4 quantum pylons + levitating AI core
            const corners = [
              [-0.4, -0.4],
              [0.4, -0.4],
              [0.4, 0.4],
              [-0.4, 0.4],
            ];
            corners.forEach(([ox, oy]) => {
              drawIsoPrism(pad.gx + ox, pad.gy + oy, 0.22, 0.22, 0.85, '#1B2E5E', '#101D40', '#091229', primary);
            });
            const corePos = isoToScreen(pad.gx, pad.gy, 1.15 + Math.sin(t * 2.8) * 0.1);
            ctx.beginPath();
            ctx.moveTo(corePos.x, corePos.y - 22);
            ctx.lineTo(corePos.x + 18, corePos.y);
            ctx.lineTo(corePos.x, corePos.y + 22);
            ctx.lineTo(corePos.x - 18, corePos.y);
            ctx.closePath();
            ctx.fillStyle = accent;
            ctx.fill();
            ctx.strokeStyle = primary;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Building label tag in playing mode
        if (screenRef.current === 'playing') {
          const labelPos = isoToScreen(pad.gx, pad.gy, level > 0 ? 1.05 : 0.28);
          ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          const txt = level > 0 ? `${pad.label} · Lv ${level}` : `${pad.label} (Ausbauen)`;
          const tw = ctx.measureText(txt).width + 14;
          ctx.fillStyle = isSelected ? 'rgba(6, 11, 25, 0.92)' : 'rgba(6, 11, 25, 0.78)';
          ctx.fillRect(labelPos.x - tw / 2, labelPos.y - 16, tw, 20);
          ctx.strokeStyle = isSelected ? accent : 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(labelPos.x - tw / 2, labelPos.y - 16, tw, 20);
          ctx.fillStyle = level > 0 ? '#E2F1FF' : '#94A3B8';
          ctx.fillText(txt, labelPos.x, labelPos.y - 2);
        }
      }

      // Animated low-poly employees walking between pads
      const workerCount = Math.min(10, Math.max(1, gs.employees.length));
      for (let w = 0; w < workerCount; w += 1) {
        const angle = t * (0.55 + w * 0.08) + w * 1.4;
        const radius = 1.1 + (w % 3) * 0.45;
        const wx = Math.cos(angle) * radius;
        const wy = Math.sin(angle) * radius;
        const wp = isoToScreen(wx, wy, 0.06);
        ctx.beginPath();
        ctx.moveTo(wp.x, wp.y - 12);
        ctx.lineTo(wp.x + 5, wp.y);
        ctx.lineTo(wp.x - 5, wp.y);
        ctx.closePath();
        ctx.fillStyle = w % 2 === 0 ? primary : accent;
        ctx.fill();
      }

      // Update & draw boost particles
      const alive: FloatingParticle[] = [];
      for (const p of particlesRef.current) {
        p.life -= dt;
        if (p.life > 0) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 90 * dt;
          const alpha = Math.max(0, p.life / p.maxLife);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
          ctx.globalAlpha = 1;
          alive.push(p);
        }
      }
      particlesRef.current = alive;

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', clearInputs);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        data-testid="campus-canvas"
        aria-label="Interaktiver Low-Poly Cyberpunk Tech-Campus"
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
