export class Engine {
  constructor({ canvas, width = 160, height = 144, background = "#000" }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Virtual resolution
    this.width = width;
    this.height = height;

    // Background colour
    this.background = background;

    // Game loop state
    this.running = false;
    this.lastTime = 0;

    // Scene management
    this.scenes = new Map();
    this.currentScene = null;

    // Canvas setup (we’ll flesh this out later)
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

    // Clear screen
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentScene && this.currentScene.draw) {
      this.currentScene.draw(ctx);
    }
  }

  addScene(name, scene) {
    this.scenes.set(name, scene);
  }

  setScene(name) {
    this.currentScene = this.scenes.get(name) || null;
  }
}