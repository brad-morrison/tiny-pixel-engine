import { Engine, Scene, Sprite } from "../../src/index.js";

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

  // Create a Sprite object from the image.
  // For now we assume the whole image is the sprite.
  const heroSprite = new Sprite({
    image: spriteImage,
    width: spriteImage.width,
    height: spriteImage.height,
  });

  // Define a simple Scene that draws the sprite
  class SpriteScene extends Scene {
    update(dt) {
      // nothing yet
    }

    draw(ctx, scale) {
      // Let's draw the sprite at virtual position (20, 20)
      heroSprite.draw(ctx, scale, 20, 20);
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