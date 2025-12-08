import { Engine, Scene } from "../../src/index.js";

const canvas = document.querySelector("#game");

// Create the engine with a 160x144 virtual resolution
const engine = new Engine({
  canvas,
  width: 160,
  height: 144,
  background: "#222",
});

// Create a new Scene
class TestScene extends Scene {
  draw(ctx, scale) {
    console.log("draw called, scale =", scale);
    ctx.fillStyle = "#fff";
    ctx.fillRect(10 * scale, 10 * scale, 1 * scale, 1 * scale);
  }
}

// Add scene
engine.addScene("test", new TestScene());

// Activate it
engine.setScene("test");

// Start the loop
engine.start();