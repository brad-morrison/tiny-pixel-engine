// examples/demo/main.js
import { Engine, assetLoader } from "../../src/index.js";
import { DemoScene } from "./scenes/DemoScene.js";
import { AssetRegistry } from "./AssetRegistry.js";

(async function run() {
  const canvas = document.getElementById("game");
  if (!canvas) {
    throw new Error("Canvas element with id 'game' not found");
  }

  const [
    idleSheetImage,
    walkSheetImage,
    musicSheetImage,
    sleepSheetImage,
    pineTreeImage,
    statusFrameImage,
    statusBlockImage,
    // ❌ remove fontImage here
  ] = await assetLoader.loadImages([
    "/examples/demo/assets/idle_animation.png",
    "/examples/demo/assets/walk.png",
    "/examples/demo/assets/music_loud.png",
    "/examples/demo/assets/sleep.png",
    "/examples/demo/assets/pine_tree.png",
    "/examples/demo/assets/status_frame.png",
    "/examples/demo/assets/status_block.png",
  ]);

  AssetRegistry.store("pet", {
    idleImg: idleSheetImage,
    walkImg: walkSheetImage,
    musicImg: musicSheetImage,
    sleepImg: sleepSheetImage,
  });

  AssetRegistry.store("pineTree", {
    image: pineTreeImage,
  });

  AssetRegistry.store("petStatusUi", {
    frameImage: statusFrameImage,
    blockImage: statusBlockImage,
  });

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#222",
  });

  const demoScene = new DemoScene();
  engine.addScene("demo", demoScene);
  engine.setScene("demo");
  engine.start();
})();