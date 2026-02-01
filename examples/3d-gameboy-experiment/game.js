// game.js - Game using tiny-pixel-engine
import { Engine, assetLoader } from './src/index.js';
import { setAsset } from './assets.js';
import { DemoScene } from './scenes/DemoScene.js';

export async function createGame(canvas) {
  const images = await assetLoader.loadImages([
    "./assets/pet_idle.png",
    "./assets/pet_walk.png",
    "./assets/pet_music.png",
    "./assets/pet_sleep.png",
    "./assets/pine_tree.png",
    "./assets/status_frame.png",
    "./assets/status_block.png",
    "./assets/hunger_icon.png",
    "./assets/sleep_icon.png",
    "./assets/fun_icon.png",
    "./assets/pet_eat.png",
    "./assets/fridge_anim.png",
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

  // Override computeScale to prevent auto-scaling
  engine.computeScale = function() {
    this.scale = 1;
    this.canvasWidth = 160;
    this.canvasHeight = 144;
    this.canvas.width = 160;
    this.canvas.height = 144;
    this.ctx.imageSmoothingEnabled = false;
  };
  engine.computeScale();

  engine.addScene("demo", new DemoScene());
  engine.setScene("demo");
  engine.start();

  return engine;
}
