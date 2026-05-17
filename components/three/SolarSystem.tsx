
"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ── Planet definitions ──
const PLANETS_DATA = [
  { name: "mercury", radius: 0.3,  distance: 5,  speed: 0.8,  tilt: 0.03, texturePath: "/textures/mercury.jpg", colors: ["#9ca3af","#6b7280","#4b5563"] },
  { name: "venus",   radius: 0.55, distance: 7,  speed: 0.6,  tilt: 0.05, texturePath: "/textures/venus.jpg",   colors: ["#fdba74","#f97316","#c2410c"] },
  { name: "earth",   radius: 0.6,  distance: 9.5,speed: 0.45, tilt: 0.41, texturePath: "/textures/earth.jpg",   colors: ["#22d3ee","#0891b2","#065f46","#34d399"] },
  { name: "mars",    radius: 0.4,  distance: 12, speed: 0.35, tilt: 0.44, texturePath: "/textures/mars.jpg",    colors: ["#fca5a5","#ef4444","#991b1b"] },
  { name: "jupiter", radius: 1.2,  distance: 16, speed: 0.2,  tilt: 0.05, texturePath: "/textures/jupiter.jpg",colors: ["#fde68a","#d97706","#92400e","#fbbf24"] },
  { name: "saturn",  radius: 1.0,  distance: 20, speed: 0.15, tilt: 0.47, texturePath: "/textures/saturn.jpg", colors: ["#e9d5ff","#a855f7","#7e22ce","#c084fc"] },
  { name: "neptune", radius: 0.7,  distance: 24, speed: 0.1,  tilt: 0.49, texturePath: "/textures/neptune.jpg",colors: ["#67e8f9","#0891b2","#164e63","#22d3ee"] },
];

// ── Props (matches what PremiumLandingPage + Hero3DBackground pass down) ──
interface SolarSystemProps {
  setActive?:          (name: string | null) => void;
  onHover?:            (name: string | null) => void;
  onFocus?:            (name: string) => void;
  onBack?:             () => void;
  focusedPlanet?:      string | null;
  isTourActive?:       boolean;
  onTourStateChange?:  (active: boolean) => void;
  mouse?:              React.MutableRefObject<{ x: number; y: number }>;
}

