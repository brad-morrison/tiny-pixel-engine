import { Engine, Scene } from "../../src/index.js";

const canvas = document.querySelector("#game");

// 1) Create the image
const spriteImage = new Image();
spriteImage.src = "/examples/basic-demo/assets/idle.png";

// 2) When it's loaded, start the engine
spriteImage.onload = () => {
  console.log("Sprite loaded:", spriteImage.width, spriteImage.height);

  // Create engine
  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#222",
  });

  // Define a simple Scene that draws the sprite
  class SpriteScene extends Scene {
    update(dt) {
      // nothing yet
    }

    draw(ctx, scale) {
      // Let's draw the sprite at virtual position (20, 20)
      const x = 20;
      const y = 20;

      // We'll assume spriteImage is 16x16 for now
      const spriteWidth = spriteImage.width;
      const spriteHeight = spriteImage.height;

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        spriteImage,
        0, 0,                    // source x, y (top-left of the image)
        spriteWidth, spriteHeight, // source width/height
        x * scale, y * scale,      // destination x, y (scaled)
        spriteWidth * scale,      // destination width
        spriteHeight * scale      // destination height
      );
    }
  }

  const scene = new SpriteScene();
  engine.addScene("sprite", scene);
  engine.setScene("sprite");
  engine.start();
};

spriteImage.onerror = (e) => {
  console.error("Failed to load sprite image", e);
};