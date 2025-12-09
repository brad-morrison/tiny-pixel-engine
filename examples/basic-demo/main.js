import {
  Engine,
  Scene,
  SpriteSheet,
  SpriteAnimation,
  Entity,
  Keyboard
} from "../../src/index.js";

const canvas = document.querySelector("#game");

// Load a sprite sheet
const spriteImage = new Image();
spriteImage.src = "/examples/basic-demo/assets/idle_animation.png";

spriteImage.onload = () => {
  console.log("Sprite sheet loaded:", spriteImage.width, spriteImage.height);

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#222",
  });

  const frameWidth = 16;
  const frameHeight = 16;

  const sheet = new SpriteSheet({
    image: spriteImage,
    frameWidth,
    frameHeight,
  });

  const idleAnim = new SpriteAnimation({
    spriteSheet: sheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 140,
    loop: true,
  });

  // Create an Entity that uses the idle animation
  const hero = new Entity({
    x: 20,
    y: 20,
    animation: idleAnim,
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

      // --- Movement based on keyboard input ---
      const speed = 40; // virtual pixels per second

      // Convert dt (ms) to seconds
      const dtSeconds = dt / 1000;

      if (keyboard.isDown("ArrowLeft") || keyboard.isDown("a")) {
        this.hero.x -= speed * dtSeconds;
      }
      if (keyboard.isDown("ArrowRight") || keyboard.isDown("d")) {
        this.hero.x += speed * dtSeconds;
      }
      if (keyboard.isDown("ArrowUp") || keyboard.isDown("w")) {
        this.hero.y -= speed * dtSeconds;
      }
      if (keyboard.isDown("ArrowDown") || keyboard.isDown("s")) {
        this.hero.y += speed * dtSeconds;
      }

      // Simple bobbing position adjustment:
      const t = this.time / 1000;
      const amplitude = 0;
      const bob = Math.sin(t * 2) * amplitude;

      // Adjust hero's y around a base value
      this.hero.y = 20 + bob;

      // Let the entity (and its animation) update
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
};

spriteImage.onerror = (e) => {
  console.error("Failed to load sprite sheet", e);
};