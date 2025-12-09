import {
  Engine,
  Scene,
  SpriteSheet,
  SpriteAnimation,
} from "../../src/index.js";

const canvas = document.querySelector("#game");

// Load a sprite sheet instead of a single frame image
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

  // Suppose the sheet is 8 frames of 16x16 in a row (128x16)
  const frameWidth = 16;
  const frameHeight = 16;

  const sheet = new SpriteSheet({
    image: spriteImage,
    frameWidth,
    frameHeight,
  });

  // Animation: frames [0,1,2,3,4,5,6,7], 120ms per frame
  const idleAnim = new SpriteAnimation({
    spriteSheet: sheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 140,
    loop: true,
  });

  class SpriteScene extends Scene {
    constructor() {
      super();
      this.time = 0;
      this.x = 20;
      this.yBase = 20;
    }

    update(dt) {
      this.time += dt;
      idleAnim.update(dt);
    }

    draw(ctx, scale) {
      const t = this.time / 1000;
      const amplitude = 2;
      const bob = Math.sin(t * 2) * amplitude;
      const y = this.yBase + bob;

      idleAnim.draw(ctx, scale, this.x, y);
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