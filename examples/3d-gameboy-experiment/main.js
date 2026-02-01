import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createGame } from "./game.js";

const canvas = document.getElementById("webgl");

// Create a hidden canvas for the game
const gameCanvas = document.createElement("canvas");
gameCanvas.width = 160;
gameCanvas.height = 144;
gameCanvas.style.display = "none";
document.body.appendChild(gameCanvas);

// Initialize the game engine (async)
let gameEngine = null;
createGame(gameCanvas).then(engine => {
  gameEngine = engine;
  console.log("Game initialized!");
});

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.5, 0.4, 0.7);
scene.add(camera);

// Lights (simple, good-enough)
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(2, 3, 2);
scene.add(key);

// Controls (orbitable)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.3;
controls.maxDistance = 2.0;

// Limit rotation (tweak later)
controls.minPolarAngle = THREE.MathUtils.degToRad(35);
controls.maxPolarAngle = THREE.MathUtils.degToRad(80);
controls.minAzimuthAngle = THREE.MathUtils.degToRad(-45);
controls.maxAzimuthAngle = THREE.MathUtils.degToRad(45);

// Load model
const loader = new GLTFLoader();

console.log("Starting to load gameboy model...");

let screenMesh = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

loader.load(
  "./models/gameboy.glb",
  (gltf) => {
    console.log("Model loaded successfully!", gltf);
    const model = gltf.scene;
    scene.add(model);
    
    console.log("Model added to scene. Position:", model.position);
    console.log("Scene children:", scene.children);

    // Find the screen mesh
    model.traverse((child) => {
      if (child.isMesh && child.name === "SCREEN_MESH") {
        screenMesh = child;
        console.log("Found screen mesh!", screenMesh);

        // Normalize UVs to full 0..1 so the canvas maps 1:1
        const uvAttr = screenMesh.geometry?.attributes?.uv;
        if (uvAttr) {
          let minU = Infinity;
          let minV = Infinity;
          let maxU = -Infinity;
          let maxV = -Infinity;

          for (let i = 0; i < uvAttr.count; i++) {
            const u = uvAttr.getX(i);
            const v = uvAttr.getY(i);
            if (u < minU) minU = u;
            if (v < minV) minV = v;
            if (u > maxU) maxU = u;
            if (v > maxV) maxV = v;
          }

          const rangeU = maxU - minU || 1;
          const rangeV = maxV - minV || 1;

          for (let i = 0; i < uvAttr.count; i++) {
            const u = (uvAttr.getX(i) - minU) / rangeU;
            const v = (uvAttr.getY(i) - minV) / rangeV;
            uvAttr.setXY(i, u, v);
          }

          uvAttr.needsUpdate = true;
        }

        // Create texture from game canvas
        const texture = new THREE.CanvasTexture(gameCanvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.flipY = true;

        // Apply texture to screen
        screenMesh.material = new THREE.MeshBasicMaterial({
          map: texture,
          emissive: new THREE.Color(0x222222),
          emissiveIntensity: 0.3
        });
      }
    });

    // Center camera target on the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    controls.update();
    
    console.log("Model center:", center);
  },
  (progress) => {
    console.log("Loading:", (progress.loaded / progress.total * 100).toFixed(2), "%");
  },
  (err) => {
    console.error("GLB load failed:", err);
  }
);

// Render loop
function tick() {
  controls.update();
  
  // The game engine has its own loop with engine.start()
  // We just need to update the texture
  if (screenMesh && screenMesh.material.map) {
    screenMesh.material.map.needsUpdate = true;
  }
  
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Resize
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Mouse interaction with the game screen
function handlePointerEvent(evt, eventType) {
  if (!screenMesh || !gameEngine) return;
  
  // Convert mouse position to normalized device coordinates (-1 to +1)
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Raycast to the screen mesh
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(screenMesh);
  
  if (intersects.length > 0) {
    const uv = intersects[0].uv;
    if (uv) {
      // Convert UV coordinates to canvas pixel coordinates
      const canvasX = uv.x * gameCanvas.width;
      const canvasY = (1 - uv.y) * gameCanvas.height;
      
      const p = gameEngine.pointer;
      p.x = canvasX;
      p.y = canvasY;
      
      if (eventType === 'down') {
        p.isDown = true;
        p.justDown = true;
        p.downX = canvasX;
        p.downY = canvasY;
        p.downTime = performance.now();
      } else if (eventType === 'up') {
        p.isDown = false;
        p.justUp = true;
        p.upTime = performance.now();
      }
    }
  }
}

canvas.addEventListener('pointerdown', (evt) => handlePointerEvent(evt, 'down'));
canvas.addEventListener('pointerup', (evt) => handlePointerEvent(evt, 'up'));
canvas.addEventListener('pointermove', (evt) => handlePointerEvent(evt, 'move'));