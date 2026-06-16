/* ============================================================
   BV EYEWEAR — WebGL engine (Three.js)
   A procedurally-built pair of glasses, reused for the hero
   backdrop and the interactive configurator.
   ============================================================ */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Build a pair of glasses as a THREE.Group ---------- */
function roundedRectShape(w, h, r){
  const s = new THREE.Shape();
  const x = -w/2, y = -h/2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function buildGlasses(){
  const group = new THREE.Group();

  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a1a,
    metalness: 0.35,
    roughness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.15,
    reflectivity: 0.6,
  });
  group.userData.frameMat = frameMat;

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d0f0e,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.86,
    transparent: true,
    opacity: 0.55,
    ior: 1.5,
    thickness: 0.4,
    clearcoat: 1,
    envMapIntensity: 1.4,
  });
  group.userData.lensMat = lensMat;

  // --- Rims ---
  const rimW = 1.05, rimH = 0.82, corner = 0.3, rimThick = 0.12;
  const outer = roundedRectShape(rimW, rimH, corner);
  const hole = roundedRectShape(rimW - rimThick*2, rimH - rimThick*2, corner - rimThick*0.5);
  outer.holes.push(hole);
  const rimGeo = new THREE.ExtrudeGeometry(outer, {
    depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24,
  });
  rimGeo.center();

  const lensGeo = new THREE.PlaneGeometry(rimW - rimThick*1.4, rimH - rimThick*1.4, 1, 1);

  const eyeGap = 0.62;
  [-1, 1].forEach((side) => {
    const rim = new THREE.Mesh(rimGeo, frameMat);
    rim.position.x = side * eyeGap;
    group.add(rim);

    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(side * eyeGap, 0, 0.02);
    group.add(lens);
  });

  // --- Bridge ---
  const bridgeGeo = new THREE.TorusGeometry(0.16, 0.045, 12, 24, Math.PI);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.position.set(0, 0.12, 0.04);
  group.add(bridge);

  // --- Temples (arms) ---
  const templeGeo = new THREE.CapsuleGeometry(0.045, 1.25, 6, 12);
  [-1, 1].forEach((side) => {
    const temple = new THREE.Mesh(templeGeo, frameMat);
    temple.rotation.z = Math.PI / 2;
    temple.rotation.y = side * 0.22;
    temple.position.set(side * (eyeGap + rimW/2 - 0.04), 0.16, -0.62);
    group.add(temple);

    // hinge stud
    const stud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16),
      frameMat
    );
    stud.rotation.x = Math.PI / 2;
    stud.position.set(side * (eyeGap + rimW/2 - 0.08), 0.16, 0.02);
    group.add(stud);
  });

  group.scale.setScalar(1);
  return group;
}

/* ---------- Reusable scene ---------- */
class GlassesScene {
  constructor(canvas, opts = {}){
    this.canvas = canvas;
    this.opts = opts;
    this.mouse = new THREE.Vector2(0, 0);
    this.target = new THREE.Vector2(0, 0);
    this.scrollRot = 0;
    this.running = true;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, opts.distance || 4.2);

    // Environment for reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Lights
    const key = new THREE.DirectionalLight(0xfff2dd, 2.4);
    key.position.set(2, 3, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9a24a, 2.6); // gold rim
    rim.position.set(-3, 1, -2);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0x8899cc, 0.6);
    fill.position.set(-1, -2, 2);
    this.scene.add(fill);
    this.scene.add(new THREE.AmbientLight(0x402a14, 0.4));

    // Glasses
    this.glasses = buildGlasses();
    this.scene.add(this.glasses);

    if (opts.controls){
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.07;
      this.controls.rotateSpeed = 0.6;
      this.controls.minPolarAngle = Math.PI * 0.28;
      this.controls.maxPolarAngle = Math.PI * 0.72;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.2;
    }

    this.resize();
    window.addEventListener("resize", () => this.resize());

    if (!opts.controls){
      window.addEventListener("pointermove", (e) => {
        this.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        this.target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    }

    // Pause when offscreen
    if (opts.observe){
      const io = new IntersectionObserver(([entry]) => {
        this.running = entry.isIntersecting;
      }, { threshold: 0.01 });
      io.observe(canvas);
    }

    this.clock = new THREE.Clock();
    this.loop = this.loop.bind(this);
    this.loop();
  }

  setColor(hex){
    const c = new THREE.Color(hex);
    this.glasses.userData.frameMat.color.copy(c);
    // brighter finishes get a touch more roughness so they read as acetate
    const lum = 0.299*c.r + 0.587*c.g + 0.114*c.b;
    this.glasses.userData.frameMat.roughness = 0.18 + lum * 0.22;
    this.glasses.userData.frameMat.metalness = 0.45 - lum * 0.3;
  }

  setScroll(p){ this.scrollRot = p; }

  resize(){
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  loop(){
    requestAnimationFrame(this.loop);
    if (!this.running) return;
    const t = this.clock.getElapsedTime();

    if (this.controls){
      this.controls.update();
    } else {
      // ease mouse
      this.mouse.x += (this.target.x - this.mouse.x) * 0.05;
      this.mouse.y += (this.target.y - this.mouse.y) * 0.05;
      const floatY = reduceMotion ? 0 : Math.sin(t * 0.6) * 0.05;
      // gentle oscillation around a front-facing pose (never edge-on)
      const baseSpin = reduceMotion ? 0 : Math.sin(t * 0.35) * 0.5;
      this.glasses.rotation.y = baseSpin + this.mouse.x * 0.45 + this.scrollRot * Math.PI * 1.2;
      this.glasses.rotation.x = -0.08 + this.mouse.y * 0.28 + this.scrollRot * 0.4;
      this.glasses.position.y = floatY - this.scrollRot * 0.4;
      this.glasses.position.z = -this.scrollRot * 1.2;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

/* ---------- Boot ---------- */
const api = { hero: null, config: null };

const heroCanvas = document.getElementById("scene");
if (heroCanvas){
  try { api.hero = new GlassesScene(heroCanvas, { distance: 4.0, observe: true }); }
  catch(e){ console.warn("Hero scene failed", e); heroCanvas.style.display = "none"; }
}

const configCanvas = document.getElementById("configScene");
if (configCanvas){
  try { api.config = new GlassesScene(configCanvas, { distance: 4.2, controls: true, observe: true }); }
  catch(e){ console.warn("Config scene failed", e); }
}

window.BVScene = api;
window.dispatchEvent(new Event("bvscene:ready"));