export default function SolarSystem({
  setActive,
  onHover,
  onFocus,
  onBack,
  focusedPlanet,
  isTourActive,
  onTourStateChange,
  mouse,
}: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    focusedPlanet:    null as string | null,
    isFlyingTo:       false,
    isFlyingBack:     false,
    flyElapsed:       0,
    flyDuration:      1.8,
    flyStartPos:      new THREE.Vector3(),
    flyStartTarget:   new THREE.Vector3(),
    flyEndPos:        new THREE.Vector3(),
    flyEndTarget:     new THREE.Vector3(),
    overviewPos:      new THREE.Vector3(0, 6, 22),
    overviewTarget:   new THREE.Vector3(0, 0, 0),
    hoveredObj:       null as THREE.Mesh | null,
    tourActive:       false,
    tourIndex:        -1,
    tourPhase:        "idle" as "idle" | "flyTo" | "pause" | "flyBack",
    tourPauseElapsed: 0,
    tourPauseDuration:4.0,
    planets: [] as { mesh: THREE.Mesh; data: (typeof PLANETS_DATA)[0]; angle: number }[],
    controls:  null as OrbitControls | null,
    camera:    null as THREE.PerspectiveCamera | null,
    sun:       null as THREE.Mesh | null,
  });

  // ── Stable callback refs ──
  const onHoverRef           = useRef(onHover);
  const onFocusRef           = useRef(onFocus);
  const onBackRef            = useRef(onBack);
  const onTourStateChangeRef = useRef(onTourStateChange);
  useEffect(() => { onHoverRef.current           = onHover; },           [onHover]);
  useEffect(() => { onFocusRef.current           = onFocus; },           [onFocus]);
  useEffect(() => { onBackRef.current            = onBack; },            [onBack]);
  useEffect(() => { onTourStateChangeRef.current = onTourStateChange; }, [onTourStateChange]);

  // ── Sync focusedPlanet prop → trigger fly-back ──
  useEffect(() => {
    const s = stateRef.current;
    if (!focusedPlanet && s.focusedPlanet && !s.isFlyingBack) {
      s.isFlyingBack  = true;
      s.flyElapsed    = 0;
      s.flyStartPos.copy(s.camera!.position);
      s.flyStartTarget.copy(s.controls!.target);
      s.flyEndPos.copy(s.overviewPos);
      s.flyEndTarget.copy(s.overviewTarget);
      s.focusedPlanet = null;
      if (s.tourActive) {
        s.tourActive  = false;
        s.tourPhase   = "idle";
        s.tourIndex   = -1;
      }
    }
  }, [focusedPlanet]);

  // ── Sync isTourActive prop ──
  useEffect(() => {
    const s = stateRef.current;
    if (isTourActive && !s.tourActive) {
      s.tourActive = true;
      s.tourIndex  = -1;
      s.tourPhase  = "idle";
      advanceTour(s);
    } else if (!isTourActive && s.tourActive) {
      s.tourActive = false;
      s.tourPhase  = "idle";
      s.tourIndex  = -1;
    }
  }, [isTourActive]);

  // ── Tour advance ──
  function advanceTour(s: typeof stateRef.current) {
    s.tourIndex++;
    if (s.tourIndex >= s.planets.length) {
      s.tourActive    = false;
      s.tourPhase     = "idle";
      s.tourIndex     = -1;
      s.isFlyingBack  = true;
      s.flyElapsed    = 0;
      s.flyStartPos.copy(s.camera!.position);
      s.flyStartTarget.copy(s.controls!.target);
      s.flyEndPos.copy(s.overviewPos);
      s.flyEndTarget.copy(s.overviewTarget);
      s.focusedPlanet = null;
      onHoverRef.current?.(null);
      onTourStateChangeRef.current?.(false);
      onBackRef.current?.();
      return;
    }
    const planet     = s.planets[s.tourIndex];
    s.focusedPlanet  = planet.data.name;
    s.tourPhase      = "flyTo";
    s.isFlyingTo     = true;
    s.flyElapsed     = 0;
    s.flyStartPos.copy(s.camera!.position);
    s.flyStartTarget.copy(s.controls!.target);
    s.controls!.enabled    = false;
    s.controls!.autoRotate = false;
    onFocusRef.current?.(planet.data.name);
  }

  // ── Main Three.js setup ──
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const s = stateRef.current;

    // Scene
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 6, 22);
    s.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    // Make the canvas fill its parent div
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset    = "0";
    renderer.domElement.style.width    = "100%";
    renderer.domElement.style.height   = "100%";
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.05;
    controls.minDistance      = 8;
    controls.maxDistance      = 50;
    controls.enablePan        = false;
    controls.autoRotate       = true;
    controls.autoRotateSpeed  = 0.15;
    controls.maxPolarAngle    = Math.PI * 0.65;
    controls.minPolarAngle    = Math.PI * 0.25;
    s.controls = controls;

    // NDC mouse (for raycasting)
    const mouseNDC = new THREE.Vector2();
    function onMouseMove(e: MouseEvent) {
      mouseNDC.x = (e.clientX / window.innerWidth)  *  2 - 1;
      mouseNDC.y = (e.clientY / window.innerHeight) * -2 + 1;
      // Also sync Hero3DBackground's mouse ref if provided
      if (mouse?.current) {
        mouse.current.x = e.clientX / window.innerWidth  - 0.5;
        mouse.current.y = e.clientY / window.innerHeight - 0.5;
      }
    }
    window.addEventListener("mousemove", onMouseMove);

    // ── Texture helpers ──
    const texLoader = new THREE.TextureLoader();

    /** Try to load from path; fall back to a procedural canvas texture */
    function loadOrProcedural(path: string, colors: string[]): THREE.Texture {
      const tex = texLoader.load(
        path,
        undefined,
        undefined,
        () => {
          // On error → swap to procedural
          tex.image   = buildProceduralCanvas(colors);
          tex.needsUpdate = true;
        }
      );
      return tex;
    }

    function buildProceduralCanvas(colors: string[]): HTMLCanvasElement {
      const canvas = document.createElement("canvas");
      canvas.width  = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() * 0.06})`;
        ctx.fillRect(0, (canvas.height / 12) * i, canvas.width, canvas.height / 12);
      }
      for (let i = 0; i < 3000; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
        ctx.fill();
      }
      return canvas;
    }

    function createProceduralTexture(w: number, h: number, fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      fn(ctx, w, h);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const sunLight = new THREE.PointLight(0xfff5d4, 2.5, 200);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    scene.add(sunLight);
    const fill = new THREE.DirectionalLight(0x4488ff, 0.3);
    fill.position.set(-20, 10, 20);
    scene.add(fill);

    // ── Sun ──
    const sunTexture = createProceduralTexture(1024, 512, (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      grad.addColorStop(0,    "#fff7c2");
      grad.addColorStop(0.3,  "#fbbf24");
      grad.addColorStop(0.6,  "#f59e0b");
      grad.addColorStop(0.85, "#d97706");
      grad.addColorStop(1,    "#92400e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 4 + 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${180 + Math.random() * 75},${120 + Math.random() * 80},${Math.random() * 40},${Math.random() * 0.3})`;
        ctx.fill();
      }
    });

    // Try loading /textures/sun.jpg; fallback = procedural
    const sunMap = texLoader.load("/textures/sun.jpg", undefined, undefined, () => {
      sunMap.image     = sunTexture.image;
      sunMap.needsUpdate = true;
    });

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 128, 128),
      new THREE.MeshBasicMaterial({ map: sunMap })
    );
    sun.userData.planetName = "sun";
    scene.add(sun);
    s.sun = sun;

    // ── Glow shader ──
    const glowVert = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    function makeGlow(size: number, color: number, power: number, opacity: number) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 32),
        new THREE.ShaderMaterial({
          vertexShader: glowVert,
          fragmentShader: `
            varying vec3 vNormal;
            uniform vec3 glowColor;
            uniform float p;
            uniform float o;
            void main() {
              float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1)), p);
              gl_FragColor = vec4(glowColor, 1.0) * intensity * o;
            }
          `,
          uniforms: {
            glowColor: { value: new THREE.Color(color) },
            p:         { value: power },
            o:         { value: opacity },
          },
          blending:    THREE.AdditiveBlending,
          side:        THREE.BackSide,
          transparent: true,
          depthWrite:  false,
        })
      );
    }
    scene.add(makeGlow(3.2, 0xfbbf24, 2.0, 0.5));
    scene.add(makeGlow(4.5, 0xf59e0b, 3.0, 0.2));
    scene.add(makeGlow(6.0, 0xfde68a, 4.0, 0.08));

    // ── Corona ──
    const coronaCount = 2000;
    const coronaGeo   = new THREE.BufferGeometry();
    const coronaPos   = new Float32Array(coronaCount * 3);
    const coronaVel: { speed: number; phase: number }[] = [];
    for (let i = 0; i < coronaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.6 + Math.random() * 2.5;
      coronaPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      coronaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      coronaPos[i * 3 + 2] = r * Math.cos(phi);
      coronaVel.push({ speed: 0.002 + Math.random() * 0.008, phase: Math.random() * Math.PI * 2 });
    }
    coronaGeo.setAttribute("position", new THREE.Float32BufferAttribute(coronaPos, 3));
    const coronaMat = new THREE.PointsMaterial({
      color: 0xfde68a, size: 0.05, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const corona = new THREE.Points(coronaGeo, coronaMat);
    scene.add(corona);

    // ── Orbit rings ──
    PLANETS_DATA.forEach(pd => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(pd.distance - 0.02, pd.distance + 0.02, 256),
        new THREE.MeshBasicMaterial({
          color: 0xffffff, side: THREE.DoubleSide,
          transparent: true, opacity: 0.06, depthWrite: false,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
    });

    // ── Planets ──
    s.planets = [];
    PLANETS_DATA.forEach(pd => {
      const tex = loadOrProcedural(pd.texturePath, pd.colors);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(pd.radius, 64, 64),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.1 })
      );
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      mesh.userData.planetName = pd.name;

      // Moon (only for earth) — kept from old file
      if (pd.name === "earth") {
        const moonTex = loadOrProcedural("/textures/moon.jpg", ["#9ca3af", "#6b7280", "#4b5563"]);
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(pd.radius * 0.27, 32, 32),
          new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9, metalness: 0.0 })
        );
        moon.userData.isMoon = true;
        // Start offset; updated each frame via a child-offset approach
        moon.position.set(pd.radius * 2.5, 0, 0);
        mesh.add(moon);

        // Earth atmosphere glow
        const atmo = new THREE.Mesh(
          new THREE.SphereGeometry(pd.radius * 1.04, 64, 64),
          new THREE.ShaderMaterial({
            vertexShader: glowVert,
            fragmentShader: `
              varying vec3 vNormal;
              void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0,0,1)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
              }
            `,
            blending: THREE.AdditiveBlending, side: THREE.BackSide,
            transparent: true, depthWrite: false,
          })
        );
        mesh.add(atmo);
      }

      // Saturn rings
      if (pd.name === "saturn") {
        const ringTex = createProceduralTexture(512, 64, (ctx, w, h) => {
          for (let x = 0; x < w; x++) {
            const t = x / w;
            const a = Math.sin(t * 30) * 0.3 + 0.5;
            ctx.fillStyle = `rgba(${180 + t * 60},${140 + t * 80},200,${a * 0.7})`;
            ctx.fillRect(x, 0, 1, h);
          }
        });
        const satRing = new THREE.Mesh(
          new THREE.RingGeometry(pd.radius * 1.3, pd.radius * 2.2, 128),
          new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.6, depthWrite: false })
        );
        satRing.rotation.x = -Math.PI / 2.5;
        mesh.add(satRing);
      }

      scene.add(mesh);
      s.planets.push({ mesh, data: pd, angle: Math.random() * Math.PI * 2 });
    });

    // ── Stars ──
    const starsGeo = new THREE.BufferGeometry();
    const sv: number[] = [], sc: number[] = [];
    for (let i = 0; i < 18000; i++) {
      sv.push((Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 1600);
      const c = new THREE.Color();
      c.setHSL(Math.random() * 0.2 + 0.55, 0.6, 0.75 + Math.random() * 0.25);
      sc.push(c.r, c.g, c.b);
    }
    starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(sv, 3));
    starsGeo.setAttribute("color",    new THREE.Float32BufferAttribute(sc, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.4, transparent: true, opacity: 0.8, vertexColors: true,
      sizeAttenuation: true, depthWrite: false,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // ── Raycaster ──
    const raycaster       = new THREE.Raycaster();
    const originalScales  = new Map<THREE.Mesh, number>();
    const getRayTargets   = () => [sun, ...s.planets.map(p => p.mesh)];

    // ── Hover handler ──
    function onCanvasMouseMove() {
      if (s.focusedPlanet || s.isFlyingTo || s.isFlyingBack) return;
      raycaster.setFromCamera(mouseNDC, camera);
      const hits    = raycaster.intersectObjects(getRayTargets(), false);
      const labelEl = document.getElementById("planet-label");

      if (hits.length > 0) {
        const obj  = hits[0].object as THREE.Mesh;
        const name = obj.userData.planetName;
        if (name) {
          document.body.style.cursor = "pointer";

          // Label
          if (labelEl) {
            const pos = new THREE.Vector3();
            obj.getWorldPosition(pos);
            pos.project(camera);
            labelEl.style.left    = ((pos.x * 0.5 + 0.5) * window.innerWidth) + "px";
            labelEl.style.top     = ((-pos.y * 0.5 + 0.5) * window.innerHeight - 40) + "px";
            labelEl.textContent   = name.charAt(0).toUpperCase() + name.slice(1);
            labelEl.style.opacity = "1";
          }

          if (s.hoveredObj !== obj) {
            if (s.hoveredObj && originalScales.has(s.hoveredObj)) {
              const sc = originalScales.get(s.hoveredObj)!;
              s.hoveredObj.scale.set(sc, sc, sc);
            }
            if (!originalScales.has(obj)) originalScales.set(obj, obj.scale.x);
            s.hoveredObj = obj;
          }
          onHoverRef.current?.(name);
          setActive?.(name);
        }
      } else {
        document.body.style.cursor = "default";
        if (labelEl) labelEl.style.opacity = "0";
        if (s.hoveredObj && originalScales.has(s.hoveredObj)) {
          const sc = originalScales.get(s.hoveredObj)!;
          s.hoveredObj.scale.set(sc, sc, sc);
        }
        s.hoveredObj = null;
        if (!s.focusedPlanet) {
          onHoverRef.current?.(null);
          setActive?.(null);
        }
      }
    }
    renderer.domElement.addEventListener("mousemove", onCanvasMouseMove);

    // ── Click to fly ──
    function onCanvasClick() {
      if (s.isFlyingTo || s.isFlyingBack) return;
      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObjects(getRayTargets(), false);
      if (hits.length === 0) return;

      const obj  = hits[0].object as THREE.Mesh;
      const name = obj.userData.planetName;
      if (!name || name === "sun") return;

      const planetObj = s.planets.find(p => p.mesh === obj);
      if (!planetObj) return;

      s.focusedPlanet      = name;
      s.isFlyingTo         = true;
      s.flyElapsed         = 0;
      s.flyStartPos.copy(camera.position);
      s.flyStartTarget.copy(controls.target);
      controls.enabled     = false;
      controls.autoRotate  = false;

      const labelEl = document.getElementById("planet-label");
      if (labelEl) labelEl.style.opacity = "0";

      onFocusRef.current?.(name);
    }
    renderer.domElement.addEventListener("click", onCanvasClick);

    // ── Animation loop ──
    const clock = new THREE.Clock();
    let time = 0, animId = 0;
    let moonAngle = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;
      moonAngle += delta * 1.6;

      // Sun
      sun.rotation.y += 0.001;

      // Corona
      const cPos = corona.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < coronaCount; i++) {
        const v   = coronaVel[i];
        const x   = cPos.getX(i), y = cPos.getY(i), z = cPos.getZ(i);
        const len = Math.sqrt(x * x + y * y + z * z);
        if (len > 0) {
          const nLen = 2.6 + (len - 2.6 + Math.sin(time * 2 + v.phase) * 0.3 * 0.05);
          cPos.setXYZ(i,
            (x / len) * (nLen + Math.sin(time * v.speed * 100 + v.phase) * 0.15),
            (y / len) * (nLen + Math.cos(time * v.speed * 80  + v.phase) * 0.15),
            (z / len) * (nLen + Math.sin(time * v.speed * 60  + v.phase) * 0.15),
          );
        }
      }
      cPos.needsUpdate    = true;
      corona.rotation.y  += 0.001;

      // Planets orbit
      s.planets.forEach(p => {
        p.angle += p.data.speed * delta * 0.3;
        p.mesh.position.set(
          Math.cos(p.angle) * p.data.distance,
          Math.sin(p.angle * 0.5) * 0.3,
          Math.sin(p.angle) * p.data.distance,
        );
        p.mesh.rotation.y += 0.01;
        p.mesh.rotation.x  = p.data.tilt;

        // Orbit moon around earth
        if (p.data.name === "earth") {
          const moonMesh = p.mesh.children.find(c => (c as THREE.Mesh).userData?.isMoon) as THREE.Mesh | undefined;
          if (moonMesh) {
            const mr = p.data.radius * 2.5;
            moonMesh.position.set(
              Math.cos(moonAngle) * mr,
              Math.sin(moonAngle * 0.3) * 0.2,
              Math.sin(moonAngle) * mr,
            );
            moonMesh.rotation.y += 0.02;
          }
        }

        // Hover scale
        if (s.hoveredObj === p.mesh) {
          const ts = (originalScales.get(p.mesh) || 1) * 1.35;
          p.mesh.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.08);
        }
      });

      // Sun hover
      if (s.hoveredObj === sun) {
        sun.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.08);
      } else {
        sun.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
      }

      // Stars twinkle
      stars.rotation.y     = time * 0.003;
      starsMat.opacity     = 0.6 + Math.sin(time * 1.5) * 0.2;

      // ── Fly-to ──
      if (s.isFlyingTo && s.focusedPlanet) {
        s.flyElapsed += delta;
        let t = Math.min(s.flyElapsed / s.flyDuration, 1);
        t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const fp = s.planets.find(p => p.data.name === s.focusedPlanet);
        if (fp) {
          const pPos   = fp.mesh.position.clone();
          const camOff = pPos.clone().normalize().multiplyScalar(fp.data.radius * 5 + 1.5);
          camOff.y    += fp.data.radius * 2;
          s.flyEndPos.copy(pPos).add(camOff);
          s.flyEndTarget.copy(pPos);

          camera.position.lerpVectors(s.flyStartPos, s.flyEndPos, t);
          controls.target.lerpVectors(s.flyStartTarget, s.flyEndTarget, t);
          controls.update();

          if (t >= 1) {
            s.isFlyingTo          = false;
            controls.enabled      = true;
            controls.autoRotate   = false;
            controls.minDistance  = fp.data.radius * 2;
            controls.maxDistance  = fp.data.radius * 12;
            if (s.tourActive && s.tourPhase === "flyTo") {
              s.tourPhase          = "pause";
              s.tourPauseElapsed   = 0;
            }
          }
        }
      }

      // ── Fly-back ──
      if (s.isFlyingBack) {
        s.flyElapsed += delta;
        let t = Math.min(s.flyElapsed / s.flyDuration, 1);
        t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(s.flyStartPos, s.flyEndPos, t);
        controls.target.lerpVectors(s.flyStartTarget, s.flyEndTarget, t);
        controls.update();

        if (t >= 1) {
          s.isFlyingBack           = false;
          controls.enabled         = true;
          controls.autoRotate      = true;
          controls.autoRotateSpeed = 0.15;
          controls.minDistance     = 8;
          controls.maxDistance     = 50;
        }
      }

      // ── Tour pause timer ──
      if (s.tourActive && s.tourPhase === "pause") {
        s.tourPauseElapsed += delta;
        if (s.tourPauseElapsed >= s.tourPauseDuration) {
          s.tourPhase = "flyTo";
          advanceTour(s);
        }
      }

      // ── Track focused planet (keep it centered after fly-to) ──
      if (s.focusedPlanet && !s.isFlyingTo && !s.isFlyingBack) {
        const fp = s.planets.find(p => p.data.name === s.focusedPlanet);
        if (fp) {
          const pPos = fp.mesh.position.clone();
          const dir  = camera.position.clone().sub(controls.target).normalize();
          const dist = camera.position.distanceTo(controls.target);
          controls.target.lerp(pPos, 0.08);
          camera.position.copy(controls.target.clone().add(dir.multiplyScalar(dist)));
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ──
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousemove", onCanvasMouseMove);
      renderer.domElement.removeEventListener("click", onCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  );
}


// "use client";

// import { useEffect, useRef, useCallback } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// // ── Planet definitions ──
// const PLANETS_DATA = [
//   { name: "mercury", radius: 0.3,  distance: 5,  speed: 0.8,  tilt: 0.03, texturePath: "/textures/mercury.jpg", colors: ["#9ca3af","#6b7280","#4b5563"] },
//   { name: "venus",   radius: 0.55, distance: 7,  speed: 0.6,  tilt: 0.05, texturePath: "/textures/venus.jpg",   colors: ["#fdba74","#f97316","#c2410c"] },
//   { name: "earth",   radius: 0.6,  distance: 9.5,speed: 0.45, tilt: 0.41, texturePath: "/textures/earth.jpg",   colors: ["#22d3ee","#0891b2","#065f46","#34d399"] },
//   { name: "mars",    radius: 0.4,  distance: 12, speed: 0.35, tilt: 0.44, texturePath: "/textures/mars.jpg",    colors: ["#fca5a5","#ef4444","#991b1b"] },
//   { name: "jupiter", radius: 1.2,  distance: 16, speed: 0.2,  tilt: 0.05, texturePath: "/textures/jupiter.jpg",colors: ["#fde68a","#d97706","#92400e","#fbbf24"] },
//   { name: "saturn",  radius: 1.0,  distance: 20, speed: 0.15, tilt: 0.47, texturePath: "/textures/saturn.jpg", colors: ["#e9d5ff","#a855f7","#7e22ce","#c084fc"] },
//   { name: "neptune", radius: 0.7,  distance: 24, speed: 0.1,  tilt: 0.49, texturePath: "/textures/neptune.jpg",colors: ["#67e8f9","#0891b2","#164e63","#22d3ee"] },
// ];

// // ── Props (matches what PremiumLandingPage + Hero3DBackground pass down) ──
// interface SolarSystemProps {
//   setActive?:          (name: string | null) => void;
//   onHover?:            (name: string | null) => void;
//   onFocus?:            (name: string) => void;
//   onBack?:             () => void;
//   focusedPlanet?:      string | null;
//   isTourActive?:       boolean;
//   onTourStateChange?:  (active: boolean) => void;
//   mouse?:              React.MutableRefObject<{ x: number; y: number }>;
// }

// export default function SolarSystem({
//   setActive,
//   onHover,
//   onFocus,
//   onBack,
//   focusedPlanet,
//   isTourActive,
//   onTourStateChange,
//   mouse,
// }: SolarSystemProps) {
//   const containerRef = useRef<HTMLDivElement>(null);

//   const stateRef = useRef({
//     focusedPlanet:    null as string | null,
//     isFlyingTo:       false,
//     isFlyingBack:     false,
//     flyElapsed:       0,
//     flyDuration:      1.8,
//     flyStartPos:      new THREE.Vector3(),
//     flyStartTarget:   new THREE.Vector3(),
//     flyEndPos:        new THREE.Vector3(),
//     flyEndTarget:     new THREE.Vector3(),
//     overviewPos:      new THREE.Vector3(0, 6, 22),
//     overviewTarget:   new THREE.Vector3(0, 0, 0),
//     hoveredObj:       null as THREE.Mesh | null,
//     tourActive:       false,
//     tourIndex:        -1,
//     tourPhase:        "idle" as "idle" | "flyTo" | "pause" | "flyBack",
//     tourPauseElapsed: 0,
//     tourPauseDuration:4.0,
//     planets: [] as { mesh: THREE.Mesh; data: (typeof PLANETS_DATA)[0]; angle: number }[],
//     controls:  null as OrbitControls | null,
//     camera:    null as THREE.PerspectiveCamera | null,
//     sun:       null as THREE.Mesh | null,
//     // ── Virtual scroll ──
//     scrollProgress: 0,    // 0 = top overview, 1 = deep into solar system
//     scrollTarget:   0,    // what we're lerping toward
//     scrollVelocity: 0,    // inertia
//   });

//   // ── Stable callback refs ──
//   const onHoverRef           = useRef(onHover);
//   const onFocusRef           = useRef(onFocus);
//   const onBackRef            = useRef(onBack);
//   const onTourStateChangeRef = useRef(onTourStateChange);
//   useEffect(() => { onHoverRef.current           = onHover; },           [onHover]);
//   useEffect(() => { onFocusRef.current           = onFocus; },           [onFocus]);
//   useEffect(() => { onBackRef.current            = onBack; },            [onBack]);
//   useEffect(() => { onTourStateChangeRef.current = onTourStateChange; }, [onTourStateChange]);

//   // ── Sync focusedPlanet prop → trigger fly-back ──
//   useEffect(() => {
//     const s = stateRef.current;
//     if (!focusedPlanet && s.focusedPlanet && !s.isFlyingBack) {
//       s.isFlyingBack  = true;
//       s.flyElapsed    = 0;
//       s.flyStartPos.copy(s.camera!.position);
//       s.flyStartTarget.copy(s.controls!.target);
//       s.flyEndPos.copy(s.overviewPos);
//       s.flyEndTarget.copy(s.overviewTarget);
//       s.focusedPlanet = null;
//       if (s.tourActive) {
//         s.tourActive  = false;
//         s.tourPhase   = "idle";
//         s.tourIndex   = -1;
//       }
//     }
//   }, [focusedPlanet]);

//   // ── Sync isTourActive prop ──
//   useEffect(() => {
//     const s = stateRef.current;
//     if (isTourActive && !s.tourActive) {
//       s.tourActive = true;
//       s.tourIndex  = -1;
//       s.tourPhase  = "idle";
//       advanceTour(s);
//     } else if (!isTourActive && s.tourActive) {
//       s.tourActive = false;
//       s.tourPhase  = "idle";
//       s.tourIndex  = -1;
//     }
//   }, [isTourActive]);

//   // ── Tour advance ──
//   function advanceTour(s: typeof stateRef.current) {
//     s.tourIndex++;
//     if (s.tourIndex >= s.planets.length) {
//       s.tourActive    = false;
//       s.tourPhase     = "idle";
//       s.tourIndex     = -1;
//       s.isFlyingBack  = true;
//       s.flyElapsed    = 0;
//       s.flyStartPos.copy(s.camera!.position);
//       s.flyStartTarget.copy(s.controls!.target);
//       s.flyEndPos.copy(s.overviewPos);
//       s.flyEndTarget.copy(s.overviewTarget);
//       s.focusedPlanet = null;
//       onHoverRef.current?.(null);
//       onTourStateChangeRef.current?.(false);
//       onBackRef.current?.();
//       return;
//     }
//     const planet     = s.planets[s.tourIndex];
//     s.focusedPlanet  = planet.data.name;
//     s.tourPhase      = "flyTo";
//     s.isFlyingTo     = true;
//     s.flyElapsed     = 0;
//     s.flyStartPos.copy(s.camera!.position);
//     s.flyStartTarget.copy(s.controls!.target);
//     s.controls!.enabled    = false;
//     s.controls!.autoRotate = false;
//     onFocusRef.current?.(planet.data.name);
//   }

//   // ── Main Three.js setup ──
//   useEffect(() => {
//     if (!containerRef.current) return;
//     const container = containerRef.current;
//     const s = stateRef.current;

//     // Scene
//     const scene    = new THREE.Scene();
//     const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
//     camera.position.set(0, 6, 22);
//     s.camera = camera;

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
//     renderer.toneMapping       = THREE.ACESFilmicToneMapping;
//     renderer.toneMappingExposure = 1.2;
//     // Make the canvas fill its parent div
//     renderer.domElement.style.position = "absolute";
//     renderer.domElement.style.inset    = "0";
//     renderer.domElement.style.width    = "100%";
//     renderer.domElement.style.height   = "100%";
//     container.appendChild(renderer.domElement);

//     // Controls
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping    = true;
//     controls.dampingFactor    = 0.05;
//     controls.minDistance      = 8;
//     controls.maxDistance      = 50;
//     controls.enablePan        = false;
//     controls.autoRotate       = true;
//     controls.autoRotateSpeed  = 0.15;
//     controls.maxPolarAngle    = Math.PI * 0.65;
//     controls.minPolarAngle    = Math.PI * 0.25;
//     s.controls = controls;

//     // NDC mouse (for raycasting)
//     const mouseNDC = new THREE.Vector2();
//     function onMouseMove(e: MouseEvent) {
//       mouseNDC.x = (e.clientX / window.innerWidth)  *  2 - 1;
//       mouseNDC.y = (e.clientY / window.innerHeight) * -2 + 1;
//       // Also sync Hero3DBackground's mouse ref if provided
//       if (mouse?.current) {
//         mouse.current.x = e.clientX / window.innerWidth  - 0.5;
//         mouse.current.y = e.clientY / window.innerHeight - 0.5;
//       }
//     }
//     window.addEventListener("mousemove", onMouseMove);

//     // ── Wheel → virtual scroll (no actual page scroll) ──
//     function onWheel(e: WheelEvent) {
//       e.preventDefault();
//       // Only scroll during overview — ignore when focused or flying
//       if (s.focusedPlanet || s.isFlyingTo || s.isFlyingBack || s.tourActive) return;
//       const delta = e.deltaY * 0.0006;
//       s.scrollTarget = Math.max(0, Math.min(1, s.scrollTarget + delta));
//     }
//     window.addEventListener("wheel", onWheel, { passive: false });

//     // ── Texture helpers ──
//     const texLoader = new THREE.TextureLoader();

//     /** Try to load from path; fall back to a procedural canvas texture */
//     function loadOrProcedural(path: string, colors: string[]): THREE.Texture {
//       const tex = texLoader.load(
//         path,
//         undefined,
//         undefined,
//         () => {
//           // On error → swap to procedural
//           tex.image   = buildProceduralCanvas(colors);
//           tex.needsUpdate = true;
//         }
//       );
//       return tex;
//     }

//     function buildProceduralCanvas(colors: string[]): HTMLCanvasElement {
//       const canvas = document.createElement("canvas");
//       canvas.width  = 1024;
//       canvas.height = 512;
//       const ctx = canvas.getContext("2d")!;
//       const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
//       colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
//       ctx.fillStyle = grad;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       for (let i = 0; i < 12; i++) {
//         ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() * 0.06})`;
//         ctx.fillRect(0, (canvas.height / 12) * i, canvas.width, canvas.height / 12);
//       }
//       for (let i = 0; i < 3000; i++) {
//         ctx.beginPath();
//         ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
//         ctx.fill();
//       }
//       return canvas;
//     }

//     function createProceduralTexture(w: number, h: number, fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
//       const canvas = document.createElement("canvas");
//       canvas.width  = w;
//       canvas.height = h;
//       const ctx = canvas.getContext("2d")!;
//       fn(ctx, w, h);
//       const tex = new THREE.CanvasTexture(canvas);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       return tex;
//     }

//     // ── Lighting ──
//     scene.add(new THREE.AmbientLight(0x404060, 1.2));  // much brighter ambient
//     const sunLight = new THREE.PointLight(0xfff5d4, 4.0, 300);
//     sunLight.castShadow = true;
//     sunLight.shadow.mapSize.set(2048, 2048);
//     scene.add(sunLight);
//     const fill = new THREE.DirectionalLight(0x6699ff, 0.8);  // stronger blue fill
//     fill.position.set(-20, 10, 20);
//     scene.add(fill);
//     // Extra rim light from opposite side so dark side isn't pitch black
//     const rimLight = new THREE.DirectionalLight(0x334466, 0.5);
//     rimLight.position.set(20, -5, -20);
//     scene.add(rimLight);

//     // ── Sun ──
//     const sunTexture = createProceduralTexture(1024, 512, (ctx, w, h) => {
//       const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
//       grad.addColorStop(0,    "#fff7c2");
//       grad.addColorStop(0.3,  "#fbbf24");
//       grad.addColorStop(0.6,  "#f59e0b");
//       grad.addColorStop(0.85, "#d97706");
//       grad.addColorStop(1,    "#92400e");
//       ctx.fillStyle = grad;
//       ctx.fillRect(0, 0, w, h);
//       for (let i = 0; i < 6000; i++) {
//         const x = Math.random() * w;
//         const y = Math.random() * h;
//         const r = Math.random() * 4 + 1;
//         ctx.beginPath();
//         ctx.arc(x, y, r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(${180 + Math.random() * 75},${120 + Math.random() * 80},${Math.random() * 40},${Math.random() * 0.3})`;
//         ctx.fill();
//       }
//     });

//     // Try loading /textures/sun.jpg; fallback = procedural
//     const sunMap = texLoader.load("/textures/sun.jpg", undefined, undefined, () => {
//       sunMap.image     = sunTexture.image;
//       sunMap.needsUpdate = true;
//     });

//     const sun = new THREE.Mesh(
//       new THREE.SphereGeometry(2.5, 128, 128),
//       new THREE.MeshBasicMaterial({ map: sunMap })
//     );
//     sun.userData.planetName = "sun";
//     scene.add(sun);
//     s.sun = sun;

//     // ── Glow shader ──
//     const glowVert = `
//       varying vec3 vNormal;
//       void main() {
//         vNormal = normalize(normalMatrix * normal);
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `;
//     function makeGlow(size: number, color: number, power: number, opacity: number) {
//       return new THREE.Mesh(
//         new THREE.SphereGeometry(size, 32, 32),
//         new THREE.ShaderMaterial({
//           vertexShader: glowVert,
//           fragmentShader: `
//             varying vec3 vNormal;
//             uniform vec3 glowColor;
//             uniform float p;
//             uniform float o;
//             void main() {
//               float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1)), p);
//               gl_FragColor = vec4(glowColor, 1.0) * intensity * o;
//             }
//           `,
//           uniforms: {
//             glowColor: { value: new THREE.Color(color) },
//             p:         { value: power },
//             o:         { value: opacity },
//           },
//           blending:    THREE.AdditiveBlending,
//           side:        THREE.BackSide,
//           transparent: true,
//           depthWrite:  false,
//         })
//       );
//     }
//     scene.add(makeGlow(3.2, 0xfbbf24, 2.0, 0.5));
//     scene.add(makeGlow(4.5, 0xf59e0b, 3.0, 0.2));
//     scene.add(makeGlow(6.0, 0xfde68a, 4.0, 0.08));

//     // ── Corona ──
//     const coronaCount = 2000;
//     const coronaGeo   = new THREE.BufferGeometry();
//     const coronaPos   = new Float32Array(coronaCount * 3);
//     const coronaVel: { speed: number; phase: number }[] = [];
//     for (let i = 0; i < coronaCount; i++) {
//       const theta = Math.random() * Math.PI * 2;
//       const phi   = Math.acos(2 * Math.random() - 1);
//       const r     = 2.6 + Math.random() * 2.5;
//       coronaPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
//       coronaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
//       coronaPos[i * 3 + 2] = r * Math.cos(phi);
//       coronaVel.push({ speed: 0.002 + Math.random() * 0.008, phase: Math.random() * Math.PI * 2 });
//     }
//     coronaGeo.setAttribute("position", new THREE.Float32BufferAttribute(coronaPos, 3));
//     const coronaMat = new THREE.PointsMaterial({
//       color: 0xfde68a, size: 0.05, transparent: true, opacity: 0.6,
//       blending: THREE.AdditiveBlending, depthWrite: false,
//     });
//     const corona = new THREE.Points(coronaGeo, coronaMat);
//     scene.add(corona);

//     // ── Orbit rings ──
//     PLANETS_DATA.forEach(pd => {
//       const ring = new THREE.Mesh(
//         new THREE.RingGeometry(pd.distance - 0.02, pd.distance + 0.02, 256),
//         new THREE.MeshBasicMaterial({
//           color: 0xffffff, side: THREE.DoubleSide,
//           transparent: true, opacity: 0.06, depthWrite: false,
//         })
//       );
//       ring.rotation.x = -Math.PI / 2;
//       scene.add(ring);
//     });

//     // ── Planets ──
//     s.planets = [];
//     PLANETS_DATA.forEach(pd => {
//       const tex = loadOrProcedural(pd.texturePath, pd.colors);

//       const mesh = new THREE.Mesh(
//         new THREE.SphereGeometry(pd.radius, 64, 64),
//         new THREE.MeshStandardMaterial({
//           map: tex,
//           roughness: 0.55,
//           metalness: 0.05,
//           emissiveMap: tex,
//           emissive: new THREE.Color(0x111122),
//           emissiveIntensity: 0.15,
//         })
//       );
//       mesh.castShadow    = true;
//       mesh.receiveShadow = true;
//       mesh.userData.planetName = pd.name;

//       // Moon (only for earth) — kept from old file
//       if (pd.name === "earth") {
//         const moonTex = loadOrProcedural("/textures/moon.jpg", ["#9ca3af", "#6b7280", "#4b5563"]);
//         const moon = new THREE.Mesh(
//           new THREE.SphereGeometry(pd.radius * 0.27, 32, 32),
//           new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9, metalness: 0.0 })
//         );
//         moon.userData.isMoon = true;
//         // Start offset; updated each frame via a child-offset approach
//         moon.position.set(pd.radius * 2.5, 0, 0);
//         mesh.add(moon);

//         // Earth atmosphere glow — bigger and brighter
//         const atmo = new THREE.Mesh(
//           new THREE.SphereGeometry(pd.radius * 1.08, 64, 64),
//           new THREE.ShaderMaterial({
//             vertexShader: glowVert,
//             fragmentShader: `
//               varying vec3 vNormal;
//               void main() {
//                 float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1)), 1.6);
//                 gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity * 2.5;
//               }
//             `,
//             blending: THREE.AdditiveBlending, side: THREE.BackSide,
//             transparent: true, depthWrite: false,
//           })
//         );
//         mesh.add(atmo);

//         // Second softer outer glow layer
//         const atmo2 = new THREE.Mesh(
//           new THREE.SphereGeometry(pd.radius * 1.18, 64, 64),
//           new THREE.ShaderMaterial({
//             vertexShader: glowVert,
//             fragmentShader: `
//               varying vec3 vNormal;
//               void main() {
//                 float intensity = pow(0.5 - dot(vNormal, vec3(0,0,1)), 2.5);
//                 gl_FragColor = vec4(0.1, 0.3, 0.8, 1.0) * intensity * 1.2;
//               }
//             `,
//             blending: THREE.AdditiveBlending, side: THREE.BackSide,
//             transparent: true, depthWrite: false,
//           })
//         );
//         mesh.add(atmo2);
//       }

//       // Saturn rings
//       if (pd.name === "saturn") {
//         const ringTex = createProceduralTexture(512, 64, (ctx, w, h) => {
//           for (let x = 0; x < w; x++) {
//             const t = x / w;
//             const a = Math.sin(t * 30) * 0.3 + 0.5;
//             ctx.fillStyle = `rgba(${180 + t * 60},${140 + t * 80},200,${a * 0.7})`;
//             ctx.fillRect(x, 0, 1, h);
//           }
//         });
//         const satRing = new THREE.Mesh(
//           new THREE.RingGeometry(pd.radius * 1.3, pd.radius * 2.2, 128),
//           new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.6, depthWrite: false })
//         );
//         satRing.rotation.x = -Math.PI / 2.5;
//         mesh.add(satRing);
//       }

//       scene.add(mesh);
//       s.planets.push({ mesh, data: pd, angle: Math.random() * Math.PI * 2 });
//     });

//     // ── Stars ──
//     const starsGeo = new THREE.BufferGeometry();
//     const sv: number[] = [], sc: number[] = [];
//     for (let i = 0; i < 18000; i++) {
//       sv.push((Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 1600, (Math.random() - 0.5) * 1600);
//       const c = new THREE.Color();
//       c.setHSL(Math.random() * 0.2 + 0.55, 0.6, 0.75 + Math.random() * 0.25);
//       sc.push(c.r, c.g, c.b);
//     }
//     starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(sv, 3));
//     starsGeo.setAttribute("color",    new THREE.Float32BufferAttribute(sc, 3));
//     const starsMat = new THREE.PointsMaterial({
//       size: 0.4, transparent: true, opacity: 0.8, vertexColors: true,
//       sizeAttenuation: true, depthWrite: false,
//     });
//     const stars = new THREE.Points(starsGeo, starsMat);
//     scene.add(stars);

//     // ── Raycaster ──
//     const raycaster       = new THREE.Raycaster();
//     const originalScales  = new Map<THREE.Mesh, number>();
//     const getRayTargets   = () => [sun, ...s.planets.map(p => p.mesh)];

//     // ── Hover handler ──
//     function onCanvasMouseMove() {
//       if (s.focusedPlanet || s.isFlyingTo || s.isFlyingBack) return;
//       raycaster.setFromCamera(mouseNDC, camera);
//       const hits    = raycaster.intersectObjects(getRayTargets(), false);
//       const labelEl = document.getElementById("planet-label");

//       if (hits.length > 0) {
//         const obj  = hits[0].object as THREE.Mesh;
//         const name = obj.userData.planetName;
//         if (name) {
//           document.body.style.cursor = "pointer";

//           // Label
//           if (labelEl) {
//             const pos = new THREE.Vector3();
//             obj.getWorldPosition(pos);
//             pos.project(camera);
//             labelEl.style.left    = ((pos.x * 0.5 + 0.5) * window.innerWidth) + "px";
//             labelEl.style.top     = ((-pos.y * 0.5 + 0.5) * window.innerHeight - 40) + "px";
//             labelEl.textContent   = name.charAt(0).toUpperCase() + name.slice(1);
//             labelEl.style.opacity = "1";
//           }

//           if (s.hoveredObj !== obj) {
//             if (s.hoveredObj && originalScales.has(s.hoveredObj)) {
//               const sc = originalScales.get(s.hoveredObj)!;
//               s.hoveredObj.scale.set(sc, sc, sc);
//             }
//             if (!originalScales.has(obj)) originalScales.set(obj, obj.scale.x);
//             s.hoveredObj = obj;
//           }
//           onHoverRef.current?.(name);
//           setActive?.(name);
//         }
//       } else {
//         document.body.style.cursor = "default";
//         if (labelEl) labelEl.style.opacity = "0";
//         if (s.hoveredObj && originalScales.has(s.hoveredObj)) {
//           const sc = originalScales.get(s.hoveredObj)!;
//           s.hoveredObj.scale.set(sc, sc, sc);
//         }
//         s.hoveredObj = null;
//         if (!s.focusedPlanet) {
//           onHoverRef.current?.(null);
//           setActive?.(null);
//         }
//       }
//     }
//     renderer.domElement.addEventListener("mousemove", onCanvasMouseMove);

//     // ── Click to fly ──
//     function onCanvasClick() {
//       if (s.isFlyingTo || s.isFlyingBack) return;
//       raycaster.setFromCamera(mouseNDC, camera);
//       const hits = raycaster.intersectObjects(getRayTargets(), false);
//       if (hits.length === 0) return;

//       const obj  = hits[0].object as THREE.Mesh;
//       const name = obj.userData.planetName;
//       if (!name || name === "sun") return;

//       const planetObj = s.planets.find(p => p.mesh === obj);
//       if (!planetObj) return;

//       s.focusedPlanet      = name;
//       s.isFlyingTo         = true;
//       s.flyElapsed         = 0;
//       s.flyStartPos.copy(camera.position);
//       s.flyStartTarget.copy(controls.target);
//       controls.enabled     = false;
//       controls.autoRotate  = false;

//       const labelEl = document.getElementById("planet-label");
//       if (labelEl) labelEl.style.opacity = "0";

//       onFocusRef.current?.(name);
//     }
//     renderer.domElement.addEventListener("click", onCanvasClick);

//     // ── Animation loop ──
//     const clock = new THREE.Clock();
//     let time = 0, animId = 0;
//     let moonAngle = 0;

//     function animate() {
//       animId = requestAnimationFrame(animate);
//       const delta = clock.getDelta();
//       time += delta;
//       moonAngle += delta * 1.6;

//       // Sun
//       sun.rotation.y += 0.001;

//       // Corona
//       const cPos = corona.geometry.attributes.position as THREE.BufferAttribute;
//       for (let i = 0; i < coronaCount; i++) {
//         const v   = coronaVel[i];
//         const x   = cPos.getX(i), y = cPos.getY(i), z = cPos.getZ(i);
//         const len = Math.sqrt(x * x + y * y + z * z);
//         if (len > 0) {
//           const nLen = 2.6 + (len - 2.6 + Math.sin(time * 2 + v.phase) * 0.3 * 0.05);
//           cPos.setXYZ(i,
//             (x / len) * (nLen + Math.sin(time * v.speed * 100 + v.phase) * 0.15),
//             (y / len) * (nLen + Math.cos(time * v.speed * 80  + v.phase) * 0.15),
//             (z / len) * (nLen + Math.sin(time * v.speed * 60  + v.phase) * 0.15),
//           );
//         }
//       }
//       cPos.needsUpdate    = true;
//       corona.rotation.y  += 0.001;

//       // Planets orbit
//       s.planets.forEach(p => {
//         p.angle += p.data.speed * delta * 0.3;
//         p.mesh.position.set(
//           Math.cos(p.angle) * p.data.distance,
//           Math.sin(p.angle * 0.5) * 0.3,
//           Math.sin(p.angle) * p.data.distance,
//         );
//         p.mesh.rotation.y += 0.01;
//         p.mesh.rotation.x  = p.data.tilt;

//         // Orbit moon around earth
//         if (p.data.name === "earth") {
//           const moonMesh = p.mesh.children.find(c => (c as THREE.Mesh).userData?.isMoon) as THREE.Mesh | undefined;
//           if (moonMesh) {
//             const mr = p.data.radius * 2.5;
//             moonMesh.position.set(
//               Math.cos(moonAngle) * mr,
//               Math.sin(moonAngle * 0.3) * 0.2,
//               Math.sin(moonAngle) * mr,
//             );
//             moonMesh.rotation.y += 0.02;
//           }
//         }

//         // Hover scale
//         if (s.hoveredObj === p.mesh) {
//           const ts = (originalScales.get(p.mesh) || 1) * 1.35;
//           p.mesh.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.08);
//         }
//       });

//       // Sun hover
//       if (s.hoveredObj === sun) {
//         sun.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.08);
//       } else {
//         sun.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
//       }

//       // Stars twinkle
//       stars.rotation.y     = time * 0.003;
//       starsMat.opacity     = 0.6 + Math.sin(time * 1.5) * 0.2;

//       // ── Virtual scroll → zoom into the solar system ──
//       // p=0: far overview (0, 6, 22)
//       // p=1: right in front of the sun, nearly filling screen (0, 1, 3.5)
//       if (!s.focusedPlanet && !s.isFlyingTo && !s.isFlyingBack && !s.tourActive) {
//         // Ease scroll progress toward target
//         s.scrollProgress += (s.scrollTarget - s.scrollProgress) * 0.07;
//         const p = s.scrollProgress; // 0 → 1

//         // Ease curve — ease-in-out so zoom feels weighty
//         const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

//         // Camera path: pull forward and slightly down toward sun
//         const targetCamX = 0;
//         const targetCamY = 6  - ease * 5;    // 6  → 1
//         const targetCamZ = 22 - ease * 18.5; // 22 → 3.5

//         // Look target drifts slightly downward so sun stays centered
//         const targetLookY = ease * -0.5;

//         if (controls.autoRotate) {
//           camera.position.x += (targetCamX - camera.position.x) * 0.05;
//           camera.position.y += (targetCamY - camera.position.y) * 0.05;
//           camera.position.z += (targetCamZ - camera.position.z) * 0.05;
//           controls.target.x += (0 - controls.target.x) * 0.05;
//           controls.target.y += (targetLookY - controls.target.y) * 0.05;
//           controls.target.z += (0 - controls.target.z) * 0.05;
//         }
//       }

//       // ── Fly-to ──
//       if (s.isFlyingTo && s.focusedPlanet) {
//         s.flyElapsed += delta;
//         let t = Math.min(s.flyElapsed / s.flyDuration, 1);
//         t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

//         const fp = s.planets.find(p => p.data.name === s.focusedPlanet);
//         if (fp) {
//           const pPos   = fp.mesh.position.clone();
//           const camOff = pPos.clone().normalize().multiplyScalar(fp.data.radius * 5 + 1.5);
//           camOff.y    += fp.data.radius * 2;
//           s.flyEndPos.copy(pPos).add(camOff);
//           s.flyEndTarget.copy(pPos);

//           camera.position.lerpVectors(s.flyStartPos, s.flyEndPos, t);
//           controls.target.lerpVectors(s.flyStartTarget, s.flyEndTarget, t);
//           controls.update();

//           if (t >= 1) {
//             s.isFlyingTo          = false;
//             controls.enabled      = true;
//             controls.autoRotate   = false;
//             controls.minDistance  = fp.data.radius * 2;
//             controls.maxDistance  = fp.data.radius * 12;
//             if (s.tourActive && s.tourPhase === "flyTo") {
//               s.tourPhase          = "pause";
//               s.tourPauseElapsed   = 0;
//             }
//           }
//         }
//       }

//       // ── Fly-back ──
//       if (s.isFlyingBack) {
//         s.flyElapsed += delta;
//         let t = Math.min(s.flyElapsed / s.flyDuration, 1);
//         t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

//         camera.position.lerpVectors(s.flyStartPos, s.flyEndPos, t);
//         controls.target.lerpVectors(s.flyStartTarget, s.flyEndTarget, t);
//         controls.update();

//         if (t >= 1) {
//           s.isFlyingBack           = false;
//           controls.enabled         = true;
//           controls.autoRotate      = true;
//           controls.autoRotateSpeed = 0.15;
//           controls.minDistance     = 8;
//           controls.maxDistance     = 50;
//           // Reset virtual scroll so user starts from overview again
//           s.scrollTarget   = 0;
//           s.scrollProgress = 0;
//         }
//       }

//       // ── Tour pause timer ──
//       if (s.tourActive && s.tourPhase === "pause") {
//         s.tourPauseElapsed += delta;
//         if (s.tourPauseElapsed >= s.tourPauseDuration) {
//           s.tourPhase = "flyTo";
//           advanceTour(s);
//         }
//       }

//       // ── Track focused planet (keep it centered after fly-to) ──
//       if (s.focusedPlanet && !s.isFlyingTo && !s.isFlyingBack) {
//         const fp = s.planets.find(p => p.data.name === s.focusedPlanet);
//         if (fp) {
//           const pPos = fp.mesh.position.clone();
//           const dir  = camera.position.clone().sub(controls.target).normalize();
//           const dist = camera.position.distanceTo(controls.target);
//           controls.target.lerp(pPos, 0.08);
//           camera.position.copy(controls.target.clone().add(dir.multiplyScalar(dist)));
//         }
//       }

//       controls.update();
//       renderer.render(scene, camera);
//     }
//     animate();

//     // ── Resize ──
//     function onResize() {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     }
//     window.addEventListener("resize", onResize);

//     // ── Cleanup ──
//     return () => {
//       cancelAnimationFrame(animId);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("wheel", onWheel);
//       window.removeEventListener("resize", onResize);
//       renderer.domElement.removeEventListener("mousemove", onCanvasMouseMove);
//       renderer.domElement.removeEventListener("click", onCanvasClick);
//       controls.dispose();
//       renderer.dispose();
//       if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
//     };
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   return (
//     <div
//       ref={containerRef}
//       style={{ position: "absolute", inset: 0, zIndex: 0 }}
//     />
//   );
// }