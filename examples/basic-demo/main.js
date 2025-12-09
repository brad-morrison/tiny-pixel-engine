import {
  Engine,
  Scene,
  SpriteSheet,
  SpriteAnimation,
  Entity,
  Keyboard,
} from "../../src/index.js";

const canvas = document.querySelector("#game");

// Helper to load images easily
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

// Load BOTH animations
Promise.all([
  loadImage("/examples/basic-demo/assets/idle_animation.png"),
  loadImage("/examples/basic-demo/assets/walk_animation.png")
]).then(([idleImage, walkImage]) => {

  console.log("Idle sheet loaded:", idleImage.width, idleImage.height);
  console.log("Walk sheet loaded:", walkImage.width, walkImage.height);

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#222",
  });

  const frameWidth = 16;
  const frameHeight = 16;

  // Create two SpriteSheets
  const idleSheet = new SpriteSheet({
    image: idleImage,
    frameWidth,
    frameHeight,
  });

  const walkSheet = new SpriteSheet({
    image: walkImage,
    frameWidth,
    frameHeight,
  });

  // Create two SpriteAnimations
  const idleAnim = new SpriteAnimation({
    spriteSheet: idleSheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 140,
    loop: true,
  });

  const walkAnim = new SpriteAnimation({
    spriteSheet: walkSheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 70,
    loop: true,
  });

  // Create hero entity
  const hero = new Entity({
    x: 20,
    y: 20,
    animation: idleAnim, // starts idle
  });

  const keyboard = new Keyboard();

  class SpriteScene extends Scene {
    constructor() {
      super();
      this.time = 0;
      this.hero = hero;
    }

    update(dt) {
      this.time += dt;

      const speed = 40;
      const dtSeconds = dt / 1000;

      // Reset velocity
      this.hero.vx = 0;

      // Input
      if (keyboard.isDown("ArrowLeft") || keyboard.isDown("a")) {
        this.hero.vx = -speed;
      }
      if (keyboard.isDown("ArrowRight") || keyboard.isDown("d")) {
        this.hero.vx = speed;
      }

      // 🔹 Animation switching
      if (this.hero.vx !== 0) {
        this.hero.animation = walkAnim;
      } else {
        this.hero.animation = idleAnim;
      }

      // Update entity (applies velocity + animation)
      this.hero.update(dt);
    }

    draw(ctx, scale) {
      this.hero.draw(ctx, scale);
    }
  }

  const scene = new SpriteScene();
  engine.addScene("sprite", scene);
  engine.setScene("sprite");
  engine.start();

}).catch((err) => {
  console.error("Failed to load one of the spritesheets", err);
});