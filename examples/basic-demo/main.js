import {
  Engine,
  Scene,
  SpriteSheet,
  SpriteAnimation,
  Entity,
  Keyboard,
  AnimationController,
} from "../../src/index.js";

const canvas = document.querySelector("#game");

// Helper to load images
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

Promise.all([
  loadImage("/examples/basic-demo/assets/idle_animation.png"),
  loadImage("/examples/basic-demo/assets/walk_animation.png"),
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

  const idleAnim = new SpriteAnimation({
    spriteSheet: idleSheet,
    frames: [0, 1, 2, 3],
    frameDuration: 140,
    loop: true,
  });

  const walkAnim = new SpriteAnimation({
    spriteSheet: walkSheet,
    frames: [0, 1, 2, 3],
    frameDuration: 70,
    loop: true,
  });

  // 👇 New: controller wraps both animations
  const heroAnimations = new AnimationController({
    animations: {
      idle: idleAnim,
      walk: walkAnim,
    },
    initialState: "idle",
  });

  // Entity just sees "an animation-like thing"
  const hero = new Entity({
    x: 20,
    y: 20,
    animation: heroAnimations,
  });

  const keyboard = new Keyboard();

  class SpriteScene extends Scene {
    constructor() {
      super();
      this.hero = hero;
    }

    update(dt) {
      const speed = 40;
      this.hero.vx = 0;

      if (keyboard.isDown("ArrowLeft") || keyboard.isDown("a")) {
        this.hero.vx = -speed;
        this.hero.facing = -1;
      }
      if (keyboard.isDown("ArrowRight") || keyboard.isDown("d")) {
        this.hero.vx = speed;
        this.hero.facing = 1;
      }

      // Decide animation state based on movement:
      if (this.hero.vx !== 0) {
        heroAnimations.setState("walk");
      } else {
        heroAnimations.setState("idle");
      }

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