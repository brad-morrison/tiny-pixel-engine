export class Engine {
  constructor({ canvas, width = 160, height = 144, background = "#000" }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Virtual game resolution
    this.width = width;
    this.height = height;

    // Background color
    this.background = background;

    // Draw scale (computed)
    this.scale = 1;

    // Scene system
    this.scenes = new Map();
    this.currentScene = null;

    // Loop state
    this.running = false;
    this.lastTime = 0;

    // Initial setup
    this.computeScale();
  }

  computeScale() {
    // CSS size of canvas (not real pixel buffer)
    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    // Calculate how much we can scale virtual pixels
    const scaleX = cssWidth / this.width;
    const scaleY = cssHeight / this.height;

    // Integer scale to keep pixel art crisp
    this.scale = Math.floor(Math.min(scaleX, scaleY)) || 1;

    // Compute actual physical resolution
    this.canvasWidth = this.width * this.scale;
    this.canvasHeight = this.height * this.scale;

    // Set canvas internal buffer size
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    // Ensure pixel sharpness
    this.ctx.imageSmoothingEnabled = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  loop(timestamp) {
    if (!this.running) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Allow responsive scaling
    this.computeScale();

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(dt);
    }
  }

  draw() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (this.currentScene && this.currentScene.draw) {
      this.currentScene.draw(ctx, this.scale);
    }
  }

    addScene(name, scene) {
    this.scenes.set(name, scene);
  }

  setScene(name) {
    const next = this.scenes.get(name) || null;

    if (this.currentScene && typeof this.currentScene.onExit === "function") {
      this.currentScene.onExit(this);
    }

    this.currentScene = next;

    if (this.currentScene && typeof this.currentScene.onEnter === "function") {
      this.currentScene.onEnter(this);
    }
  }
}