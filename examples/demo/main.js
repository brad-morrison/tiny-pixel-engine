// examples/demo/main.js
import { Engine, assetLoader } from "../../src/index.js";
import { setAsset } from "./assets.js";
import { DemoScene } from "./scenes/DemoScene.js";

(async () => {
  const canvas = document.getElementById("game");
  if (!canvas) throw new Error("Missing <canvas id='game'/>");

  const images = await assetLoader.loadImages([
    "/examples/demo/assets/pet_idle.png",
    "/examples/demo/assets/pet_walk.png",
    "/examples/demo/assets/pet_music.png",
    "/examples/demo/assets/pet_sleep.png",
    "/examples/demo/assets/pine_tree.png",
    "/examples/demo/assets/status_frame.png",
    "/examples/demo/assets/status_block.png",
    "/examples/demo/assets/hunger_icon.png",
    "/examples/demo/assets/sleep_icon.png",
    "/examples/demo/assets/fun_icon.png",
    "/examples/demo/assets/pet_eat.png",
    "/examples/demo/assets/fridge_anim.png",
  ]);

  const [
    idleImg,
    walkImg,
    musicImg,
    sleepImg,
    treeImg,
    frameImage,
    blockImage,
    hungerIconImage,
    energyIconImage,
    funIconImage,
    eatImg,
    fridgeAnim,
  ] = images;

  setAsset("pet", { idleImg, walkImg, musicImg, sleepImg, eatImg });
  setAsset("pineTree", { image: treeImg });
  setAsset("fridgeAnim", { image: fridgeAnim });
  setAsset("petStatusUi", {
    frameImage,
    blockImage,
    hungerIconImage,
    energyIconImage,
    funIconImage,
  });

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#346856",
  });

  engine.addScene("demo", new DemoScene());
  engine.setScene("demo");
  engine.start();
})();