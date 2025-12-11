// examples/demo/main.js
import { Engine, assetLoader } from "../../src/index.js";
import { DemoScene } from "./scenes/DemoScene.js";
import { AssetRegistry } from "./AssetRegistry.js";

/**
 * main.js
 * ----------------------------------
 * - Grab canvas
 * - Initialize Engine
 * - Load all sprite sheets
 * - Store them in AssetRegistry
 * - Create DemoScene (no image args)
 * - Start the engine
 */
(async function run() {
  const canvas = document.getElementById("game");
  if (!canvas) {
    throw new Error("Canvas element with id 'game' not found");
  }

  // Load all sprite sheets needed for the pet/hero
  const [
    idleSheetImage,
    walkSheetImage,
    musicSheetImage,
    sleepSheetImage,
    pineTreeImage
  ] = await assetLoader.loadImages([
    "/examples/demo/assets/idle_animation.png",
    "/examples/demo/assets/walk.png",
    "/examples/demo/assets/music_loud.png",
    "/examples/demo/assets/sleep.png",
    "/examples/demo/assets/tree.png",
  ]);

  // Store them in a central place for the demo
  AssetRegistry.store("pet", {
    idleImg: idleSheetImage,
    walkImg: walkSheetImage,
    musicImg: musicSheetImage,
    sleepImg: sleepSheetImage,
  });

  // Store the pine tree separately
  AssetRegistry.store("pineTree", {
    image: pineTreeImage,
  });

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#222",
  });

  // DemoScene no longer takes images
  const demoScene = new DemoScene();

  engine.addScene("demo", demoScene);
  engine.setScene("demo");
  engine.start();
})();